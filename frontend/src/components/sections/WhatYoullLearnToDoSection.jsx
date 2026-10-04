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

  const rawHeading = course?.roleHeading
  let heading = rawHeading
  if (!heading && course?.title) {
    const cleanTitle = course.title.trim()
    heading = cleanTitle.toLowerCase().startsWith('what is') ? cleanTitle : `What is ${cleanTitle}?`
  }

  let intro = course?.roleIntro
  if (intro && heading && intro.trim().toLowerCase().startsWith(heading.trim().toLowerCase())) {
    intro = intro.trim().slice(heading.trim().length).replace(/^[:\-\s]+/, '').trim()
  }

  const columns = course?.roleColumns ?? []

  // Support array from roleBulletsList or roleBullets, or string parsing
  let bullets = []
  if (Array.isArray(course?.roleBulletsList) && course.roleBulletsList.length > 0) {
    bullets = course.roleBulletsList
  } else if (Array.isArray(course?.roleBullets) && course.roleBullets.length > 0) {
    bullets = course.roleBullets
  } else if (typeof course?.roleBullets === 'string' && course.roleBullets.trim()) {
    try {
      const parsed = JSON.parse(course.roleBullets)
      if (Array.isArray(parsed)) {
        bullets = parsed
      } else {
        bullets = course.roleBullets.split('\n').map((s) => s.trim()).filter(Boolean)
      }
    } catch {
      bullets = course.roleBullets.split('\n').map((s) => s.trim()).filter(Boolean)
    }
  }

  const hasRoleSection = Boolean(heading || intro || columns.length > 0)
  const hasBullets = bullets.length > 0

  if (!hasRoleSection && !hasBullets) return null

  return (
    <motion.section
      aria-labelledby="role-title"
      variants={motionSafe(fadeUp, reduced)}
      initial="hidden"
      whileInView="visible"
      viewport={ONCE_IN_VIEW}
      className="mt-12"
    >
      {hasRoleSection && (
        <div>
          <SectionHeading id="role-title" title={heading || 'What is this role?'} lede={intro || undefined} />

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
        </div>
      )}

      {hasBullets && (
        <div className={hasRoleSection ? 'mt-10 pt-8 border-t border-slate-200/80' : ''}>
          <h3 className="text-xl sm:text-2xl font-bold text-navy-800 tracking-tight flex items-center gap-2 mb-4">
            <span className="inline-block w-2 h-6 bg-[#DF1E26] rounded-full mr-1" />
            Topics You Will Learn
          </h3>
          <ul className="grid sm:grid-cols-2 gap-3 mt-4">
            {bullets.map((bullet, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2.5 text-[0.9375rem] text-slate-700 bg-slate-50/80 p-3 rounded-xl border border-slate-200/80 shadow-2xs hover:border-[#DF1E26]/20 transition-colors"
              >
                <span className="mt-1.5 h-2 w-2 rounded-full bg-[#DF1E26] shrink-0" />
                <span className="leading-relaxed font-medium">{bullet}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </motion.section>
  )
}
