import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getCollectionByHandle, getAllCollections } from "@/lib/shopify-collections";
import StickerSubcategoryView from "@/components/StickerSubcategoryView";

// Any collection handle that should show the sticker subcategory picker
// instead of a normal Shopify products grid.
const SUBCATEGORY_HANDLES = [
  "custom-stickers-logos",
  "custom-vinyl-stickers",
  "custom-stickers",
  "stickers",
];

const SUBCATEGORY_TITLES: Record<string, string> = {
  "custom-stickers-logos": "Custom Stickers",
  "custom-vinyl-stickers": "Custom Vinyl Stickers",
  "custom-stickers":       "Custom Stickers",
  "stickers":              "Stickers",
};

type Props = { params: Promise<{ handle: string }> };

export async function generateStaticParams() {
  const collections = await getAllCollections();
  const fromShopify = collections.map((c) => ({ handle: c.handle }));
  // also pre-generate subcategory handles that may not be in Shopify
  const extra = SUBCATEGORY_HANDLES.filter(
    (h) => !fromShopify.some((c) => c.handle === h),
  ).map((h) => ({ handle: h }));
  return [...fromShopify, ...extra];
}

export default async function CollectionPage({ params }: Props) {
  const { handle } = await params;

  // ── Subcategory picker (no Shopify query needed) ──────────────────────────
  if (SUBCATEGORY_HANDLES.includes(handle)) {
    const title = SUBCATEGORY_TITLES[handle] ?? "Custom Stickers";

    return (
      <main className="min-h-screen overflow-x-hidden">
        <CollectionHero title={title} backHref="/#categories" backLabel="All Categories" showCount={false} />
        <StickerSubcategoryView />
      </main>
    );
  }

  // ── Normal Shopify collection page ────────────────────────────────────────
  const collection = await getCollectionByHandle(handle);
  if (!collection) notFound();

  return (
    <main className="min-h-screen overflow-x-hidden">
      <CollectionHero
        title={collection.title}
        description={collection.description}
        productCount={collection.products.length}
        backHref="/#categories"
        backLabel="All Categories"
        showCount
      />

      {/* ── Trust Badges ── */}
      <section className="px-6 pb-12">
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            {
              icon: (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 17.58A5 5 0 0 0 18 8h-1.26A8 8 0 1 0 4 16.25" />
                  <line x1="8" y1="16" x2="8.01" y2="16" /><line x1="8" y1="20" x2="8.01" y2="20" />
                  <line x1="12" y1="18" x2="12.01" y2="18" /><line x1="12" y1="22" x2="12.01" y2="22" />
                  <line x1="16" y1="16" x2="16.01" y2="16" /><line x1="16" y1="20" x2="16.01" y2="20" />
                </svg>
              ),
              label: "Waterproof & Extreme-Weather Tested",
            },
            {
              icon: (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="2" y1="12" x2="22" y2="12" />
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
              ),
              label: "Premium Quality, Made in the USA",
            },
            {
              icon: (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
              ),
              label: "Free Online Proof With All Orders",
            },
          ].map(({ icon, label }) => (
            <div
              key={label}
              className="group flex items-center gap-4 border border-white/6 bg-white/1.5 hover:border-indigo-500/25 hover:bg-white/3 px-5 py-4 rounded-xl transition-all duration-300"
            >
              <div className="text-indigo-400 flex-shrink-0 group-hover:text-indigo-300 transition-colors duration-300">{icon}</div>
              <p className="text-[11px] text-zinc-400 font-medium leading-snug group-hover:text-zinc-200 transition-colors duration-300">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Products Grid ── */}
      <section className="px-6 pb-20">
        {collection.products.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-5 max-w-5xl mx-auto">
            {collection.products.map((product, idx) => {
              const price    = product.minPrice ?? null;
              const currency = product.currencyCode ?? "USD";

              return (
                <Link
                  key={product.id}
                  href={`/products/${product.handle}`}
                  className="group relative overflow-hidden rounded-2xl border border-white/6 bg-zinc-950 animate-fade-up hover:border-white/14 transition-all duration-500 hover:shadow-[0_24px_64px_rgba(0,0,0,0.65),0_0_40px_rgba(80,60,200,0.08)]"
                  style={{ animationDelay: `${idx * 65}ms`, animationFillMode: "both" }}
                >
                  {/* Portrait image — 3:4 ratio */}
                  <div className="relative aspect-3/4 overflow-hidden">
                    {product.featuredImage ? (
                      <Image
                        src={product.featuredImage.url}
                        alt={product.featuredImage.altText ?? product.title}
                        fill
                        sizes="(max-width: 768px) 50vw, 33vw"
                        className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-linear-to-br from-indigo-950/50 to-zinc-900 flex items-center justify-center">
                        <span
                          className="text-7xl font-black text-white/2.5 select-none"
                          style={{ fontFamily: "var(--font-orbitron)" }}
                        >
                          {product.title.charAt(0)}
                        </span>
                      </div>
                    )}

                    {/* Persistent bottom gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/50 to-transparent" />

                    {/* Hover: deeper overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/98 via-zinc-950/60 to-zinc-950/10 opacity-0 group-hover:opacity-100 transition-opacity duration-400" />

                    {/* Index badge */}
                    <div
                      className="absolute top-3.5 left-3.5 text-[10px] font-bold text-white/18 tracking-[0.3em]"
                      style={{ fontFamily: "var(--font-orbitron)" }}
                    >
                      {String(idx + 1).padStart(2, "0")}
                    </div>

                    {/* Shimmer scan line on hover */}
                    <div
                      className="absolute inset-0 -translate-y-full group-hover:translate-y-full transition-transform duration-1000 ease-in-out pointer-events-none"
                      style={{ background: "linear-gradient(to bottom, transparent 0%, rgba(255,255,255,0.045) 50%, transparent 100%)" }}
                    />

                    {/* Center "View Product" — slides up on hover */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="border border-white/25 px-5 py-2.5 backdrop-blur-sm translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-400">
                        <span
                          className="text-[8px] tracking-[0.45em] uppercase text-white"
                          style={{ fontFamily: "var(--font-orbitron)" }}
                        >
                          View Product
                        </span>
                      </div>
                    </div>

                    {/* Corner decorators — appear on hover */}
                    <div className="absolute top-3 right-3 w-5 h-5 border-t-[1.5px] border-r-[1.5px] border-transparent group-hover:border-white/30 transition-all duration-500" />
                    <div className="absolute top-3 left-3 w-5 h-5 border-t-[1.5px] border-l-[1.5px] border-transparent group-hover:border-white/30 transition-all duration-500" />

                    {/* Floating content at bottom */}
                    <div className="absolute bottom-0 inset-x-0 p-4 flex flex-col gap-2">
                      <h3
                        className="text-[10px] sm:text-[11px] font-bold tracking-[0.08em] uppercase text-zinc-300 group-hover:text-white transition-colors duration-300 line-clamp-2 leading-snug"
                        style={{ fontFamily: "var(--font-orbitron)" }}
                      >
                        {product.title}
                      </h3>
                      <div className="flex items-center justify-between gap-2">
                        {price ? (
                          <div>
                            <p className="text-[7px] text-zinc-500 tracking-[0.3em] uppercase mb-0.5" style={{ fontFamily: "var(--font-orbitron)" }}>
                              From
                            </p>
                            <p className="text-sm font-bold text-white" style={{ fontFamily: "var(--font-orbitron)" }}>
                              {new Intl.NumberFormat("en-US", { style: "currency", currency }).format(Number(price))}
                            </p>
                          </div>
                        ) : (
                          <p className="text-xs text-zinc-600 italic">Price varies</p>
                        )}
                        <div className="w-7 h-7 rounded-md border border-white/8 flex items-center justify-center text-zinc-500 group-hover:border-indigo-400/40 group-hover:text-indigo-400 group-hover:bg-indigo-500/8 transition-all duration-300 shrink-0">
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                            className="group-hover:translate-x-0.5 transition-transform duration-200">
                            <path d="m5 12 14 0M13 6l6 6-6 6" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bottom gradient accent bar */}
                  <div className="absolute bottom-0 inset-x-0 h-0.5 overflow-hidden">
                    <div className="h-full w-0 group-hover:w-full bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-700 ease-out" />
                  </div>

                  {/* Left accent bar */}
                  <div className="absolute left-0 inset-y-0 w-0.5 overflow-hidden">
                    <div className="w-full h-0 group-hover:h-full bg-linear-to-b from-indigo-500/70 via-purple-500/50 to-transparent transition-all duration-600 ease-out" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}

// ─── Shared hero ──────────────────────────────────────────────────────────────

function CollectionHero({
  title,
  description,
  productCount,
  backHref,
  backLabel,
  showCount,
}: {
  title: string;
  description?: string;
  productCount?: number;
  backHref: string;
  backLabel: string;
  showCount: boolean;
}) {
  return (
    <section className="relative px-6 pt-10 pb-16 text-center overflow-hidden">
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[340px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(ellipse, rgba(100,80,220,0.10) 0%, transparent 70%)" }}
      />

      <div className="relative flex justify-start mb-10 animate-fade-in">
        <Link href={backHref} className="group inline-flex items-center gap-2.5" style={{ fontFamily: "var(--font-orbitron)" }}>
          <span className="w-8 h-8 border border-white/[0.08] flex items-center justify-center text-gray-500 group-hover:border-white/25 group-hover:text-white group-hover:bg-white/[0.04] transition-all duration-300">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
              className="group-hover:-translate-x-0.5 transition-transform duration-200">
              <path d="m12 19-7-7 7-7" /><path d="M19 12H5" />
            </svg>
          </span>
          <span className="text-[9px] tracking-[0.4em] uppercase text-gray-500 group-hover:text-white transition-colors duration-300">
            {backLabel}
          </span>
        </Link>
      </div>

      <div className="relative flex flex-col items-center">
        <div className="inline-flex items-center gap-3 mb-6 animate-fade-in" style={{ animationFillMode: "both" }}>
          <span className="w-8 h-px bg-gradient-to-r from-transparent to-white/20" />
          <span className="text-[8px] tracking-[0.55em] uppercase text-gray-500" style={{ fontFamily: "var(--font-orbitron)" }}>
            Collection
          </span>
          <span className="w-8 h-px bg-gradient-to-l from-transparent to-white/20" />
        </div>

        <h1
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-none text-shimmer animate-fade-up"
          style={{ fontFamily: "var(--font-orbitron)", animationFillMode: "both" }}
        >
          {title}
        </h1>

        {description && (
          <p className="text-gray-400 mt-6 w-full max-w-3xl text-sm leading-7 animate-fade-up delay-150" style={{ animationFillMode: "both" }}>
            {description}
          </p>
        )}

        {showCount && productCount !== undefined && (
          <div className="mt-8 inline-flex items-center gap-3 border border-white/[0.09] px-6 py-2.5 animate-scale-in delay-300" style={{ animationFillMode: "both" }}>
            <span className="text-xl font-bold text-white" style={{ fontFamily: "var(--font-orbitron)" }}>
              {productCount}
            </span>
            <span className="w-px h-4 bg-white/[0.1]" />
            <span className="text-[8px] tracking-[0.4em] uppercase text-gray-500" style={{ fontFamily: "var(--font-orbitron)" }}>
              {productCount === 1 ? "Product" : "Products"}
            </span>
          </div>
        )}
      </div>

      <div className="h-px mt-14 bg-gradient-to-r from-transparent via-white/[0.09] to-transparent" />
    </section>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="text-center py-36 animate-fade-in">
      <div className="relative w-24 h-24 border border-white/[0.07] flex items-center justify-center mx-auto mb-7">
        <div className="absolute inset-0 bg-gradient-to-br from-[rgba(100,80,220,0.07)] to-transparent" />
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" className="text-gray-600">
          <rect x="2" y="3" width="20" height="14" rx="2" />
          <line x1="8" y1="21" x2="16" y2="21" />
          <line x1="12" y1="17" x2="12" y2="21" />
        </svg>
      </div>
      <p className="text-gray-500 text-xs tracking-[0.3em] uppercase mb-2" style={{ fontFamily: "var(--font-orbitron)" }}>
        No Products Yet
      </p>
      <p className="text-gray-600 text-xs mb-10">This collection is coming soon.</p>
      <Link
        href="/#categories"
        className="group inline-flex items-center gap-3 text-[10px] font-bold tracking-[0.25em] uppercase px-8 py-4 bg-white text-black hover:bg-gray-100 transition-colors duration-200"
        style={{ fontFamily: "var(--font-orbitron)" }}
      >
        Browse Other Categories
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
          className="group-hover:translate-x-0.5 transition-transform duration-200">
          <path d="m5 12 14 0M13 6l6 6-6 6" />
        </svg>
      </Link>
    </div>
  );
}
