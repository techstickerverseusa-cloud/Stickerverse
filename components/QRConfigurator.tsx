"use client";

import { useState, useRef, useMemo, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import QRCode from "qrcode";
import { useCart } from "@/lib/cart-store";
import type { VinylStickerCartItem } from "@/lib/cart-types";
import { unitPrice, savePct, QTY_PRESETS, MIN_QTY, type ProductId } from "@/lib/pricing";

type Material = "vinyl" | "holographic";
type Position = "right" | "left" | "top" | "bottom";
type Finish = "matte" | "gloss";
type SizeId = "2x4" | "2.5x5" | "3x6" | "4x8" | "custom";
type QrSource = "generate" | "upload";

const ACCENT = "#818cf8";
const ACCENT_RGB = "129,140,248";

const MATERIALS: { id: Material; label: string; swatch: React.CSSProperties }[] = [
  { id: "vinyl", label: "Vinyl", swatch: { background: "linear-gradient(160deg,#e8e8e8 0%,#c8c8c8 100%)" } },
  { id: "holographic", label: "Holographic", swatch: { background: "linear-gradient(135deg,#ff6b9d 0%,#c44dff 25%,#4d79ff 50%,#00d4aa 75%,#ffd700 100%)" } },
];

const POSITIONS: { id: Position; label: string }[] = [
  { id: "right", label: "Right" },
  { id: "left", label: "Left" },
  { id: "top", label: "Top" },
  { id: "bottom", label: "Bottom" },
];

const SIZE_PRESETS: { id: Exclude<SizeId, "custom">; label: string; w: number; h: number }[] = [
  { id: "2x4", label: '2" × 4"', w: 2, h: 4 },
  { id: "2.5x5", label: '2.5" × 5"', w: 2.5, h: 5 },
  { id: "3x6", label: '3" × 6"', w: 3, h: 6 },
  { id: "4x8", label: '4" × 8"', w: 4, h: 8 },
];

function positionImage(material: Material, position: Position): string {
  return `/qr-positions/${material}-${position}.png`;
}

function productIdFor(material: Material): ProductId {
  return material === "holographic" ? "qr-holographic" : "qr-vinyl";
}

function fmt(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format(n);
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/** Draws `img` centered inside {x,y,w,h}, preserving aspect ratio (contain-fit). */
function drawContain(ctx: CanvasRenderingContext2D, img: HTMLImageElement, x: number, y: number, w: number, h: number) {
  const scale = Math.min(w / img.width, h / img.height);
  const dw = img.width * scale;
  const dh = img.height * scale;
  ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
}

async function compositeSticker(logoSrc: string, qrSrc: string, position: Position): Promise<Blob> {
  const [logoImg, qrImg] = await Promise.all([loadImage(logoSrc), loadImage(qrSrc)]);
  const horizontal = position === "left" || position === "right";
  const canvas = document.createElement("canvas");
  canvas.width = horizontal ? 1000 : 700;
  canvas.height = horizontal ? 500 : 900;
  const ctx = canvas.getContext("2d")!;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const qrFraction = 0.36;
  if (horizontal) {
    const qrW = canvas.width * qrFraction;
    const logoRect = position === "right"
      ? { x: 0, y: 0, w: canvas.width - qrW, h: canvas.height }
      : { x: qrW, y: 0, w: canvas.width - qrW, h: canvas.height };
    const qrRect = position === "right"
      ? { x: canvas.width - qrW, y: 0, w: qrW, h: canvas.height }
      : { x: 0, y: 0, w: qrW, h: canvas.height };
    drawContain(ctx, logoImg, logoRect.x, logoRect.y, logoRect.w, logoRect.h);
    drawContain(ctx, qrImg, qrRect.x, qrRect.y, qrRect.w, qrRect.h);
  } else {
    const qrH = canvas.height * qrFraction;
    const logoRect = position === "bottom"
      ? { x: 0, y: 0, w: canvas.width, h: canvas.height - qrH }
      : { x: 0, y: qrH, w: canvas.width, h: canvas.height - qrH };
    const qrRect = position === "bottom"
      ? { x: 0, y: canvas.height - qrH, w: canvas.width, h: qrH }
      : { x: 0, y: 0, w: canvas.width, h: qrH };
    drawContain(ctx, logoImg, logoRect.x, logoRect.y, logoRect.w, logoRect.h);
    drawContain(ctx, qrImg, qrRect.x, qrRect.y, qrRect.w, qrRect.h);
  }

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Canvas export failed"))), "image/png");
  });
}

export default function QRConfigurator() {
  const [material, setMaterial] = useState<Material>("vinyl");
  const [position, setPosition] = useState<Position>("right");
  const [finish, setFinish] = useState<Finish>("gloss");
  const [sizeId, setSizeId] = useState<SizeId>("2.5x5");
  const [customW, setCustomW] = useState("");
  const [customH, setCustomH] = useState("");
  const [selectedTierQty, setSelectedTierQty] = useState<number | "custom">(100);
  const [customQtyInput, setCustomQtyInput] = useState("");

  const [qrSource, setQrSource] = useState<QrSource>("generate");
  const [link, setLink] = useState("");
  const [qrPreview, setQrPreview] = useState<string | null>(null);
  const [uploadedQrFile, setUploadedQrFile] = useState<File | null>(null);
  const [uploadedQrPreview, setUploadedQrPreview] = useState<string | null>(null);

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [instructions, setInstructions] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const logoRef = useRef<HTMLInputElement>(null);
  const qrFileRef = useRef<HTMLInputElement>(null);
  const { addItem } = useCart();
  const router = useRouter();

  const product = productIdFor(material);

  const dims = useMemo(() => {
    if (sizeId === "custom") {
      const w = parseFloat(customW);
      const h = parseFloat(customH);
      return isFinite(w) && isFinite(h) && w > 0 && h > 0 ? { w, h } : null;
    }
    const preset = SIZE_PRESETS.find((s) => s.id === sizeId)!;
    return { w: preset.w, h: preset.h };
  }, [sizeId, customW, customH]);

  const activeQty = selectedTierQty === "custom" ? parseInt(customQtyInput) || 0 : selectedTierQty;

  function priceFor(qty: number): { perUnit: number; total: number; savings: number } {
    if (!dims || qty <= 0) return { perUnit: 0, total: 0, savings: 0 };
    const perUnit = unitPrice(product, "contour", dims.w, dims.h, qty);
    const total = Math.round(perUnit * qty * 100) / 100;
    const savings = savePct(product, "contour", dims.w, dims.h, qty);
    return { perUnit, total, savings };
  }

  const { perUnit: activePerUnit, total: activeTotal } = priceFor(activeQty);

  // Live QR preview whenever the link changes
  useEffect(() => {
    if (qrSource !== "generate" || !link.trim()) { setQrPreview(null); return; }
    let cancelled = false;
    QRCode.toDataURL(link.trim(), { margin: 1, width: 256, color: { dark: "#000000", light: "#ffffff" } })
      .then((url) => { if (!cancelled) setQrPreview(url); })
      .catch(() => { if (!cancelled) setQrPreview(null); });
    return () => { cancelled = true; };
  }, [link, qrSource]);

  function handleLogoFile(f: File) {
    setLogoFile(f);
    setLogoPreview(URL.createObjectURL(f));
  }

  function handleQrFile(f: File) {
    setUploadedQrFile(f);
    setUploadedQrPreview(URL.createObjectURL(f));
  }

  const qrReady = qrSource === "generate" ? !!qrPreview : !!uploadedQrPreview;
  const activeQrSrc = qrSource === "generate" ? qrPreview : uploadedQrPreview;

  const canProceed =
    dims !== null &&
    !!logoFile && qrReady &&
    (selectedTierQty !== "custom" || (customQtyInput !== "" && parseInt(customQtyInput) >= MIN_QTY));

  async function handleAddToCart() {
    if (!canProceed || !logoPreview || !activeQrSrc) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const blob = await compositeSticker(logoPreview, activeQrSrc, position);
      const form = new FormData();
      form.append("file", blob, "qr-sticker.png");
      const res = await fetch("/api/qr-upload", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error || "Upload failed");

      const sizeLabel = sizeId === "custom" ? `${customW}×${customH} in` : sizeId.replace("x", "×") + '"';
      const materialLabel = material === "holographic" ? "Holographic" : "Vinyl";

      const cartItem: Omit<VinylStickerCartItem, "id" | "addedAt"> = {
        kind: "vinyl-sticker",
        cutType: "contour",
        title: "QR Code Stickers",
        subtitle: `${materialLabel} · ${finish} · QR ${position} · ${sizeLabel} · Qty ${activeQty}`,
        thumbnail: data.url,
        unitLabel: "stickers",
        totalPrice: activeTotal,
        quantity: activeQty,
        shape: "rectangle",
        material: `qr-${material}`,
        finish,
        size: sizeId === "custom" ? "custom" : sizeId,
        customWidth: sizeId === "custom" && customW ? Number(customW) : undefined,
        customHeight: sizeId === "custom" && customH ? Number(customH) : undefined,
        roundedCorners: null,
        tierQty: activeQty,
        perUnit: activePerUnit,
        fileName: logoFile?.name,
        fileUrl: data.url,
        instructions: [
          qrSource === "generate" && link ? `QR destination: ${link}` : "Customer-supplied QR image",
          `QR position: ${position}`,
          instructions,
        ].filter(Boolean).join("\n"),
      };
      addItem(cartItem);
      router.push("/cart");
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Something went wrong — please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <style>{`
        .qr-card { transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease; }
        .qr-card:hover { transform: translateY(-3px); box-shadow: 0 12px 40px rgba(0,0,0,0.4); }
        .qr-opt { position: relative; overflow: hidden; transition: all 0.22s cubic-bezier(0.4,0,0.2,1); }
        .qr-input:focus { outline: none; border-color: rgba(${ACCENT_RGB}, 0.55) !important; box-shadow: 0 0 0 3px rgba(${ACCENT_RGB}, 0.12); }
      `}</style>

      <div className="min-h-screen pb-28 overflow-x-hidden" style={{ background: "#040410" }}>
        <div className="max-w-400 mx-auto px-4">

          {/* ── Hero ── */}
          <div className="mt-6 rounded-3xl overflow-hidden relative" style={{
            background: "linear-gradient(135deg,#0c0c2e 0%,#131050 45%,#0c0c2a 100%)",
            border: `1px solid rgba(${ACCENT_RGB},0.18)`, minHeight: "150px",
          }}>
            <div className="relative z-10 px-8 py-7">
              <p style={{ fontSize: "9px", letterSpacing: "0.45em", textTransform: "uppercase", fontFamily: "var(--font-orbitron)", color: `rgba(${ACCENT_RGB},0.75)`, marginBottom: "0.5rem" }}>
                Custom Stickers
              </p>
              <h1 style={{
                fontFamily: "var(--font-orbitron)", fontWeight: 900, fontSize: "clamp(1.75rem,3.5vw,2.75rem)", lineHeight: 1.1,
                background: `linear-gradient(135deg,#fff 0%,rgba(${ACCENT_RGB},1) 55%,rgba(${ACCENT_RGB},0.65) 100%)`,
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
              }}>
                QR Code Stickers
              </h1>
              <p style={{ color: `rgba(${ACCENT_RGB},0.85)`, fontSize: "0.875rem", fontWeight: 600, marginTop: "0.4rem" }}>
                Scan to your website, menu, or social — instantly.
              </p>
            </div>
          </div>

          {/* ── Material ── */}
          <div className="qr-card rounded-[20px] p-5 mt-4" style={{ background: "linear-gradient(145deg,#08082a 0%,#0c0c32 100%)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <h2 style={{ fontFamily: "var(--font-orbitron)", fontSize: "0.7rem", fontWeight: 700, color: "white", letterSpacing: "0.06em", marginBottom: "12px" }}>
              Select Material
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: `repeat(${MATERIALS.length}, 1fr)`, gap: "8px", maxWidth: "320px" }}>
              {MATERIALS.map((m) => {
                const sel = material === m.id;
                return (
                  <button key={m.id} className="qr-opt" onClick={() => setMaterial(m.id)} style={{
                    display: "flex", flexDirection: "column", alignItems: "center", gap: "6px",
                    padding: "10px", borderRadius: "14px", cursor: "pointer",
                    border: `2px solid ${sel ? ACCENT : "rgba(255,255,255,0.07)"}`,
                    background: sel ? `rgba(${ACCENT_RGB},0.08)` : "rgba(255,255,255,0.02)",
                  }}>
                    <div style={{ width: "100%", height: "40px", borderRadius: "8px", ...m.swatch }} />
                    <span style={{ fontSize: "10px", fontWeight: 700, fontFamily: "var(--font-orbitron)", color: sel ? "white" : "rgba(255,255,255,0.5)" }}>{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── 4-column grid ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mt-4">

            {/* Position */}
            <div className="qr-card rounded-[20px] p-5 flex flex-col gap-3" style={{ background: "linear-gradient(145deg,#08082a 0%,#0c0c32 100%)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <h2 style={{ fontFamily: "var(--font-orbitron)", fontSize: "0.7rem", fontWeight: 700, color: "white", letterSpacing: "0.06em" }}>Select QR Position</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {POSITIONS.map((p) => {
                  const sel = position === p.id;
                  return (
                    <button key={p.id} className="qr-opt" onClick={() => setPosition(p.id)} style={{
                      display: "flex", alignItems: "center", gap: "10px", padding: "8px 10px", borderRadius: "12px", cursor: "pointer",
                      border: `1px solid ${sel ? `rgba(${ACCENT_RGB},0.55)` : "rgba(255,255,255,0.07)"}`,
                      background: sel ? `rgba(${ACCENT_RGB},0.1)` : "rgba(255,255,255,0.03)",
                    }}>
                      <div style={{ position: "relative", width: "56px", height: "28px", flexShrink: 0 }}>
                        <Image src={positionImage(material, p.id)} alt={p.label} fill className="object-contain" unoptimized />
                      </div>
                      <span style={{ fontSize: "10px", fontWeight: 700, fontFamily: "var(--font-orbitron)", color: sel ? "white" : "rgba(255,255,255,0.5)" }}>{p.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Size */}
            <div className="qr-card rounded-[20px] p-5 flex flex-col gap-3" style={{ background: "linear-gradient(145deg,#08082a 0%,#0c0c32 100%)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <h2 style={{ fontFamily: "var(--font-orbitron)", fontSize: "0.7rem", fontWeight: 700, color: "white", letterSpacing: "0.06em" }}>Select Size</h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                {SIZE_PRESETS.map((s) => {
                  const sel = sizeId === s.id;
                  return (
                    <button key={s.id} className="qr-opt" onClick={() => setSizeId(s.id)} style={{
                      padding: "14px 8px", borderRadius: "14px", cursor: "pointer",
                      border: `1px solid ${sel ? `rgba(${ACCENT_RGB},0.55)` : "rgba(255,255,255,0.07)"}`,
                      background: sel ? `rgba(${ACCENT_RGB},0.1)` : "rgba(255,255,255,0.03)",
                      fontSize: "12px", fontWeight: 700, fontFamily: "var(--font-orbitron)",
                      color: sel ? "white" : "rgba(255,255,255,0.5)",
                    }}>
                      {s.label}
                    </button>
                  );
                })}
              </div>
              <button className="qr-opt" onClick={() => setSizeId("custom")} style={{
                width: "100%", padding: "10px", borderRadius: "12px", cursor: "pointer",
                border: `1px solid ${sizeId === "custom" ? `rgba(${ACCENT_RGB},0.55)` : "rgba(255,255,255,0.07)"}`,
                background: sizeId === "custom" ? `rgba(${ACCENT_RGB},0.1)` : "rgba(255,255,255,0.03)",
                fontSize: "11px", fontWeight: 600, fontFamily: "var(--font-orbitron)", letterSpacing: "0.08em",
                color: sizeId === "custom" ? "white" : "rgba(255,255,255,0.38)",
              }}>
                Custom Size
              </button>
              {sizeId === "custom" && (
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <input type="number" min="1" max="24" step="0.25" value={customW} onChange={(e) => setCustomW(e.target.value)} placeholder="W (in)" className="qr-input"
                    style={{ flex: 1, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "white", fontSize: "13px", padding: "8px 12px", borderRadius: "10px" }} />
                  <span style={{ color: "rgba(255,255,255,0.28)", fontSize: "14px" }}>×</span>
                  <input type="number" min="1" max="24" step="0.25" value={customH} onChange={(e) => setCustomH(e.target.value)} placeholder="H (in)" className="qr-input"
                    style={{ flex: 1, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "white", fontSize: "13px", padding: "8px 12px", borderRadius: "10px" }} />
                </div>
              )}
            </div>

            {/* Finish */}
            <div className="qr-card rounded-[20px] p-5 flex flex-col gap-3" style={{ background: "linear-gradient(145deg,#08082a 0%,#0c0c32 100%)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <h2 style={{ fontFamily: "var(--font-orbitron)", fontSize: "0.7rem", fontWeight: 700, color: "white", letterSpacing: "0.06em" }}>Select Finish</h2>
              <div className="flex flex-col gap-2">
                {([{ id: "gloss" as Finish, label: "Gloss", sub: "Bold shine. Vibrant colors." }, { id: "matte" as Finish, label: "Matte", sub: "Smooth finish. No glare." }]).map((f) => {
                  const sel = finish === f.id;
                  return (
                    <button key={f.id} className="qr-opt" onClick={() => setFinish(f.id)} style={{
                      display: "flex", alignItems: "center", padding: "12px 14px", borderRadius: "14px", cursor: "pointer", textAlign: "left",
                      border: `2px solid ${sel ? ACCENT : "rgba(255,255,255,0.07)"}`,
                      background: sel ? `rgba(${ACCENT_RGB},0.08)` : "rgba(255,255,255,0.02)",
                    }}>
                      <div>
                        <p style={{ fontSize: "0.8125rem", fontWeight: 700, color: "white" }}>{f.label}</p>
                        <p style={{ fontSize: "9px", color: "rgba(255,255,255,0.4)", marginTop: "2px" }}>{f.sub}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quantity */}
            <div className="qr-card rounded-[20px] p-5 flex flex-col gap-2" style={{ background: "linear-gradient(145deg,#08082a 0%,#0c0c32 100%)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <h2 style={{ fontFamily: "var(--font-orbitron)", fontSize: "0.7rem", fontWeight: 700, color: "white", letterSpacing: "0.06em" }}>Select Quantity</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "3px", flex: 1 }}>
                {QTY_PRESETS.map((qty) => {
                  const { total: tot, savings: sav } = priceFor(qty);
                  const active = selectedTierQty === qty;
                  return (
                    <button key={qty} className="qr-opt" onClick={() => setSelectedTierQty(qty)} style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 12px", borderRadius: "10px", cursor: "pointer",
                      border: `1px solid ${active ? `rgba(${ACCENT_RGB},0.5)` : "transparent"}`,
                      background: active ? `rgba(${ACCENT_RGB},0.14)` : "transparent",
                    }}>
                      <span style={{ fontFamily: "var(--font-orbitron)", fontSize: "11px", fontWeight: 700, color: active ? "white" : "rgba(255,255,255,0.55)" }}>
                        {qty >= 1000 ? `${qty / 1000}k` : qty}
                      </span>
                      <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                        <span style={{ fontSize: "12px", fontWeight: 600, color: active ? "white" : "rgba(255,255,255,0.7)" }}>{tot > 0 ? fmt(tot) : "—"}</span>
                        {sav > 0 && (
                          <span style={{ fontSize: "8px", fontWeight: 700, padding: "2px 7px", borderRadius: "100px", fontFamily: "var(--font-orbitron)", background: active ? `rgba(${ACCENT_RGB},0.3)` : "rgba(34,197,94,0.14)", color: active ? ACCENT : "#22c55e" }}>
                            Save {sav}%
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
                <button className="qr-opt" onClick={() => setSelectedTierQty("custom")} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 12px", borderRadius: "10px", cursor: "pointer",
                  border: `1px solid ${selectedTierQty === "custom" ? `rgba(${ACCENT_RGB},0.5)` : "rgba(255,255,255,0.06)"}`,
                  background: selectedTierQty === "custom" ? `rgba(${ACCENT_RGB},0.14)` : "rgba(255,255,255,0.02)",
                }}>
                  <span style={{ fontFamily: "var(--font-orbitron)", fontSize: "11px", fontWeight: 700, color: selectedTierQty === "custom" ? "white" : "rgba(255,255,255,0.45)" }}>Custom</span>
                  <span style={{ fontSize: "9px", color: selectedTierQty === "custom" ? ACCENT : "rgba(255,255,255,0.28)", fontFamily: "var(--font-orbitron)" }}>Enter qty →</span>
                </button>
                {selectedTierQty === "custom" && (
                  <input type="number" min={MIN_QTY} max="50000" step="1" value={customQtyInput} onChange={(e) => setCustomQtyInput(e.target.value)} placeholder={`Enter quantity (min ${MIN_QTY})`} className="qr-input"
                    style={{ marginTop: "4px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "white", fontSize: "13px", padding: "9px 12px", borderRadius: "10px" }} />
                )}
              </div>
              <div style={{ marginTop: "6px", borderRadius: "14px", padding: "14px 16px", background: `linear-gradient(135deg,rgba(${ACCENT_RGB},0.2) 0%,rgba(${ACCENT_RGB},0.1) 100%)`, border: `1px solid rgba(${ACCENT_RGB},0.28)` }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <p style={{ fontSize: "8px", fontFamily: "var(--font-orbitron)", color: `rgba(${ACCENT_RGB},0.65)`, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "3px" }}>Total</p>
                    <p style={{ fontFamily: "var(--font-orbitron)", fontSize: "1.125rem", fontWeight: 900, color: "white" }}>{activeTotal > 0 ? fmt(activeTotal) : "—"}</p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ fontSize: "8px", fontFamily: "var(--font-orbitron)", color: `rgba(${ACCENT_RGB},0.65)`, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "3px" }}>Per unit</p>
                    <p style={{ fontSize: "0.875rem", fontWeight: 700, color: `rgba(${ACCENT_RGB},0.9)` }}>{activePerUnit > 0 ? fmt(activePerUnit) : "—"}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── QR source ── */}
          <div className="qr-card rounded-[20px] p-5 mt-4" style={{ background: "linear-gradient(145deg,#08082a 0%,#0c0c32 100%)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <h2 style={{ fontFamily: "var(--font-orbitron)", fontSize: "0.7rem", fontWeight: 700, color: "white", letterSpacing: "0.06em", marginBottom: "12px" }}>
              Website Link or Social Media Handle
            </h2>

            <div style={{
              position: "relative", display: "grid", gridTemplateColumns: "1fr 1fr",
              background: "#07071e", borderRadius: "12px", padding: "4px",
              border: "1px solid rgba(255,255,255,0.06)", maxWidth: "360px", marginBottom: "14px",
            }}>
              <div style={{
                position: "absolute", top: "4px", bottom: "4px",
                left: qrSource === "generate" ? "4px" : "calc(50% + 2px)", width: "calc(50% - 6px)",
                background: `linear-gradient(135deg,${ACCENT}cc,${ACCENT})`, borderRadius: "8px",
                transition: "left 0.28s cubic-bezier(0.34,1.56,0.64,1)",
              }} />
              {([{ id: "generate" as QrSource, label: "Generate my QR" }, { id: "upload" as QrSource, label: "Upload my own QR" }]).map((t) => (
                <button key={t.id} onClick={() => setQrSource(t.id)} style={{
                  position: "relative", zIndex: 1, padding: "9px 4px", borderRadius: "8px", cursor: "pointer", border: "none", background: "transparent",
                  fontSize: "10px", fontWeight: 700, fontFamily: "var(--font-orbitron)",
                  color: qrSource === t.id ? "white" : "rgba(255,255,255,0.4)",
                }}>
                  {t.label}
                </button>
              ))}
            </div>

            {qrSource === "generate" ? (
              <div className="flex flex-col sm:flex-row gap-4 items-start">
                <input
                  type="text" value={link} onChange={(e) => setLink(e.target.value)}
                  placeholder="https://yourwebsite.com or @yourhandle" className="qr-input"
                  style={{ flex: 1, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "white", fontSize: "13px", padding: "12px 14px", borderRadius: "12px", width: "100%" }}
                />
                {qrPreview && (
                  <div style={{ width: "72px", height: "72px", borderRadius: "10px", overflow: "hidden", border: "1px solid rgba(255,255,255,0.15)", flexShrink: 0, background: "white" }}>
                    <Image src={qrPreview} alt="QR preview" width={72} height={72} unoptimized />
                  </div>
                )}
              </div>
            ) : (
              <div>
                <input ref={qrFileRef} type="file" accept="image/png,image/jpeg" style={{ display: "none" }}
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleQrFile(f); }} />
                <button onClick={() => qrFileRef.current?.click()} className="qr-opt" style={{
                  display: "flex", alignItems: "center", gap: "12px", padding: "10px 14px", borderRadius: "12px", cursor: "pointer",
                  border: `1px dashed ${uploadedQrPreview ? `rgba(${ACCENT_RGB},0.5)` : "rgba(255,255,255,0.15)"}`,
                  background: "rgba(255,255,255,0.03)",
                }}>
                  {uploadedQrPreview ? (
                    <div style={{ width: "44px", height: "44px", borderRadius: "8px", overflow: "hidden", background: "white" }}>
                      <Image src={uploadedQrPreview} alt="Uploaded QR" width={44} height={44} unoptimized />
                    </div>
                  ) : null}
                  <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)" }}>
                    {uploadedQrFile ? uploadedQrFile.name : "Click to upload your QR code image"}
                  </span>
                </button>
              </div>
            )}
          </div>

          {/* ── Logo/Design upload ── */}
          <div style={{ marginTop: "1rem" }}>
            <div
              onClick={() => logoRef.current?.click()}
              style={{
                borderRadius: "20px",
                border: `2px dashed ${logoFile ? `rgba(${ACCENT_RGB},0.4)` : "rgba(255,255,255,0.11)"}`,
                background: logoFile ? `rgba(${ACCENT_RGB},0.04)` : "#06061a",
                cursor: "pointer", minHeight: "160px",
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                gap: "16px", padding: "2.5rem", transition: "all 0.25s ease",
              }}
            >
              <input ref={logoRef} type="file" accept="image/png,image/jpeg,image/svg+xml" style={{ display: "none" }}
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleLogoFile(f); }} />
              {logoPreview ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
                  <div style={{ position: "relative", width: "96px", height: "96px" }}>
                    <Image src={logoPreview} alt="Logo preview" fill className="object-contain" />
                  </div>
                  <p style={{ fontSize: "13px", fontWeight: 600, color: "white" }}>{logoFile?.name}</p>
                </div>
              ) : (
                <>
                  <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: `rgba(${ACCENT_RGB},0.1)`, border: `1px solid rgba(${ACCENT_RGB},0.2)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="1.5">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" x2="12" y1="3" y2="15" />
                    </svg>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <p style={{ fontSize: "15px", fontWeight: 600, color: "white", marginBottom: "6px" }}>Upload your logo or design</p>
                    <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.32)" }}>This is combined with your QR code on one sticker</p>
                  </div>
                </>
              )}
            </div>

            <div style={{ marginTop: "1rem", paddingBottom: "1rem" }}>
              <textarea
                value={instructions} onChange={(e) => setInstructions(e.target.value)} rows={2}
                placeholder="Special instructions (optional)"
                style={{ width: "100%", borderRadius: "14px", background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.08)", color: "white", fontSize: "13px", padding: "14px 16px", resize: "none", lineHeight: 1.7 }}
              />
            </div>
          </div>

        </div>
      </div>

      {/* ── Sticky CTA ── */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 50, padding: "14px 16px", borderTop: "1px solid rgba(255,255,255,0.06)", background: "rgba(4,4,16,0.98)" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto", display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
          <button
            onClick={handleAddToCart}
            disabled={!canProceed || submitting}
            style={{
              width: "100%", maxWidth: "640px", padding: "16px", borderRadius: "14px",
              cursor: canProceed && !submitting ? "pointer" : "not-allowed",
              fontFamily: "var(--font-orbitron)", fontSize: "13px", fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase",
              background: canProceed && !submitting ? `linear-gradient(135deg,${ACCENT} 0%,rgba(${ACCENT_RGB},0.72) 100%)` : "rgba(255,255,255,0.05)",
              color: canProceed && !submitting ? "white" : "rgba(255,255,255,0.2)",
              border: `1px solid ${canProceed && !submitting ? `rgba(${ACCENT_RGB},0.4)` : "rgba(255,255,255,0.05)"}`,
              transition: "all 0.22s ease",
            }}
          >
            {submitting ? "Uploading…" : "Add to Cart →"}
          </button>
          {submitError && <p style={{ fontSize: "11px", color: "#f87171" }}>{submitError}</p>}
          <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.28)" }}>
            {!logoFile ? "Upload your logo to continue" : !qrReady ? "Add a link or upload your QR to continue" : "We’ll combine your QR and logo into one sticker"}
          </p>
        </div>
      </div>
    </>
  );
}
