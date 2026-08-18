import { motion } from 'framer-motion'
import EnrollCourseForm from '../forms/EnrollCourseForm.jsx'
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
 * The card is sticky from `lg` up so it stays in reach while the prose scrolls.
 * Below `lg` it drops into the flow and MobileEnrollBar provides the standing CTA.
 *
 * `children` renders in the left column beneath the description. In the
 * reference the enroll card sits alongside both this copy and the role section
 * that follows it, so the page nests that section here rather than starting a
 * new full-width row — otherwise the card's height leaves a dead gap below the
 * paragraph.
 */
export default function WhyLearnSection({ course, isLoading, enrollFormRef, children }) {
  const reduced = useReducedMotion()

  // Sanitized immediately before use; the result is trusted only because it
  // just came out of DOMPurify.
  const safeDescription = sanitizeHtml(course?.description)
  const subject = course?.category || course?.title

  return (
    <section
      aria-labelledby="why-learn-title"
      className="mx-auto max-w-6xl px-5 pt-12 pb-10 sm:px-8 lg:pt-14 lg:pb-12"
    >
      <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-14">
        <div>
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

          {children}
        </div>

        <motion.div
          variants={motionSafe(fadeUp, reduced)}
          initial="hidden"
          whileInView="visible"
          viewport={ONCE_IN_VIEW}
          className="lg:sticky lg:top-24 lg:self-start"
        >
          <EnrollCourseForm
            ref={enrollFormRef}
            courseId={course?.id}
            discountLabel={course?.discountLabel}
          />
        </motion.div>
      </div>
    </section>
  )
}
