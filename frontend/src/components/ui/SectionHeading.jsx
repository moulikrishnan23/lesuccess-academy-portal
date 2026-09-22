import { motion } from 'framer-motion'
import { fadeUp, motionSafe, ONCE_IN_VIEW } from '../../animations/variants.js'
import useReducedMotion from '../../hooks/useReducedMotion.js'

/**
 * Section header.
 *
 * All headings animate in with a gentle fade + slide-up on scroll entrance,
 * providing a consistent, modern animation across all sections of the site.
 * Pass `animate={false}` to suppress when the heading is inside an already-
 * animated parent container.
 */
/*
 * `section` reproduces exactly what every existing caller already renders —
 * the course page was validated against a reference at these values, so they
 * are not up for rounding to the nearest scale step. `page` is the new one, for
 * a page's own <h1>.
 */
const TITLE_SIZES = {
  section: 'text-[1.5rem] sm:text-[1.75rem] lg:text-[2rem]',
  page: 'text-3xl sm:text-4xl',
  // Dominant heading for a full-bleed band, where the type carries the section.
  band: 'text-4xl sm:text-5xl',
}

const TITLE_WEIGHTS = { semibold: 'font-semibold', bold: 'font-bold' }

/*
 * `dark` and `light` are the original two and keep every existing caller
 * pixel-identical. `ink` is opt-in for the near-black heading the testimonials
 * reference uses — it is deliberately not the default, because the rest of the
 * site is navy.
 */
const TITLE_TONES = { dark: 'text-navy-800', light: 'text-white', ink: 'text-ink' }

export default function SectionHeading({
  eyebrow,
  title,
  lede,
  id,
  align = 'left',
  tone = 'dark',
  as: Heading = 'h2',
  size = 'section',
  weight = 'semibold',
  className = '',
  animate = true,
}) {
  const reduced = useReducedMotion()
  const isCentered = align === 'center'
  // `tone` is about the band behind the heading, not the type colour: 'light'
  // means light text for a dark band. Default keeps every existing caller
  // rendering exactly as before.
  const isOnDark = tone === 'light'

  const inner = (
    <header className={`${isCentered ? 'text-center' : ''} ${className}`}>
      {eyebrow ? (
        <p className="mb-3 inline-block rounded-full bg-brand-soft px-3 py-1 text-[0.6875rem] font-semibold tracking-[0.12em] text-brand uppercase">
          {eyebrow}
        </p>
      ) : null}

      <Heading
        id={id}
        className={`font-display leading-tight ${TITLE_WEIGHTS[weight]} ${
          TITLE_SIZES[size]
        } ${TITLE_TONES[tone] ?? TITLE_TONES.dark}`}
      >
        {title}
      </Heading>

      {lede ? (
        <p
          className={`mt-4 text-[0.9375rem] leading-[1.9] ${
            isOnDark ? 'text-white/80' : 'text-ink-soft'
          } ${isCentered ? 'mx-auto max-w-2xl' : 'max-w-3xl'}`}
        >
          {lede}
        </p>
      ) : null}
    </header>
  )

  if (!animate) return inner

  return (
    <motion.div
      variants={motionSafe(fadeUp, reduced)}
      initial="hidden"
      whileInView="visible"
      viewport={ONCE_IN_VIEW}
    >
      {inner}
    </motion.div>
  )
}
