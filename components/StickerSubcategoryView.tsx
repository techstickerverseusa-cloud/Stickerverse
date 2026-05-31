import Link from "next/link";

const SUBCATEGORIES = [
  {
    title: "Vinyl Stickers",
    href: "/stickers/vinyl",
    gradient: "linear-gradient(145deg, #0b1437 0%, #1a2f6e 60%, #0d1a3a 100%)",
    shimmer: "#3b5bdb",
    shape: (
      <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-20 h-20">
        <path d="M60 15 C25 15 10 35 10 60 C10 85 30 105 60 105 C90 105 110 85 110 60 C110 35 95 15 60 15Z"
          fill="#3b5bdb" fillOpacity="0.25" stroke="#4c6ef5" strokeWidth="1.5" />
        <path d="M60 28 C35 28 22 44 22 60 C22 76 36 94 60 94 C84 94 98 76 98 60 C98 44 85 28 60 28Z"
          fill="#3b5bdb" fillOpacity="0.4" />
        <circle cx="60" cy="60" r="18" fill="#4c6ef5" fillOpacity="0.6" />
        <circle cx="60" cy="60" r="10" fill="#748ffc" />
      </svg>
    ),
  },
  {
    title: "Holographic Stickers",
    href: "/stickers/holographic",
    gradient: "linear-gradient(145deg, #1a0533 0%, #4a1272 40%, #2d0a5c 100%)",
    shimmer: "#cc5de8",
    shape: (
      <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-20 h-20">
        <path d="M60 10 L75 42 L110 42 L82 63 L93 95 L60 75 L27 95 L38 63 L10 42 L45 42Z"
          fill="url(#holo)" fillOpacity="0.5" stroke="#da77f2" strokeWidth="1.2" />
        <defs>
          <linearGradient id="holo" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#cc5de8" />
            <stop offset="33%" stopColor="#4dabf7" />
            <stop offset="66%" stopColor="#69db7c" />
            <stop offset="100%" stopColor="#ffd43b" />
          </linearGradient>
        </defs>
        <path d="M60 10 L75 42 L110 42 L82 63 L93 95 L60 75 L27 95 L38 63 L10 42 L45 42Z"
          fill="url(#holo)" fillOpacity="0.35" />
      </svg>
    ),
  },
  {
    title: "Glitter Stickers",
    href: "/stickers/glitter",
    gradient: "linear-gradient(145deg, #1c1000 0%, #5c3200 50%, #2a1800 100%)",
    shimmer: "#ffd43b",
    shape: (
      <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-20 h-20">
        <rect x="18" y="18" width="84" height="84" rx="14" fill="#f59f00" fillOpacity="0.2" stroke="#ffd43b" strokeWidth="1.2" />
        <rect x="28" y="28" width="64" height="64" rx="10" fill="#f59f00" fillOpacity="0.3" />
        <circle cx="45" cy="45" r="5" fill="#ffd43b" fillOpacity="0.9" />
        <circle cx="75" cy="45" r="3" fill="#ffd43b" fillOpacity="0.6" />
        <circle cx="60" cy="60" r="7" fill="#ffd43b" fillOpacity="0.8" />
        <circle cx="45" cy="75" r="3" fill="#ffd43b" fillOpacity="0.6" />
        <circle cx="75" cy="75" r="5" fill="#ffd43b" fillOpacity="0.9" />
        <circle cx="60" cy="35" r="2.5" fill="#ffd43b" fillOpacity="0.7" />
        <circle cx="60" cy="85" r="2.5" fill="#ffd43b" fillOpacity="0.7" />
        <circle cx="35" cy="60" r="2.5" fill="#ffd43b" fillOpacity="0.7" />
        <circle cx="85" cy="60" r="2.5" fill="#ffd43b" fillOpacity="0.7" />
      </svg>
    ),
  },
  {
    title: "Chrome Stickers",
    href: "/stickers/chrome",
    gradient: "linear-gradient(145deg, #111111 0%, #2c2c2c 50%, #111111 100%)",
    shimmer: "#adb5bd",
    shape: (
      <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-20 h-20">
        <path d="M60 12 L108 36 L108 84 L60 108 L12 84 L12 36Z"
          fill="url(#chrome)" fillOpacity="0.35" stroke="#adb5bd" strokeWidth="1.2" />
        <defs>
          <linearGradient id="chrome" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f8f9fa" />
            <stop offset="40%" stopColor="#868e96" />
            <stop offset="70%" stopColor="#f8f9fa" />
            <stop offset="100%" stopColor="#495057" />
          </linearGradient>
        </defs>
        <path d="M60 25 L96 44 L96 76 L60 95 L24 76 L24 44Z" fill="url(#chrome)" fillOpacity="0.6" />
        <circle cx="60" cy="60" r="14" fill="url(#chrome)" fillOpacity="0.9" />
      </svg>
    ),
  },
  {
    title: "Sticker Sheets",
    href: "/stickers/sheets",
    gradient: "linear-gradient(145deg, #001a12 0%, #04421e 50%, #001a12 100%)",
    shimmer: "#51cf66",
    shape: (
      <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-20 h-20">
        <rect x="15" y="10" width="60" height="80" rx="5" fill="#2f9e44" fillOpacity="0.15" stroke="#51cf66" strokeWidth="1.2" />
        <rect x="20" y="16" width="50" height="10" rx="2" fill="#51cf66" fillOpacity="0.35" />
        <rect x="20" y="30" width="22" height="22" rx="3" fill="#51cf66" fillOpacity="0.4" />
        <rect x="46" y="30" width="22" height="22" rx="3" fill="#51cf66" fillOpacity="0.3" />
        <rect x="20" y="56" width="22" height="22" rx="3" fill="#51cf66" fillOpacity="0.3" />
        <rect x="46" y="56" width="22" height="22" rx="3" fill="#51cf66" fillOpacity="0.4" />
        <rect x="45" y="20" width="60" height="80" rx="5" fill="#2f9e44" fillOpacity="0.08" stroke="#40c057" strokeWidth="1" />
        <rect x="55" y="55" width="22" height="22" rx="3" fill="#40c057" fillOpacity="0.25" />
        <rect x="55" y="31" width="22" height="22" rx="3" fill="#40c057" fillOpacity="0.2" />
      </svg>
    ),
  },
];

const TRUST_BADGES = [
  {
    label: "Waterproof & Extreme-Weather Tested",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 17.58A5 5 0 0 0 18 8h-1.26A8 8 0 1 0 4 16.25" />
        <line x1="8" y1="16" x2="8.01" y2="16" /><line x1="8" y1="20" x2="8.01" y2="20" />
        <line x1="12" y1="18" x2="12.01" y2="18" /><line x1="12" y1="22" x2="12.01" y2="22" />
        <line x1="16" y1="16" x2="16.01" y2="16" /><line x1="16" y1="20" x2="16.01" y2="20" />
      </svg>
    ),
  },
  {
    label: "Premium Quality, Made in the USA",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
  },
  {
    label: "Free Online Proof With All Orders",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21 15 16 10 5 21" />
      </svg>
    ),
  },
];

export default function StickerSubcategoryView() {
  return (
    <section className="px-6 pb-16">
      <div className="max-w-5xl mx-auto">

        {/* ── Sub-category cards ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-10">
          {SUBCATEGORIES.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group flex flex-col rounded-xl overflow-hidden border border-white/[0.07] hover:border-white/[0.22] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_50px_rgba(0,0,0,0.6)]"
              style={{ background: item.gradient }}
            >
              {/* Art area */}
              <div className="flex items-center justify-center pt-6 pb-4 px-4 flex-1 min-h-[120px]">
                <div className="group-hover:scale-105 transition-transform duration-300">
                  {item.shape}
                </div>
              </div>

              {/* Label */}
              <div
                className="px-4 py-3 flex items-center justify-between border-t border-white/[0.06]"
                style={{ background: "rgba(0,0,0,0.3)" }}
              >
                <span
                  className="text-[10px] sm:text-[11px] font-bold tracking-[0.08em] uppercase text-gray-300 group-hover:text-white transition-colors duration-200 leading-snug"
                  style={{ fontFamily: "var(--font-orbitron)" }}
                >
                  {item.title}
                </span>
                <svg
                  width="11" height="11" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.5"
                  className="text-gray-500 group-hover:text-white group-hover:translate-x-0.5 transition-all duration-200 flex-shrink-0 ml-2"
                >
                  <path d="m5 12 14 0M13 6l6 6-6 6" />
                </svg>
              </div>
            </Link>
          ))}
        </div>

        {/* ── Trust badges ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {TRUST_BADGES.map(({ label, icon }) => (
            <div
              key={label}
              className="flex items-center gap-4 border border-white/[0.07] bg-white/[0.02] px-5 py-4 rounded-sm"
            >
              <div className="text-indigo-400 flex-shrink-0">{icon}</div>
              <p className="text-xs text-gray-300 font-medium leading-snug">{label}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
