import { motion } from 'framer-motion'
import SectionHeading from '../ui/SectionHeading.jsx'
import { SkeletonText } from '../ui/Skeleton.jsx'
import { fadeUp, motionSafe, ONCE_IN_VIEW } from '../../animations/variants.js'
import useReducedMotion from '../../hooks/useReducedMotion.js'
import { sanitizeHtml } from '../../utils/sanitize.js'

/**
 * "Why Learn …?" — the course's own description, with the enroll card alongside.
 *
 * The heading uses `course.category` (the short course name) rather than the
 * full SEO title, because the reference reads "Why Learn Python Full Stack?"
 * while the hero above it carries the longer "… course in Coimbatore" form.
 *
 * Content only. The page owns the two-column layout and the enroll card, so
 * that one sticky column can run alongside this section *and* the three that
 * follow it — see CourseDetailPage.
 */
export default function WhyLearnSection({ course, isLoading }) {
  const reduced = useReducedMotion()

  // Sanitized immediately before use; the result is trusted only because it
  // just came out of DOMPurify.
  const safeDescription = sanitizeHtml(course?.description)
  const subject = course?.category || course?.title

  return (
    <section aria-labelledby="why-learn-title" className="pt-12 lg:pt-14">
      <motion.div
        variants={motionSafe(fadeUp, reduced)}
        initial="hidden"
        whileInView="visible"
        viewport={ONCE_IN_VIEW}
      >
        <SectionHeading
          id="why-learn-title"
          title={subject ? `Why Learn ${subject}?` : 'About this course'}
        />

        <div className="mt-6">
          {isLoading ? (
            <SkeletonText lines={7} />
          ) : safeDescription ? (
            // Safe: sanitizeHtml() runs DOMPurify with a narrow allowlist.
            <div
              className="prose-course"
              dangerouslySetInnerHTML={{ __html: safeDescription }}
            />
          ) : (
            <p className="prose-course">
              {course?.shortDescription ||
                'A full description of this course is on its way. Ask us anything in the meantime — we will call you back.'}
            </p>
          )}
        </div>
      </motion.div>
    </section>
  )
}
