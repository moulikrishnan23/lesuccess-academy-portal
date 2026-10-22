import { useRef } from 'react'
import useInView from './useInView.js'
import useReducedMotion from '../../hooks/useReducedMotion.js'

/**
 * Fade and rise into place the first time the element is scrolled to.
 *
 * CSS-driven (.motion-reveal in motion.css) rather than Framer, so a page with
 * dozens of these costs one IntersectionObserver each and no per-frame JS.
 * `index` staggers siblings by 60ms; transform-only, so it causes no layout shift.
 */
export default function Reveal({
  as: Tag = 'div',
  index = 0,
  className = '',
  style,
  children,
  ...rest
}) {
  const ref = useRef(null)
  const reduced = useReducedMotion()
  const inView = useInView(ref, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' })
  const shown = reduced || inView

  return (
    <Tag
      ref={ref}
      className={`motion-reveal${shown ? ' is-in' : ''}${className ? ` ${className}` : ''}`}
      style={{ '--reveal-i': index, ...style }}
      {...rest}
    >
      {children}
    </Tag>
  )
}
