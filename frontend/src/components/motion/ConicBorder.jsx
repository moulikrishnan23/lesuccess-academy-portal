/**
 * Wraps a surface in a 2px conic-gradient ring that fades in and rotates while
 * the surface is hovered or holds focus.
 *
 * The ring is a masked ::after (motion.css) that inherits the wrapper's
 * border-radius, so give the wrapper the radius the surface already has. The
 * rotation animates the registered @property --ang and is paused until hover,
 * so idle rings cost nothing. `tone="dark"` swaps the light stop to white for
 * surfaces on a navy band.
 *
 * Reduced motion: the ring still appears on hover/focus, but does not spin.
 */
export default function ConicBorder({
  as: Tag = 'div',
  tone = 'light',
  className = '',
  children,
  ...rest
}) {
  return (
    <Tag
      className={`motion-conic${tone === 'dark' ? ' motion-conic--dark' : ''}${className ? ` ${className}` : ''}`}
      {...rest}
    >
      {children}
    </Tag>
  )
}
