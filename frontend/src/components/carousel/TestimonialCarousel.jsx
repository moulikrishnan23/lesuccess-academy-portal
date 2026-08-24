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
    <div className="flex items-center gap-2.5">
      <GoogleIcon size={26} />
      <span>
        {rating ? (
          <span className="block font-display text-[0.9375rem] font-semibold text-navy-800">
            Rated {rating}/5
          </span>
        ) : null}
        {reviewCount ? (
          <span className="block text-[0.6875rem] text-ink-muted">
            {reviewCount}+ Google Reviews
          </span>
        ) : null}
      </span>
    </div>
  )
}

function TestimonialSkeleton() {
  return (
    <div className="rounded-xl border-2 border-line bg-white p-5">
      <div className="space-y-2.5 px-7 pt-6">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="mx-auto h-3 w-2/3" />
      </div>
      <div className="mt-5 flex items-center gap-3">
        <Skeleton className="h-11 w-11" rounded="rounded-full" />
        <div className="space-y-1.5">
          <Skeleton className="h-3.5 w-24" />
          <Skeleton className="h-2.5 w-16" />
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
    <section
      id="testimonials"
      aria-labelledby="testimonials-title"
      className="bg-section"
    >
      <motion.div
        variants={motionSafe(fadeUp, reduced)}
        initial="hidden"
        whileInView="visible"
        viewport={ONCE_IN_VIEW}
        className="mx-auto max-w-6xl px-5 py-14 sm:px-8 lg:py-16"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <SectionHeading id="testimonials-title" title="What Our Students Say" />
          <RatingSummary rating={rating} reviewCount={reviewCount} />
        </div>

        <div className="mt-8">
          {isLoading ? (
            <div
              aria-busy="true"
              aria-label="Loading student reviews"
              className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
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
              breakpoints={{ sm: 2, lg: 3 }}
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
