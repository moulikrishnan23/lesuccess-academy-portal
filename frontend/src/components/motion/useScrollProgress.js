import { useEffect, useRef } from 'react'

/**
 * How far a tall section has been scrolled through, 0..1.
 *
 * 0 while its top edge is at or below the top of the viewport, 1 once its bottom
 * edge has reached the bottom of the viewport. A section no taller than the
 * viewport has no scroll range, so it is either not started (0) or done (1).
 */
export function scrollProgress(top, height, viewportHeight) {
  const range = height - viewportHeight
  if (!(range > 0)) return top <= 0 ? 1 : 0
  return Math.min(1, Math.max(0, -top / range))
}

/**
 * Writes the scroll progress of `ref` to the CSS variable `--p` on that element.
 *
 * The value never goes through React state: scroll fires every frame, and a
 * re-render per frame on a 260vh pinned section is exactly the jank this hook
 * exists to avoid. CSS reads `--p` directly; JS can read the returned ref.
 *
 * Work is rAF-throttled, the listener is passive, and it is only attached while
 * the section is on screen. With `disabled` (pass the reduced-motion flag) the
 * element is pinned at its final state, `--p: 1`.
 */
export default function useScrollProgress(ref, { disabled = false } = {}) {
  const progressRef = useRef(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return undefined

    const write = (p) => {
      progressRef.current = p
      el.style.setProperty('--p', p.toFixed(4))
    }

    if (disabled) {
      write(1)
      return undefined
    }

    let frame = 0
    let listening = false

    const measure = () => {
      frame = 0
      const rect = el.getBoundingClientRect()
      write(scrollProgress(rect.top, rect.height, window.innerHeight))
    }
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure)
    }
    const listen = (on) => {
      if (on === listening) return
      listening = on
      const method = on ? 'addEventListener' : 'removeEventListener'
      window[method]('scroll', schedule, { passive: true })
      window[method]('resize', schedule)
    }

    measure()

    let io
    if (typeof IntersectionObserver === 'undefined') {
      listen(true)
    } else {
      io = new IntersectionObserver(([entry]) => {
        listen(entry.isIntersecting)
        // One last measurement on the way out, so a fast fling leaves 0 or 1
        // behind rather than whatever the previous frame happened to catch.
        schedule()
      })
      io.observe(el)
    }

    return () => {
      io?.disconnect()
      listen(false)
      cancelAnimationFrame(frame)
    }
  }, [ref, disabled])

  return progressRef
}
