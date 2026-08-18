/**
 * Loading placeholder.
 *
 * The shimmer lives in one place — the `.shimmer` utility in index.css — so
 * there is exactly one shimmer timing on the site. Reduced motion is handled
 * there too, by the global animation-duration override.
 *
 * Skeletons are decorative: they are hidden from assistive tech, and the
 * loading state is announced by the container's aria-busy instead.
 */
export default function Skeleton({ className = '', rounded = 'rounded-md' }) {
  return (
    <span
      aria-hidden="true"
      className={`shimmer block ${rounded} ${className}`}
    />
  )
}

/** A paragraph-shaped stack of lines, with a short last line. */
export function SkeletonText({ lines = 3, className = '' }) {
  return (
    <span aria-hidden="true" className={`block space-y-2.5 ${className}`}>
      {Array.from({ length: lines }, (_, index) => (
        <Skeleton
          key={index}
          className={`h-3.5 ${index === lines - 1 ? 'w-2/3' : 'w-full'}`}
        />
      ))}
    </span>
  )
}
