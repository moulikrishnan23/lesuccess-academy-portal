import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Sparkles } from 'lucide-react'
import useReducedMotion from '../../hooks/useReducedMotion.js'

const MESSAGE_TEXT = "Hey there! Got a question? LeBot’s here to help."
const TYPE_SPEED_MS = 36
const AUTO_DISMISS_DELAY_MS = 8000

export default function LeBotWelcomeBubble({ isOpen, onOpenChat }) {
  const reducedMotion = useReducedMotion()
  const [displayedText, setDisplayedText] = useState(reducedMotion ? MESSAGE_TEXT : '')
  const [isTyping, setIsTyping] = useState(!reducedMotion)
  const [dismissed, setDismissed] = useState(false)
  const [sessionSeen, setSessionSeen] = useState(() => {
    try {
      return sessionStorage.getItem('lebot_welcome_dismissed') === 'true'
    } catch {
      return false
    }
  })

  const dismissTimerRef = useRef(null)

  // Character-by-character typewriter animation
  useEffect(() => {
    if (sessionSeen || dismissed || isOpen) return

    if (reducedMotion) {
      setDisplayedText(MESSAGE_TEXT)
      setIsTyping(false)
      dismissTimerRef.current = setTimeout(() => {
        setDismissed(true)
      }, AUTO_DISMISS_DELAY_MS)
      return () => {
        if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current)
      }
    }

    let currentIndex = 0
    setDisplayedText('')
    setIsTyping(true)

    const intervalId = setInterval(() => {
      currentIndex += 1
      if (currentIndex <= MESSAGE_TEXT.length) {
        setDisplayedText(MESSAGE_TEXT.slice(0, currentIndex))
      } else {
        clearInterval(intervalId)
        setIsTyping(false)
        // Keep visible for auto-dismiss delay, then fade out
        dismissTimerRef.current = setTimeout(() => {
          setDismissed(true)
        }, AUTO_DISMISS_DELAY_MS)
      }
    }, TYPE_SPEED_MS)

    return () => {
      clearInterval(intervalId)
      if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current)
    }
  }, [reducedMotion, sessionSeen, dismissed, isOpen])

  const handleDismiss = (e) => {
    e.stopPropagation()
    setDismissed(true)
    try {
      sessionStorage.setItem('lebot_welcome_dismissed', 'true')
    } catch {
      // Ignore storage errors
    }
  }

  const handleBubbleClick = () => {
    if (onOpenChat) {
      onOpenChat()
    }
  }

  // Hide if chat is open, user dismissed, or already session seen
  const shouldShow = !isOpen && !dismissed && !sessionSeen

  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, x: 12 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          exit={{ opacity: 0, scale: 0.92, x: 10, transition: { duration: 0.2 } }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          onClick={handleBubbleClick}
          role="status"
          aria-live="polite"
          title="Click to chat with LeBot"
          className="fixed z-45 flex items-center gap-2.5 rounded-2xl bg-white/95 px-3.5 py-2.5 text-xs text-slate-800 shadow-[0_6px_24px_rgba(0,0,0,0.14)] border border-slate-200/90 backdrop-blur-md cursor-pointer hover:border-[#DF1E26]/40 transition-colors duration-150 select-none max-w-[calc(100vw-5.75rem)] sm:max-w-xs"
          style={{
            bottom: 'calc(var(--chat-launcher-bottom, 2rem) + 0.35rem)',
            right: 'calc(var(--chat-launcher-size, 3.5rem) + 1.5rem)',
          }}
        >
          {/* Subtle Speech Bubble Pointer Tail (points right toward launcher) */}
          <span
            aria-hidden="true"
            className="absolute -right-1.5 top-1/2 -translate-y-1/2 h-3 w-3 rotate-45 bg-white border-t border-r border-slate-200/90 pointer-events-none"
          />

          {/* Bot Icon with brand indicator */}
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#07405C] to-[#024D72] text-amber-300 shadow-2xs">
            <Sparkles size={14} className="animate-pulse" />
          </div>

          {/* Typed Text Body */}
          <div className="min-w-0 flex-1 leading-snug">
            <p className="font-medium text-slate-700">
              {displayedText}
              {isTyping && (
                <span
                  aria-hidden="true"
                  className="inline-block h-3.5 w-[2px] ml-0.5 bg-[#DF1E26] animate-pulse align-middle"
                />
              )}
            </p>
          </div>

          {/* Compact Dismiss Button */}
          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Dismiss welcome message"
            className="ml-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <X size={12} strokeWidth={2.5} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
