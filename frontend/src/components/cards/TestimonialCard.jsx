import StarRating from '../ui/StarRating.jsx'
import { QuoteIcon } from '../ui/icons.jsx'

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
    <figure className="flex h-full flex-col rounded-xl border-2 border-brand bg-white p-5">
      <div className="relative grow">
        <QuoteIcon
          size={26}
          className="absolute -top-1 left-0 text-line-strong/70"
        />
        <QuoteIcon
          size={26}
          className="absolute -top-1 right-0 rotate-180 text-line-strong/70"
        />

        <blockquote className="px-7 pt-6 text-center text-[0.8125rem] leading-[1.8] text-ink-soft">
          {quoteText}
        </blockquote>
      </div>

      <figcaption className="mt-5 flex items-center gap-3">
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
            width="44"
            height="44"
            className="h-11 w-11 shrink-0 rounded-full object-cover"
          />
        ) : null}

        <span className="min-w-0">
          <span className="block truncate text-[0.9375rem] font-semibold text-navy-800">
            {studentName}
          </span>
          <StarRating
            value={ratingValue}
            size={13}
            className="mt-0.5"
            label={`${studentName} rated this course ${ratingValue} out of 5`}
          />
        </span>
      </figcaption>
    </figure>
  )
}
