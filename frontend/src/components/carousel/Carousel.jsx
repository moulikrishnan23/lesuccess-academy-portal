import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronIcon } from '../ui/icons.jsx'
import { CAROUSEL_TRANSITION } from '../../animations/variants.js'
import useReducedMotion from '../../hooks/useReducedMotion.js'

const GAP_PX = 20

/**
 * Shared carousel for the whole site — course previews, testimonials, anything
 * else. It is presentational: it never fetches, and it renders whatever
 * `renderItem` returns.
 *
 * Slides-per-view is derived from the *container* width rather than the
 * viewport, so the same component behaves correctly in a narrow column and a
 * full-bleed section without being told which it is in.
 *
 * Movement is a single translateX on the track. Nothing animates width.
 */
export default function Carousel({
  items,
  renderItem,
  getItemKey = (item, index) => item?.id ?? index,
  breakpoints = { sm: 2, lg: 3 },
  label = 'Carousel',
  className = '',
}) {
  const reduced = useReducedMotion()
  const viewportRef = useRef(null)
  const [viewportWidth, setViewportWidth] = useState(0)
  const [index, setIndex] = useState(0)

  useLayoutEffect(() => {
    const node = viewportRef.current
    if (!node) return undefined

    const observer = new ResizeObserver(([entry]) => {
      setViewportWidth(entry.contentRect.width)
    })
    observer.observe(node)
    setViewportWidth(node.getBoundingClientRect().width)

    return () => observer.disconnect()
  }, [])

  const perView = useMemo(() => {
    if (viewportWidth === 0) return 1
    if (viewportWidth >= 900) return breakpoints.lg ?? 3
    if (viewportWidth >= 620) return breakpoints.sm ?? 2
    return 1
  }, [viewportWidth, breakpoints.lg, breakpoints.sm])

  const slideWidth =
    viewportWidth > 0 ? (viewportWidth - GAP_PX * (perView - 1)) / perView : 0

  const maxIndex = Math.max(0, items.length - perView)
  const isInteractive = maxIndex > 0

  /*
   * A widening viewport raises perView, which lowers maxIndex and can leave the
   * stored index past the end. That used to be corrected by an effect that
   * clamped `index` after the fact; clamping on read does the same job in one
   * render instead of two, and keeps the effect out of the way of
   * react-hooks/set-state-in-effect. The stored value catches up on the next
   * goTo(), which clamps before it writes.
   */
  const activeIndex = Math.min(index, maxIndex)

  const goTo = useCallback(
    (next) => setIndex(Math.min(Math.max(next, 0), maxIndex)),
    [maxIndex],
  )

  const offset = -(activeIndex * (slideWidth + GAP_PX))

  const handleDragEnd = (_event, info) => {
    // Commit to a slide change on either a decisive throw or a half-slide drag.
    const throwDistance = info.offset.x + info.velocity.x * 0.2
    const steps = Math.round(-throwDistance / (slideWidth + GAP_PX))
    goTo(activeIndex + steps)
  }

  const handleKeyDown = (event) => {
    if (event.key === 'ArrowRight') {
      event.preventDefault()
      goTo(activeIndex + 1)
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault()
      goTo(activeIndex - 1)
    }
  }

  return (
    // `relative` anchors the overlaid arrows; they stay within these bounds so
    // the page never picks up horizontal overflow on narrow screens.
    <div className={`relative ${className}`}>
      <div
        ref={viewportRef}
        role="group"
        aria-roledescription="carousel"
        aria-label={label}
        tabIndex={isInteractive ? 0 : -1}
        onKeyDown={isInteractive ? handleKeyDown : undefined}
        className="overflow-hidden rounded-card"
      >
        <motion.ul
          className="flex list-none items-stretch p-0"
          style={{ gap: GAP_PX }}
          animate={{ x: offset }}
          transition={reduced ? { duration: 0 } : CAROUSEL_TRANSITION}
          drag={isInteractive && !reduced ? 'x' : false}
          dragElastic={0.08}
          dragMomentum={false}
          // Constrain to the track's real travel so it can't be flung into space.
          dragConstraints={{
            left: -(maxIndex * (slideWidth + GAP_PX)),
            right: 0,
          }}
          onDragEnd={handleDragEnd}
        >
          {items.map((item, itemIndex) => (
            <li
              key={getItemKey(item, itemIndex)}
              className="shrink-0"
              // Slides stay in the accessibility tree even when off-screen:
              // for static content, letting a screen reader run through all of
              // them linearly beats forcing arrow-button paging.
              style={{ width: slideWidth > 0 ? slideWidth : '100%' }}
            >
              {renderItem(item, itemIndex)}
            </li>
          ))}
        </motion.ul>
      </div>

      {/*
        Arrows sit over the track edges, as in the reference carousels. The
        enabled arrow is solid navy, the disabled one drops to a light outline
        rather than disappearing, so the control's position stays predictable.
      */}
      {isInteractive ? (
        <>
          <CarouselButton
            label="Previous"
            disabled={activeIndex === 0}
            onClick={() => goTo(activeIndex - 1)}
            direction="left"
            className="left-0"
          />
          <CarouselButton
            label="Next"
            disabled={activeIndex === maxIndex}
            onClick={() => goTo(activeIndex + 1)}
            direction="right"
            className="right-0"
          />
        </>
      ) : null}
    </div>
  )
}

function CarouselButton({ label, disabled, onClick, direction, className = '' }) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={`absolute top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full shadow-md transition-colors ${
        disabled
          ? 'cursor-not-allowed border border-line bg-white text-ink-muted'
          : 'bg-navy-800 text-white hover:bg-navy-700'
      } ${className}`}
    >
      <ChevronIcon size={15} direction={direction} />
    </button>
  )
}
