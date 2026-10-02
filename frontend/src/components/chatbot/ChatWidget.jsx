import { lazy, Suspense, useCallback, useRef, useState } from 'react'
import ChatLauncher from './ChatLauncher.jsx'

/*
 * Loaded on the first launcher click, never before. ChatWindow pulls in useChat,
 * the API service and the whole conversation UI, so a visitor who never opens
 * the chat downloads only the launcher above.
 */
const ChatWindow = lazy(() => import('./ChatWindow.jsx'))

/** Build-time flag. Off by default: the widget renders nothing and makes no requests. */
const CHATBOT_ENABLED = import.meta.env.VITE_CHATBOT_ENABLED === 'true'

/**
 * The public site's chatbot: a launcher plus a lazily loaded window.
 *
 * Mounted once in AppContent for public routes only (never /admin, /trainer or
 * /login). Hides itself for the rest of the visit once the server reports the
 * chatbot disabled (404).
 *
 * @param {Object}   props
 * @param {Function} [props.onOpenEnquiry] Opens the global Course Enquiry modal.
 */
export default function ChatWidget({ onOpenEnquiry }) {
  if (!CHATBOT_ENABLED) return null
  return <ChatWidgetInner onOpenEnquiry={onOpenEnquiry} />
}

function ChatWidgetInner({ onOpenEnquiry }) {
  const [isOpen, setIsOpen] = useState(false)
  // Stays true after the first open, so the conversation (and any reply still
  // in flight) survives closing the window.
  const [hasLoaded, setHasLoaded] = useState(false)
  const [isDisabled, setIsDisabled] = useState(false)
  const [hasUnread, setHasUnread] = useState(false)
  const launcherRef = useRef(null)

  const toggle = useCallback(() => {
    setHasLoaded(true)
    setHasUnread(false)
    setIsOpen((open) => !open)
  }, [])

  const close = useCallback(({ returnFocus = true } = {}) => {
    setIsOpen(false)
    if (returnFocus) launcherRef.current?.focus()
  }, [])

  const handleDisabled = useCallback(() => {
    setIsOpen(false)
    setIsDisabled(true)
  }, [])

  const handleUnreadReply = useCallback(() => setHasUnread(true), [])

  if (isDisabled) return null

  return (
    <div className="chat-anchor contents">
      <ChatLauncher ref={launcherRef} open={isOpen} hasUnread={hasUnread} onClick={toggle} />
      {hasLoaded && (
        <Suspense fallback={null}>
          <ChatWindow
            open={isOpen}
            onClose={close}
            onDisabled={handleDisabled}
            onUnreadReply={handleUnreadReply}
            onOpenEnquiry={onOpenEnquiry}
          />
        </Suspense>
      )}
    </div>
  )
}
