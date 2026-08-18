/**
 * Section header.
 *
 * Course_Page.pdf uses a plain navy heading with no eyebrow label, so the
 * course page passes no `eyebrow`. The prop is kept because the home page in
 * homa page.pdf does use small pill labels above its headings — that page can
 * opt in without a second component.
 */
export default function SectionHeading({
  eyebrow,
  title,
  lede,
  id,
  align = 'left',
  className = '',
}) {
  const isCentered = align === 'center'

  return (
    <header className={`${isCentered ? 'text-center' : ''} ${className}`}>
      {eyebrow ? (
        <p className="mb-3 inline-block rounded-full bg-brand-soft px-3 py-1 text-[0.6875rem] font-semibold tracking-[0.12em] text-brand uppercase">
          {eyebrow}
        </p>
      ) : null}

      <h2
        id={id}
        className="font-display text-[1.5rem] leading-tight font-semibold text-navy-800 sm:text-[1.75rem] lg:text-[2rem]"
      >
        {title}
      </h2>

      {lede ? (
        <p
          className={`mt-4 text-[0.9375rem] leading-[1.9] text-ink-soft ${
            isCentered ? 'mx-auto max-w-2xl' : 'max-w-3xl'
          }`}
        >
          {lede}
        </p>
      ) : null}
    </header>
  )
}
