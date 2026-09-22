import { useEffect, useState, useCallback } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft,
  ChevronRight,
  Folder,
  Image as ImageIcon,
  X,
  ArrowLeft,
  Layers,
} from 'lucide-react'
import apiClient from '../../services/apiClient.js'
import { getImageUrl } from '../../utils/imageUtils.js'

export default function GalleryPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const activeSlug = searchParams.get('folder') || searchParams.get('album')

  const [categories, setCategories] = useState([])
  const [currentFolder, setCurrentFolder] = useState(null)
  const [parentFolder, setParentFolder] = useState(null)
  const [breadcrumbs, setBreadcrumbs] = useState([{ name: 'Gallery', slug: null }])
  const [subcategories, setSubcategories] = useState([])
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(true)
  const [lightboxIndex, setLightboxIndex] = useState(null)

  // Navigate to folder or root
  const navigateTo = useCallback((slug = null) => {
    if (slug) {
      setSearchParams({ folder: slug })
    } else {
      setSearchParams({})
    }
  }, [setSearchParams])

  // Sync state whenever URL search param changes
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        if (!activeSlug) {
          // Root level
          const { data } = await apiClient.get('/api/gallery/categories')
          setCategories(data?.data || [])
          setCurrentFolder(null)
          setParentFolder(null)
          setBreadcrumbs([{ name: 'Gallery', slug: null }])
          setSubcategories([])
          setImages([])
        } else {
          // Folder/Subfolder level
          const catRes = await apiClient.get(`/api/gallery/categories/${activeSlug}`)
          const cat = catRes?.data?.data
          if (!cat) {
            navigateTo(null)
            return
          }
          setCurrentFolder(cat)

          // Fetch parent if this is a subfolder
          let parent = null
          if (cat.parentId) {
            try {
              const parentRes = await apiClient.get(`/api/gallery/categories/${cat.parentId}`)
              parent = parentRes?.data?.data || null
            } catch (pErr) {
              console.warn('Could not fetch parent category:', pErr)
            }
          }
          setParentFolder(parent)

          // Set clean, deduplicated breadcrumbs
          if (parent) {
            setBreadcrumbs([
              { name: 'Gallery', slug: null },
              { name: parent.name, slug: parent.slug },
              { name: cat.name, slug: cat.slug },
            ])
          } else {
            setBreadcrumbs([
              { name: 'Gallery', slug: null },
              { name: cat.name, slug: cat.slug },
            ])
          }

          // Fetch subcategories
          const subRes = await apiClient.get(`/api/gallery/categories/${cat.id}/subcategories`)
          setSubcategories(subRes?.data?.data || [])

          // Fetch images
          const imgRes = await apiClient.get(`/api/gallery/categories/${cat.id}/images`)
          setImages(imgRes?.data?.data || [])
        }
      } catch (err) {
        console.error('Failed to load gallery view:', err)
        navigateTo(null)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [activeSlug, navigateTo])

  // Back button handler
  const handleBack = () => {
    if (parentFolder) {
      navigateTo(parentFolder.slug)
    } else {
      navigateTo(null)
    }
  }

  // Lightbox handlers
  const openLightbox = (index) => setLightboxIndex(index)
  const closeLightbox = () => setLightboxIndex(null)
  const nextImage = () => {
    if (lightboxIndex !== null && images.length > 0) {
      setLightboxIndex((lightboxIndex + 1) % images.length)
    }
  }
  const prevImage = () => {
    if (lightboxIndex !== null && images.length > 0) {
      setLightboxIndex((lightboxIndex - 1 + images.length) % images.length)
    }
  }

  // Handle keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (lightboxIndex === null) return
      if (e.key === 'Escape') closeLightbox()
      if (e.key === 'ArrowRight') nextImage()
      if (e.key === 'ArrowLeft') prevImage()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [lightboxIndex, images])

  return (
    <div className="min-h-screen bg-[#F5F8FC]/50 py-12 px-4 sm:px-6 lg:px-12">
      <div className="mx-auto max-w-7xl">
        {/* =====================================================
            HEADER / TITLE
        ===================================================== */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#07405C]/10 border border-[#07405C]/20 text-xs font-semibold uppercase tracking-wider text-[#07405C] mb-3">
            Campus Life & Events
          </div>
          <h1 className="font-display text-3xl font-black tracking-tight text-[#101010] sm:text-4xl md:text-5xl">
            {currentFolder ? currentFolder.name : 'Photo Gallery & Moments'}
          </h1>
          <p className="mt-3 text-sm text-slate-600 sm:text-base max-w-2xl mx-auto font-normal">
            {currentFolder?.description ||
              'Explore campus moments, placement celebrations, corporate drives, and life at LeSuccess Academy.'}
          </p>

          {/* Breadcrumbs & Back Navigation */}
          {currentFolder && (
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleBack}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-xs transition hover:bg-slate-50 hover:text-[#07405C] hover:border-[#07405C]/30 cursor-pointer"
              >
                <ArrowLeft size={16} />
                <span>Back</span>
              </button>

              <nav aria-label="Breadcrumb" className="flex items-center text-sm font-medium text-slate-500">
                {breadcrumbs.map((crumb, idx) => {
                  const isLast = idx === breadcrumbs.length - 1
                  return (
                    <span key={crumb.name + idx} className="flex items-center">
                      {idx > 0 && <span className="mx-2 text-slate-400">/</span>}
                      {isLast ? (
                        <span className="font-bold text-[#07405C]">{crumb.name}</span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => navigateTo(crumb.slug)}
                          className="hover:text-[#07405C] hover:underline cursor-pointer"
                        >
                          {crumb.name}
                        </button>
                      )}
                    </span>
                  )
                })}
              </nav>
            </div>
          )}
        </div>

        {/* =====================================================
            LOADING STATE
        ===================================================== */}
        {loading ? (
          <div className="flex min-h-[40vh] items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-[#07405C]" />
          </div>
        ) : (
          <>
            {/* ===================================================
                ROOT VIEW: FOLDER / CATEGORY CARDS
            =================================================== */}
            {!currentFolder && (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {categories.map((cat) => (
                  <motion.div
                    key={cat.id}
                    whileHover={{ y: -5 }}
                    transition={{ duration: 0.2 }}
                    onClick={() => navigateTo(cat.slug)}
                    className="group cursor-pointer overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition hover:border-[#07405C]/50 hover:shadow-xl"
                  >
                    {/* Thumbnail Preview */}
                    <div className="relative aspect-4/3 w-full overflow-hidden bg-slate-100">
                      {cat.coverImageUrl ? (
                        <img
                          src={getImageUrl(cat.coverImageUrl)}
                          alt={cat.name}
                          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                          onError={(e) => {
                            e.target.style.display = 'none'
                          }}
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#07405C]/10 to-slate-200 text-[#07405C]">
                          <Folder size={48} strokeWidth={1.5} />
                        </div>
                      )}

                      {/* Photo/Subcategory count badge */}
                      <div className="absolute bottom-3 right-3 rounded-lg bg-[#101010]/75 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-md flex items-center gap-1.5 border border-white/10">
                        {cat.subCategoryCount > 0 && cat.imageCount > 0 ? (
                          <>
                            <Layers size={13} />
                            <span>{cat.subCategoryCount} folders • {cat.imageCount} photos</span>
                          </>
                        ) : cat.subCategoryCount > 0 ? (
                          <>
                            <Layers size={13} />
                            <span>{cat.subCategoryCount} folders</span>
                          </>
                        ) : (
                          <>
                            <ImageIcon size={13} />
                            <span>{cat.imageCount || 0} photos</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Card Title */}
                    <div className="p-4 text-center">
                      <h3 className="font-display text-base font-bold text-[#101010] transition group-hover:text-[#DF1E26]">
                        {cat.name}
                      </h3>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* ===================================================
                FOLDER VIEW: SUBCATEGORIES (IF ANY)
            =================================================== */}
            {currentFolder && subcategories.length > 0 && (
              <div className="mb-12">
                <h2 className="mb-6 font-display text-xl font-bold text-[#101010] flex items-center gap-2">
                  <Folder size={20} className="text-[#07405C]" />
                  <span>Subfolders / Albums</span>
                </h2>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {subcategories.map((sub) => (
                    <motion.div
                      key={sub.id}
                      whileHover={{ y: -4 }}
                      onClick={() => navigateTo(sub.slug)}
                      className="group cursor-pointer overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs transition hover:border-[#07405C]/50 hover:shadow-lg"
                    >
                      <div className="relative aspect-4/3 w-full overflow-hidden bg-slate-100">
                        {sub.coverImageUrl ? (
                          <img
                            src={getImageUrl(sub.coverImageUrl)}
                            alt={sub.name}
                            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-slate-100 text-[#07405C]">
                            <Folder size={40} strokeWidth={1.5} />
                          </div>
                        )}
                        <div className="absolute bottom-3 right-3 rounded-lg bg-[#101010]/75 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-md flex items-center gap-1.5 border border-white/10">
                          {sub.subCategoryCount > 0 && sub.imageCount > 0 ? (
                            <>
                              <Layers size={13} />
                              <span>{sub.subCategoryCount} folders • {sub.imageCount} photos</span>
                            </>
                          ) : sub.subCategoryCount > 0 ? (
                            <>
                              <Layers size={13} />
                              <span>{sub.subCategoryCount} folders</span>
                            </>
                          ) : (
                            <>
                              <ImageIcon size={13} />
                              <span>{sub.imageCount || 0} photos</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="p-4 text-center">
                        <h4 className="font-display text-base font-bold text-[#101010] transition group-hover:text-[#DF1E26]">
                          {sub.name}
                        </h4>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* ===================================================
                FOLDER VIEW: PHOTO GRID (IMAGE ONLY DISPLAY)
            =================================================== */}
            {currentFolder && images.length > 0 && (
              <div>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {images.map((img, idx) => (
                    <motion.div
                      key={img.id}
                      whileHover={{ y: -4, scale: 1.01 }}
                      transition={{ duration: 0.2 }}
                      onClick={() => openLightbox(idx)}
                      className="group relative cursor-pointer overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs hover:border-[#07405C]/50 hover:shadow-xl transition aspect-4/3"
                    >
                      <img
                        src={getImageUrl(img.imageUrl)}
                        alt="Gallery item"
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                        loading="lazy"
                      />
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty Folder State */}
            {currentFolder && subcategories.length === 0 && images.length === 0 && (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
                <ImageIcon size={48} className="mx-auto text-slate-400 mb-3" />
                <h3 className="text-lg font-bold text-slate-700">No photos in this folder yet</h3>
                <p className="mt-1 text-sm text-slate-500">
                  New event photos will be updated here shortly.
                </p>
              </div>
            )}
          </>
        )}

        {/* =====================================================
            INTERACTIVE LIGHTBOX MODAL
        ===================================================== */}
        <AnimatePresence>
          {lightboxIndex !== null && images[lightboxIndex] && (
            <div
              role="dialog"
              aria-modal="true"
              className="fixed inset-0 z-80 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={closeLightbox}
                aria-label="Close photo preview"
                className="absolute right-5 top-5 z-90 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 focus:outline-none"
              >
                <X size={22} />
              </button>

              {/* Prev Button */}
              {images.length > 1 && (
                <button
                  type="button"
                  onClick={prevImage}
                  aria-label="Previous photo"
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-90 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/25 focus:outline-none"
                >
                  <ChevronLeft size={28} />
                </button>
              )}

              {/* Next Button */}
              {images.length > 1 && (
                <button
                  type="button"
                  onClick={nextImage}
                  aria-label="Next photo"
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-90 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/25 focus:outline-none"
                >
                  <ChevronRight size={28} />
                </button>
              )}

              {/* Image Only Container */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="relative max-h-[90vh] max-w-5xl overflow-hidden rounded-2xl bg-transparent text-center flex flex-col items-center justify-center"
              >
                <img
                  src={getImageUrl(images[lightboxIndex].imageUrl)}
                  alt="Gallery photo"
                  className="max-h-[85vh] w-auto max-w-full object-contain mx-auto rounded-xl shadow-2xl"
                />
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
