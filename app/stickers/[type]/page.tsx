import { notFound } from "next/navigation";
import Link from "next/link";
import StandaloneConfigurator, { type StickerType } from "@/components/StandaloneConfigurator";

const VALID_TYPES: StickerType[] = ["vinyl", "holographic", "glitter", "chrome", "sheets"];

type Props = { params: Promise<{ type: string }> };

export function generateStaticParams() {
  return VALID_TYPES.map((type) => ({ type }));
}

export default async function StickerTypePage({ params }: Props) {
  const { type } = await params;
  if (!VALID_TYPES.includes(type as StickerType)) notFound();

  return (
    <main className="min-h-screen overflow-x-hidde max-w-6xl mx-auto">

      {/* Back to sticker types */}
      <div className="px-6 pt-8">
        <Link
          href="/collections/custom-vinyl-stickers"
          className="group inline-flex items-center gap-2.5"
          style={{ fontFamily: "var(--font-orbitron)" }}
        >
          <span className="w-8 h-8 border border-white/[0.08] flex items-center justify-center text-gray-500 group-hover:border-white/25 group-hover:text-white group-hover:bg-white/[0.04] transition-all duration-300">
            <svg
              width="12" height="12" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5"
              className="group-hover:-translate-x-0.5 transition-transform duration-200"
            >
              <path d="m12 19-7-7 7-7" /><path d="M19 12H5" />
            </svg>
          </span>
          <span className="text-[9px] tracking-[0.4em] uppercase text-gray-500 group-hover:text-white transition-colors duration-300">
            All Sticker Types
          </span>
        </Link>
      </div>

      <StandaloneConfigurator stickerType={type as StickerType} />
    </main>
  );
}
