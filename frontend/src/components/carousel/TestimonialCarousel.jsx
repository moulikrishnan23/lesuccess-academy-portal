import { motion } from 'framer-motion'
import Carousel from './Carousel.jsx'
import TestimonialCard from '../cards/TestimonialCard.jsx'
import SectionHeading from '../ui/SectionHeading.jsx'
import Skeleton from '../ui/Skeleton.jsx'
import ErrorState from '../ui/ErrorState.jsx'
import { GoogleIcon } from '../ui/icons.jsx'
import { fadeUp, motionSafe, ONCE_IN_VIEW } from '../../animations/variants.js'
import useReducedMotion from '../../hooks/useReducedMotion.js'

/** "G  Rated 4.6/5 / 250+ Google Reviews", as in the reference header. */
function RatingSummary({ rating, reviewCount }) {
  // Settings are decorative here — with neither value, show nothing rather
  // than "undefined/5".
  if (!rating && !reviewCount) return null

  return (
    // shrink-0: the heading beside it must give up width first, not this.
    <div className="flex shrink-0 items-center gap-3">
      {/* The mark sits on its own white disc, as on the reference badge. */}
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white shadow-[0_2px_8px_rgba(11,42,69,0.16)]">
        <GoogleIcon size={24} />
      </span>
      <span>
        {rating ? (
          <span className="block font-display text-[1rem] font-bold text-ink">
            Rated {rating}/5
          </span>
        ) : null}
        {reviewCount ? (
          <span className="block whitespace-nowrap text-[0.8125rem] text-navy-600">
            {reviewCount}+ Google Reviews
          </span>
        ) : null}
      </span>
    </div>
  )
}

function TestimonialSkeleton() {
  return (
    <div className="rounded-2xl border-2 border-line bg-white p-6">
      <div className="space-y-2.5 px-9 pt-7">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="mx-auto h-3 w-2/3" />
      </div>
      <div className="mt-6 flex items-center gap-4">
        <Skeleton className="h-15 w-15" rounded="rounded-xl" />
        <div className="space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
    </div>
  )
}

/**
 * "What Our Students Say".
 *
 * Presentational: the page fetches, this renders. It reuses the shared Carousel
 * rather than forking it, so slide timing matches every other carousel on the
 * site.
 *
 * EMPTY STATE DECISION: when a course has no approved testimonials the whole
 * section is hidden (returns null) rather than falling back to general reviews.
 * A review of a different course under this course's heading reads as a review
 * of *this* course. The page drops the matching tab to keep the tab bar honest.
 */
export default function TestimonialCarousel({
  testimonials,
  isLoading,
  error,
  onRetry,
  rating,
  reviewCount,
}) {
  const reduced = useReducedMotion()

  const hasNothingToShow = !isLoading && !error && testimonials.length === 0
  if (hasNothingToShow) return null

  return (
    /*
      A contained panel rather than a full-bleed band: this section sits in the
      left column of the course page's grid so the enroll card can stay fixed
      all the way down to it. Same reason ModulesAccordion is a panel — a
      background cannot bleed to the viewport edge from inside a max-width
      column without 100vw, which reintroduces horizontal scrolling.
    */
    <section
      id="testimonials"
      aria-labelledby="testimonials-title"
      /*
        Same three-layer elevation as the enroll card beside it, scaled down.

        A panel this large carries a shadow differently from a 400px card: the
        same opacities would read as a drop-shadow effect rather than as depth.
        The contact and body layers are lightened and the ambient layer spread
        wider, so the panel lifts off the white page at the same apparent height
        as the card without shouting.
      */
      className="overflow-hidden rounded-card bg-section ring-1 ring-navy-900/[0.05] shadow-[0_1px_2px_rgba(18,58,92,0.04),0_10px_24px_-12px_rgba(18,58,92,0.10),0_36px_64px_-32px_rgba(18,58,92,0.22)]"
    >
      <motion.div
        variants={motionSafe(fadeUp, reduced)}
        initial="hidden"
        whileInView="visible"
        viewport={ONCE_IN_VIEW}
        className="px-6 py-12 sm:px-8 lg:py-14"
      >
        {/*
          The badge sits beside the heading rather than pushed to the far edge
          (no justify-between) — the two read as one title block, as in the
          reference.
        */}
        {/*
          Stacked, not side by side.

          The reference puts the Google badge next to the title, but that was
          drawn for a full-width band. This section now lives in the course
          page's content column — about 704px — and a flex row there left the
          title 358px, breaking "What Our Students Say" across two lines. The
          badge sits under the title instead, which keeps the title on one line
          and reads as one block either way.
        */}
        <div className="flex flex-col gap-4">
          <SectionHeading
            id="testimonials-title"
            title="What Our Students Say"
            tone="ink"
            weight="bold"
          />
          <RatingSummary rating={rating} reviewCount={reviewCount} />
        </div>

        <div className="mt-8">
          {isLoading ? (
            <div
              aria-busy="true"
              aria-label="Loading student reviews"
              className="grid gap-5 sm:grid-cols-2"
            >
              {Array.from({ length: 3 }, (_, index) => (
                <TestimonialSkeleton key={index} />
              ))}
            </div>
          ) : error ? (
            <ErrorState
              title="Reviews didn't load"
              message="The rest of the page is fine — this section just couldn't reach the server."
              onRetry={onRetry}
            />
          ) : (
            <Carousel
              items={testimonials}
              label="Student reviews"
              /*
                One per view, not two.

                The section now shares a row with the enroll card, so the column
                is about 704px at every desktop width — max-w-6xl minus the card
                and the gap. Two cards there would be 335px each, roughly 260px
                of text once the padding is off, which turns every quote into a
                tower. One card fills 704px, wider than the 545px each got when
                two shared the full-width band, so the quotes read better even
                though you see one at a time. The arrows page through the rest.
              */
              breakpoints={{ sm: 1, lg: 1 }}
              renderItem={(testimonial) => (
                <TestimonialCard testimonial={testimonial} />
              )}
            />
          )}
        </div>
      </motion.div>
    </section>
  )
}
