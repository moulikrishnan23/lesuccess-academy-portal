import { useMemo } from 'react'
import { motion } from 'framer-motion'
import SectionHeading from '../ui/SectionHeading.jsx'
import Skeleton from '../ui/Skeleton.jsx'
import { EmptyState } from '../ui/ErrorState.jsx'
import {
  cardHover,
  fadeUp,
  motionSafe,
  ONCE_IN_VIEW,
  staggerContainer,
} from '../../animations/variants.js'
import useReducedMotion from '../../hooks/useReducedMotion.js'

/**
 * Group the flat tech stack into cards.
 *
 * Group order follows first appearance in the API response rather than a
 * hardcoded list of five names — a course with three groups, or with a group an
 * admin invented last week, has to render without a code change.
 *
 * Within a group, items sort by displayOrder (which restarts per group).
 */
function groupByName(techStack) {
  const groups = new Map()

  techStack.forEach((item) => {
    const name = item.groupName || 'Other'
    if (!groups.has(name)) groups.set(name, [])
    groups.get(name).push(item)
  })

  return Array.from(groups, ([name, items]) => ({
    name,
    items: [...items].sort((a, b) => a.displayOrder - b.displayOrder),
  }))
}

/**
 * One group card.
 *
 * The reference shows technology groups as logos only, and groups without
 * logos (Soft Skill) as small bulleted words. `iconUrl` decides which, so the
 * admin dashboard controls the treatment by whether it uploads a logo.
 */
function TechCard({ group, reduced, className = '' }) {
  return (
    <motion.li
      // `variants` carries the staggered entrance from the parent list. Hover is
      // a direct prop rather than a second variant set — mixing hidden/visible
      // with rest/hover on one element makes them fight over the same `y`.
      variants={fadeUp}
      whileHover={reduced ? undefined : cardHover.hover}
      className={`rounded-lg border border-line bg-white px-4 py-3 ${className}`}
    >
      <h3 className="text-center text-[0.8125rem] font-medium text-navy-800">
        {group.name}
      </h3>

      <ul className="mt-2.5 flex list-none flex-wrap items-center justify-center gap-x-5 gap-y-2 p-0">
        {group.items.map((item) =>
          item.iconUrl ? (
            <li key={item.id} className="flex items-center">
              <img
                src={item.iconUrl}
                alt={item.itemName}
                title={item.itemName}
                width="26"
                height="26"
                loading="lazy"
                className="h-[26px] w-[26px] object-contain"
              />
            </li>
          ) : (
            <li
              key={item.id}
              className="flex items-center gap-1.5 text-[0.6875rem] text-ink-soft"
            >
              <span aria-hidden="true" className="text-ink-muted">
                •
              </span>
              {item.itemName}
            </li>
          ),
        )}
      </ul>
    </motion.li>
  )
}

function TechCardSkeleton() {
  return (
    <li className="rounded-lg border border-line bg-white px-4 py-3">
      <Skeleton className="mx-auto h-3 w-20" />
      <div className="mt-3 flex justify-center gap-5">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-[26px] w-[26px]" rounded="rounded-md" />
        ))}
      </div>
    </li>
  )
}

export default function TechStackSection({ course, techStack, isLoading }) {
  const reduced = useReducedMotion()
  const groups = useMemo(() => groupByName(techStack ?? []), [techStack])

  /*
   * The reference heading reads "What is Python Full Stack Development?" while
   * this renders "What is Python Full Stack?" — `category` is the only short
   * course name in the data model, and appending "Development" would be wrong
   * for non-development courses ("Data Analytics Development"). Closing the gap
   * needs a dedicated field rather than a string trick.
   */
  const subject = course?.category || course?.title

  // An odd number of groups leaves the last card alone on its row; the
  // reference centres it rather than leaving a gap on the right.
  const hasOrphanCard = groups.length % 2 === 1

  return (
    <section
      aria-labelledby="stack-title"
      className="mx-auto max-w-6xl px-5 pb-14 sm:px-8 lg:pb-16"
    >
      <motion.div
        variants={motionSafe(fadeUp, reduced)}
        initial="hidden"
        whileInView="visible"
        viewport={ONCE_IN_VIEW}
      >
        <SectionHeading
          id="stack-title"
          title={subject ? `What is ${subject}?` : 'What you will learn'}
        />
      </motion.div>

      {isLoading ? (
        <ul
          aria-busy="true"
          aria-label="Loading course technologies"
          className="mt-6 grid max-w-2xl list-none gap-4 p-0 sm:grid-cols-2"
        >
          {Array.from({ length: 4 }, (_, index) => (
            <TechCardSkeleton key={index} />
          ))}
        </ul>
      ) : groups.length === 0 ? (
        <EmptyState
          className="mt-6 max-w-2xl"
          title="Tools list coming soon"
          message="We are still finalising the tool list for this batch. Ask us and we will send it across."
        />
      ) : (
        <motion.ul
          variants={motionSafe(staggerContainer, reduced)}
          initial="hidden"
          whileInView="visible"
          viewport={ONCE_IN_VIEW}
          className="mt-6 grid max-w-2xl list-none gap-4 p-0 sm:grid-cols-2"
        >
          {groups.map((group, index) => {
            const isOrphan = hasOrphanCard && index === groups.length - 1

            return (
              <TechCard
                key={group.name}
                group={group}
                reduced={reduced}
                className={isOrphan ? 'sm:col-span-2 sm:mx-auto sm:w-1/2' : ''}
              />
            )
          })}
        </motion.ul>
      )}
    </section>
  )
}
