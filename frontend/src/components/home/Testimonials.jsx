import { useState } from "react";
import { ChevronLeft, ChevronRight, Star, ShieldCheck } from "lucide-react";
import { GOOGLE_REVIEWS, GOOGLE_REVIEWS_META } from "../../data/googleReviews.js";

const CARDS_PER_VIEW = 3;

export default function Testimonials() {
  const [startIndex, setStartIndex] = useState(0);
  const maxStart = Math.max(0, GOOGLE_REVIEWS.length - CARDS_PER_VIEW);

  const goPrev = () => setStartIndex((i) => Math.max(0, i - 1));
  const goNext = () => setStartIndex((i) => Math.min(maxStart, i + 1));

  const visible = GOOGLE_REVIEWS.slice(startIndex, startIndex + CARDS_PER_VIEW);

  return (
    <section className="relative w-full bg-white py-20 px-6 sm:px-10 lg:px-16 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-12">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-rose-500 px-4 py-1.5 text-xs font-semibold tracking-wide text-rose-600 mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
              STUDENT TESTIMONIALS
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">
              What Our <span className="text-rose-600">Students Say</span>
            </h2>
          </div>

          {/* Google Review Badge */}
          <div className="flex items-center gap-3.5 bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 shadow-xs">
            <svg viewBox="0 0 24 24" className="w-8 h-8 shrink-0" aria-hidden="true">
              <path
                fill="#4285F4"
                d="M23.52 12.27c0-.85-.08-1.66-.22-2.44H12v4.62h6.47a5.54 5.54 0 0 1-2.4 3.64v3h3.88c2.27-2.09 3.57-5.17 3.57-8.82Z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.96-1.07 7.95-2.91l-3.88-3c-1.08.72-2.46 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.26v3.1A12 12 0 0 0 12 24Z"
              />
              <path
                fill="#FBBC05"
                d="M5.27 14.28A7.2 7.2 0 0 1 4.89 12c0-.79.14-1.56.38-2.28v-3.1H1.26A12 12 0 0 0 0 12c0 1.94.46 3.77 1.26 5.38l4.01-3.1Z"
              />
              <path
                fill="#EA4335"
                d="M12 4.77c1.76 0 3.34.6 4.58 1.79l3.44-3.44C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.69 1.26 6.62l4.01 3.1C6.22 6.88 8.87 4.77 12 4.77Z"
              />
            </svg>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-slate-900 leading-tight">
                  Rated {GOOGLE_REVIEWS_META.rating}/5
                </span>
                <div className="flex text-[#FFC400]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={13} fill="#FFC400" />
                  ))}
                </div>
              </div>
              <p className="text-xs text-blue-600 font-medium">
                {GOOGLE_REVIEWS_META.totalReviews}+ Verified Google Reviews
              </p>
            </div>
          </div>
        </div>

        {/* Carousel View */}
        <div className="relative">
          <button
            type="button"
            onClick={goPrev}
            disabled={startIndex === 0}
            aria-label="Previous testimonials"
            className="hidden md:flex absolute -left-5 top-1/2 -translate-y-1/2 z-10 items-center justify-center w-11 h-11 rounded-full bg-white shadow-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition"
          >
            <ChevronLeft size={20} />
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {visible.map((review) => (
              <div
                key={review.id}
                className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-7 shadow-xs hover:shadow-md hover:border-rose-400 transition-all duration-300"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex text-[#FFC400]">
                      {[...Array(review.rating)].map((_, i) => (
                        <Star key={i} size={16} fill="#FFC400" />
                      ))}
                    </div>
                    <span className="text-xs text-slate-400">{review.date}</span>
                  </div>

                  <p className="text-sm leading-relaxed text-slate-700 italic">
                    &ldquo;{review.text}&rdquo;
                  </p>
                </div>

                <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">
                      {review.name}
                    </h4>
                    <p className="text-xs text-rose-600 font-medium mt-0.5">
                      {review.course}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-slate-400 text-xs">
                    <ShieldCheck size={14} className="text-blue-500" />
                    <span>Google</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={goNext}
            disabled={startIndex >= maxStart}
            aria-label="Next testimonials"
            className="hidden md:flex absolute -right-5 top-1/2 -translate-y-1/2 z-10 items-center justify-center w-11 h-11 rounded-full bg-white shadow-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Mobile slide indicator */}
        <div className="mt-8 flex justify-center gap-2 md:hidden">
          {Array.from({ length: GOOGLE_REVIEWS.length }).map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setStartIndex(Math.min(maxStart, idx))}
              className={`h-2 rounded-full transition-all ${
                startIndex === idx ? "w-6 bg-rose-600" : "w-2 bg-slate-300"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
