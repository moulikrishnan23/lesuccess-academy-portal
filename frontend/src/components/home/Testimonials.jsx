import { useState, useEffect } from "react";
import {
  Star,
  ChevronLeft,
  ChevronRight,
  Heart,
  Share2,
  MoreVertical,
  Info,
  ExternalLink,
} from "lucide-react";
import { motion } from "framer-motion";
import { fadeUp, motionSafe, ONCE_IN_VIEW } from "../../animations/variants.js";
import useReducedMotion from "../../hooks/useReducedMotion.js";
import apiClient from "../../services/apiClient.js";
import { GOOGLE_REVIEWS, GOOGLE_REVIEWS_META } from "../../data/googleReviews.js";

const AVATAR_COLORS = [
  "bg-[#07405C]",
  "bg-[#024D72]",
  "bg-[#101010]",
  "bg-[#DF1E26]",
  "bg-[#CA164B]",
];

function getAvatarColor(name = "") {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export default function Testimonials() {
  const reduced = useReducedMotion();
  const [reviews, setReviews] = useState(GOOGLE_REVIEWS);
  const [expandedIds, setExpandedIds] = useState(new Set());
  const [likedMap, setLikedMap] = useState({});
  const [startIndex, setStartIndex] = useState(0);

  // Fetch dynamically from backend database API
  useEffect(() => {
    let isMounted = true;
    apiClient
      .get("/api/testimonials")
      .then((res) => {
        if (!isMounted) return;
        const apiData = Array.isArray(res) ? res : res?.data;
        if (Array.isArray(apiData) && apiData.length > 0) {
          const mapped = apiData.map((t) => ({
            id: t.id,
            name: t.studentName,
            reviewCount: t.reviewerRole || "1 review",
            course: t.courseName || "",
            rating: t.rating || 5,
            date: t.reviewDate || "Recently",
            text: t.reviewText,
            likesCount: t.likesCount || 0,
            photoUrl: t.photoUrl,
            verified: true,
          }));
          setReviews(mapped);
        }
      })
      .catch((_err) => {
        // Fallback to local authentic GOOGLE_REVIEWS on error
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const cardsPerPage = 3;
  const maxStart = Math.max(0, reviews.length - cardsPerPage);

  const goPrev = () => setStartIndex((i) => Math.max(0, i - 1));
  const goNext = () => setStartIndex((i) => Math.min(maxStart, i + 1));

  const toggleExpand = (id) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleLike = (id, defaultCount) => {
    setLikedMap((prev) => {
      const current = prev[id];
      if (current) {
        return { ...prev, [id]: null };
      }
      return { ...prev, [id]: (defaultCount || 0) + 1 };
    });
  };

  const sortedReviews = [...reviews].sort((a, b) => (b.rating || 5) - (a.rating || 5));
  const visibleReviews = sortedReviews.slice(startIndex, startIndex + cardsPerPage);

  return (
    <section className="relative w-full bg-slate-50/70 py-20 px-4 sm:px-8 lg:px-16 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          variants={motionSafe(fadeUp, reduced)}
          initial="hidden"
          whileInView="visible"
          viewport={ONCE_IN_VIEW}
          className="text-center max-w-3xl mx-auto mb-10"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-[#07405C]/30 bg-[#07405C]/5 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-[#07405C]">
            Student Testimonials
          </span>
          <h2 className="mt-3 text-3xl font-extrabold text-[#101010] sm:text-4xl tracking-tight">
            Verified Reviews from Our <span className="text-[#DF1E26]">Learners</span>
          </h2>
          <p className="mt-2 text-base text-slate-600">
            Real feedback from graduates who transformed their careers with LeSuccess Academy.
          </p>
        </motion.div>

        {/* Google Reviews Style Card */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-200/50 p-6 sm:p-10 transition-all">
          {/* Card Top Header */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-3">
                <h3 className="text-2xl sm:text-3xl font-bold text-[#101010] tracking-tight">
                  {GOOGLE_REVIEWS_META.placeName}
                </h3>
                {/* Google Multi-Color Icon */}
                <svg viewBox="0 0 24 24" className="w-6 h-6 shrink-0" aria-label="Google">
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
              </div>
              <p className="mt-1 text-xs sm:text-sm text-slate-500 max-w-xl">
                {GOOGLE_REVIEWS_META.address}
              </p>

              {/* Overall Rating & Star Count */}
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <span className="text-3xl sm:text-4xl font-black text-[#101010]">
                  {GOOGLE_REVIEWS_META.rating}
                </span>
                <div className="flex items-center text-[#ffb800] gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={22}
                      className={
                        i < Math.floor(GOOGLE_REVIEWS_META.rating)
                          ? "fill-[#ffb800] text-[#ffb800]"
                          : i < GOOGLE_REVIEWS_META.rating
                          ? "fill-[#ffb800]/50 text-[#ffb800]"
                          : "text-slate-300"
                      }
                    />
                  ))}
                </div>
                <span className="text-sm sm:text-base font-semibold text-slate-600">
                  {GOOGLE_REVIEWS_META.totalReviews} reviews
                </span>
                <Info size={16} className="text-slate-400" />
              </div>
            </div>

            {/* Write a review button */}
            <div className="shrink-0 pt-2 sm:pt-0">
              <a
                href={GOOGLE_REVIEWS_META.writeReviewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-[#07405C] bg-white px-6 py-2.5 text-sm font-bold text-[#07405C] shadow-xs hover:bg-[#07405C] hover:text-white transition-all cursor-pointer"
              >
                <span>Write a review</span>
                <ExternalLink size={14} />
              </a>
            </div>
          </div>

          {/* Carousel / Multi-Column Reviews Cards */}
          <div className="relative mt-8">
            {/* Desktop Navigation Arrows */}
            {reviews.length > cardsPerPage && (
              <>
                <button
                  type="button"
                  onClick={goPrev}
                  disabled={startIndex === 0}
                  aria-label="Previous review"
                  className="hidden lg:flex absolute -left-5 top-1/2 -translate-y-1/2 z-10 w-11 h-11 items-center justify-center rounded-full bg-white border border-slate-200 shadow-md text-slate-700 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition"
                >
                  <ChevronLeft size={22} />
                </button>
                <button
                  type="button"
                  onClick={goNext}
                  disabled={startIndex >= maxStart}
                  aria-label="Next review"
                  className="hidden lg:flex absolute -right-5 top-1/2 -translate-y-1/2 z-10 w-11 h-11 items-center justify-center rounded-full bg-white border border-slate-200 shadow-md text-slate-700 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition"
                >
                  <ChevronRight size={22} />
                </button>
              </>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {visibleReviews.map((review) => {
                const initial = review.name ? review.name.trim().charAt(0).toUpperCase() : "S";
                const isExpanded = expandedIds.has(review.id);
                const displayLikes =
                  likedMap[review.id] !== undefined
                    ? likedMap[review.id]
                    : review.likesCount || 0;
                const isLiked = !!likedMap[review.id];

                return (
                  <div
                    key={review.id}
                    className="group flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-7 shadow-xs hover:shadow-[0_16px_36px_rgba(7,64,92,0.08)] hover:-translate-y-1.5 hover:border-slate-300 transition-all duration-300"
                  >
                    <div>
                      {/* Reviewer Header: Avatar, Name, Review Count, 3-dots */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          {review.photoUrl ? (
                            <img
                              src={review.photoUrl}
                              alt={review.name}
                              className="w-11 h-11 rounded-full object-cover"
                            />
                          ) : (
                            <div
                              className={`w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-inner ${getAvatarColor(
                                review.name
                              )}`}
                            >
                              {initial}
                            </div>
                          )}
                          <div>
                            <h4 className="font-bold text-slate-900 text-sm sm:text-base leading-tight">
                              {review.name}
                            </h4>
                            <p className="text-xs text-slate-500 mt-0.5">
                              {review.reviewCount || "1 review"}
                            </p>
                          </div>
                        </div>

                    </div>
                    {/* Stars and Date */}
                    <div className="mt-3 flex items-center gap-2">
                      <div className="flex text-[#ffb800]">
                        {[...Array(review.rating || 5)].map((_, i) => (
                          <Star key={i} size={15} fill="#ffb800" stroke="#ffb800" />
                        ))}
                      </div>
                      <span className="text-xs text-slate-500 font-medium">
                        {review.date}
                      </span>
                    </div>

                    {/* Review Text with ... More toggle */}
                    <p className="mt-3 text-sm text-slate-700 leading-relaxed font-normal">
                      {isExpanded || review.text.length <= 160 ? (
                        review.text
                      ) : (
                        <>
                          {review.text.slice(0, 160)}
                          <span>... </span>
                          <button
                            type="button"
                            onClick={() => toggleExpand(review.id)}
                            className="text-slate-500 hover:text-slate-900 font-medium text-xs inline underline cursor-pointer"
                          >
                            More
                          </button>
                        </>
                      )}
                    </p>
                  </div>

                  {/* Footer Actions: Heart/Like and Course Tag */}
                  <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <button
                        type="button"
                        onClick={() => toggleLike(review.id, review.likesCount)}
                        aria-label="Like review"
                        className={`inline-flex items-center gap-1.5 text-xs font-semibold transition cursor-pointer ${
                          isLiked
                            ? "text-[#DF1E26]"
                            : "text-slate-400 hover:text-[#DF1E26]"
                        }`}
                      >
                        <Heart
                          size={16}
                          className={isLiked ? "fill-[#DF1E26] text-[#DF1E26]" : ""}
                        />
                        {displayLikes > 0 && <span>{displayLikes}</span>}
                      </button>
                    </div>

                    {review.course && (
                      <span className="text-[11px] font-bold text-[#DF1E26] bg-[#DF1E26]/10 px-2.5 py-0.5 rounded-full border border-[#DF1E26]/20">
                        {review.course}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        </div>
      </div>
    </section>
  );
}
