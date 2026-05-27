const SHOPIFY_API_VERSION = "2026-04";

async function shopifyAdminFetch<T>(query: string, variables: object = {}): Promise<T> {
  const STORE = process.env.SHOPIFY_STORE_DOMAIN;
  const TOKEN = process.env.SHOPIFY_ADMIN_TOKEN;
  if (!STORE || !TOKEN) throw new Error("Missing SHOPIFY_STORE_DOMAIN or SHOPIFY_ADMIN_TOKEN");

  const resp = await fetch(`https://${STORE}/admin/api/${SHOPIFY_API_VERSION}/graphql.json`, {
    method: "POST",
    headers: {
      "X-Shopify-Access-Token": TOKEN,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, variables }),
    cache: "no-store",
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Shopify Admin HTTP ${resp.status}: ${text.slice(0, 400)}`);
  }

  const json = (await resp.json()) as { data?: T; errors?: { message: string }[] };
  if (json.errors?.length) throw new Error(json.errors[0].message);
  if (!json.data) throw new Error("Shopify Admin returned no data");
  return json.data;
}

export interface DraftLineItem {
  title?: string;
  quantity: number;
  originalUnitPrice?: string;
  requiresShipping?: boolean;
  variantId?: string;
  customAttributes?: { key: string; value: string }[];
}

export async function createDraftOrder({
  lineItems,
  customerId,
  email,
  note,
}: {
  lineItems: DraftLineItem[];
  customerId?: string | null;
  email?: string | null;
  note?: string;
}) {
  const query = `
    mutation draftOrderCreate($input: DraftOrderInput!) {
      draftOrderCreate(input: $input) {
        draftOrder { id name invoiceUrl totalPrice }
        userErrors { field message }
      }
    }
  `;

  type Resp = {
    draftOrderCreate: {
      draftOrder: { id: string; name: string; invoiceUrl: string; totalPrice: string } | null;
      userErrors: { field: string; message: string }[];
    };
  };

  const input: Record<string, unknown> = {
    lineItems: lineItems.map((item) => {
      if (item.variantId) {
        return {
          variantId: item.variantId,
          quantity: item.quantity,
          ...(item.customAttributes?.length ? { customAttributes: item.customAttributes } : {}),
        };
      }
      return {
        title: item.title,
        quantity: item.quantity,
        originalUnitPrice: item.originalUnitPrice ?? "0.00",
        requiresShipping: item.requiresShipping ?? true,
        ...(item.customAttributes?.length ? { customAttributes: item.customAttributes } : {}),
      };
    }),
  };

  if (customerId) input.customerId = customerId;
  if (email) input.email = email;
  if (note) input.note = note;

  const data = await shopifyAdminFetch<Resp>(query, { input });

  const errors = data.draftOrderCreate.userErrors;
  if (errors.length > 0) throw new Error(errors[0].message);

  const order = data.draftOrderCreate.draftOrder;
  if (!order) throw new Error("Draft order creation returned no data");
  return order;
}

export async function uploadFileToShopify(
  buffer: Buffer,
  filename: string,
  mimeType: string,
): Promise<string | null> {
  const STORE = process.env.SHOPIFY_STORE_DOMAIN!;
  const TOKEN = process.env.SHOPIFY_ADMIN_TOKEN!;
  const base = `https://${STORE}/admin/api/${SHOPIFY_API_VERSION}/graphql.json`;
  const headers = { "X-Shopify-Access-Token": TOKEN, "Content-Type": "application/json" };

  // 1. Stage the upload
  const stageResp = await fetch(base, {
    method: "POST",
    headers,
    body: JSON.stringify({
      query: `
        mutation stagedUploadsCreate($input: [StagedUploadInput!]!) {
          stagedUploadsCreate(input: $input) {
            stagedTargets { url resourceUrl parameters { name value } }
            userErrors { message }
          }
        }
      `,
      variables: {
        input: [{ resource: "FILE", filename, mimeType, httpMethod: "POST", fileSize: String(buffer.length) }],
      },
    }),
    cache: "no-store",
  });

  const stageJson = (await stageResp.json()) as {
    data?: { stagedUploadsCreate: { stagedTargets: { url: string; resourceUrl: string; parameters: { name: string; value: string }[] }[] } };
  };
  const target = stageJson.data?.stagedUploadsCreate?.stagedTargets?.[0];
  if (!target) return null;

  // 2. Upload file
  const form = new FormData();
  for (const p of target.parameters) form.append(p.name, p.value);
  form.append("file", new Blob([new Uint8Array(buffer)], { type: mimeType }), filename);
  const upResp = await fetch(target.url, { method: "POST", body: form });
  if (!upResp.ok) return null;

  // 3. Create file in Shopify — get file ID
  const createResp = await fetch(base, {
    method: "POST",
    headers,
    body: JSON.stringify({
      query: `
        mutation fileCreate($files: [FileCreateInput!]!) {
          fileCreate(files: $files) {
            files {
              id
              fileStatus
              ... on MediaImage { image { url } }
              ... on GenericFile { url }
            }
            userErrors { message }
          }
        }
      `,
      variables: { files: [{ originalSource: target.resourceUrl, contentType: "IMAGE" }] },
    }),
    cache: "no-store",
  });

  const createJson = (await createResp.json()) as {
    data?: {
      fileCreate: {
        files: { id: string; fileStatus: string; image?: { url: string }; url?: string }[];
        userErrors: { message: string }[];
      };
    };
  };

  const created = createJson.data?.fileCreate?.files?.[0];
  if (!created) return null;

  // If URL is immediately available (already READY), return it
  const immediateUrl = created.image?.url ?? created.url;
  if (immediateUrl) return immediateUrl;

  // 4. Poll until READY (max 8 × 2s = 16s)
  const fileId = created.id;
  if (!fileId) return null;

  for (let i = 0; i < 8; i++) {
    await new Promise((r) => setTimeout(r, 2000));

    const pollResp = await fetch(base, {
      method: "POST",
      headers,
      body: JSON.stringify({
        query: `
          query getFile($id: ID!) {
            node(id: $id) {
              ... on MediaImage { fileStatus image { url } }
              ... on GenericFile  { fileStatus url }
            }
          }
        `,
        variables: { id: fileId },
      }),
      cache: "no-store",
    });

    const pollJson = (await pollResp.json()) as {
      data?: { node: { fileStatus: string; image?: { url: string }; url?: string } | null };
    };

    const node = pollJson.data?.node;
    if (node?.fileStatus === "READY") {
      return node.image?.url ?? node.url ?? null;
    }
  }

  return null;
}
