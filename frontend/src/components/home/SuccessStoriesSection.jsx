import { useState } from 'react'
import { Trophy, ChevronRight, Maximize2 } from 'lucide-react'
import { FaInstagram } from 'react-icons/fa6'
import { Link } from 'react-router-dom'
import { useAppData } from '../../context/AppDataContext.jsx'
import { getImageUrl } from '../../utils/imageUtils.js'
import InstagramReelEmbed from '../common/InstagramReelEmbed.jsx'
import ImageLightboxModal from '../common/ImageLightboxModal.jsx'

// --- Keyframe styles for marquee ---
const marqueeStyles = `
  @keyframes marquee {
    from { transform: translateX(0); }
    to { transform: translateX(-50%); }
  }
  .animate-marquee {
    animation-name: marquee;
    animation-duration: 35s;
    animation-timing-function: linear;
    animation-iteration-count: infinite;
  }
  @media (prefers-reduced-motion: reduce) {
    .animate-marquee {
      animation: none;
    }
  }
`

const StoryImageCard = ({ image, onClick }) => (
  <div
    onClick={onClick}
    className="inline-flex h-[220px] w-[300px] mx-3 shrink-0 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs hover:shadow-md transition-all duration-300 relative group cursor-pointer"
  >
    <img
      src={getImageUrl(image.imageUrl)}
      alt={image.caption || 'Success story'}
      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
      loading="lazy"
    />
    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors flex items-center justify-center pointer-events-none">
      <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/95 text-slate-800 rounded-full p-2.5 shadow-lg flex items-center gap-1 text-xs font-bold">
        <Maximize2 size={16} />
        <span>View</span>
      </div>
    </div>
    {image.caption && (
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/85 to-transparent p-4 pt-8">
        <p className="text-white text-sm font-semibold line-clamp-2">{image.caption}</p>
      </div>
    )}
  </div>
)

const ReelEmbedCard = ({ reel }) => (
  <div className="w-[240px] xs:w-[260px] sm:w-[280px] shrink-0">
    <InstagramReelEmbed reelUrl={reel.reelUrl} title={reel.title} />
  </div>
)

export default function SuccessStoriesSection() {
  const { successStories } = useAppData()
  const [lightboxIndex, setLightboxIndex] = useState(null)
  
  if (successStories.status === 'loading' || successStories.status === 'empty' || successStories.status === 'error') {
    return null
  }

  const { images = [], reels = [] } = successStories.data
  
  // Filter active only
  const isItemActive = (item) => Boolean(item?.isActive ?? item?.active ?? false)
  const activeImages = images.filter(isItemActive).sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
  const activeReels = reels.filter(isItemActive).sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))

  if (activeImages.length === 0 && activeReels.length === 0) return null

  // Duplicate items for seamless marquee if there are few
  const getMarqueeItems = (items) => {
    if (items.length === 0) return []
    if (items.length < 6) {
      return [...items, ...items, ...items, ...items]
    }
    return [...items, ...items]
  }

  const marqueeImages = getMarqueeItems(activeImages)

  return (
    <section className="relative overflow-hidden bg-slate-50 py-20 lg:py-24">
      <style>{marqueeStyles}</style>

      {/* Background decorations */}
      <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#07405C]/5 blur-3xl w-[600px] h-[600px] mix-blend-multiply pointer-events-none" />
      <div className="absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2 rounded-full bg-[#CA164B]/5 blur-3xl w-[600px] h-[600px] mix-blend-multiply pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 mb-4 border border-amber-200">
            <Trophy size={14} className="text-amber-500" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700">
              Success Stories
            </span>
          </div>
          <h2 className="font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Our Students' <span className="text-[#DF1E26]">Success Stories</span>
          </h2>
          <p className="mt-4 text-base text-slate-600">
            See what our alumni have achieved after completing their training at LeSuccess Academy.
          </p>
        </div>

        <div className="flex flex-col gap-10">
          {/* Row 1: Images Marquee Row */}
          {activeImages.length > 0 && (
            <div className="group relative w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)] py-4">
              <div className="flex w-max animate-marquee group-hover:[animation-play-state:paused]">
                {marqueeImages.map((image, idx) => {
                  const originalIndex = activeImages.findIndex((img) => img.id === image.id)
                  return (
                    <StoryImageCard
                      key={`${image.id}-${idx}`}
                      image={image}
                      onClick={() => setLightboxIndex(originalIndex >= 0 ? originalIndex : 0)}
                    />
                  )
                })}
              </div>
            </div>
          )}

          {/* Row 2: Actual Instagram Reels Row */}
          {activeReels.length > 0 && (
            <div className="mt-4">
              <div className="flex items-center gap-2 mb-6 ml-2">
                <FaInstagram size={22} className="text-pink-600" />
                <h3 className="font-display text-xl font-bold text-slate-900">Student Reviews & Reels</h3>
              </div>
              <div className="flex gap-4 sm:gap-6 overflow-x-auto pb-6 px-1 snap-x hide-scrollbar items-stretch">
                {activeReels.map((reel) => (
                  <div key={reel.id} className="snap-start flex justify-center shrink-0">
                    <ReelEmbedCard reel={reel} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-12 flex justify-center">
          <Link
            to="/success-stories"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-white border border-slate-200/90 px-7 py-3 text-sm font-bold text-slate-700 hover:bg-[#07405C] hover:text-white hover:border-[#07405C] shadow-xs hover:shadow-md transition-all duration-200 active:scale-95"
          >
            <span>View All Success Stories</span>
            <ChevronRight size={16} />
          </Link>
        </div>
      </div>

      {/* Image Lightbox Modal */}
      <ImageLightboxModal
        images={activeImages}
        currentIndex={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onNavigate={setLightboxIndex}
      />

      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  )
}
