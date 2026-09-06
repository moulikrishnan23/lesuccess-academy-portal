import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import SectionHeading from '../../components/ui/SectionHeading.jsx'
import Skeleton, { SkeletonText } from '../../components/ui/Skeleton.jsx'
import ErrorState, { EmptyState } from '../../components/ui/ErrorState.jsx'
import useCourses from '../../hooks/useCourses.js'
import useDocumentMeta from '../../hooks/useDocumentMeta.js'
import useReducedMotion from '../../hooks/useReducedMotion.js'
import {
  cardHover,
  cardReveal,
  fadeUp,
  ITEM_IN_VIEW,
  motionSafe,
  ONCE_IN_VIEW,
} from '../../animations/variants.js'

/**
 * Splits a duration into the parts the card sets at two different sizes.
 *
 * The catalog runs from 60 to 300 hours — a five-fold spread, and the only
 * figure that varies meaningfully from one course to the next. Setting the
 * numeral large and the unit small turns "how long until I can apply for
 * work" into the thing you can scan down a column, which is why this page
 * splits the value instead of calling formatDuration for one grey string.
 */
function splitDuration(value, unit) {
  const numeric = Number(value)
  if (!Number.isFinite(numeric)) return null

  const word = unit ? String(unit).toLowerCase() : ''
  const singular = numeric === 1 && word.endsWith('s') ? word.slice(0, -1) : word

  return { value: numeric, unit: singular }
}

/**
 * One catalog card.
 *
 * Two treatments, not one. A course carrying a badge is rare — two of twenty —
 * so it earns the filled brand tile and everything else stays quiet. Twenty
 * identical cards give a reader nothing to steer by; one break in the rhythm
 * per screen does.
 *
 * The whole card is the link, so there is no "view course" affordance in the
 * corner: the text would only restate what the cursor already says.
 *
 * Each card observes itself for its reveal rather than inheriting one from the
 * grid — see ITEM_IN_VIEW. Watching the whole grid meant a tall catalog never
 * crossed its own visibility threshold on load and every card stayed invisible
 * until the visitor scrolled.
 *
 * @param {number} column Position within its row, for the cascade delay.
 */
function CourseCard({ course, column, reduced }) {
  const duration = splitDuration(course.durationValue, course.durationUnit)
  const featured = Boolean(course.badgeLabel)

  return (
    <motion.li
      custom={column}
      variants={motionSafe(cardReveal, reduced)}
      initial="hidden"
      whileInView="visible"
      viewport={ITEM_IN_VIEW}
      whileHover={reduced ? undefined : cardHover.hover}
      className="h-full"
    >
      <Link
        to={`/courses/${course.slug}`}
        /*
          `group` drives the hover rule; `overflow-hidden` keeps that rule
          clipped to the radius, and `relative` makes this its containing block.
        */
        className={`group relative flex h-full flex-col overflow-hidden rounded-card p-6 transition-colors duration-200 ${
          featured
            ? 'bg-brand-gradient-diagonal text-white'
            : 'border border-line bg-white'
        }`}
      >
        {/*
          Quiet tile only: the filled tile is already the emphasis and does not
          need a second one drawn across its top edge.
        */}
        {featured ? null : (
          <span
            aria-hidden="true"
            className="bg-brand-gradient absolute inset-x-0 top-0 h-[3px] origin-left scale-x-0 transition-transform duration-300 ease-out group-hover:scale-x-100"
          />
        )}

        {/*
          Category left, duration right. The category is a label, not a badge —
          it says which shelf the course sits on and should not shout twenty
          times down the page.
        */}
        <div className="relative flex items-start justify-between gap-4">
          <span
            className={`pt-1.5 text-[0.8125rem] font-medium ${
              featured ? 'text-white/75' : 'text-ink-muted'
            }`}
          >
            {course.categoryGroup}
          </span>

          {/*
            Numeral and unit share a baseline rather than stacking. The catalog
            mixes hours with one course quoted in months, and a numeral set
            alone invites a comparison the units do not support — "6" beside
            "300" reads as the shorter course when it is the longer one.
          */}
          {duration ? (
            <span className="flex shrink-0 items-baseline gap-1.5">
              <span
                className={`font-display text-[2rem] leading-none font-bold tracking-tight ${
                  featured ? 'text-white' : 'text-navy-800'
                }`}
              >
                {duration.value}
              </span>
              <span
                className={`text-[0.8125rem] ${
                  featured ? 'text-white/75' : 'text-ink-muted'
                }`}
              >
                {duration.unit}
              </span>
            </span>
          ) : null}
        </div>

        <h2
          className={`relative mt-5 font-display text-[1.1875rem] leading-snug font-semibold ${
            featured ? 'text-white' : 'text-navy-800'
          }`}
        >
          {course.title}
        </h2>

        <p
          className={`relative mt-3 grow text-[0.875rem] leading-[1.8] ${
            featured ? 'text-white/85' : 'text-ink-soft'
          }`}
        >
          {course.shortDescription}
        </p>

        {course.discountLabel || course.badgeLabel ? (
          <div
            className={`relative mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 border-t pt-4 text-[0.8125rem] ${
              featured ? 'border-white/25' : 'border-line'
            }`}
          >
            {course.badgeLabel ? (
              <span className="font-semibold text-white">{course.badgeLabel}</span>
            ) : null}
            {course.discountLabel ? (
              <span className={featured ? 'text-white/85' : 'font-semibold text-green'}>
                {course.discountLabel}
              </span>
            ) : null}
          </div>
        ) : null}
      </Link>
    </motion.li>
  )
}

function CourseCardSkeleton() {
  return (
    <li className="rounded-card border border-line bg-white p-6">
      <div className="flex items-start justify-between gap-4">
        <Skeleton className="mt-1 h-4 w-20" />
        <Skeleton className="h-10 w-14" />
      </div>
      <Skeleton className="mt-5 h-5 w-3/4" />
      <SkeletonText lines={3} className="mt-4" />
      <Skeleton className="mt-6 h-3 w-24" />
    </li>
  )
}

/**
 * Course catalog — /courses
 *
 * The one place every published course is reachable from. The navbar's
 * "Course" link and the home page's "View all courses" both land here, and
 * every card leads into the course detail page.
 *
 * Owns the data and passes it down, the same way CourseDetailPage does.
 */
export default function CourseCatalogPage() {
  const reduced = useReducedMotion()
  const { courses, isLoading, error, refetch } = useCourses()

  useDocumentMeta({
    title: 'Courses — LeSuccess Academy',
    description:
      'Job-focused software, data, cloud and business courses in Coimbatore, with live projects and placement support.',
  })

  // Catalog order is the seed's order; sorting is the backend's job once the
  // real endpoint exists. Counting here only feeds the heading.
  const count = useMemo(() => courses.length, [courses])

  return (
    // Tinted ground so the white cards read as cards rather than as ruled
    // boxes drawn on the page.
    <div className="bg-section">
      <section
        aria-labelledby="catalog-title"
        className="mx-auto max-w-6xl px-5 py-14 sm:px-8 lg:py-16"
      >
        <motion.div
          variants={motionSafe(fadeUp, reduced)}
          initial="hidden"
          whileInView="visible"
          viewport={ONCE_IN_VIEW}
        >
          <SectionHeading
            id="catalog-title"
            title="Our Courses"
            lede={
              count
                ? `${count} job-focused programmes in software, data, cloud, marketing and finance — every one taught with live projects and placement support.`
                : 'Job-focused programmes taught with live projects and placement support.'
            }
          />
        </motion.div>

        {isLoading ? (
          <ul
            aria-busy="true"
            aria-label="Loading courses"
            className="mt-10 grid list-none gap-6 p-0 sm:grid-cols-2 lg:grid-cols-3"
          >
            {Array.from({ length: 6 }, (_, index) => (
              <CourseCardSkeleton key={index} />
            ))}
          </ul>
        ) : error ? (
          <ErrorState
            className="mt-10"
            title="The course list didn't load"
            message={error?.message ?? 'The server did not respond. Try again in a moment.'}
            onRetry={refetch}
          />
        ) : count === 0 ? (
          <EmptyState
            className="mt-10"
            title="No courses published yet"
            message="New batches are being finalised. Call us and we will tell you what is starting next."
          />
        ) : (
          <ul className="mt-10 grid list-none gap-6 p-0 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course, index) => (
              <CourseCard
                key={course.id}
                course={course}
                // Three columns at lg; the modulo makes each row cascade rather
                // than delaying card 20 by a second and a half.
                column={index % 3}
                reduced={reduced}
              />
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
