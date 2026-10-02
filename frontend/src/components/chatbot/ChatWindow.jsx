import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUpRight, RotateCcw, SendHorizontal, X } from 'lucide-react'
import { DURATION, EASE_OUT } from '../../animations/variants.js'
import useChat, { MAX_MESSAGE_LENGTH } from '../../hooks/useChat.js'
import useReducedMotion from '../../hooks/useReducedMotion.js'
import MarkdownMessage from './MarkdownMessage.jsx'

const GREETING = 'Hi! I can help you with our courses, services and upcoming webinars.'

/** Sent as-is when tapped. Deliberately no fee question: fees come from the team. */
const QUICK_REPLIES = [
  'What courses do you offer?',
  'Any upcoming webinars?',
  'How long is the Python Full Stack course?',
  'How can I contact you?',
]

const COUNTER_THRESHOLD = 400
const SOURCE_LABELS = {
  COURSE: 'View course',
  COURSE_MODULE: 'View course',
  SERVICE: 'View service',
  PROCESS_STEP: 'View services',
}

/** Below Tailwind's `sm`: the window becomes a full-screen sheet. */
const MOBILE_QUERY = '(max-width: 639.98px)'

function subscribeMobile(onChange) {
  const mql = window.matchMedia(MOBILE_QUERY)
  mql.addEventListener('change', onChange)
  return () => mql.removeEventListener('change', onChange)
}

function useIsMobileSheet() {
  return useSyncExternalStore(
    subscribeMobile,
    () => window.matchMedia(MOBILE_QUERY).matches,
    () => false,
  )
}

/**
 * Sources the model returned become links only when they are internal routes:
 * a path that starts with exactly one "/". "//host" (protocol-relative),
 * "/\host", "https:" and "javascript:" are all dropped. De-duplicated by URL.
 */
function safeSources(sources) {
  if (!Array.isArray(sources)) return []
  const seen = new Set()
  const result = []
  for (const source of sources) {
    const url = source?.sourceUrl
    if (typeof url !== 'string' || !url.startsWith('/') || url.startsWith('//') || url.startsWith('/\\')) continue
    if (seen.has(url)) continue
    seen.add(url)
    result.push({ url, label: SOURCE_LABELS[source?.type] ?? 'Learn more' })
  }
  return result
}

/**
 * The chatbot conversation window. Lazy-loaded by ChatWidget and kept mounted
 * after the first open, so the conversation and any in-flight reply survive
 * closing it; only the panel itself mounts and unmounts.
 *
 * Bot text is rendered via MarkdownMessage — a lightweight markdown-to-HTML
 * converter sanitised with DOMPurify and a strict tag allowlist.
 */
export default function ChatWindow({ open, onClose, onDisabled, onUnreadReply, onOpenEnquiry }) {
  const { messages, status, send, reset } = useChat()
  const isMobileSheet = useIsMobileSheet()
  const reducedMotion = useReducedMotion()

  const [draft, setDraft] = useState('')
  const inputRef = useRef(null)
  const listRef = useRef(null)
  const isSending = status === 'sending'

  // ── Server says the chatbot is off: hand control back to the widget ──────
  useEffect(() => {
    if (status === 'disabled') onDisabled()
  }, [status, onDisabled])

  // ── Unread dot: a bot reply that lands while the window is closed ────────
  const lastMessage = messages[messages.length - 1]
  const lastSeenIdRef = useRef(lastMessage?.id)
  useEffect(() => {
    if (!lastMessage || lastMessage.id === lastSeenIdRef.current) return
    lastSeenIdRef.current = lastMessage.id
    if (!open && lastMessage.role === 'bot') onUnreadReply()
  }, [lastMessage, open, onUnreadReply])

  // ── Focus the input on open ──────────────────────────────────────────────
  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  // ── Body scroll lock, full-screen mobile sheet only ──────────────────────
  useEffect(() => {
    if (!open || !isMobileSheet) return undefined
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [open, isMobileSheet])

  // ── Keep the newest message in view ──────────────────────────────────────
  useLayoutEffect(() => {
    const list = listRef.current
    if (list) list.scrollTop = list.scrollHeight
  }, [messages, isSending, open])

  // ── Auto-grow the textarea up to four lines (max-height in its class) ────
  useLayoutEffect(() => {
    const input = inputRef.current
    if (!input) return
    input.style.height = 'auto'
    input.style.height = `${input.scrollHeight}px`
  }, [draft, open])

  const submit = useCallback(async (text) => {
    if (isSending) return
    const message = text.trim()
    if (!message || message.length > MAX_MESSAGE_LENGTH) return
    setDraft('')
    await send(message)
  }, [isSending, send])

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault()
      submit(draft)
    }
  }

  const handleDialogKeyDown = (event) => {
    if (event.key === 'Escape') {
      event.stopPropagation()
      onClose()
    }
  }

  const handleNewChat = () => {
    reset()
    setDraft('')
    inputRef.current?.focus()
  }

  // On the full-screen sheet a followed link would stay hidden under the
  // window, so close it; on desktop the page changes beside the panel.
  const handleSourceClick = () => {
    if (isMobileSheet) onClose({ returnFocus: false })
  }

  const transition = reducedMotion ? { duration: 0 } : { duration: DURATION.interaction, ease: EASE_OUT }
  const hiddenState = reducedMotion ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 16, scale: 0.98 }

  return (
    <AnimatePresence>
      {open && (
        <motion.section
          key="chat-window"
          id="ls-chat-window"
          role="dialog"
          aria-modal={isMobileSheet ? 'true' : 'false'}
          aria-labelledby="ls-chat-title"
          onKeyDown={handleDialogKeyDown}
          initial={hiddenState}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={hiddenState}
          transition={transition}
          style={{ transformOrigin: 'bottom right' }}
          className="chat-window z-50 flex flex-col overflow-hidden bg-surface font-sans text-ink sm:right-6 sm:border sm:border-line sm:shadow-card lg:right-8"
        >
          <header className="flex items-center gap-3 bg-navy-800 px-4 py-3 text-white">
            <div className="min-w-0 flex-1">
              <h2 id="ls-chat-title" className="truncate text-base font-bold leading-tight text-white">
                LeSuccess Assistant
              </h2>
              <p className="text-xs text-white/75">Usually replies instantly</p>
            </div>
            <button
              type="button"
              onClick={handleNewChat}
              disabled={isSending}
              aria-label="Start a new chat"
              title="New chat"
              className="flex h-9 w-9 items-center justify-center rounded-full text-white/90 transition-colors hover:bg-white/10 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
            >
              <RotateCcw size={18} aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => onClose()}
              aria-label="Close chat"
              title="Close"
              className="flex h-9 w-9 items-center justify-center rounded-full text-white/90 transition-colors hover:bg-white/10 cursor-pointer"
            >
              <X size={20} aria-hidden="true" />
            </button>
          </header>

          <div
            ref={listRef}
            role="log"
            aria-live="polite"
            aria-label="Conversation"
            data-testid="chat-messages"
            className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto bg-section px-4 py-4"
          >
            {messages.length === 0 ? (
              <EmptyState disabled={isSending} onPick={submit} />
            ) : (
              messages.map((message) => (
                <MessageBubble key={message.id} message={message} onSourceClick={handleSourceClick} />
              ))
            )}
            {isSending && <TypingIndicator />}
          </div>

          <form
            className="border-t border-line bg-surface px-3 pt-3"
            onSubmit={(event) => {
              event.preventDefault()
              submit(draft)
            }}
          >
            <div className="flex items-end gap-2">
              <label htmlFor="ls-chat-input" className="sr-only">
                Type your message
              </label>
              <textarea
                id="ls-chat-input"
                ref={inputRef}
                rows={1}
                value={draft}
                maxLength={MAX_MESSAGE_LENGTH}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your question…"
                className="max-h-[7.5rem] min-h-11 flex-1 resize-none overflow-y-auto rounded-card border border-line-strong bg-surface px-3 py-2.5 text-sm leading-6 text-ink placeholder:text-ink-muted focus:border-navy-800"
              />
              <button
                type="submit"
                disabled={!draft.trim() || isSending}
                aria-label="Send message"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-card bg-brand-gradient text-white shadow-[0_4px_16px_rgba(244,66,70,0.35)] transition-opacity disabled:opacity-40 disabled:shadow-none cursor-pointer disabled:cursor-not-allowed"
              >
                <SendHorizontal size={18} aria-hidden="true" />
              </button>
            </div>
            <div className="flex min-h-5 items-center justify-end pt-1">
              {draft.length > COUNTER_THRESHOLD && (
                <span
                  data-testid="chat-char-counter"
                  className={`text-xs ${draft.length >= MAX_MESSAGE_LENGTH ? 'text-danger' : 'text-ink-muted'}`}
                >
                  {draft.length}/{MAX_MESSAGE_LENGTH}
                </span>
              )}
            </div>
            <p className="pb-3 text-[0.6875rem] leading-snug text-ink-soft">
              AI assistant — answers may be inaccurate. Please confirm fees and dates with our team.{' '}
              {onOpenEnquiry ? (
                <button
                  type="button"
                  onClick={onOpenEnquiry}
                  className="font-semibold text-brand underline underline-offset-2 cursor-pointer"
                >
                  Talk to our team
                </button>
              ) : (
                <Link to="/contact" className="font-semibold text-brand underline underline-offset-2">
                  Talk to our team
                </Link>
              )}
            </p>
          </form>
        </motion.section>
      )}
    </AnimatePresence>
  )
}

function EmptyState({ disabled, onPick }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="max-w-[85%] self-start rounded-card border border-line bg-surface px-3.5 py-2.5 text-sm leading-relaxed text-ink">
        {GREETING}
      </div>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Suggested questions">
        {QUICK_REPLIES.map((question) => (
          <button
            key={question}
            type="button"
            disabled={disabled}
            onClick={() => onPick(question)}
            className="rounded-full border border-navy-800/25 bg-surface px-3 py-1.5 text-left text-xs font-semibold text-navy-800 transition-colors hover:border-brand hover:text-brand disabled:opacity-50 cursor-pointer"
          >
            {question}
          </button>
        ))}
      </div>
    </div>
  )
}

function MessageBubble({ message, onSourceClick }) {
  const isUser = message.role === 'user'
  const sources = useMemo(() => (isUser ? [] : safeSources(message.sources)), [isUser, message.sources])

  if (isUser) {
    return (
      <div
        data-role="user"
        className="max-w-[85%] self-end whitespace-pre-wrap break-words rounded-card bg-brand-gradient px-3.5 py-2.5 text-sm leading-relaxed text-white"
      >
        {message.text}
      </div>
    )
  }

  return (
    <div data-role="bot" className="flex max-w-[85%] flex-col gap-1.5 self-start">
      <div
        className={`break-words rounded-card border px-3.5 py-2.5 text-sm leading-relaxed text-ink ${
          message.error ? 'border-danger/30 bg-danger-soft' : 'border-line bg-surface'
        }`}
      >
        <MarkdownMessage text={message.text} className="chat-md" />
        {message.error === 'unavailable' && (
          <>
            {' '}
            <Link to="/contact" className="font-semibold text-brand underline underline-offset-2">
              Contact us
            </Link>
          </>
        )}
      </div>
      {sources.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {sources.map((source) => (
            <Link
              key={source.url}
              to={source.url}
              onClick={onSourceClick}
              className="inline-flex items-center gap-1 rounded-full border border-line bg-surface px-2.5 py-1 text-[0.6875rem] font-semibold text-navy-800 transition-colors hover:border-brand hover:text-brand"
            >
              {source.label}
              <ArrowUpRight size={12} aria-hidden="true" />
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

function TypingIndicator() {
  return (
    <div
      data-testid="chat-typing"
      className="flex items-center gap-1 self-start rounded-card border border-line bg-surface px-3.5 py-3"
    >
      <span className="sr-only">The assistant is typing</span>
      {[0, 150, 300].map((delayMs) => (
        <span
          key={delayMs}
          aria-hidden="true"
          className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink-muted"
          style={{ animationDelay: `${delayMs}ms` }}
        />
      ))}
    </div>
  )
}
