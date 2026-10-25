import { useEffect, useRef, useState } from 'react'
import useReducedMotion from '../../hooks/useReducedMotion.js'

/**
 * An endless horizontal strip.
 *
 * The track holds two identical groups and slides by exactly one group plus
 * one gap (motion.css), so the loop has no seam. That only works if one group
 * is at least as wide as the strip, so each group repeats the items as many
 * times as the strip's width needs (measured with a ResizeObserver; six logos
 * on a 1900px screen would otherwise leave a blank run before the loop
 * restarts). Every copy after the first is aria-hidden and inert: screen
 * readers and keyboard users meet each item once. The strip pauses on hover
 * (optional) and always while anything inside has focus.
 *
 * Reduced motion: one copy, no animation, scrollable sideways instead.
 *
 * `alwaysMove` opts a strip out of that: it keeps its normal pace under
 * reduced motion, for strips the design depends on. It is driven by a small
 * rAF loop rather than the CSS animation, because the global reduced-motion
 * backstop in index.css cuts every CSS animation to 0.01ms. It moves
 * continuously (hover does not pause it), idles only while off screen and
 * resumes from the same spot, and holds still only while a keyboard user has
 * focused something inside it.
 *
 * `items` is an array of React nodes, each carrying its own key.
 */
export default function Marquee({
  items,
  reverse = false,
  speed = 38,
  gap = '1.5rem',
  pauseOnHover = true,
  alwaysMove = false,
  label,
  className = '',
}) {
  const reduced = useReducedMotion()
  const rootRef = useRef(null)
  const trackRef = useRef(null)
  const groupRef = useRef(null)
  const driven = alwaysMove
  const staticStrip = reduced && !alwaysMove
  // How many times one group repeats the items so it spans the strip.
  const [repeats, setRepeats] = useState(1)

  useEffect(() => {
    const root = rootRef.current
    const group = groupRef.current
    if (staticStrip || !root || !group || typeof ResizeObserver === 'undefined') return undefined

    const measure = () => {
      const gapPx = parseFloat(getComputedStyle(group).columnGap) || 0
      const current = Number(group.dataset.repeats) || 1
      const single = (group.scrollWidth + gapPx) / current
      if (single <= 0) return
      const need = Math.max(1, Math.ceil((root.clientWidth + gapPx) / single))
      setRepeats((r) => (r === need ? r : need))
    }
    // Fires once on observe, then whenever the strip resizes or logos load.
    const ro = new ResizeObserver(measure)
    ro.observe(root)
    ro.observe(group)
    return () => ro.disconnect()
  }, [staticStrip, items])

  useEffect(() => {
    const root = rootRef.current
    const track = trackRef.current
    if (!driven || !root || !track || typeof IntersectionObserver === 'undefined') return undefined

    let frame = 0
    let running = false
    let held = false
    let offset = 0
    let velocity = 0
    let last = 0
    let gapPx = 0
    const direction = reverse ? -1 : 1

    const tick = (now) => {
      const dt = Math.min(0.05, (now - (last || now)) / 1000)
      last = now
      // One loop = one copy plus the gap between the two copies.
      const loop = (track.scrollWidth + gapPx) / 2
      if (loop > 0) {
        // `speed` is seconds per set of items, so extra repeats keep the pace.
        const sets = Number(track.firstElementChild?.dataset.repeats) || 1
        const cruise = loop / sets / speed
        velocity += ((held ? 0 : cruise) - velocity) * 0.1
        offset = (offset + direction * velocity * dt) % loop
        if (offset < 0) offset += loop
        track.style.transform = `translate3d(${-offset}px, 0, 0)`
      }
      frame = requestAnimationFrame(tick)
    }

    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !running) {
        running = true
        last = 0
        gapPx = parseFloat(getComputedStyle(track).columnGap) || 0
        frame = requestAnimationFrame(tick)
      } else if (!entry.isIntersecting && running) {
        running = false
        cancelAnimationFrame(frame)
      }
    })
    io.observe(root)

    // A driven strip never stops for the mouse; it only holds still while a
    // keyboard user has focused something inside it, so they can activate it.
    const hold = (event) => {
      held = Boolean(event.target?.matches?.(':focus-visible'))
    }
    const release = () => {
      held = false
    }
    root.addEventListener('focusin', hold)
    root.addEventListener('focusout', release)

    return () => {
      io.disconnect()
      cancelAnimationFrame(frame)
      root.removeEventListener('focusin', hold)
      root.removeEventListener('focusout', release)
    }
  }, [driven, reverse, speed])

  if (!items?.length) return null

  const sets = staticStrip ? 1 : repeats
  // One group: the real items, then hidden copies until the strip is covered.
  const group = (hiddenGroup) => (
    <>
      {hiddenGroup ? (
        <div className="motion-marquee-set" aria-hidden="true" inert>
          {items}
        </div>
      ) : (
        items
      )}
      {Array.from({ length: sets - 1 }, (_, i) => (
        <div key={`set-${i}`} className="motion-marquee-set" aria-hidden="true" inert>
          {items}
        </div>
      ))}
    </>
  )

  const classes = [
    'motion-marquee',
    reverse && 'motion-marquee--reverse',
    pauseOnHover && !driven && 'motion-marquee--pause',
    driven && 'motion-marquee--driven',
    staticStrip && 'motion-marquee--static',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div
      ref={rootRef}
      className={classes}
      style={{ '--marquee-duration': `${speed * sets}s`, '--marquee-gap': gap }}
      role={label ? 'region' : undefined}
      aria-label={label}
    >
      <div ref={trackRef} className="motion-marquee-track">
        <div ref={groupRef} className="motion-marquee-group" data-repeats={sets}>
          {group(false)}
        </div>
        {!staticStrip && (
          <div className="motion-marquee-group" data-repeats={sets} aria-hidden="true" inert>
            {group(true)}
          </div>
        )}
      </div>
    </div>
  )
}
