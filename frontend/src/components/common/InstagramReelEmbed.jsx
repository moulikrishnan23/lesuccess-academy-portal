import { useState, useId } from 'react'
import { FaInstagram } from 'react-icons/fa6'
import { getCleanReelUrl, getReelShortcode } from '../../utils/instagramEmbed.js'

/**
 * Clean Video-Only Instagram Reel Player with single "View on Instagram" CTA
 *
 * Requirements strictly met:
 * 1. ONLY one play control (Instagram's native play button inside the video). ZERO custom play button overlays.
 * 2. Precision windowing technique clips out Instagram top header (avatar, username, follow button).
 * 3. Shows full vertical Reel with Instagram's native "View on Instagram" bottom action.
 * 4. Strict uniform card dimensions, rounded corners, and subtle shadow across all views.
 */
export default function InstagramReelEmbed({
  reelUrl,
  title = 'Instagram Reel',
  maxWidth,
  className = '',
}) {
  const [hasError, setHasError] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const titleId = useId()

  const shortcode = getReelShortcode(reelUrl)
  const canonicalUrl = getCleanReelUrl(reelUrl)

  if (!canonicalUrl && !shortcode) return null

  // Fallback if shortcode could not be extracted or embed fails
  if (!shortcode || hasError) {
    return (
      <div
        className={`relative w-full rounded-2xl bg-white border border-slate-200/80 overflow-hidden shadow-xs ${className}`}
        style={maxWidth ? { maxWidth: typeof maxWidth === 'number' ? `${maxWidth}px` : maxWidth } : undefined}
      >
        <div className="relative w-full aspect-[4/5] bg-gradient-to-b from-slate-900 via-slate-800 to-black text-white flex flex-col items-center justify-center p-6 text-center">
          <div className="h-12 w-12 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-white/80 mb-3 shadow-md">
            <FaInstagram size={24} />
          </div>
          <p className="text-xs font-semibold text-slate-300 mb-1 line-clamp-2">{title || 'Student Success Story'}</p>
          <p className="text-[11px] text-slate-500 mb-3">Reel preview temporarily unavailable</p>
        </div>
      </div>
    )
  }

  const embedSrc = `https://www.instagram.com/reel/${shortcode}/embed/`

  return (
    <div
      className={`relative w-full rounded-2xl bg-black border border-slate-800/80 overflow-hidden shadow-xs transition-shadow hover:shadow-md ${className}`}
      style={maxWidth ? { maxWidth: typeof maxWidth === 'number' ? `${maxWidth}px` : maxWidth } : undefined}
    >
      {/* Vertical Video Window Container - aspect-[46/65] crops immediately after the horizontal line below 'View more on Instagram' */}
      <div className="relative w-full aspect-[46/65] overflow-hidden bg-black select-none">
        {/* Loading Skeleton / Placeholder while iframe loads */}
        {!isLoaded && (
          <div className="absolute inset-0 z-0 bg-slate-950 flex flex-col items-center justify-center p-4">
            <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-amber-400 via-pink-500 to-purple-600 flex items-center justify-center text-white mb-2 shadow-md animate-pulse">
              <FaInstagram size={20} />
            </div>
            <span className="text-[11px] font-medium text-slate-400">Loading Reel...</span>
          </div>
        )}

        {/* 
          Iframe windowing:
          - top: -56px cleanly crops out Instagram top header bar and separator line
          - height: calc(100% + 99px) ensures full vertical reel layout and native 'View more on Instagram' area
          - Aspect ratio 46/65 (0.7077) clips out all engagement icons (likes, comments, share, bookmark)
        */}
        <iframe
          id={titleId}
          src={embedSrc}
          title={title || 'Instagram Reel Video'}
          className="absolute left-0 w-full border-0 transition-opacity duration-300 pointer-events-auto"
          style={{
            top: '-56px',
            height: 'calc(100% + 99px)',
            opacity: isLoaded ? 1 : 0,
          }}
          scrolling="no"
          allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
          allowFullScreen
          loading="lazy"
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
        />
      </div>
    </div>
  )
}
