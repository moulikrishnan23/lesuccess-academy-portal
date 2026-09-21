import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Button from '../ui/Button.jsx'
import useReducedMotion from '../../hooks/useReducedMotion.js'
import { motionSafe, slideUpBar } from '../../animations/variants.js'
import { formatPrice } from '../../utils/formatters.js'

const SHOW_AFTER_PX = 420

/**
 * Mobile-only sticky enroll bar.
 *
 * On a phone the enroll card sits inline in the content flow; pinning a
 * three-field form to the bottom of a small viewport would eat most of it. So
 * the sticky element is a compact bar that jumps to the real form.
 *
 * It stays out of the way until the hero CTA has scrolled off, and hides again
 * while the form itself is on screen — two CTAs for the same action, visible at
 * the same time, is noise.
 */
export default function MobileEnrollBar({ course, onEnrollClick, formRef }) {
  const reduced = useReducedMotion()
  const [isScrolledPast, setIsScrolledPast] = useState(false)
  const [isFormVisible, setIsFormVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setIsScrolledPast(window.scrollY > SHOW_AFTER_PX)
    onScroll()

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const node = formRef?.current
    if (!node) return undefined

    const observer = new IntersectionObserver(
      ([entry]) => setIsFormVisible(entry.isIntersecting),
      { rootMargin: '-20% 0px -20% 0px' },
    )
    observer.observe(node)

    return () => observer.disconnect()
  }, [formRef])

  const price = formatPrice(course.discountPrice ?? course.price)
  const strikePrice = course.discountPrice ? formatPrice(course.price) : null
  const isVisible = isScrolledPast && !isFormVisible

  return (
    <AnimatePresence>
      {isVisible ? (
        <motion.div
          variants={motionSafe(slideUpBar, reduced)}
          initial="hidden"
          animate="visible"
          exit={reduced ? undefined : 'hidden'}
          className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 px-4 py-3 backdrop-blur-sm lg:hidden"
          style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              {price ? (
                <p className="flex items-baseline gap-2">
                  <span className="font-display text-lg font-semibold text-navy-800">
                    {price}
                  </span>
                  {strikePrice ? (
                    <span className="text-sm text-ink-muted line-through">
                      {strikePrice}
                    </span>
                  ) : null}
                </p>
              ) : (
                <p className="font-display text-base font-semibold text-navy-800">
                  Talk to a counsellor
                </p>
              )}

              {course.discountLabel ? (
                <p className="text-[0.6875rem] font-semibold text-green">
                  {course.discountLabel}
                </p>
              ) : null}
            </div>

            <Button variant="primary" size="md" onClick={onEnrollClick} className="shrink-0">
              Enroll Now
            </Button>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
