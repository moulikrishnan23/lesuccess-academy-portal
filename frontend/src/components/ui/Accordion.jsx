import { useCallback, useId, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { accordionPanel, motionSafe } from '../../animations/variants.js'
import useReducedMotion from '../../hooks/useReducedMotion.js'

// Hoisted so the default props keep a stable identity across renders.
const NO_IDS = []
const NO_CLASSNAMES = {}

/**
 * Shared accordion.
 *
 * Owns state, keyboard behaviour and ARIA wiring; owns none of the visuals.
 * Callers pass `renderTrigger` / `renderPanel` so a section can look however it
 * needs without forking this component.
 *
 * Keyboard model follows the WAI-ARIA accordion pattern:
 *   Enter / Space  toggle          (native <button>, not reimplemented)
 *   ArrowDown / Up move focus between headers
 *   Home / End     first / last header
 */
export default function Accordion({
  items,
  allowMultiple = false,
  defaultOpenIds = NO_IDS,
  renderTrigger,
  renderPanel,
  classNames = NO_CLASSNAMES,
}) {
  const baseId = useId()
  const reduced = useReducedMotion()
  const [openIds, setOpenIds] = useState(() => new Set(defaultOpenIds))

  // Focus is moved imperatively by the arrow keys, so the triggers are tracked
  // by index rather than queried from the DOM.
  const triggerRefs = useRef([])

  const toggle = useCallback(
    (id) => {
      setOpenIds((current) => {
        const next = allowMultiple ? new Set(current) : new Set()
        if (current.has(id)) next.delete(id)
        else next.add(id)
        return next
      })
    },
    [allowMultiple],
  )

  const focusTrigger = (index) => {
    const total = triggerRefs.current.length
    if (total === 0) return
    // Wrap, so ArrowDown on the last header returns to the first.
    const target = ((index % total) + total) % total
    triggerRefs.current[target]?.focus()
  }

  const handleKeyDown = (event, index) => {
    const actions = {
      ArrowDown: () => focusTrigger(index + 1),
      ArrowUp: () => focusTrigger(index - 1),
      Home: () => focusTrigger(0),
      End: () => focusTrigger(triggerRefs.current.length - 1),
    }

    const action = actions[event.key]
    if (!action) return

    event.preventDefault()
    action()
  }

  return (
    <div className={classNames.root ?? ''}>
      {items.map((item, index) => {
        const isOpen = openIds.has(item.id)
        const triggerId = `${baseId}-trigger-${item.id}`
        const panelId = `${baseId}-panel-${item.id}`

        return (
          <div key={item.id} className={classNames.item ?? ''} data-open={isOpen}>
            <h3>
              <button
                type="button"
                id={triggerId}
                ref={(node) => {
                  triggerRefs.current[index] = node
                }}
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggle(item.id)}
                onKeyDown={(event) => handleKeyDown(event, index)}
                className={classNames.trigger ?? ''}
              >
                {renderTrigger({ item, index, isOpen })}
              </button>
            </h3>

            <AnimatePresence initial={false}>
              {isOpen ? (
                <motion.div
                  key="panel"
                  id={panelId}
                  role="region"
                  aria-labelledby={triggerId}
                  variants={motionSafe(accordionPanel, reduced)}
                  initial="hidden"
                  animate="visible"
                  exit={reduced ? undefined : 'exit'}
                  // Height is animated, so the panel must clip its own content
                  // for the duration of the transition.
                  className="overflow-hidden"
                >
                  <div className={classNames.panel ?? ''}>
                    {renderPanel({ item, index })}
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        )
      })}
    </div>
  )
}
