/**
 * Section header.
 *
 * Course_Page.pdf uses a plain navy heading with no eyebrow label, so the
 * course page passes no `eyebrow`. The prop is kept because the home page in
 * homa page.pdf does use small pill labels above its headings — that page can
 * opt in without a second component.
 */
/*
 * `section` reproduces exactly what every existing caller already renders —
 * the course page was validated against a reference at these values, so they
 * are not up for rounding to the nearest scale step. `page` is the new one, for
 * a page's own <h1>.
 */
const TITLE_SIZES = {
  section: 'text-[1.5rem] sm:text-[1.75rem] lg:text-[2rem]',
  page: 'text-3xl sm:text-4xl',
  // Dominant heading for a full-bleed band, where the type carries the section.
  band: 'text-4xl sm:text-5xl',
}

const TITLE_WEIGHTS = { semibold: 'font-semibold', bold: 'font-bold' }

export default function SectionHeading({
  eyebrow,
  title,
  lede,
  id,
  align = 'left',
  tone = 'dark',
  as: Heading = 'h2',
  size = 'section',
  weight = 'semibold',
  className = '',
}) {
  const isCentered = align === 'center'
  // `tone` is about the band behind the heading, not the type colour: 'light'
  // means light text for a dark band. Default keeps every existing caller
  // rendering exactly as before.
  const isOnDark = tone === 'light'

  return (
    <header className={`${isCentered ? 'text-center' : ''} ${className}`}>
      {eyebrow ? (
        <p className="mb-3 inline-block rounded-full bg-brand-soft px-3 py-1 text-[0.6875rem] font-semibold tracking-[0.12em] text-brand uppercase">
          {eyebrow}
        </p>
      ) : null}

      <Heading
        id={id}
        className={`font-display leading-tight ${TITLE_WEIGHTS[weight]} ${
          TITLE_SIZES[size]
        } ${isOnDark ? 'text-white' : 'text-navy-800'}`}
      >
        {title}
      </Heading>

      {lede ? (
        <p
          className={`mt-4 text-[0.9375rem] leading-[1.9] ${
            isOnDark ? 'text-white/80' : 'text-ink-soft'
          } ${isCentered ? 'mx-auto max-w-2xl' : 'max-w-3xl'}`}
        >
          {lede}
        </p>
      ) : null}
    </header>
  )
}
