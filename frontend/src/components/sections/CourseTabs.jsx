import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { DURATION, EASE_OUT } from '../../animations/variants.js'
import useReducedMotion from '../../hooks/useReducedMotion.js'
import { DEFAULT_TABS } from './courseTabs.constants.js'

/**
 * In-page tab bar. Pure UI — it owns its own scroll spy and depends on nothing
 * outside this file, so the layout owner's navbar scroll-spy can change freely.
 *
 * Tabs are real anchors, not buttons: they navigate within the document, so the
 * platform should handle Enter, middle-click and "copy link address".
 *
 * `tabs` is a prop because a section can legitimately be absent — the
 * testimonials section hides itself when a course has no reviews, and a tab
 * pointing at nothing is worse than one fewer tab.
 */
export default function CourseTabs({ tabs = DEFAULT_TABS }) {
  const reduced = useReducedMotion()
  const [activeId, setActiveId] = useState(tabs[0]?.id)
  const [indicator, setIndicator] = useState({ x: 0, width: 0 })

  const listRef = useRef(null)
  const navRef = useRef(null)
  const tabRefs = useRef({})

  /*
   * Publish this bar's height so the things that must clear it — the sticky
   * enroll card, the scroll offset for in-page anchors — can be expressed
   * against it instead of guessing. Cleared on unmount: the variable is only
   * meaningful while a course page is mounted.
   */
  useLayoutEffect(() => {
    const node = navRef.current
    if (!node) return undefined

    const root = document.documentElement
    const publish = () =>
      root.style.setProperty('--course-tabs-h', `${node.offsetHeight}px`)

    publish()
    const observer = new ResizeObserver(publish)
    observer.observe(node)

    return () => {
      observer.disconnect()
      root.style.removeProperty('--course-tabs-h')
    }
  }, [])

  // --- Scroll spy -----------------------------------------------------------
  useEffect(() => {
    const visible = new Set()

    /*
     * How much of the top of the viewport is covered by fixed chrome: the site
     * header plus this bar. It used to be hardcoded to 96px, which stopped
     * matching once the header grew — a section counted as "current" while it
     * was still hidden behind the header.
     */
    const chromeHeight = () => {
      const styles = getComputedStyle(document.documentElement)
      const px = (name) => parseFloat(styles.getPropertyValue(name)) || 0
      return px('--app-header-max') + px('--course-tabs-h')
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) visible.add(entry.target.id)
          else visible.delete(entry.target.id)
        })

        /*
          Several sections can be in the band at once, and the deepest one is
          the one being entered.
        
          Taking the first instead meant a section could not become current
          until the one above it had left the band entirely. Testimonials is
          last on the page and sits directly under the certificate, so clicking
          its tab scrolled correctly but left the underline on Certificate —
          the certificate was still occupying the top of the band. Reading from
          the end fixes that and keeps the ordinary scroll case unchanged,
          since the deepest visible section is always the newest one.
        */
        const next = [...tabs].reverse().find((tab) => visible.has(tab.id))
        if (next) setActiveId(next.id)
      },
      {
        // Top offset clears the sticky bar; the bottom offset means a section
        // becomes active once it reaches the upper part of the viewport.
        //
        // KNOWN LIMITATION: if the viewport is nearly as tall as the whole
        // page (a very short course on a large monitor), the trailing sections
        // can sit below this band at maximum scroll and never become active —
        // the tab bar then stays on the last section that did reach it. A
        // bottom-of-page override was tried and could not be verified in the
        // available browser environment, so it was left out rather than
        // shipped unproven. Revisit with a real device if it shows up.
        rootMargin: `-${chromeHeight()}px 0px -55% 0px`,
        threshold: 0,
      },
    )

    const sections = tabs.map((tab) => document.getElementById(tab.id)).filter(Boolean)
    sections.forEach((section) => observer.observe(section))

    return () => observer.disconnect()
  }, [tabs])

  // --- Indicator geometry ---------------------------------------------------
  useLayoutEffect(() => {
    const measure = () => {
      const node = tabRefs.current[activeId]
      if (!node) return
      setIndicator({ x: node.offsetLeft, width: node.offsetWidth })
    }

    measure()

    const observer = new ResizeObserver(measure)
    if (listRef.current) observer.observe(listRef.current)

    return () => observer.disconnect()
  }, [activeId])

  return (
    /*
      Sticks below the site header, not at the top of the viewport.

      `top-0` put this bar underneath the fixed offer bar and navbar, which sit
      above it in the stacking order — so it was pinned, but invisible from the
      first scroll onward. --app-header tracks the header's real measured
      height and shrinks while the navbar is hidden, so the bar rides up with
      it; the duration matches the navbar's own transition.
    */
    <nav
      ref={navRef}
      aria-label="Course sections"
      className="sticky z-30 border-b border-line bg-white/95 backdrop-blur-sm transition-[top] duration-300 ease-in-out"
      style={{ top: 'var(--app-header, 0px)' }}
    >
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <ul
          ref={listRef}
          className="relative flex list-none gap-1 overflow-x-auto p-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {tabs.map((tab) => {
            const isActive = tab.id === activeId

            return (
              <li key={tab.id}>
                <a
                  href={`#${tab.id}`}
                  ref={(node) => {
                    tabRefs.current[tab.id] = node
                  }}
                  aria-current={isActive ? 'true' : undefined}
                  className={`block whitespace-nowrap px-5 py-4 text-sm transition-colors ${
                    isActive
                      ? 'font-semibold text-brand'
                      : 'font-normal text-ink-soft hover:text-navy-800'
                  }`}
                >
                  {tab.label}
                </a>
              </li>
            )
          })}

          {/*
            The indicator slides rather than fades. It is 1px wide and scaled,
            so both its position and its size are pure transforms — Framer
            composes translate before scale, so x is unaffected by scaleX.
          */}
          <motion.span
            aria-hidden="true"
            className="absolute bottom-0 left-0 h-[3px] w-px origin-left rounded-full bg-brand"
            initial={false}
            animate={{ x: indicator.x, scaleX: indicator.width }}
            transition={
              reduced
                ? { duration: 0 }
                : { duration: DURATION.interaction, ease: EASE_OUT }
            }
          />
        </ul>
      </div>
    </nav>
  )
}
