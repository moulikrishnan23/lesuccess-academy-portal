import { MessageCircle, X } from 'lucide-react'

/**
 * The round button that opens the chatbot. Always in the bundle, so it is kept
 * tiny; everything else loads on its first click (see ChatWidget).
 *
 * Its position comes from `.chat-launcher` in index.css, which stacks it above
 * BackToTop and the mobile bottom bars.
 */
export default function ChatLauncher({ ref, open, hasUnread, onClick }) {
  return (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      aria-label="Open chat with LeSuccess assistant"
      aria-expanded={open}
      aria-controls={open ? 'ls-chat-window' : undefined}
      className="chat-launcher z-45 right-4 sm:right-6 lg:right-8 flex h-12 w-12 items-center justify-center rounded-full bg-brand-gradient text-white shadow-[0_4px_16px_rgba(244,66,70,0.35)] transition-transform duration-200 hover:scale-105 active:scale-95 cursor-pointer"
    >
      {open ? (
        <X size={22} strokeWidth={2.5} aria-hidden="true" />
      ) : (
        <MessageCircle size={22} strokeWidth={2.25} aria-hidden="true" />
      )}
      {hasUnread && !open && (
        <span
          data-testid="chat-unread-dot"
          aria-hidden="true"
          className="absolute -right-0.5 -top-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-gold"
        />
      )}
    </button>
  )
}
