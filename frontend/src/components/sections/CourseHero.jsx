import { useState } from 'react'
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
 * Where a course's hero backdrop lives.
 *
 * Looked up by slug, so `public/course/hero/<slug>.svg` is the whole contract —
 * no data edit, no rebuild. Every course in the catalog ships one, generated
 * from its own tech stack and subject; see that folder's README.
 *
 * An explicit `heroImageUrl` wins, which is how a photograph gets used once the
 * backend supplies one. Only the .svg path is probed, so the common case costs
 * no wasted request.
 */
function heroImageFor(course) {
  if (course.heroImageUrl) return course.heroImageUrl
  return course.slug ? `/course/hero/${course.slug}.svg` : null
}

/**
 * Hero band — dark navy, centre-aligned, per Course_Page.pdf.
 *
 * Above the fold, so the entrance runs on mount rather than on scroll.
 */
export default function CourseHero({ course, onEnrollClick, onFreeDemoClick }) {
  const reduced = useReducedMotion()
  const duration = formatDuration(course.durationValue, course.durationUnit)

  /*
    The backdrop is looked up by convention, so whether it exists can only be
    discovered at runtime. `onError` records the failure against the slug it
    happened on, which means moving to another course clears it without an
    effect — a course whose artwork is missing falls back to the patterned
    navy, and must never show a broken image.
  */
  const [failedSlug, setFailedSlug] = useState(null)
  const heroImage = heroImageFor(course)
  const showImage = Boolean(heroImage) && failedSlug !== course.slug

  return (
    <section
      id="about"
      aria-labelledby="course-title"
      className="relative overflow-hidden bg-navy-900"
    >
      {/*
        Per-course photographic backdrop. Decorative, so it is alt="" and hidden
        from assistive tech — the headline beside it already names the course.
      */}
      {showImage ? (
        <>
          <img
            src={heroImage}
            alt=""
            aria-hidden="true"
            onError={() => setFailedSlug(course.slug)}
            className="absolute inset-0 h-full w-full object-cover"
          />

          {/*
            Two-part navy scrim, shaped rather than flat.

            A flat overlay heavy enough to guarantee contrast also flattens the
            photograph into a colour field, which defeats the point of having
            one. So the base stays light enough to read the artwork through at
            the edges, and a radial pass concentrates the darkening under the
            centred headline and pills where the white type actually sits.

            Worked worst case, a pure-white photograph: centre lands at 0.81
            effective alpha (#395268, 8.1:1 against white) and the outer edge of
            the text block at 0.66 (#5E7284, 4.96:1). Both clear AA for normal
            text, so any photograph is safe here. The figures ignore the blue
            radial below, which only ever darkens further — they are a floor.
          */}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[rgba(11,42,69,0.50)]"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[radial-gradient(85%_120%_at_50%_50%,rgba(11,42,69,0.62)_0%,rgba(11,42,69,0.32)_60%,transparent_100%)]"
          />
        </>
      ) : null}

      {/*
        Fallback texture, and only that.

        The grid exists to stop the band being a flat navy rectangle when a
        course has no artwork. Over a backdrop it has nothing left to do — the
        artwork is the texture — and a 48px rule drawn across it reads as a
        screen door in front of the image. So it renders only when there is no
        image behind it.
      */}
      {showImage ? null : (
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-[0.16] [background-image:linear-gradient(rgba(255,255,255,.6)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.6)_1px,transparent_1px)] [background-size:48px_48px]"
        />
      )}
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
