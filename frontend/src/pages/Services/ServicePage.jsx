import { useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  FileSearch,
  HandFist,
  Handshake,
  MapPinned,
  MessagesSquare,
  Network,
  Presentation,
  Rocket,
  UserRoundCog,
  UsersRound,
} from 'lucide-react'
import FeatureCard from '../../components/cards/FeatureCard.jsx'
import ProcessStepCard from '../../components/cards/ProcessStepCard.jsx'
import LeadCaptureForm from '../../components/forms/LeadCaptureForm.jsx'
import SectionHeading from '../../components/ui/SectionHeading.jsx'
import useDocumentMeta from '../../hooks/useDocumentMeta.js'
import useProcessSteps from '../../hooks/useProcessSteps.js'
import useReducedMotion from '../../hooks/useReducedMotion.js'
import useServiceOfferings from '../../hooks/useServiceOfferings.js'
import {
  fadeUp,
  motionSafe,
  ONCE_IN_VIEW,
  staggerContainer,
} from '../../animations/variants.js'
import { LEAD_SOURCE } from '../../services/leadApi.js'

/*
 * Page copy, verbatim from Service_Page.pdf. Kept as data at the top of the
 * file rather than inline in the markup so the wording can be checked against
 * the reference without reading through JSX.
 *
 * These are no longer the only source: /api/services and /api/process-steps
 * exist now and are read by the hooks below. The arrays stay as the FALLBACK.
 * The `service` table is unseeded, so GET /api/services returns [] today — if
 * an empty list replaced this copy the page would go blank, so empty, failed
 * and still-loading all resolve back to these arrays. See `resolveList`.
 */
const INSTITUTION_SERVICES = [
  {
    title: 'Placement Opportunities',
    icon: MapPinned,
    description:
      'Company specific helps to meet helps to job matching and exclusive industry partnerships. Every Year we will place 100+ Students with above 10LPA Package.',
  },
  {
    title: 'Career Counselling',
    icon: UsersRound,
    description:
      'Aim to help students make informed decisions about their career paths. Our counselors provide personalized guidance based on individual interests, strengths and career aspirations.',
  },
  {
    title: 'Skill Development Programs',
    icon: Network,
    description:
      'Focus on enhancing practical skills and competencies. Our expert trainers guide students through hands-on training to ensure they gain real-world experience and confidence in their abilities.',
  },
  {
    title: 'Communication Training',
    icon: MessagesSquare,
    description:
      'Language proficiency is crucial for career advancement and global opportunities. Our language training programs are designed to help individuals master languages, making them more competitive in the job market.',
  },
]

const CORPORATE_SERVICES = [
  {
    title: 'Recruitment Partner',
    icon: Handshake,
    description:
      "Streamline the hiring process, connecting you with top talent tailored to your specific needs. We leverage extensive industry expertise and a vast network to find candidates who align with your company's values and goals.",
  },
  {
    title: 'Corporate Training',
    icon: Presentation,
    description:
      'For freshers provide comprehensive onboarding programs designed to equip new hires with essential skills, foster seamless integration into the corporate environment, and enhance their professional development from day one.',
  },
]

const PROCESS_STEPS = [
  {
    step: '01',
    icon: FileSearch,
    title: 'Evaluate',
    description:
      'We identify skills, spot gaps, and align learning with career goals to build a strong foundation.',
  },
  {
    step: '02',
    icon: UserRoundCog,
    title: 'Customize',
    description:
      'We design a focused, industry-aligned curriculum tailored to real-world demands and learner objectives.',
  },
  {
    step: '03',
    icon: HandFist,
    title: 'Empower',
    description:
      'Hands-on training led by industry professionals using live projects, case studies, and practical tools.',
  },
  {
    step: '04',
    icon: Rocket,
    title: 'Launch',
    description:
      'Final assessments, career guidance, and placement support to transform learners into job-ready professionals.',
  },
]

/*
 * iconUrl → lucide component.
 *
 * The cards take an icon COMPONENT (`icon: Icon`), but the backend stores a
 * string. Only icons already imported in this file are mappable — this is a
 * lookup, not a dynamic import, so an unknown name cannot pull in new code.
 *
 * Keys are normalized (basename, extension dropped, non-alphanumerics removed,
 * lowercased) so "MapPinned", "map-pinned" and "/icons/map_pinned.svg" all hit
 * the same entry. Anything unrecognised — or null, which is what every seeded
 * process_step row carries today — returns undefined and the caller keeps the
 * static icon, so current visuals cannot regress.
 */
const ICON_COMPONENTS = {
  FileSearch,
  HandFist,
  Handshake,
  MapPinned,
  MessagesSquare,
  Network,
  Presentation,
  Rocket,
  UserRoundCog,
  UsersRound,
}

const ICON_LOOKUP = Object.entries(ICON_COMPONENTS).reduce(
  (acc, [name, component]) => {
    acc[name.toLowerCase()] = component
    return acc
  },
  {},
)

function iconFromUrl(iconUrl) {
  if (typeof iconUrl !== 'string') return undefined

  const basename = iconUrl.split(/[\\/]/).pop() ?? ''
  const key = basename
    .replace(/\.[a-z0-9]+$/i, '')
    .replace(/[^a-z0-9]/gi, '')
    .toLowerCase()

  return key ? ICON_LOOKUP[key] : undefined
}

/**
 * The fallback rule, in one place: a live list is used only when it is a
 * non-empty array. Loading (`[]`), a failed fetch (`[]`) and an unseeded table
 * (`[]`) are therefore indistinguishable, and all three keep the static copy.
 */
function resolveList(live, fallback) {
  return Array.isArray(live) && live.length > 0 ? live : fallback
}

/**
 * A live ServiceOfferingResponse rendered in the shape FeatureCard wants.
 * `fallbackIcon` is the static card's icon at the same position, so a row with
 * no usable iconUrl still draws the artwork the page draws today.
 */
function toServiceCard(item, fallbackIcon) {
  return {
    title: item.title,
    description: item.description,
    icon: iconFromUrl(item.iconUrl) ?? fallbackIcon,
  }
}

/*
 * Vertical offsets for the four steps: odd cards drop, even cards rise, so the
 * row alternates evenly rather than wandering.
 *
 * Paired mb/mt rather than mt alone. The row is a stretch grid, so a lone
 * `mt-10` is taken out of the card's own height and the dropped cards end up
 * 40px shorter than their neighbours. Giving every card the same 40px — below
 * on the risers, above on the droppers — costs them all equally and keeps the
 * four boxes identical, which is what the reference shows.
 */
const STEP_OFFSETS = ['lg:mb-10', 'lg:mt-10', 'lg:mb-10', 'lg:mt-10']

/*
 * Band photography. Both files are stock placeholders — real photographs, but
 * of somebody else's campus and office. See public/service/README.md for their
 * source and licence, and swap in LeSuccess's own before launch.
 */
const BAND_IMAGES = {
  institutions: '/service/institutions.jpg',
  corporate: '/service/corporate.jpg',
}

/**
 * A service band: a short photograph panel carrying the heading, with the card
 * grid riding up over its bottom edge.
 *
 * The panel is deliberately shorter than the content. The first row of cards
 * starts on the photograph and overflows onto the white page below it, so the
 * boundary cuts through the cards rather than sitting above or below them —
 * that overlap is the shape of this section in the reference, not a rounding
 * error. `-mt` on the grid is what produces it, so the panel's padding-bottom
 * and that pull have to be read together: the difference between them is the
 * gap under the heading.
 */
function ServiceBand({ id, labelledBy, image, heading, children }) {
  return (
    <section id={id} aria-labelledby={labelledBy}>
      <div className="relative overflow-hidden bg-[#07405C] pt-20 pb-28 lg:pt-24 lg:pb-32">
        {/*
          Desaturated under a heavy navy wash: the reference reads as a duotone
          of the brand navy rather than a full-colour photograph, and a bright
          sky behind white type would fight the heading.
        */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-cover bg-center saturate-[0.35]"
          style={{ backgroundImage: `url(${image})` }}
        />
        <div aria-hidden="true" className="band-overlay-navy absolute inset-0 bg-[#07405C]/85" />

        <div className="relative mx-auto max-w-6xl px-5 sm:px-8">{heading}</div>
      </div>

      {/* z-10 keeps the cards above the panel they overlap. */}
      <div className="relative z-10 mx-auto -mt-16 max-w-6xl px-5 pb-20 sm:px-8 lg:pb-24">
        {children}
      </div>
    </section>
  )
}

/**
 * Service page — /service
 *
 * Content, order and wording come from Service_Page.pdf; the styling comes from
 * the same tokens and components the course page uses, so the two read as one
 * site. Every card and the form are existing components — this file composes
 * them and owns nothing but the copy.
 */
export default function ServicePage() {
  const reduced = useReducedMotion()

  /*
   * Live content. Both hooks swallow their own failures into an empty list, so
   * nothing here can throw and no loading branch is needed: while a request is
   * in flight the lists are empty, which resolves to the static copy, so the
   * page renders its current content immediately and swaps only if real rows
   * arrive.
   */
  const { institution: liveInstitution, corporate: liveCorporate } =
    useServiceOfferings()
  const { steps: liveSteps } = useProcessSteps()

  const institutionServices = useMemo(() => {
    const live = resolveList(liveInstitution, null)
    if (!live) return INSTITUTION_SERVICES
    return live.map((item, index) =>
      toServiceCard(item, INSTITUTION_SERVICES[index]?.icon),
    )
  }, [liveInstitution])

  const corporateServices = useMemo(() => {
    const live = resolveList(liveCorporate, null)
    if (!live) return CORPORATE_SERVICES
    return live.map((item, index) =>
      toServiceCard(item, CORPORATE_SERVICES[index]?.icon),
    )
  }, [liveCorporate])

  const processSteps = useMemo(() => {
    const live = resolveList(liveSteps, null)
    if (!live) return PROCESS_STEPS
    return live.map((item, index) => ({
      // The cards show "01".."04"; the backend sends an int stepNumber.
      step: String(item.stepNumber ?? index + 1).padStart(2, '0'),
      title: item.title,
      description: item.description,
      icon: iconFromUrl(item.iconUrl) ?? PROCESS_STEPS[index]?.icon,
    }))
  }, [liveSteps])

  /*
   * "You looking for?" options — the page's own service names rather than
   * invented categories. Derived from the RESOLVED lists, not the static arrays
   * at module scope: computing this once at import time would have left the
   * dropdown showing stale copy whenever live rows differed from the fallback.
   */
  const enquiryOptions = useMemo(
    () =>
      [...institutionServices, ...corporateServices].map(({ title }) => ({
        value: title,
        label: title,
      })),
    [institutionServices, corporateServices],
  )

  useDocumentMeta({
    title: 'Services — LeSuccess Academy',
    description:
      'We partner with corporates and educational institutions to deliver industry-relevant skills, workforce training and career development solutions.',
  })

  return (
    <>
      {/* 1 — Page intro */}
      <section
        aria-labelledby="service-intro-title"
        className="mx-auto max-w-6xl px-5 pt-16 pb-16 text-center sm:px-8 lg:pt-20"
      >
        <div className="inline-flex items-center gap-2 rounded-full border border-[#07405C]/20 bg-[#07405C]/10 px-4 py-1.5 text-xs font-bold text-[#07405C] shadow-xs mb-4">
          SERVICES & INDUSTRY PARTNERSHIPS
        </div>
        <motion.div
          variants={motionSafe(fadeUp, reduced)}
          initial="hidden"
          animate="visible"
        >
          <SectionHeading
            id="service-intro-title"
            as="h1"
            size="page"
            weight="bold"
            align="center"
            title={
              <>
                We Don&apos;t Just Train.{' '}
                <span className="text-[#DF1E26]">We Transform.</span>
              </>
            }
            lede="We partner with corporates and educational institutions to deliver industry-relevant skills, workforce training and career development solutions."
          />
        </motion.div>
      </section>

      {/* 2 — For Institutions */}
      <ServiceBand
        id="institutions"
        labelledBy="institutions-title"
        image={BAND_IMAGES.institutions}
        heading={
          <motion.div
            variants={motionSafe(fadeUp, reduced)}
            initial="hidden"
            whileInView="visible"
            viewport={ONCE_IN_VIEW}
          >
            <SectionHeading
              id="institutions-title"
              align="center"
              tone="light"
              size="band"
              weight="bold"
              title="For Institutions"
            />
          </motion.div>
        }
      >
        <motion.ul
          variants={motionSafe(staggerContainer, reduced)}
          initial="hidden"
          whileInView="visible"
          viewport={ONCE_IN_VIEW}
          /*
            auto-rows-fr makes every row as tall as its tallest card, so the
            boxes match across rows as well as within one.
          */
          className="grid list-none gap-6 p-0 sm:auto-rows-fr sm:grid-cols-2"
        >
          {institutionServices.map((service, index) => (
            <FeatureCard
              key={service.title}
              icon={service.icon}
              title={service.title}
              description={service.description}
              /*
                Checkerboard offset that keeps every card the SAME height.
                Grid stretches both cards in a row to one bottom edge, so a
                lone `mt-10` would silently make the dropped card 40px shorter.
                Giving each card the same 40px — below on the left column,
                above on the right — costs both the same height and leaves them
                staggered. Margin, not translate: FeatureCard's hover animates
                `y`, and framer-motion's inline transform would wipe out a CSS
                translate mid-hover.
              */
              className={index % 2 === 1 ? 'sm:mt-10' : 'sm:mb-10'}
            />
          ))}
        </motion.ul>
      </ServiceBand>

      {/* 3 — Corporate Training */}
      <ServiceBand
        id="corporate"
        labelledBy="corporate-title"
        image={BAND_IMAGES.corporate}
        heading={
          <motion.div
            variants={motionSafe(fadeUp, reduced)}
            initial="hidden"
            whileInView="visible"
            viewport={ONCE_IN_VIEW}
          >
            <SectionHeading
              id="corporate-title"
              align="center"
              tone="light"
              size="band"
              weight="bold"
              title="Corporate Training"
            />
          </motion.div>
        }
      >
        <motion.ul
          variants={motionSafe(staggerContainer, reduced)}
          initial="hidden"
          whileInView="visible"
          viewport={ONCE_IN_VIEW}
          // Equal-size, staggered boxes — same technique as institutions above.
          className="grid list-none gap-6 p-0 md:auto-rows-fr md:grid-cols-2"
        >
          {corporateServices.map((service, index) => (
            <FeatureCard
              key={service.title}
              icon={service.icon}
              title={service.title}
              description={service.description}
              className={index % 2 === 1 ? 'md:mt-10' : 'md:mb-10'}
            />
          ))}
        </motion.ul>
      </ServiceBand>

      {/* 4 — How LeSuccess Drives Success */}
      <section
        aria-labelledby="process-title"
        className="mx-auto max-w-6xl px-5 py-20 sm:px-8 lg:py-24"
      >
        <motion.div
          variants={motionSafe(fadeUp, reduced)}
          initial="hidden"
          whileInView="visible"
          viewport={ONCE_IN_VIEW}
        >
          <SectionHeading
            id="process-title"
            align="center"
            size="band"
            weight="bold"
            title={
              <>
                How LeSuccess <span className="text-[#DF1E26]">Drives Success</span>
              </>
            }
            lede="At LeSuccess, our structured learning framework ensures every learner gains practical skills, confidence, and career-ready expertise."
          />
        </motion.div>

        <motion.ol
          variants={motionSafe(staggerContainer, reduced)}
          initial="hidden"
          whileInView="visible"
          viewport={ONCE_IN_VIEW}
          className="mt-12 grid list-none gap-6 p-0 sm:grid-cols-2 lg:auto-rows-fr lg:grid-cols-4"
        >
          {processSteps.map((item, index) => (
            <ProcessStepCard
              key={item.step}
              step={item.step}
              icon={item.icon}
              title={item.title}
              description={item.description}
              // Staggered starts turn the shared drift into a travelling wave
              // across the row instead of four cards bobbing in lockstep.
              floatDelay={index * 0.45}
              // Only from `lg`, where all four sit on one row and the offsets
              // read as rhythm rather than mess.
              className={STEP_OFFSETS[index]}
            />
          ))}
        </motion.ol>
      </section>

      {/* 5 — Ready to Transform Your Future? */}
      <section
        aria-labelledby="service-cta-title"
        className="relative overflow-hidden bg-gradient-to-br from-[#024D72] via-[#07405C] to-[#013550]"
      >
        {/* Decorative ambient subtle glow */}
        <div
          aria-hidden="true"
          className="absolute -top-24 -left-24 h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none"
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-[#DF1E26]/10 blur-3xl pointer-events-none"
        />

        {/*
          One column: heading, subtext, then the three fields across the
          container with the button beneath. The form has no card of its own —
          the band is the surface.
        */}
        <div className="relative mx-auto max-w-4xl px-5 py-20 sm:px-8 lg:py-24">
          <motion.div
            variants={motionSafe(fadeUp, reduced)}
            initial="hidden"
            whileInView="visible"
            viewport={ONCE_IN_VIEW}
          >
            <SectionHeading
              id="service-cta-title"
              align="center"
              tone="light"
              weight="bold"
              title="Ready to Transform Your Future?"
              lede="Whether you are a student looking for a course or a college looking for training partners, LeSuccess is your destination."
            />
          </motion.div>

          <motion.div
            variants={motionSafe(fadeUp, reduced)}
            initial="hidden"
            whileInView="visible"
            viewport={ONCE_IN_VIEW}
            className="mt-10"
          >
            <LeadCaptureForm
              layout="row"
              options={enquiryOptions}
              source={LEAD_SOURCE.SERVICE_CTA_FORM}
            />
          </motion.div>
        </div>
      </section>
    </>
  )
}
