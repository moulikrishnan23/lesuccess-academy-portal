import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, ExternalLink, Star, Check } from "lucide-react";
import { useAppData } from "../../context/AppDataContext.jsx";
import { getImageUrl } from "../../utils/imageUtils.js";
import { GOOGLE_REVIEWS, GOOGLE_REVIEWS_META } from "../../data/googleReviews.js";
import useAnimationActive from "../../hooks/useAnimationActive.js";
import SectionHead from "./SectionHead.jsx";
import useClipReveal from "./useClipReveal.js";
import { Reveal, useInView, useReducedMotion } from "../motion/index.js";

const AUTO_MS = 5000;
const GAP_PX = 24; // the carousel's 1.5rem gap

/** Width of one slide plus the gap: the distance between scroll stops. */
function slideStep(track) {
  const first = track?.firstElementChild;
  return first ? first.offsetWidth + GAP_PX : 1;
}

/** Scrolls to slide `index`; past the end wraps to the start. */
function scrollToSlide(track, index, smooth) {
  if (!track) return;
  const max = track.scrollWidth - track.clientWidth;
  const target = index * slideStep(track);
  track.scrollTo({ left: target > max + 10 ? 0 : Math.max(0, target), behavior: smooth ? "smooth" : "auto" });
}

function Stars({ count = 5, size = 18 }) {
  return (
    <div className="lh-stars" role="img" aria-label={`${count} out of 5 stars`}>
      {Array.from({ length: count }, (_, i) => (
        <Star key={i} size={size} fill="currentColor" strokeWidth={0} style={{ "--s": i }} aria-hidden="true" />
      ))}
    </div>
  );
}

/** One review card; its stars pop in one by one when it scrolls into view. */
function ReviewCard({ review, expanded, onToggle }) {
  const ref = useRef(null);
  const inView = useInView(ref, { threshold: 0.2 });
  const text = review.text || "";
  const long = text.length > 160;

  return (
    <article ref={ref} className={`lh-glass lh-testi${inView ? " is-in" : ""}`}>
      <div className="flex items-center justify-between gap-2">
        <Stars count={review.rating || 5} />
        <span className="lh-verified">
          <Check size={12} aria-hidden="true" />
          Verified
        </span>
      </div>
      <q>
        {expanded || !long ? text : `${text.slice(0, 160)}…`}
        {long && (
          <>
            {" "}
            <button type="button" className="lh-testi-more" onClick={onToggle}>
              {expanded ? "Less" : "More"}
            </button>
          </>
        )}
      </q>
      <div className="lh-who">
        <div className="lh-av">
          {review.photoUrl ? (
            <img src={getImageUrl(review.photoUrl, "", { width: 160 })} alt="" loading="lazy" decoding="async" />
          ) : (
            (review.name || "S").trim().charAt(0).toUpperCase()
          )}
        </div>
        <div>
          <b>{review.name}</b>
          <small>{review.date || review.reviewCount}</small>
          {review.course && (
            <>
              <br />
              <span className="lh-ctag">{review.course}</span>
            </>
          )}
        </div>
      </div>
    </article>
  );
}

/**
 * "Verified Reviews from Our Learners" (spec: docs/mockup/lower-home.html,
 * #testimonials): a light band with the Google rating, and an auto-advancing,
 * swipeable carousel with a progress bar that pauses on hover or focus.
 *
 * Reviews come from the admin-managed testimonials, falling back to the
 * verified Google reviews; their order is the admin's displayOrder.
 */
export default function Testimonials() {
  const { testimonials } = useAppData();
  const reduced = useReducedMotion();
  const sectionRef = useRef(null);
  const trackRef = useRef(null);
  const active = useAnimationActive(sectionRef);
  useClipReveal(sectionRef);

  const [expandedIds, setExpandedIds] = useState(() => new Set());
  const [page, setPage] = useState(0);
  const [pageCount, setPageCount] = useState(1);
  const [paused, setPaused] = useState(false);
  const [cycle, setCycle] = useState(0);

  const reviews = useMemo(() => {
    const list =
      Array.isArray(testimonials?.data) && testimonials.data.length > 0
        ? testimonials.data
        : GOOGLE_REVIEWS;
    return [...list].sort((a, b) =>
      typeof a.displayOrder === "number" && typeof b.displayOrder === "number"
        ? a.displayOrder - b.displayOrder
        : 0,
    );
  }, [testimonials?.data]);

  const toggleExpand = (id) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const goTo = (index) => scrollToSlide(trackRef.current, index, !reduced);

  // Pages = positions the first visible card can take. Measured in the
  // ResizeObserver callback, which also fires once on observe.
  useEffect(() => {
    const track = trackRef.current;
    if (!track || typeof ResizeObserver === "undefined") return undefined;
    const ro = new ResizeObserver(() => {
      const perView = Math.max(1, Math.round(track.clientWidth / slideStep(track)));
      setPageCount(Math.max(1, reviews.length - perView + 1));
    });
    ro.observe(track);
    return () => ro.disconnect();
  }, [reviews.length]);

  // Auto-advance; each tick also restarts the progress bar (keyed on `cycle`).
  useEffect(() => {
    if (reduced || paused || !active || pageCount <= 1) return undefined;
    const timer = setInterval(() => {
      setCycle((c) => c + 1);
      const track = trackRef.current;
      if (!track) return;
      const next = Math.round(track.scrollLeft / slideStep(track)) + 1;
      scrollToSlide(track, next >= pageCount ? 0 : next, true);
    }, AUTO_MS);
    return () => clearInterval(timer);
  }, [reduced, paused, active, pageCount]);

  return (
    <section ref={sectionRef} id="testimonials" className="lh-sec lh-testimonials-light lh-rv">
      <div className="lh-wrap">
        <SectionHead
          center
          badge="Student Testimonials"
          title="Verified Reviews from Our"
          highlight="Learners"
          lead="Real feedback from graduates who transformed their careers with LeSuccess Academy."
        >
          <div className="lh-rate">
            <span className="grid h-7 w-7 place-items-center rounded-full border border-slate-200 font-extrabold text-[#4285F4]">
              G
            </span>
            <span>
              Rated <b>{GOOGLE_REVIEWS_META.rating}/5</b>, <b>250+</b> Google Reviews
            </span>
            <Stars size={16} />
          </div>
        </SectionHead>

        <Reveal
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocus={() => setPaused(true)}
          onBlur={() => setPaused(false)}
        >
          <div
            ref={trackRef}
            className="lh-car"
            tabIndex={0}
            aria-label="Student testimonials"
            onScroll={(e) => setPage(Math.round(e.currentTarget.scrollLeft / slideStep(e.currentTarget)))}
            onKeyDown={(e) => {
              if (e.key === "ArrowRight") goTo(page + 1);
              if (e.key === "ArrowLeft") goTo(page - 1);
            }}
          >
            {reviews.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                expanded={expandedIds.has(review.id)}
                onToggle={() => toggleExpand(review.id)}
              />
            ))}
          </div>

          {pageCount > 1 && (
            <div className="lh-car-ctl">
              <div className="lh-dots">
                {Array.from({ length: pageCount }, (_, i) => (
                  <button
                    key={i}
                    type="button"
                    aria-label={`Go to slide ${i + 1}`}
                    aria-current={i === page ? "true" : undefined}
                    onClick={() => goTo(i)}
                  />
                ))}
              </div>
              {!reduced && (
                <div className={`lh-prog${paused || !active ? "" : " is-running"}`} style={{ "--prog-ms": `${AUTO_MS}ms` }} aria-hidden="true">
                  <i key={cycle} />
                </div>
              )}
              <div className="lh-arrows">
                <button type="button" aria-label="Previous review" onClick={() => goTo(page - 1)}>
                  <ChevronLeft size={20} aria-hidden="true" />
                </button>
                <button type="button" aria-label="Next review" onClick={() => goTo(page + 1)}>
                  <ChevronRight size={20} aria-hidden="true" />
                </button>
              </div>
            </div>
          )}
        </Reveal>

        <div className="mt-10 text-center">
          <a
            href={GOOGLE_REVIEWS_META.writeReviewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="lh-btn lh-btn-o"
          >
            Write a review
            <ExternalLink size={16} aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
}
