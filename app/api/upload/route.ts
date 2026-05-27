import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

    const ALLOWED = ["image/png", "image/jpeg", "image/jpg", "image/webp", "image/svg+xml", "application/pdf"];
    if (!ALLOWED.includes(file.type))
      return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
    if (file.size > 25 * 1024 * 1024)
      return NextResponse.json({ error: "File too large (max 25 MB)" }, { status: 400 });

    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const originalUrl = `data:${file.type};base64,${fileBuffer.toString("base64")}`;

    let processedUrl = originalUrl;
    let removedBackground = false;

    if (file.type.startsWith("image/") && file.type !== "image/svg+xml") {
      const KEY = process.env.REMOVE_BG_API_KEY;
      if (KEY) {
        try {
          const bgForm = new FormData();
          bgForm.append("image_file", new Blob([fileBuffer], { type: file.type }), file.name);
          bgForm.append("size", "auto");

          const bgResp = await fetch("https://api.remove.bg/v1.0/removebg", {
            method: "POST",
            headers: { "X-Api-Key": KEY },
            body: bgForm,
          });

          if (bgResp.ok) {
            const bgRemovedBuffer = Buffer.from(await bgResp.arrayBuffer());
            processedUrl = `data:image/png;base64,${bgRemovedBuffer.toString("base64")}`;
            removedBackground = true;
          }
        } catch {
          // fall through — use original
        }
      }
    }

    return NextResponse.json({ originalUrl, processedUrl, removedBackground });
  } catch (err) {
    console.error("[/api/upload]", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
