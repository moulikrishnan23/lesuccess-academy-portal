import { motion } from 'framer-motion'
import SectionHeading from '../ui/SectionHeading.jsx'
import { fadeUp, motionSafe, ONCE_IN_VIEW } from '../../animations/variants.js'
import useReducedMotion from '../../hooks/useReducedMotion.js'

/**
 * "What does a … do?" — heading, one paragraph, an optional split of the role,
 * and three bullets.
 *
 * Was WhatDoesDevDoSection, which carried the copy in the component: a
 * full-stack variant taken from Course_Page.pdf, a couple of hand-written
 * variants, and a default, matched on keywords in `course.category`. That does
 * not survive a catalog where most courses are not development courses, so the
 * copy now comes off the course row (`roleHeading`, `roleIntro`, `roleColumns`,
 * `roleBullets`) and this file only lays it out.
 *
 * `roleColumns` replaces the Front End / Back End split that used to be baked
 * into the paragraph. It renders 1 or 2 columns, or none — courses whose intro
 * already carries the split, including the Course_Page.pdf reference course,
 * seed it empty so the validated layout is unchanged.
 *
 * The reference has no cards and no second Enroll CTA in this section; both
 * were removed to match it, and neither comes back here.
 *
 * Rendered inside WhyLearnSection's left column — the enroll card floats
 * alongside this section too — so it carries no container or horizontal
 * padding of its own.
 */
export default function WhatYoullLearnToDoSection({ course }) {
  const reduced = useReducedMotion()

  const heading = course?.roleHeading
  const columns = course?.roleColumns ?? []
  const bullets = course?.roleBullets ?? []

  /*
   * Nothing to say about the role means no section. Seeding covers every
   * published course, so this is a guard against a half-filled admin form
   * rather than an expected state — a heading over an empty list reads as a
   * broken page, an absent section reads as a shorter one.
   */
  if (!heading || bullets.length === 0) return null

  return (
    <motion.section
      aria-labelledby="role-title"
      variants={motionSafe(fadeUp, reduced)}
      initial="hidden"
      whileInView="visible"
      viewport={ONCE_IN_VIEW}
      className="mt-12"
    >
      <SectionHeading id="role-title" title={heading} lede={course?.roleIntro || undefined} />

      {columns.length > 0 ? (
        <dl
          className={`mt-6 grid gap-x-10 gap-y-5 ${
            columns.length > 1 ? 'sm:grid-cols-2' : ''
          }`}
        >
          {columns.map((column) => (
            <div key={column.label}>
              <dt className="text-[0.9375rem] font-semibold text-navy-800">
                {column.label}
              </dt>
              <dd className="mt-1.5 text-[0.9375rem] leading-[1.9] text-ink-soft">
                {column.description}
              </dd>
            </div>
          ))}
        </dl>
      ) : null}

      <ul className="mt-5 list-disc space-y-2 pl-5 text-[0.9375rem] leading-[1.9] text-ink-soft marker:text-ink-muted">
        {bullets.map((bullet) => (
          <li key={bullet}>{bullet}</li>
        ))}
      </ul>
    </motion.section>
  )
}
