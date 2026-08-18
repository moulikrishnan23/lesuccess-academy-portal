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

/**
 * Sample certificate.
 *
 * The reference embeds a photograph of the printed certificate — dark green
 * with a gold border and seal. That image is not in the repo, so this is a
 * vector stand-in built to the same colours and proportions.
 *
 * TODO(design): replace with the real artwork, ideally served from a
 * `certificate_sample_url` site setting so it can change without a deploy.
 */
function SampleCertificate() {
  return (
    <svg
      viewBox="0 0 220 300"
      role="img"
      aria-label="Sample LeSuccess Academy course completion certificate"
      className="h-auto w-full"
    >
      <title>Sample LeSuccess Academy course completion certificate</title>

      <rect width="220" height="300" fill="#0E3B2E" />
      <rect x="7" y="7" width="206" height="286" fill="none" stroke="#C9A227" strokeWidth="2" />
      <rect x="12" y="12" width="196" height="276" fill="none" stroke="#C9A227" strokeWidth="0.6" />

      {/* Gold seal with ribbon, top-left as in the reference. */}
      <circle cx="42" cy="52" r="14" fill="#C9A227" />
      <circle cx="42" cy="52" r="9.5" fill="none" stroke="#0E3B2E" strokeWidth="0.9" />
      <path d="M36 63l6 5 6-5 3 14-9-5-9 5z" fill="#C9A227" />

      <text x="110" y="36" textAnchor="middle" fill="#F5F1E4" fontFamily="Georgia, serif" fontSize="9" letterSpacing="1">
        LeSuccess
      </text>

      <text x="110" y="92" textAnchor="middle" fill="#F5F1E4" fontFamily="Georgia, serif" fontSize="17" letterSpacing="2">
        DECLARATION
      </text>
      <text x="110" y="106" textAnchor="middle" fill="#C9A227" fontFamily="Georgia, serif" fontSize="7" letterSpacing="3">
        OF COMPLETION
      </text>

      <text x="110" y="132" textAnchor="middle" fill="#C6D3CB" fontSize="6">
        This is to certify that
      </text>

      <text x="110" y="156" textAnchor="middle" fill="#F5F1E4" fontFamily="Georgia, serif" fontSize="15" fontStyle="italic">
        Student Name
      </text>
      <line x1="55" y1="164" x2="165" y2="164" stroke="#C9A227" strokeWidth="0.7" />

      <text x="110" y="182" textAnchor="middle" fill="#C6D3CB" fontSize="5.5">
        has successfully completed the course
      </text>

      <text x="110" y="200" textAnchor="middle" fill="#C9A227" fontSize="8" fontWeight="700" letterSpacing="0.6">
        COURSE TITLE
      </text>

      {/* Signature block */}
      <line x1="38" y1="252" x2="92" y2="252" stroke="#7E9A8C" strokeWidth="0.7" />
      <text x="65" y="261" textAnchor="middle" fill="#9DB3A7" fontSize="4.6" letterSpacing="0.8">
        DATE
      </text>

      <line x1="128" y1="252" x2="182" y2="252" stroke="#7E9A8C" strokeWidth="0.7" />
      <text x="155" y="261" textAnchor="middle" fill="#9DB3A7" fontSize="4.6" letterSpacing="0.8">
        DIRECTOR
      </text>

      {/* Gold corner flourish, bottom-right. */}
      <path d="M213 293V255l-46 38z" fill="#C9A227" opacity="0.9" />
    </svg>
  )
}

export default function CertificateSection() {
  const reduced = useReducedMotion()

  return (
    <section
      id="certificate"
      aria-labelledby="certificate-title"
      className="mx-auto max-w-6xl px-5 py-14 sm:px-8 lg:py-16"
    >
      <motion.div
        variants={motionSafe(fadeUp, reduced)}
        initial="hidden"
        whileInView="visible"
        viewport={ONCE_IN_VIEW}
      >
        <SectionHeading id="certificate-title" title="Get Your Certificate" />

        <div className="mt-7 flex flex-col gap-8 sm:flex-row sm:items-center">
          <div className="w-full max-w-[220px] shrink-0 rounded-lg bg-section p-4">
            <SampleCertificate />
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
                <PlusMarker
                  size={13}
                  className="mt-[5px] shrink-0 text-gold"
                />
                <span className="max-w-md text-[0.875rem] leading-[1.75] text-ink-soft">
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
