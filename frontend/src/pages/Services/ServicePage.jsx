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
import useReducedMotion from '../../hooks/useReducedMotion.js'
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
 * Static on purpose: no CMS wiring was asked for. When /api/services exists,
 * these arrays are what a useServices() hook would return — same shape, same
 * field names — so the components below would not change.
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
 * "You looking for?" options. The reference shows the control but not its
 * choices, so these are the page's own service names rather than invented
 * categories — nothing here is a service the page does not already describe.
 */
const ENQUIRY_OPTIONS = [...INSTITUTION_SERVICES, ...CORPORATE_SERVICES].map(
  ({ title }) => ({ value: title, label: title }),
)

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
      <div className="relative overflow-hidden bg-navy-900 pt-20 pb-28 lg:pt-24 lg:pb-32">
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
        <div aria-hidden="true" className="band-overlay-navy absolute inset-0" />

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
        className="mx-auto max-w-6xl px-5 pt-20 pb-16 text-center sm:px-8 lg:pt-24"
      >
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
                <span className="text-brand">We Transform.</span>
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
          {INSTITUTION_SERVICES.map((service, index) => (
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
          {CORPORATE_SERVICES.map((service, index) => (
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
                How LeSuccess <span className="text-brand">Drives Success</span>
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
          {PROCESS_STEPS.map((item, index) => (
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
        className="relative overflow-hidden bg-navy-900"
      >
        {/* Diagonal navy → blue, both stops from the theme's navy ramp. */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[linear-gradient(135deg,var(--color-navy-900)_0%,var(--color-navy-700)_100%)]"
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
              options={ENQUIRY_OPTIONS}
              source={LEAD_SOURCE.SERVICE_CTA_FORM}
            />
          </motion.div>
        </div>
      </section>
    </>
  )
}
