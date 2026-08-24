import Button from './Button.jsx'

/**
 * Inline failure state with a retry.
 *
 * Copy rule: say what failed and what to do next, in the interface's voice.
 * No apologies, no "Oops!".
 */
export default function ErrorState({
  title = "This didn't load",
  message = 'Check your connection, then try again.',
  onRetry,
  retryLabel = 'Try again',
  className = '',
}) {
  return (
    <div
      role="alert"
      className={`rounded-card border border-line bg-surface px-6 py-8 text-center ${className}`}
    >
      <p className="font-display text-lg font-semibold text-navy-800">{title}</p>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-ink-soft">
        {message}
      </p>
      {onRetry ? (
        <Button variant="quiet" size="md" className="mt-5" onClick={onRetry}>
          {retryLabel}
        </Button>
      ) : null}
    </div>
  )
}

/**
 * Zero-items state. Separate from ErrorState because nothing has gone wrong —
 * it must not carry role="alert" or a retry.
 */
export function EmptyState({ title, message, className = '' }) {
  return (
    <div
      className={`rounded-card border border-dashed border-line-strong bg-surface/60 px-6 py-10 text-center ${className}`}
    >
      <p className="font-display text-base font-semibold text-navy-800">{title}</p>
      {message ? (
        <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-ink-soft">
          {message}
        </p>
      ) : null}
    </div>
  )
}
