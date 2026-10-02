import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react'
import { FaInstagram } from 'react-icons/fa6'
import InstagramReelEmbed from './InstagramReelEmbed.jsx'
import { getCleanReelUrl } from '../../utils/instagramEmbed.js'

/**
 * Side Preview Card for 3D Carousel / Card Stack layout
 * Matches the reference design (media_1790503958075.webp & media_1790503958106.jpg)
 */
function SidePreviewCard({ reel, position = 'left', onClick }) {
  if (!reel) return null
  const isLeft = position === 'left'

  return (
    <div
      onClick={onClick}
      className={`hidden sm:flex flex-col w-[210px] md:w-[240px] shrink-0 rounded-3xl overflow-hidden border border-white/10 bg-slate-900 shadow-xl cursor-pointer transition-all duration-300 transform select-none ${
        isLeft
          ? '-mr-8 md:-mr-12 lg:-mr-16 scale-[0.85] -rotate-2 opacity-50 hover:opacity-80 z-10'
          : '-ml-8 md:-ml-12 lg:-ml-16 scale-[0.85] rotate-2 opacity-50 hover:opacity-80 z-10'
      }`}
      aria-label={isLeft ? 'Previous success story' : 'Next success story'}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onClick?.()
      }}
    >
      {/* Video Placeholder / Thumbnail with Instagram icon */}
      <div className="relative w-full aspect-[4/5] bg-gradient-to-b from-slate-800 via-slate-900 to-black flex flex-col items-center justify-center p-4 text-center overflow-hidden">
        <div className="h-11 w-11 rounded-full bg-gradient-to-tr from-amber-500 via-pink-600 to-purple-600 flex items-center justify-center text-white mb-2 shadow-md">
          <FaInstagram size={20} />
        </div>
        <span className="text-[11px] font-bold text-white/90 line-clamp-2 px-2">
          {reel.title || 'Student Success Story'}
        </span>
        <span className="text-[10px] text-pink-400 mt-1">Tap to View</span>
      </div>

      {/* Sleek bottom bar matching reference */}
      <div className="w-full bg-[#0b1320] border-t border-white/5 px-3 py-2.5 flex items-center justify-between">
        <span className="text-[11px] font-bold text-slate-300 truncate max-w-[130px]">
          {reel.title || 'Success Story'}
        </span>
        <div className="h-6 w-6 rounded-full bg-white/10 flex items-center justify-center text-white/70">
          <ChevronRight size={13} />
        </div>
      </div>
    </div>
  )
}

/**
 * Instagram Success Stories 3-Card Stack / Carousel Popup
 * Visually matches the uploaded reference images (media_1790503958075.webp & media_1790503958106.jpg):
 *
 * - Cover flow / 3-Card layout: Active reel center card flanked by previous and next preview cards
 * - Top-right close button (X) at the corner of the Reel card
 * - Sleek card footer with title, "View on Instagram" CTA, and circular action button (+)
 * - Smooth automatic rotation every 6s, pauses on hover/touch
 * - Touch swipe support on mobile (320px–430px)
 * - Zero likes, comments, share controls, or Instagram post UI
 * - Strictly uses Admin Success Stories active reels data in displayOrder sequence
 */
export default function InitialReelExperience({ activeReels = [], onContinue }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [isWatching, setIsWatching] = useState(false)
  const isHoveringPlayerRef = useRef(false)
  const touchStartX = useRef(null)

  // Sort reels by admin display order and take ONLY the first/top 4 (Requirement 2)
  const sortedReels = [...activeReels]
    .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
    .slice(0, 4)

  const count = sortedReels.length

  const handleNext = useCallback(() => {
    if (count <= 1) return
    setIsWatching(false)
    setCurrentIndex((prev) => (prev + 1) % count)
  }, [count])

  const handlePrev = useCallback(() => {
    if (count <= 1) return
    setIsWatching(false)
    setCurrentIndex((prev) => (prev - 1 + count) % count)
  }, [count])

  // Stop auto-transition when user starts playing / watching a Reel (Requirement 1)
  useEffect(() => {
    const handleWindowBlur = () => {
      // When a user clicks or taps inside the cross-origin Instagram embed iframe to play,
      // the browser window loses focus and document.activeElement becomes an IFRAME
      if (document.activeElement?.tagName === 'IFRAME' || isHoveringPlayerRef.current) {
        setIsWatching(true)
      }
    }

    const handleMessage = (event) => {
      // Instagram embed postMessage playback signals
      if (typeof event.origin === 'string' && event.origin.includes('instagram.com')) {
        setIsWatching(true)
      }
    }

    window.addEventListener('blur', handleWindowBlur)
    window.addEventListener('message', handleMessage)
    return () => {
      window.removeEventListener('blur', handleWindowBlur)
      window.removeEventListener('message', handleMessage)
    }
  }, [])

  // Automatic rotation between active reels (stopped while user is watching a reel)
  useEffect(() => {
    if (count <= 1 || isPaused || isWatching) return
    const timer = setInterval(() => {
      handleNext()
    }, 6000)
    return () => clearInterval(timer)
  }, [count, isPaused, isWatching, handleNext])

  // Keyboard navigation: Escape closes, Left/Right rotates
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onContinue?.()
      if (e.key === 'ArrowRight') handleNext()
      if (e.key === 'ArrowLeft') handlePrev()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onContinue, handleNext, handlePrev])

  // Lock body scroll while popup is mounted to prevent double scrollbars
  useEffect(() => {
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = originalOverflow
    }
  }, [])

  // Touch swipe support for mobile
  const handleTouchStart = (e) => {
    setIsPaused(true)
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return
    const diffX = touchStartX.current - e.changedTouches[0].clientX
    if (Math.abs(diffX) > 45) {
      if (diffX > 0) handleNext()
      else handlePrev()
    }
    touchStartX.current = null
    setIsPaused(false)
  }

  if (!sortedReels || count === 0) return null

  const currentReel = sortedReels[currentIndex]
  const prevReel = count > 1 ? sortedReels[(currentIndex - 1 + count) % count] : null
  const nextReel = count > 1 ? sortedReels[(currentIndex + 1) % count] : null
  const canonicalUrl = getCleanReelUrl(currentReel.reelUrl)

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-6 bg-slate-950/75 backdrop-blur-xs select-none overflow-hidden transition-opacity"
      role="dialog"
      aria-modal="true"
      aria-label="Student Success Stories"
      onClick={onContinue}
    >
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] rounded-full bg-[#DF1E26]/12 blur-[120px] pointer-events-none" />

      {/* Main 3-Card Carousel Container (stop propagation so clicking inside doesn't close) */}
      <div
        className="relative flex items-center justify-center w-full max-w-4xl mx-auto my-auto"
        onClick={(e) => e.stopPropagation()}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Left Preview Card (shown on tablet/desktop, matching reference) */}
        {count > 1 && (
          <SidePreviewCard
            reel={prevReel}
            position="left"
            onClick={handlePrev}
          />
        )}

        {/* Center Active Reel Card (Main Focus) */}
        <div
          className="relative w-[280px] xs:w-[300px] sm:w-[320px] shrink-0 rounded-3xl overflow-hidden border border-white/10 bg-slate-900 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)] z-20 transition-all duration-300"
        >
          {/* Close Button (✕) at top-right of the card matching ASCII reference */}
          <button
            type="button"
            onClick={onContinue}
            className="absolute top-3.5 right-3.5 z-30 flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-black/60 hover:bg-black/90 text-white/90 hover:text-white transition cursor-pointer shadow-lg backdrop-blur-sm border border-white/20 active:scale-95"
            aria-label="Close Success Stories popup"
            title="Close (Go to Home)"
          >
            <X size={18} />
          </button>

          {/* Reel Video Area */}
          <div
            className="w-full"
            onPointerEnter={() => {
              isHoveringPlayerRef.current = true
            }}
            onPointerLeave={() => {
              isHoveringPlayerRef.current = false
            }}
            onPointerDownCapture={() => {
              setIsWatching(true)
            }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={currentReel.id || currentIndex}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.28, ease: 'easeInOut' }}
                className="w-full"
              >
                <InstagramReelEmbed
                  reelUrl={currentReel.reelUrl}
                  title={currentReel.title}
                  showViewMore={false}
                  className="!rounded-none !border-0 !shadow-none !bg-transparent"
                />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Card Footer matching reference (Omnichain card footer format) */}
          <div className="w-full bg-[#0b1320] border-t border-white/10 px-4 py-3 flex items-center justify-between gap-2">
            <div className="flex flex-col min-w-0 pr-1">
              <h4
                className="text-xs sm:text-sm font-bold text-white truncate"
                title={currentReel.title || 'Student Success Story'}
              >
              {currentReel.title || 'Student Success Story'}
              </h4>
            </div>

            {/* Circular (+) Action Button matching reference */}
            <a
              href={canonicalUrl || currentReel.reelUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 hover:bg-white/25 text-white transition shadow-sm border border-white/10 cursor-pointer active:scale-95"
              aria-label="Open Reel on Instagram"
              title="Open Reel on Instagram"
            >
              <FaInstagram size={15} />
            </a>
          </div>
        </div>

        {/* Right Preview Card (shown on tablet/desktop, matching reference) */}
        {count > 1 && (
          <SidePreviewCard
            reel={nextReel}
            position="right"
            onClick={handleNext}
          />
        )}

        {/* Left Arrow Button */}
        {count > 1 && (
          <button
            type="button"
            onClick={handlePrev}
            className="absolute -left-3 sm:left-2 md:left-6 z-30 flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-black/60 hover:bg-black/85 text-white backdrop-blur-md shadow-xl transition cursor-pointer border border-white/15"
            aria-label="Previous reel"
          >
            <ChevronLeft size={18} />
          </button>
        )}

        {/* Right Arrow Button */}
        {count > 1 && (
          <button
            type="button"
            onClick={handleNext}
            className="absolute -right-3 sm:right-2 md:right-6 z-30 flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-black/60 hover:bg-black/85 text-white backdrop-blur-md shadow-xl transition cursor-pointer border border-white/15"
            aria-label="Next reel"
          >
            <ChevronRight size={18} />
          </button>
        )}

        {/* Pagination Dots at Bottom */}
        {count > 1 && (
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex items-center justify-center gap-1.5 z-30">
            {sortedReels.map((reel, idx) => (
              <button
                key={reel.id || idx}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                className={`transition-all rounded-full cursor-pointer ${
                  idx === currentIndex
                    ? 'h-2 w-5 bg-gradient-to-r from-[#DF1E26] to-[#CA164B]'
                    : 'h-2 w-2 bg-white/40 hover:bg-white/70'
                }`}
                aria-label={`Go to reel ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
