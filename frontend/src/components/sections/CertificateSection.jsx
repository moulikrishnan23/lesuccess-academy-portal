import { useState } from 'react'
import { motion } from 'framer-motion'
import SectionHeading from '../ui/SectionHeading.jsx'
import { PlusMarker } from '../ui/icons.jsx'
import { fadeUp, motionSafe, ONCE_IN_VIEW, staggerContainer } from '../../animations/variants.js'
import useReducedMotion from '../../hooks/useReducedMotion.js'

/** Benefit copy, verbatim from Course_Page.pdf. */
const BENEFITS = [
  'Expands Your Knowledge And Better Prepares You For Job Responsibilities.',
  'Acts As A Concise Proof Of Your Abilities And Skills.',
  'Provides Strong Support For Improving Career Opportunities.',
]

/*
  WHY THERE IS NO DEFAULT IMAGE HERE.

  This section used to render `/course/certificate.png` first and fall back to
  the vector below. That is wrong for a catalog of twenty courses: a raster
  certificate has one course name baked into its pixels, so every course page
  showed whichever course the photograph happened to name. The vector is drawn
  from text, so it is the only version that can say the right thing.

  `imageUrl` survives as a prop, not a default. Pass one only when the image is
  specific to the course being shown — a per-course `certificate_sample_url`
  from the backend, say. Never point it at one shared file again.
*/

/** Usable width for the course name, inside the 250-wide certificate. */
const TITLE_WIDTH = 210

/*
  Average advance of an uppercase glyph in the certificate's sans face, as a
  fraction of the font size.

  Deliberately pessimistic. Measured with getBBox across all twenty catalog
  titles, per-character advance divided by font size ranges from 0.602 ('GEN
  AI') to 0.727 ('SERVICENOW') — glyph mix moves it far more than length does,
  since 'I' and 'L' are narrow and 'S', 'W', 'M' are wide. This constant plus
  the tracking term has to sit above the worst of that range, or a wide-glyph
  title would be sized as if it fit and then overrun the certificate.

  0.68 puts the model at 0.732 advance-per-size against a measured worst of
  0.727. The cost is that a title of mostly narrow glyphs is set a few tenths
  smaller than it strictly needs to be, which is invisible; the alternative,
  tuning it tight and overflowing on a title nobody has added yet, is not.
*/
const CAP_ADVANCE = 0.68
const TITLE_TRACKING = 0.5
const TITLE_MAX_SIZE = 9.6
const TITLE_MIN_SIZE = 7.4

/** Largest size at or below the cap that fits the longest line. */
function sizeToFit(lines) {
  const longest = Math.max(...lines.map((line) => line.length))
  if (!longest) return TITLE_MAX_SIZE
  const fitted = (TITLE_WIDTH / longest - TITLE_TRACKING) / CAP_ADVANCE
  return Math.min(TITLE_MAX_SIZE, fitted)
}

/** Split into two lines at the word boundary that leaves them most even. */
function balanceTwoLines(text) {
  const words = text.split(' ').filter(Boolean)
  if (words.length < 2) return [text]

  let best = null
  for (let i = 1; i < words.length; i += 1) {
    const head = words.slice(0, i).join(' ')
    const tail = words.slice(i).join(' ')
    const longest = Math.max(head.length, tail.length)
    if (!best || longest < best.longest) best = { lines: [head, tail], longest }
  }
  return best.lines
}

/**
 * Fits a course name into the award line.
 *
 * The catalog runs from 'Tally' to 'Artificial Intelligence and Machine
 * Learning' — five characters to forty-four. SVG has no text wrapping, so
 * neither a fixed size nor a fixed line count works across that spread.
 *
 * Prefer one line: a certificate reads as a certificate when the award is a
 * single emphatic line. Only when one line would have to shrink below
 * TITLE_MIN_SIZE — small enough to look like a mistake — does it wrap to two.
 *
 * `clamp` is the backstop. Titles come from the backend, so a title long
 * enough to defeat both passes is possible; that line is squeezed to the
 * available width instead of running off the certificate.
 */
function fitCourseName(name) {
  for (const lines of [[name], balanceTwoLines(name)]) {
    const size = sizeToFit(lines)
    if (size >= TITLE_MIN_SIZE) {
      // Floor, never round: rounding up undoes the fit that was just computed.
      return { lines, size: Math.floor(size * 10) / 10, clamp: false }
    }
  }

  const lines = balanceTwoLines(name)
  return { lines, size: TITLE_MIN_SIZE, clamp: true }
}

/**
 * The course name as it should appear on a certificate.
 *
 * Catalog titles are written for search, not for an award line — 'Python :
 * Full Stack Development course in Coimbatore' under a line that already reads
 * 'has successfully completed the course' says "course" twice and names a city
 * the certificate has no reason to name. The trailing SEO phrase is dropped so
 * the award line states the subject and nothing else.
 */
function certificateCourseName(title) {
  if (!title) return ''
  return title
    .replace(/\s+course\s+in\s+.+$/i, '')
    .replace(/\s+course$/i, '')
    .replace(/\s+:/g, ':')
    .trim()
    .toUpperCase()
}

/*
  Palette matched by eye to the issued certificate. GREEN_DEEP is the dominant
  forest green of the corner wedges; GREEN_MID is the darker fold at the very
  tip, so the corner reads as one deep green creased rather than two colours.

  These were judged against a screenshot of the issued certificate, not sampled
  from a file. If a scan of the real document turns up, sample it and correct
  any drift here.
*/
const GREEN_DEEP = '#0E4535'
const GREEN_MID = '#0A3227'
const GOLD = '#BE9B2E'
const GOLD_DEEP = '#96751A'
const INK = '#14201B'
const INK_SOFT = '#55645C'

/**
 * Vector rendering of the issued LeSuccess completion certificate.
 *
 * Matches the real document: light ground, green and gold corner wedges, the
 * CERTIFIED rosette top-left and the LeSuccess wordmark top-right. Because SVG
 * has no text wrapping, the citation paragraph is split into fixed lines below
 * — edit those together if the copy ever changes.
 *
 * This is the primary rendering, not a stand-in. It is drawn from text, which
 * is what lets one component name twenty different courses correctly; a single
 * raster certificate cannot.
 */
function SampleCertificate({ courseName }) {
  /*
    Award line geometry. Two lines need eleven units of leading and take the
    block six units higher, so the course period below still clears the
    citation without any of the fixed citation baselines moving.
  */
  const { lines, size, clamp } = fitCourseName(courseName)
  const twoLine = lines.length > 1
  const firstBaseline = twoLine ? 216 : 222
  const periodBaseline = twoLine ? 240 : 235

  const label = courseName
    ? `Sample LeSuccess Academy declaration of completion certificate for ${courseName}`
    : 'Sample LeSuccess Academy declaration of completion certificate'

  return (
    <svg
      viewBox="0 0 250 335"
      role="img"
      aria-label={label}
      className="h-auto w-full"
    >
      <title>{label}</title>

      <rect width="250" height="335" fill="#FFFFFF" />

      {/* Top-left corner wedges: gold sliver behind, two greens stacked over it. */}
      <polygon points="0,112 128,0 118,0 0,102" fill={GOLD} />
      <polygon points="0,0 118,0 0,102" fill={GREEN_DEEP} />
      <polygon points="0,0 72,0 0,62" fill={GREEN_MID} />

      {/*
        Bottom-left corner wedges, mirroring the top. Deliberately shallower
        than the top pair so they stay clear of the signature block.
      */}
      <polygon points="0,255 72,335 62,335 0,265" fill={GOLD} />
      <polygon points="0,335 0,265 62,335" fill={GREEN_DEEP} />
      <polygon points="0,335 0,300 31,335" fill={GREEN_MID} />

      {/* Bottom-right gold wedge. */}
      <polygon points="250,335 250,278 192,335" fill={GOLD} />

      {/* CERTIFIED rosette, sitting over the top-left wedge. */}
      <path d="M44 56l-5 26 9-6 8 6-4-26z" fill={GOLD_DEEP} />
      <path d="M60 56l5 26-9-6-8 6 4-26z" fill={GOLD_DEEP} />
      <circle cx="52" cy="42" r="21" fill={GOLD} />
      <circle cx="52" cy="42" r="17.5" fill="none" stroke={GOLD_DEEP} strokeWidth="0.8" />
      <circle cx="52" cy="42" r="14.5" fill="#0C1D17" />
      <path d="M52 32.5l1.6 3.4 3.7.5-2.7 2.6.7 3.7-3.3-1.8-3.3 1.8.7-3.7-2.7-2.6 3.7-.5z" fill={GOLD} />
      <text x="52" y="50.5" textAnchor="middle" fill={GOLD} fontSize="4.4" letterSpacing="0.7" fontWeight="700">
        CERTIFIED
      </text>

      {/* LeSuccess wordmark, top-right. */}
      <path d="M168 30q28-11 56-2" fill="none" stroke={GOLD} strokeWidth="1.6" strokeLinecap="round" />
      <text x="196" y="45" textAnchor="middle" fill="#123C56" fontFamily="Georgia, serif" fontSize="15" fontWeight="700">
        LeSuccess
      </text>
      <text x="196" y="52.5" textAnchor="middle" fill={GOLD} fontSize="3.6" letterSpacing="0.9">
        Learn • Achieve • Succeed
      </text>

      {/* Title block. */}
      <text x="125" y="116" textAnchor="middle" fill={GREEN_DEEP} fontFamily="Georgia, serif" fontSize="23" fontWeight="700" letterSpacing="1.2">
        DECLARATION
      </text>
      <text x="125" y="130" textAnchor="middle" fill={INK} fontSize="7" letterSpacing="3.4">
        OF COMPLETION
      </text>

      {/* Recipient. */}
      <text x="125" y="157" textAnchor="middle" fill={INK_SOFT} fontFamily="Georgia, serif" fontSize="7.5">
        This is to certify that
      </text>
      <text x="125" y="182" textAnchor="middle" fill={INK} fontFamily="Georgia, serif" fontSize="17" letterSpacing="1.6">
        GOWTHAM R
      </text>
      <line x1="42" y1="191" x2="208" y2="191" stroke="#D5DAD7" strokeWidth="0.8" />

      {/* Award. */}
      <text x="125" y="205" textAnchor="middle" fill={INK_SOFT} fontSize="6.4">
        has successfully completed the course
      </text>
      {lines.map((line, index) => (
        <text
          key={line}
          x="125"
          y={firstBaseline + index * 11}
          textAnchor="middle"
          fill={INK}
          fontSize={size}
          fontWeight="700"
          letterSpacing={TITLE_TRACKING}
          /* Only a title too long for both passes is squeezed; see fitCourseName. */
          textLength={clamp ? TITLE_WIDTH : undefined}
          lengthAdjust={clamp ? 'spacingAndGlyphs' : undefined}
        >
          {line}
        </text>
      ))}
      <text x="125" y={periodBaseline} textAnchor="middle" fill={INK} fontSize="6.2" fontWeight="700">
        Course Period: 06 Oct 2025 – 12 Jan 2026
      </text>

      {/* Citation. SVG has no text wrapping, so these lines are set by hand. */}
      <text x="125" y="254" textAnchor="middle" fill={INK_SOFT} fontSize="5.6">
        Throughout the course, the participant demonstrated
      </text>
      <text x="125" y="263" textAnchor="middle" fill={INK_SOFT} fontSize="5.6">
        strong initiative, a commitment to continuous skill
      </text>
      <text x="125" y="272" textAnchor="middle" fill={INK_SOFT} fontSize="5.6">
        enhancement, and professional growth, effectively
      </text>
      {/*
        Deliberately not the course name: it already appears above in the award
        line, and repeating a 44-character title here would need its own
        wrapping pass for no gain.
      */}
      <text x="125" y="281" textAnchor="middle" fill={INK_SOFT} fontSize="5.6">
        showcasing proficiency in current industry tools
      </text>
      <text x="125" y="290" textAnchor="middle" fill={INK_SOFT} fontSize="5.6">
        and techniques.
      </text>

      <text x="125" y="306" textAnchor="middle" fill={INK} fontFamily="Georgia, serif" fontSize="7" fontStyle="italic">
        Congratulations on a job well done!
      </text>

      {/* Signatory, held right of the bottom-left wedge. */}
      <text x="118" y="319" textAnchor="middle" fill={INK} fontSize="6" fontWeight="700" letterSpacing="0.4">
        UMA DEVI P.K
      </text>
      <text x="118" y="326" textAnchor="middle" fill={INK_SOFT} fontSize="4.6" letterSpacing="0.6">
        CHIEF EXECUTIVE OFFICER
      </text>

      {/*
        Embossed seal. Sits in the gap between the citation, the signatory and
        the gold corner — nudge it and it will collide with one of the three.
      */}
      <circle cx="210" cy="298" r="13" fill="none" stroke={GREEN_DEEP} strokeWidth="1" />
      <circle cx="210" cy="298" r="9.8" fill="none" stroke={GREEN_DEEP} strokeWidth="0.45" />
      <text x="210" y="296.5" textAnchor="middle" fill={GREEN_DEEP} fontFamily="Georgia, serif" fontSize="4.2" fontWeight="700">
        LeSuccess
      </text>
      <line x1="203" y1="298.5" x2="217" y2="298.5" stroke={GREEN_DEEP} strokeWidth="0.4" />
      <text x="210" y="303.5" textAnchor="middle" fill={GREEN_DEEP} fontSize="3" letterSpacing="0.5">
        ACADEMY
      </text>

      {/* Drawn last so it sits above the corner wedges. */}
      <rect x="0.5" y="0.5" width="249" height="334" fill="none" stroke="#C8CEC9" strokeWidth="1" />
    </svg>
  )
}

/**
 * @param {object} course The course being shown. Its title names the award.
 * @param {string} [imageUrl] Certificate artwork for *this* course only.
 */
export default function CertificateSection({ course, imageUrl }) {
  const reduced = useReducedMotion()

  /*
    An image passed in still lives outside the bundle, so its absence can only
    be discovered at runtime. `onError` flips this once and the vector takes
    over, following the same "never render a broken <img>" rule used by
    CourseHero and TestimonialCard.
  */
  const [imageFailed, setImageFailed] = useState(false)
  const showImage = Boolean(imageUrl) && !imageFailed
  const courseName = certificateCourseName(course?.title)

  return (
    <section
      id="certificate"
      aria-labelledby="certificate-title"
      /* ModulesAccordion above carries the gap, so no top padding here. */
      className="pb-14 lg:pb-16"
    >
      <motion.div
        variants={motionSafe(fadeUp, reduced)}
        initial="hidden"
        whileInView="visible"
        viewport={ONCE_IN_VIEW}
      >
        <SectionHeading id="certificate-title" title="Get Your Certificate" />

        <div className="mt-7 flex flex-col gap-8 sm:flex-row sm:items-center">
          {/*
            The certificate is light-on-light against the section card, so it
            carries its own hairline ring and a soft shadow to hold an edge.
          */}
          <div className="w-full max-w-[240px] shrink-0 overflow-hidden rounded-lg bg-white shadow-[0_2px_14px_rgba(15,64,52,0.14)] ring-1 ring-black/5">
            {showImage ? (
              <img
                src={imageUrl}
                alt={
                  courseName
                    ? `Sample LeSuccess Academy completion certificate for ${courseName}`
                    : 'Sample LeSuccess Academy course completion certificate'
                }
                loading="lazy"
                onError={() => setImageFailed(true)}
                className="h-auto w-full object-contain"
              />
            ) : (
              <SampleCertificate courseName={courseName} />
            )}
          </div>

          <motion.ul
            variants={motionSafe(staggerContainer, reduced)}
            initial="hidden"
            whileInView="visible"
            viewport={ONCE_IN_VIEW}
            className="list-none space-y-4 p-0"
          >
            {BENEFITS.map((benefit) => (
              <motion.li key={benefit} variants={fadeUp} className="flex gap-3">
                {/* Marker size and top offset track the text size below. */}
                <PlusMarker
                  size={16}
                  className="mt-[6px] shrink-0 text-gold"
                />
                <span className="max-w-lg text-[1.0625rem] font-bold leading-[1.7] text-ink-soft">
                  {benefit}
                </span>
              </motion.li>
            ))}
          </motion.ul>
        </div>
      </motion.div>
    </section>
  )
}
