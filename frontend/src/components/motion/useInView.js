import { useEffect, useState } from 'react'

/**
 * True once `ref` has entered the viewport (or while it is inside, with
 * `once: false`).
 *
 * Browsers without IntersectionObserver start as "in view", so content gated on
 * this hook is never left invisible.
 */
export default function useInView(
  ref,
  { threshold = 0.15, rootMargin = '0px', once = true } = {},
) {
  const [inView, setInView] = useState(
    () => typeof IntersectionObserver === 'undefined',
  )

  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') return undefined

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          if (once) io.disconnect()
        } else if (!once) {
          setInView(false)
        }
      },
      { threshold, rootMargin },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [ref, threshold, rootMargin, once])

  return inView
}
