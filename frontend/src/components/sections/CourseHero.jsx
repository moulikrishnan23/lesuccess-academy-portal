import { motion } from 'framer-motion'
import Button from '../ui/Button.jsx'
import {
  BriefcaseIcon,
  CertificateIcon,
  ClockIcon,
  TagIcon,
} from '../ui/icons.jsx'
import { fadeUp, motionSafe, staggerContainer } from '../../animations/variants.js'
import useReducedMotion from '../../hooks/useReducedMotion.js'
import { formatDuration } from '../../utils/formatters.js'

/**
 * ASSUMPTION: only the duration pill is backed by data.
 *
 * "Certificate Included", "Placement Assistance" and "Affordable Fees" appear
 * in Course_Page.pdf but have no corresponding fields on the Course model —
 * there is no hasCertificate / hasPlacement / feeTier to read. They are
 * institute-wide promises rather than per-course facts, so they are static.
 *
 * If the model later gains those flags, drive the pills from them instead of
 * adding a second source of truth.
 */
const STATIC_PROMISES = [
  { label: 'Certificate Included', Icon: CertificateIcon },
  { label: 'Placement Assistance', Icon: BriefcaseIcon },
  { label: 'Affordable Fees', Icon: TagIcon },
]

function StatPill({ label, Icon }) {
  return (
    <motion.li
      variants={fadeUp}
      className="flex items-center gap-2 text-[0.8125rem] font-light text-white/90 sm:text-sm"
    >
      <Icon className="shrink-0 text-white/80" width={17} height={17} />
      {label}
    </motion.li>
  )
}

/**
 * Hero band — dark navy, centre-aligned, per Course_Page.pdf.
 *
 * Above the fold, so the entrance runs on mount rather than on scroll.
 */
export default function CourseHero({ course, onEnrollClick, onFreeDemoClick }) {
  const reduced = useReducedMotion()
  const duration = formatDuration(course.durationValue, course.durationUnit)

  return (
    <section
      id="about"
      aria-labelledby="course-title"
      className="relative overflow-hidden bg-navy-900"
    >
      {/*
        The reference uses a photographic backdrop behind the navy band. No such
        asset exists in the repo, so this falls back to the same navy with a
        faint grid. A per-course heroImageUrl takes over when one is uploaded.
        TODO(design): supply the hero background image used in Course_Page.pdf.
      */}
      {course.heroImageUrl ? (
        <img
          src={course.heroImageUrl}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover opacity-25"
        />
      ) : null}

      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.16] [background-image:linear-gradient(rgba(255,255,255,.6)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.6)_1px,transparent_1px)] [background-size:48px_48px]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(90%_120%_at_50%_0%,rgba(37,106,158,0.55),transparent_65%)]"
      />

      <motion.div
        variants={motionSafe(staggerContainer, reduced)}
        initial="hidden"
        animate="visible"
        className="relative mx-auto max-w-4xl px-5 py-16 text-center sm:px-8 lg:py-24"
      >
        {course.iconUrl ? (
          <motion.img
            variants={fadeUp}
            src={course.iconUrl}
            alt={`${course.title} course icon`}
            width="44"
            height="44"
            className="mx-auto mb-5 h-11 w-11 object-contain"
          />
        ) : null}

        <motion.h1
          id="course-title"
          variants={fadeUp}
          className="text-balance font-display text-[1.75rem] leading-[1.25] font-semibold text-white sm:text-[2.25rem] lg:text-[2.75rem]"
        >
          {course.title}
        </motion.h1>

        <motion.ul
          variants={motionSafe(staggerContainer, reduced)}
          className="mt-7 flex list-none flex-wrap items-center justify-center gap-x-7 gap-y-3 p-0"
        >
          {/* Reference renders this as "Duration - 3Months". */}
          {duration ? <StatPill label={`Duration - ${duration}`} Icon={ClockIcon} /> : null}
          {STATIC_PROMISES.map(({ label, Icon }) => (
            <StatPill key={label} label={label} Icon={Icon} />
          ))}
        </motion.ul>

        <motion.div
          variants={fadeUp}
          className="mt-9 flex flex-wrap items-center justify-center gap-4"
        >
          {/* Both CTAs move the visitor to the enroll form. Neither navigates —
              the page owns that behaviour and passes it down. */}
          <Button variant="onDark" size="lg" onClick={onFreeDemoClick}>
            Free Demo
          </Button>
          <Button variant="primary" size="lg" onClick={onEnrollClick}>
            Enroll Now
          </Button>
        </motion.div>
      </motion.div>
    </section>
  )
}
