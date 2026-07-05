import { notFound } from "next/navigation";
import Link from "next/link";
import StandaloneConfigurator, { type StickerType } from "@/components/StandaloneConfigurator";

const VALID_TYPES: StickerType[] = ["vinyl", "holographic", "glitter", "chrome", "sheets"];

type Props = { params: Promise<{ type: string }> };

export function generateStaticParams() {
  return VALID_TYPES.map((type) => ({ type }));
}

type FAQ = { q: string; a: string };

const COMMON_FAQS: FAQ[] = [
  {
    q: "Can I get a proof before printing?",
    a: "Absolutely! We provide a free online proof before printing so you can see exactly how your stickers will look. You'll receive the proof within 24 hours and can request revisions if needed.",
  },
  {
    q: "What's the minimum order quantity?",
    a: "Our minimum order is 15 stickers, making it perfect for small businesses, events, or personal projects. We offer quantity discounts starting at 100+ stickers.",
  },
  {
    q: "How long does shipping take?",
    a: "Standard orders are printed within 24–48 hours, then shipped with UPS Ground (2–4 business days) or USPS. Priority printing and expedited shipping options are also available.",
  },
  {
    q: "What sizes are available?",
    a: "We offer stickers in sizes from 2\" × 2\" up to custom sizes. Popular sizes include 2\", 3\", 4\", and 5\" squares, but we can print any custom size you need. Use our calculator to see pricing for your specific size!",
  },
];

const TYPE_FAQS: Record<StickerType, FAQ[]> = {
  vinyl: [
    {
      q: "Are vinyl stickers waterproof?",
      a: "Yes! Our vinyl stickers are waterproof, weather-resistant, and UV protected. They're perfect for outdoor use on cars, water bottles, coolers, and more. They can even go through the dishwasher (top rack recommended).",
    },
    {
      q: "How long do vinyl stickers last?",
      a: "Our premium vinyl stickers are designed to last 3–5 years outdoors and even longer indoors. They're scratch-resistant and won't fade or peel easily when applied correctly to clean, smooth surfaces.",
    },
    {
      q: "Can I use vinyl stickers outdoors?",
      a: "Yes! Our vinyl stickers are specifically designed for outdoor use. They're weather-resistant, UV protected, and can withstand rain, sun, and temperature changes. Perfect for car windows, outdoor equipment, and more.",
    },
  ],
  holographic: [
    {
      q: "What makes holographic stickers special?",
      a: "Holographic stickers feature a stunning rainbow-shimmer effect that shifts colors as the viewing angle changes. They're eye-catching for branding, packaging, and promotional use.",
    },
    {
      q: "Are holographic stickers durable?",
      a: "Yes! Our holographic stickers are made with premium vinyl and are waterproof, UV resistant, and scratch resistant — just as tough as our standard vinyl stickers.",
    },
    {
      q: "Can holographic stickers be used outdoors?",
      a: "Absolutely. They're weather-resistant and UV protected, so they hold up in outdoor conditions while keeping their eye-catching holographic shine.",
    },
  ],
  glitter: [
    {
      q: "Do glitter stickers shed glitter?",
      a: "No. Our glitter stickers use a glitter-infused vinyl laminate — the sparkle is locked in under a protective layer, so there's no mess or shedding.",
    },
    {
      q: "Are glitter stickers waterproof?",
      a: "Yes! They're fully waterproof and weather-resistant, making them great for water bottles, laptop cases, and outdoor applications.",
    },
    {
      q: "How do glitter stickers look when printed?",
      a: "Your artwork prints on top of a glitter vinyl base, giving the whole sticker a sparkling, textured look. Colors may appear slightly different than on standard vinyl due to the glitter substrate.",
    },
  ],
  chrome: [
    {
      q: "What do chrome stickers look like?",
      a: "Chrome stickers have a mirror-like metallic finish that creates a bold, premium appearance. They're perfect for logos and branding that need to stand out.",
    },
    {
      q: "Do chrome stickers scratch easily?",
      a: "Our chrome stickers are laminated with a protective coating to resist everyday scratching and scuffing. Handle them with care during application for best results.",
    },
    {
      q: "Can chrome stickers be used outdoors?",
      a: "Yes, they're weather-resistant and UV protected. Avoid prolonged direct exposure to harsh chemicals or abrasive surfaces to maintain the mirror finish.",
    },
  ],
  sheets: [
    {
      q: "What are sticker sheets?",
      a: "Sticker sheets let you print multiple smaller designs on a single sheet. Ideal for product packaging, planners, journaling, event giveaways, and Etsy shops.",
    },
    {
      q: "Can I put different designs on one sheet?",
      a: "Yes! You can arrange multiple different designs on a single sheet. Just submit your artwork as a single file with all designs laid out, and we'll print it exactly as shown.",
    },
    {
      q: "Are sticker sheets waterproof?",
      a: "Yes — our sticker sheets are printed on premium waterproof vinyl and are scratch and UV resistant.",
    },
  ],
};

function FAQSection({ type }: { type: StickerType }) {
  const faqs = [...TYPE_FAQS[type], ...COMMON_FAQS];
  return (
    <section className="max-w-3xl mx-auto px-6 py-16">
      <h2
        className="text-xs tracking-[0.35em] uppercase text-gray-500 mb-8"
        style={{ fontFamily: "var(--font-orbitron)" }}
      >
        Frequently Asked Questions
      </h2>
      <div className="divide-y divide-white/6">
        {faqs.map(({ q, a }) => (
          <details key={q} className="group py-5 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
            <summary className="flex items-start justify-between gap-4 select-none">
              <span className="text-sm font-medium text-white/90 leading-snug">{q}</span>
              <span className="mt-0.5 shrink-0 text-gray-500 group-open:rotate-45 transition-transform duration-200">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </span>
            </summary>
            <p className="mt-3 text-sm text-gray-400 leading-relaxed pr-6">{a}</p>
          </details>
        ))}
      </div>
    </section>
  );
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

      <FAQSection type={type as StickerType} />
    </main>
  );
}
