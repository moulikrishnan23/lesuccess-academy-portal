import { X } from 'lucide-react'

/**
 * The round button that opens the chatbot. Always in the bundle, so it is kept
 * tiny; everything else loads on its first click (see ChatWidget).
 *
 * Its position comes from `.chat-launcher` in index.css, placed at the bottom right.
 */
export default function ChatLauncher({ ref, open, hasUnread, onClick }) {
  return (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      aria-label="Open chat with LeBot"
      aria-expanded={open}
      aria-controls={open ? 'ls-chat-window' : undefined}
      title={open ? "Close chat" : "Chat with LeBot"}
      className="chat-launcher z-45 right-4 sm:right-6 lg:right-8 flex h-14 w-14 items-center justify-center rounded-full bg-[#b82523] text-white shadow-[0_4px_20px_rgba(0,0,0,0.45)] border border-white/20 transition-all duration-200 hover:scale-105 hover:border-white/40 active:scale-95 cursor-pointer overflow-hidden p-0"
    >
      {open ? (
        <X size={24} strokeWidth={2.5} aria-hidden="true" className="text-white" />
      ) : (
        <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-[#b82523]">
          <img
            src="/logo/LeSuccess_Logo_Chatbot2.gif"
            alt="Chat with LeBot"
            className="h-full w-full object-cover scale-[0.82] pointer-events-none select-none rounded-full"
          />
        </div>
      )}
      {hasUnread && !open && (
        <span
          data-testid="chat-unread-dot"
          aria-hidden="true"
          className="absolute right-0.5 top-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-gold shadow-sm"
        />
      )}
    </button>
  )
}
