import { getGoogleReviews } from "@/lib/google-reviews";

function StarRating({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <svg
          key={n}
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill={n <= rating ? "#facc15" : "none"}
          stroke={n <= rating ? "#facc15" : "#374151"}
          strokeWidth="1.5"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );
}

export default async function GoogleReviewsSection() {
  const place = await getGoogleReviews();

  if (!place || !place.reviews?.length) return null;

  const topReviews = place.reviews.filter((r) => r.text && r.rating >= 4).slice(0, 6);
  if (!topReviews.length) return null;

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="text-center mb-14 space-y-3">
          <p
            className="text-[10px] tracking-[0.45em] uppercase text-indigo-400 font-semibold"
            style={{ fontFamily: "var(--font-orbitron)" }}
          >
            Google Reviews
          </p>
          <h2
            className="text-3xl md:text-5xl font-black uppercase tracking-tight"
            style={{ fontFamily: "var(--font-orbitron)" }}
          >
            <span className="text-white">What Customers </span>
            <span className="bg-linear-to-r from-yellow-400 via-orange-400 to-yellow-300 bg-clip-text text-transparent">
              Say
            </span>
          </h2>
          <div className="flex items-center justify-center gap-3 pt-2">
            <StarRating rating={Math.round(place.rating)} size={18} />
            <span className="text-white font-bold text-lg" style={{ fontFamily: "var(--font-orbitron)" }}>
              {place.rating.toFixed(1)}
            </span>
            <span className="text-gray-500 text-sm">
              · {place.user_ratings_total.toLocaleString()} reviews on Google
            </span>
          </div>
        </div>

        {/* Review cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {topReviews.map((review, i) => (
            <div
              key={i}
              className="flex flex-col gap-4 p-6 border border-white/6 bg-white/2 hover:border-white/12 transition-colors duration-300"
            >
              {/* Reviewer row */}
              <div className="flex items-center gap-3">
                {/* Avatar fallback with initial */}
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                  style={{ background: "linear-gradient(135deg,#6366f1,#a855f7)" }}
                >
                  {review.author_name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{review.author_name}</p>
                  <p className="text-[11px] text-gray-600">{review.relative_time_description}</p>
                </div>
              </div>

              <StarRating rating={review.rating} />

              <p className="text-sm text-gray-400 leading-relaxed line-clamp-4">
                {review.text}
              </p>
            </div>
          ))}
        </div>

        {/* Link to Google */}
        <div className="text-center mt-10">
          <a
            href={place.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-xs text-gray-500 hover:text-white transition-colors duration-200 tracking-widest uppercase"
            style={{ fontFamily: "var(--font-orbitron)" }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
              <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
            Read all reviews on Google
          </a>
        </div>

      </div>
    </section>
  );
}
