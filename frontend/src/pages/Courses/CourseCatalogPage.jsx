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
  fadeUp,
  motionSafe,
  ONCE_IN_VIEW,
  staggerContainer,
} from '../../animations/variants.js'
import { formatDuration } from '../../utils/formatters.js'

/**
 * One catalog card. The whole card is the link, so the click target is the
 * card rather than a small "view" affordance in the corner.
 */
function CourseCard({ course, reduced }) {
  const duration = formatDuration(course.durationValue, course.durationUnit)

  return (
    <motion.li variants={fadeUp} whileHover={reduced ? undefined : cardHover.hover}>
      <Link
        to={`/courses/${course.slug}`}
        className="flex h-full flex-col rounded-card border border-line bg-white p-6 transition-colors hover:border-line-strong"
      >
        {/* Reserve the badge row on every card so titles align across a row. */}
        <div className="flex min-h-6 items-start justify-between gap-3">
          {course.categoryGroup ? (
            <span className="rounded-full bg-brand-soft px-3 py-1 text-[0.6875rem] font-semibold tracking-[0.08em] text-brand uppercase">
              {course.categoryGroup}
            </span>
          ) : (
            <span />
          )}

          {course.badgeLabel ? (
            <span className="rounded-md border border-green-soft bg-green-soft px-2.5 py-1 text-[0.6875rem] font-semibold text-green">
              {course.badgeLabel}
            </span>
          ) : null}
        </div>

        <h2 className="mt-4 font-display text-lg leading-snug font-semibold text-navy-800">
          {course.title}
        </h2>

        <p className="mt-3 grow text-[0.875rem] leading-[1.8] text-ink-soft">
          {course.shortDescription}
        </p>

        <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-line pt-4 text-[0.8125rem] text-ink-soft">
          {duration ? <span>{duration}</span> : null}
          {course.discountLabel ? (
            <span className="font-semibold text-green">{course.discountLabel}</span>
          ) : null}
          <span aria-hidden="true" className="ml-auto font-medium text-brand">
            View course →
          </span>
        </div>
      </Link>
    </motion.li>
  )
}

function CourseCardSkeleton() {
  return (
    <li className="rounded-card border border-line bg-white p-6">
      <Skeleton className="h-5 w-24" rounded="rounded-full" />
      <Skeleton className="mt-4 h-5 w-3/4" />
      <SkeletonText lines={3} className="mt-4" />
      <Skeleton className="mt-6 h-3 w-28" />
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
    <section aria-labelledby="catalog-title" className="mx-auto max-w-6xl px-5 py-14 sm:px-8 lg:py-16">
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
        <motion.ul
          variants={motionSafe(staggerContainer, reduced)}
          initial="hidden"
          whileInView="visible"
          viewport={ONCE_IN_VIEW}
          className="mt-10 grid list-none gap-6 p-0 sm:grid-cols-2 lg:grid-cols-3"
        >
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} reduced={reduced} />
          ))}
        </motion.ul>
      )}
    </section>
  )
}
