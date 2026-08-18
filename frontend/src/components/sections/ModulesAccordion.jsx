import { motion } from 'framer-motion'
import Accordion from '../ui/Accordion.jsx'
import SectionHeading from '../ui/SectionHeading.jsx'
import Skeleton from '../ui/Skeleton.jsx'
import { EmptyState } from '../ui/ErrorState.jsx'
import { ChevronIcon } from '../ui/icons.jsx'
import {
  DURATION,
  EASE_OUT,
  fadeUp,
  motionSafe,
  ONCE_IN_VIEW,
} from '../../animations/variants.js'
import useReducedMotion from '../../hooks/useReducedMotion.js'

function Chevron({ isOpen, reduced }) {
  return (
    <motion.span
      aria-hidden="true"
      className="shrink-0 text-ink-muted"
      animate={{ rotate: isOpen ? 180 : 0 }}
      transition={
        reduced ? { duration: 0 } : { duration: DURATION.interaction, ease: EASE_OUT }
      }
    >
      <ChevronIcon size={16} direction="down" />
    </motion.span>
  )
}

function ModulesSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading curriculum"
      className="mt-6 max-w-3xl space-y-2.5"
    >
      {Array.from({ length: 6 }, (_, index) => (
        <div
          key={index}
          className="flex items-center justify-between rounded-lg border border-line bg-white px-4 py-4"
        >
          <Skeleton className="h-3.5 w-32" />
          <Skeleton className="h-3 w-3" />
        </div>
      ))}
    </div>
  )
}

/**
 * "Topics You will Learn" — the curriculum accordion.
 *
 * Rows are collapsed on load, matching the reference. Keyboard behaviour
 * (Enter/Space to toggle, arrows to move between headers) comes from the shared
 * Accordion and is not reimplemented here.
 */
export default function ModulesAccordion({ modules, isLoading }) {
  const reduced = useReducedMotion()
  const items = modules ?? []

  return (
    <section
      id="curriculum"
      aria-labelledby="curriculum-title"
      className="relative bg-section"
    >
      {/* Faint grid, as in the reference section background. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-60 [background-image:linear-gradient(#e8eef5_1px,transparent_1px),linear-gradient(90deg,#e8eef5_1px,transparent_1px)] [background-size:56px_56px]"
      />

      <motion.div
        variants={motionSafe(fadeUp, reduced)}
        initial="hidden"
        whileInView="visible"
        viewport={ONCE_IN_VIEW}
        className="relative mx-auto max-w-6xl px-5 py-14 sm:px-8 lg:py-16"
      >
        <SectionHeading id="curriculum-title" title="Topics You will Learn" />

        {isLoading ? (
          <ModulesSkeleton />
        ) : items.length === 0 ? (
          <EmptyState
            className="mt-6 max-w-3xl"
            title="Curriculum coming soon"
            message="The module breakdown for this course is being finalised. Request a call and we will send you the syllabus directly."
          />
        ) : (
          <Accordion
            items={items}
            classNames={{
              root: 'mt-6 max-w-3xl space-y-2.5',
              item: 'overflow-hidden rounded-lg border border-line bg-white transition-colors data-[open=true]:border-brand/40',
              trigger:
                'flex w-full items-center justify-between gap-4 px-4 py-3.5 text-left',
              panel: 'px-4 pb-4',
            }}
            renderTrigger={({ item, isOpen }) => (
              <>
                <span className="text-[0.875rem] font-medium text-navy-800">
                  {item.title}
                </span>
                <Chevron isOpen={isOpen} reduced={reduced} />
              </>
            )}
            renderPanel={({ item }) => (
              <p className="border-t border-line pt-3 text-[0.875rem] leading-[1.85] text-ink-soft">
                {item.description || 'Details for this module are being finalised.'}
              </p>
            )}
          />
        )}
      </motion.div>
    </section>
  )
}
