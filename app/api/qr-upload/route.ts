import { NextRequest, NextResponse } from "next/server";
import { uploadFileToShopify } from "@/lib/shopify-admin";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });
    if (file.size > 25 * 1024 * 1024)
      return NextResponse.json({ error: "File too large (max 25 MB)" }, { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());
    const baseName = `qr-sticker-${Date.now()}`;
    const url = await uploadFileToShopify(buffer, `${baseName}.png`, "image/png");
    if (!url) return NextResponse.json({ error: "Upload failed" }, { status: 500 });

    return NextResponse.json({ url });
  } catch (err) {
    console.error("[/api/qr-upload]", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
