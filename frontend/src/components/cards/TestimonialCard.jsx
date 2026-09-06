import StarRating from '../ui/StarRating.jsx'
import { SlashQuoteIcon } from '../ui/icons.jsx'

/**
 * One student review, matching the card in Course_Page.pdf / homa page.pdf:
 * paired quote glyphs, the quote itself centred, then the student's photo,
 * name and rating along the bottom. The red border is the site's card
 * treatment for this carousel, not an active-slide indicator.
 *
 * Presentational — it never fetches and never filters.
 */
export default function TestimonialCard({ testimonial }) {
  const { studentName, photoUrl, ratingValue, quoteText } = testimonial

  return (
    <figure className="flex h-full flex-col rounded-[20px] border-[3px] border-brand bg-white p-6 shadow-[0_6px_20px_rgba(11,42,69,0.07)]">
      {/*
        Opening mark sits top-left, closing mark bottom-right — the quote reads
        as enclosed by them. The blockquote keeps horizontal padding so the
        text never runs underneath either glyph.
      */}
      <div className="relative grow">
        <SlashQuoteIcon
          size={32}
          className="absolute -top-1 left-0 text-line-strong/60"
        />

        <blockquote className="px-9 pt-7 text-center text-[0.9375rem] leading-[1.85] text-ink-soft">
          {quoteText}
        </blockquote>

        <SlashQuoteIcon
          size={32}
          className="absolute bottom-0 right-0 rotate-180 text-line-strong/60"
        />
      </div>

      <figcaption className="mt-6 flex items-center gap-4">
        {/*
          photoUrl comes from the API. When a record genuinely has no photo the
          <img> is skipped rather than substituting initials, so the row keeps
          the reference layout instead of inventing a different avatar style.
        */}
        {photoUrl ? (
          <img
            src={photoUrl}
            alt={`${studentName}, course graduate`}
            loading="lazy"
            width="60"
            height="60"
            className="h-15 w-15 shrink-0 rounded-xl object-cover"
          />
        ) : null}

        <span className="min-w-0">
          <span className="block truncate text-[1.25rem] font-bold text-ink">
            {studentName}
          </span>
          <StarRating
            value={ratingValue}
            size={20}
            className="mt-1"
            fillClassName="text-[#FFC400]"
            label={`${studentName} rated this course ${ratingValue} out of 5`}
          />
        </span>
      </figcaption>
    </figure>
  )
}
