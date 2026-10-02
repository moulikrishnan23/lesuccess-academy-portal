import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { Trophy, ArrowRight, Maximize2 } from 'lucide-react'
import { FaInstagram } from 'react-icons/fa6'
import { useAppData } from '../../context/AppDataContext.jsx'
import { getImageUrl } from '../../utils/imageUtils.js'
import Skeleton from '../../components/ui/Skeleton.jsx'
import ErrorState from '../../components/ui/ErrorState.jsx'
import InstagramReelEmbed from '../../components/common/InstagramReelEmbed.jsx'
import ImageLightboxModal from '../../components/common/ImageLightboxModal.jsx'
import InitialReelExperience from '../../components/common/InitialReelExperience.jsx'

export default function SuccessStoriesPage() {
  const { successStories } = useAppData()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const isEntry = searchParams.get('entry') === 'true'
  const [showEntryModal, setShowEntryModal] = useState(isEntry)
  const [lightboxIndex, setLightboxIndex] = useState(null)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  if (successStories.status === 'loading') {
    return (
      <div className="min-h-screen bg-slate-50 pt-24 pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Skeleton className="h-64 w-full rounded-3xl mb-16" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-[300px] w-full rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (successStories.status === 'error') {
    return (
      <div className="min-h-screen bg-slate-50 pt-32 pb-20 flex items-center justify-center">
        <ErrorState
          title="Failed to Load"
          message="We couldn't load the success stories at this time."
          onRetry={successStories.refetch}
        />
      </div>
    )
  }

  const isItemActive = (item) => Boolean(item?.isActive ?? item?.active ?? false)
  const { images = [], reels = [] } = successStories.data
  const activeImages = images.filter(isItemActive).sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
  const activeReels = reels.filter(isItemActive).sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-[#07405C] pt-32 pb-20 lg:pt-40 lg:pb-28">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
          <div className="absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full bg-[#CA164B] opacity-20 blur-[100px]" />
          <div className="absolute -bottom-40 -left-40 h-[600px] w-[600px] rounded-full bg-[#CA164B] opacity-20 blur-[100px]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 mb-6 backdrop-blur-sm border border-white/20">
            <Trophy size={16} className="text-amber-400" />
            <span className="text-sm font-bold uppercase tracking-wider text-white">
              Student Success
            </span>
          </div>
          
          <h1 className="font-display text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl max-w-4xl mx-auto">
            Inspiring Journeys to <span className="text-[#CA164B]">Career Success</span>
          </h1>
          
          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-300">
            Discover the stories of LeSuccess Academy alumni who have transformed their careers, landed their dream jobs, and built remarkable futures.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/"
              onClick={() => {
                try {
                  sessionStorage.setItem('lesuccess_initial_entry_done', 'true')
                } catch {
                  /* ignore storage error */
                }
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#DF1E26] to-[#CA164B] px-8 py-3.5 text-sm sm:text-base font-bold text-white shadow-lg hover:brightness-110 transition active:scale-95 cursor-pointer"
            >
              <span>Explore LeSuccess (Go to Home)</span>
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          {/* Photos Grid */}
          {activeImages.length > 0 && (
            <div className="mb-24">
              <div className="text-center mb-12">
                <h2 className="font-display text-3xl font-bold text-slate-900">Alumni Highlights</h2>
                <p className="mt-3 text-slate-600">Celebrating milestones and achievements (click any photo to view full size)</p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {activeImages.map((image, idx) => (
                  <div
                    key={image.id}
                    onClick={() => setLightboxIndex(idx)}
                    className="group relative overflow-hidden rounded-2xl bg-white shadow-sm transition-all hover:shadow-xl border border-slate-200 cursor-pointer"
                  >
                    <div className="aspect-[4/3] overflow-hidden relative">
                      <img
                        src={getImageUrl(image.imageUrl)}
                        alt={image.caption || 'Success Story'}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center pointer-events-none">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/95 text-slate-800 rounded-full p-2.5 shadow-lg flex items-center gap-1.5 text-xs font-bold">
                          <Maximize2 size={16} />
                          <span>View Full Photo</span>
                        </div>
                      </div>
                    </div>
                    {image.caption && (
                      <div className="p-4 bg-white border-t border-slate-100">
                        <p className="text-slate-800 font-semibold text-sm line-clamp-2">{image.caption}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reels Grid */}
          {activeReels.length > 0 && (
            <div>
              <div className="text-center mb-12">
                <div className="inline-flex items-center justify-center p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mb-4 shadow-lg shadow-pink-500/30">
                  <FaInstagram size={28} className="text-white" />
                </div>
                <h2 className="font-display text-3xl font-bold text-slate-900">Student Reviews</h2>
                <p className="mt-3 text-slate-600">Hear directly from our students on Instagram</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8 justify-items-center items-start">
                {activeReels.map((reel) => (
                  <div
                    key={reel.id}
                    className="w-full max-w-[260px] sm:max-w-[280px] flex justify-center"
                  >
                    <InstagramReelEmbed reelUrl={reel.reelUrl} title={reel.title} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {(activeImages.length === 0 && activeReels.length === 0) && (
            <div className="text-center py-20">
              <Trophy size={64} className="mx-auto text-slate-300 mb-4" />
              <h3 className="text-xl font-bold text-slate-700">More Stories Coming Soon</h3>
              <p className="mt-2 text-slate-500">We are constantly updating new student success stories.</p>
            </div>
          )}
        </div>
      </section>

      {/* Initial Entry Experience if visited with ?entry=true */}
      {showEntryModal && activeReels.length > 0 && (
        <InitialReelExperience
          activeReels={activeReels}
          onContinue={() => {
            setShowEntryModal(false)
            try {
              sessionStorage.setItem('lesuccess_initial_entry_done', 'true')
            } catch {
              /* ignore storage error */
            }
            navigate('/', { replace: true })
          }}
        />
      )}

      {/* Image Lightbox Modal */}
      <ImageLightboxModal
        images={activeImages}
        currentIndex={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onNavigate={setLightboxIndex}
      />
    </div>
  )
}
