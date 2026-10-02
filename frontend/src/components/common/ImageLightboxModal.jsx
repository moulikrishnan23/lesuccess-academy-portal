import { useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import { getImageUrl } from '../../utils/imageUtils.js'

export default function ImageLightboxModal({
  images = [],
  currentIndex = null,
  onClose,
  onNavigate,
}) {
  const isOpen = currentIndex !== null && currentIndex >= 0 && currentIndex < images.length
  const currentImage = isOpen ? images[currentIndex] : null

  const handleNext = useCallback(
    (e) => {
      e?.stopPropagation()
      if (images.length <= 1) return
      const nextIdx = (currentIndex + 1) % images.length
      onNavigate?.(nextIdx)
    },
    [currentIndex, images.length, onNavigate]
  )

  const handlePrev = useCallback(
    (e) => {
      e?.stopPropagation()
      if (images.length <= 1) return
      const prevIdx = (currentIndex - 1 + images.length) % images.length
      onNavigate?.(prevIdx)
    },
    [currentIndex, images.length, onNavigate]
  )

  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.()
      if (e.key === 'ArrowRight') handleNext()
      if (e.key === 'ArrowLeft') handlePrev()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose, handleNext, handlePrev])

  return (
    <AnimatePresence>
      {isOpen && currentImage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          className="fixed inset-0 z-[120] flex items-center justify-center bg-black/90 p-3 sm:p-6 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          aria-label="Image preview"
        >
          {/* Top Controls: Counter & Close */}
          <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between text-white pointer-events-none">
            <span className="text-xs sm:text-sm font-semibold tracking-wider bg-black/50 px-3 py-1.5 rounded-full border border-white/10 pointer-events-auto">
              {currentIndex + 1} / {images.length}
            </span>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onClose?.()
              }}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 hover:bg-white/30 text-white transition cursor-pointer pointer-events-auto shadow-lg focus:outline-none"
              aria-label="Close preview"
            >
              <X size={22} />
            </button>
          </div>

          {/* Previous Button */}
          {images.length > 1 && (
            <button
              type="button"
              onClick={handlePrev}
              className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-white/15 hover:bg-white/30 text-white transition cursor-pointer shadow-lg focus:outline-none"
              aria-label="Previous image"
            >
              <ChevronLeft size={26} />
            </button>
          )}

          {/* Next Button */}
          {images.length > 1 && (
            <button
              type="button"
              onClick={handleNext}
              className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-white/15 hover:bg-white/30 text-white transition cursor-pointer shadow-lg focus:outline-none"
              aria-label="Next image"
            >
              <ChevronRight size={26} />
            </button>
          )}

          {/* Full Image Container */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            className="relative flex flex-col items-center justify-center max-h-[88vh] max-w-[92vw] sm:max-w-4xl"
          >
            <img
              src={getImageUrl(currentImage.imageUrl)}
              alt={currentImage.caption || 'Success story'}
              className="max-h-[80vh] w-auto max-w-full object-contain rounded-xl shadow-2xl"
            />
            {currentImage.caption && (
              <div className="mt-3 max-w-xl text-center">
                <p className="text-sm sm:text-base font-semibold text-white/90 bg-black/60 px-4 py-2 rounded-xl border border-white/10 backdrop-blur-xs">
                  {currentImage.caption}
                </p>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
