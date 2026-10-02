import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Info, BookOpen, Award, MessageSquare, Sparkles } from 'lucide-react'
import { DURATION, EASE_OUT } from '../../animations/variants.js'
import useReducedMotion from '../../hooks/useReducedMotion.js'
import { DEFAULT_TABS } from './courseTabs.constants.js'

const TAB_ICONS = {
  about: Info,
  curriculum: BookOpen,
  course: BookOpen,
  certificate: Award,
  testimonials: MessageSquare,
}

/**
 * Course Section Navigation Bar:
 * - On Desktop (>= 768px / md): Sticky at top directly below the header (--app-header),
 *   with sliding indicator and zero-gap alignment with OfferHeader when navbar hides.
 * - On Mobile (< 768px / md): Fixed at the bottom of the viewport as a proper mobile
 *   bottom navigation bar (About | Course | Certificate | Testimonials) with live
 *   active-section tracking, smooth offset scrolling, and iOS safe-area support.
 */
export default function CourseTabs({ tabs = DEFAULT_TABS }) {
  const reduced = useReducedMotion()
  const [activeId, setActiveId] = useState(tabs[0]?.id)
  const [indicator, setIndicator] = useState({ x: 0, width: 0 })

  const listRef = useRef(null)
  const navRef = useRef(null)
  const mobileNavRef = useRef(null)
  const tabRefs = useRef({})

  /*
   * Publish this bar's height on desktop so sticky elements (enroll card, scroll offsets)
   * can clear it accurately instead of guessing.
   */
  useLayoutEffect(() => {
    const node = navRef.current
    if (!node) return undefined

    const root = document.documentElement
    const publish = () => {
      const h = node.offsetHeight || 50
      root.style.setProperty('--course-tabs-h', `${h}px`)
    }

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

    const chromeHeight = () => {
      const styles = getComputedStyle(document.documentElement)
      const px = (name) => parseFloat(styles.getPropertyValue(name)) || 0
      const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
      if (isMobile) {
        return (px('--offer-header-h') || 40) + 16
      }
      return px('--app-header-max') + px('--course-tabs-h')
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) visible.add(entry.target.id)
          else visible.delete(entry.target.id)
        })

        const next = [...tabs].reverse().find((tab) => visible.has(tab.id))
        if (next) setActiveId(next.id)
      },
      {
        rootMargin: `-${chromeHeight()}px 0px -55% 0px`,
        threshold: 0,
      },
    )

    const sections = tabs.map((tab) => document.getElementById(tab.id)).filter(Boolean)
    sections.forEach((section) => observer.observe(section))

    return () => observer.disconnect()
  }, [tabs])

  // --- Desktop Indicator geometry -------------------------------------------
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

  const handleTabClick = (e, tabId) => {
    e.preventDefault()
    const target = document.getElementById(tabId)
    if (!target) return

    // Calculate fixed header height covering the top of the viewport
    const styles = getComputedStyle(document.documentElement)
    const px = (name) => parseFloat(styles.getPropertyValue(name)) || 0
    const isMobile = window.innerWidth < 768

    // On mobile: top fixed element is ONLY OfferHeader (Navbar is at bottom)
    // On desktop: top fixed elements are OfferHeader + desktop CourseTabs
    const topChromeHeight = isMobile
      ? (px('--offer-header-h') || 40) + 16
      : (px('--app-header') || 40) + (px('--course-tabs-h') || 50) + 16

    const elementPosition = target.getBoundingClientRect().top
    const offsetPosition = elementPosition + window.pageYOffset - topChromeHeight

    window.scrollTo({
      top: Math.max(0, offsetPosition),
      behavior: reduced ? 'auto' : 'smooth',
    })

    window.history.replaceState(null, '', `#${tabId}`)
    setActiveId(tabId)
  }

  return (
    <>
      {/* =====================================================
          DESKTOP STICKY TAB BAR (>= 768px / md)
          Sticks below the site header with zero gap!
      ===================================================== */}
      <nav
        ref={navRef}
        aria-label="Course sections"
        className="hidden md:block sticky z-30 border-b border-line bg-white/95 backdrop-blur-sm transition-[top] duration-300 ease-in-out shadow-2xs"
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
                    onClick={(e) => handleTabClick(e, tab.id)}
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

      {/* =====================================================
          MOBILE BOTTOM NAVIGATION (< 768px / md)
          Fixed directly above the mobile website navbar
          (About | Course | Certificate | Testimonials)
      ===================================================== */}
      <nav
        ref={mobileNavRef}
        aria-label="Mobile course section navigation"
        className="block md:hidden fixed bottom-[calc(3.5rem+env(safe-area-inset-bottom,0px))] left-0 right-0 z-40 border-t border-b border-slate-200/90 bg-white/95 backdrop-blur-md shadow-[0_-4px_20px_rgba(0,0,0,0.08)]"
      >
        <div className="grid grid-cols-4 divide-x divide-slate-100 text-center">
          {tabs.map((tab) => {
            const isActive = tab.id === activeId
            const Icon = TAB_ICONS[tab.id] || Sparkles

            return (
              <button
                key={tab.id}
                type="button"
                onClick={(e) => handleTabClick(e, tab.id)}
                aria-current={isActive ? 'true' : undefined}
                className={`relative flex flex-col items-center justify-center py-2 px-1 transition-all cursor-pointer ${
                  isActive
                    ? 'text-[#DF1E26] font-bold bg-red-50/60'
                    : 'text-slate-600 font-medium hover:text-[#07405C] active:scale-95'
                }`}
              >
                {isActive && (
                  <span className="absolute top-0 left-2 right-2 h-[2.5px] bg-[#DF1E26] rounded-full" />
                )}
                <Icon size={17} className={isActive ? 'text-[#DF1E26]' : 'text-slate-400'} />
                <span className="text-[11px] font-semibold tracking-tight mt-0.5 leading-tight truncate max-w-full">
                  {tab.label}
                </span>
              </button>
            )
          })}
        </div>
      </nav>
    </>
  )
}
