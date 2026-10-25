import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Folder,
  Image as ImageIcon,
  X,
  ArrowLeft,
  Layers,
} from "lucide-react";
import apiClient from "../../services/apiClient.js";
import { getImageUrl } from "../../utils/imageUtils.js";
import ErrorState from "../../components/ui/ErrorState.jsx";
import SpotlightCard from "../../components/ui/SpotlightCard.jsx";
import BorderBeam from "../../components/ui/BorderBeam.jsx";
import ParallaxLayer from "../../components/ui/ParallaxLayer.jsx";

function normalizeList(val) {
  if (Array.isArray(val)) return val;
  if (val && Array.isArray(val.data)) return val.data;
  return [];
}

export default function GalleryPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeSlug = searchParams.get("folder") || searchParams.get("album");

  const [categories, setCategories] = useState(() => {
    try {
      const cached = localStorage.getItem("lesuccess_cache_gallery_v1");
      return cached ? normalizeList(JSON.parse(cached)) : [];
    } catch {
      return [];
    }
  });
  const [currentFolder, setCurrentFolder] = useState(null);
  const [parentFolder, setParentFolder] = useState(null);
  const [breadcrumbs, setBreadcrumbs] = useState([
    { name: "Gallery", slug: null },
  ]);
  const [subcategories, setSubcategories] = useState([]);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState(null);

  // Navigate to folder or root
  const navigateTo = useCallback(
    (slug = null) => {
      if (slug) {
        setSearchParams({ folder: slug });
      } else {
        setSearchParams({});
      }
    },
    [setSearchParams],
  );

  // Sync state whenever URL search param changes
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        if (!activeSlug) {
          // Root level
          try {
            const { data } = await apiClient.get("/api/gallery/categories");
            const catList = normalizeList(data);
            setCategories(catList);
            if (catList.length > 0) {
              try {
                localStorage.setItem(
                  "lesuccess_cache_gallery_v1",
                  JSON.stringify({ data: catList, savedAt: Date.now() }),
                );
              } catch {
                // Ignore storage errors
              }
            }
          } catch (fetchErr) {
            console.warn(
              "Failed to fetch gallery categories, checking cache:",
              fetchErr,
            );
            const cachedStr = localStorage.getItem(
              "lesuccess_cache_gallery_v1",
            );
            if (cachedStr) {
              try {
                const parsed = JSON.parse(cachedStr);
                const cachedList = normalizeList(parsed);
                if (cachedList.length > 0) {
                  setCategories(cachedList);
                } else {
                  setError("Failed to load gallery categories");
                }
              } catch {
                setError("Failed to load gallery categories");
              }
            } else {
              setError("Failed to load gallery categories");
            }
          }
          setCurrentFolder(null);
          setParentFolder(null);
          setBreadcrumbs([{ name: "Gallery", slug: null }]);
          setSubcategories([]);
          setImages([]);
        } else {
          // Folder/Subfolder level
          const catRes = await apiClient.get(
            `/api/gallery/categories/${activeSlug}`,
          );
          const cat = catRes?.data?.data;
          if (!cat) {
            navigateTo(null);
            return;
          }
          setCurrentFolder(cat);

          // Fetch parent if this is a subfolder
          let parent = null;
          if (cat.parentId) {
            try {
              const parentRes = await apiClient.get(
                `/api/gallery/categories/${cat.parentId}`,
              );
              parent = parentRes?.data?.data || null;
            } catch (pErr) {
              console.warn("Could not fetch parent category:", pErr);
            }
          }
          setParentFolder(parent);

          // Set clean, deduplicated breadcrumbs
          if (parent) {
            setBreadcrumbs([
              { name: "Gallery", slug: null },
              { name: parent.name, slug: parent.slug },
              { name: cat.name, slug: cat.slug },
            ]);
          } else {
            setBreadcrumbs([
              { name: "Gallery", slug: null },
              { name: cat.name, slug: cat.slug },
            ]);
          }

          // Fetch subcategories
          const subRes = await apiClient.get(
            `/api/gallery/categories/${cat.id}/subcategories`,
          );
          setSubcategories(normalizeList(subRes?.data));

          // Fetch images
          const imgRes = await apiClient.get(
            `/api/gallery/categories/${cat.id}/images`,
          );
          setImages(normalizeList(imgRes?.data));
        }
      } catch (err) {
        console.error("Failed to load gallery view:", err);
        navigateTo(null);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [activeSlug, navigateTo, retryCount]);

  // Back button handler
  const handleBack = () => {
    if (parentFolder) {
      navigateTo(parentFolder.slug);
    } else {
      navigateTo(null);
    }
  };

  // Lightbox handlers
  const openLightbox = (index) => setLightboxIndex(index);
  const closeLightbox = useCallback(() => setLightboxIndex(null), []);
  const nextImage = useCallback(() => {
    setLightboxIndex((prev) => {
      if (prev === null || images.length === 0) return null;
      return (prev + 1) % images.length;
    });
  }, [images.length]);
  const prevImage = useCallback(() => {
    setLightboxIndex((prev) => {
      if (prev === null || images.length === 0) return null;
      return (prev - 1 + images.length) % images.length;
    });
  }, [images.length]);

  // Handle keyboard navigation for lightbox
  useEffect(() => {
    if (lightboxIndex === null) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") nextImage();
      if (e.key === "ArrowLeft") prevImage();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxIndex, closeLightbox, nextImage, prevImage]);

  const safeCategories = normalizeList(categories);
  const safeSubcategories = normalizeList(subcategories);
  const safeImages = normalizeList(images);

  return (
    <div className="relative min-h-screen bg-[#F5F8FC]/50 py-12 px-4 sm:px-6 lg:px-12 overflow-hidden">
      {/* Dynamic Background Parallax Depth Elements */}
      <ParallaxLayer
        speed={-0.35}
        range={120}
        className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-gradient-to-br from-[#DF1E26]/10 to-transparent blur-3xl"
      />
      <ParallaxLayer
        speed={0.4}
        range={140}
        className="pointer-events-none absolute top-1/3 -right-28 h-96 w-96 rounded-full bg-gradient-to-tl from-[#07405C]/12 to-transparent blur-3xl"
      />
      <ParallaxLayer
        speed={-0.25}
        range={90}
        className="pointer-events-none absolute -bottom-20 left-1/4 h-80 w-80 rounded-full bg-gradient-to-tr from-cyan-400/10 to-transparent blur-3xl"
      />

      <div className="relative z-10 mx-auto max-w-7xl">
        {/* =====================================================
            HEADER / TITLE
        ===================================================== */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#07405C]/10 border border-[#07405C]/20 text-xs font-semibold uppercase tracking-wider text-[#07405C] mb-3">
            Campus Life & Events
          </div>
          <h1 className="font-display text-3xl font-black tracking-tight text-[#101010] sm:text-4xl md:text-5xl">
            {currentFolder ? currentFolder.name : "Photo Gallery & Moments"}
          </h1>
          <p className="mt-3 text-sm text-slate-600 sm:text-base max-w-2xl mx-auto font-normal">
            {currentFolder?.description ||
              "Explore campus moments, placement celebrations, corporate drives, and life at LeSuccess Academy."}
          </p>

          {/* Breadcrumbs & Back Navigation */}
          {currentFolder && (
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleBack}
                data-cursor-text="Back"
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-xs transition hover:bg-slate-50 hover:text-[#07405C] hover:border-[#07405C]/30 cursor-pointer"
              >
                <ArrowLeft size={16} />
                <span>Back</span>
              </button>

              <nav
                aria-label="Breadcrumb"
                className="flex items-center text-sm font-medium text-slate-500"
              >
                {breadcrumbs.map((crumb, idx) => {
                  const isLast = idx === breadcrumbs.length - 1;
                  return (
                    <span key={crumb.name + idx} className="flex items-center">
                      {idx > 0 && (
                        <span className="mx-2 text-slate-400">/</span>
                      )}
                      {isLast ? (
                        <span className="font-bold text-[#07405C]">
                          {crumb.name}
                        </span>
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
                  );
                })}
              </nav>
            </div>
          )}
        </div>

        {/* =====================================================
            LOADING / ERROR STATE
        ===================================================== */}
        {loading && safeCategories.length === 0 ? (
          <div className="flex min-h-[40vh] items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-[#07405C]" />
          </div>
        ) : error && safeCategories.length === 0 ? (
          <div className="max-w-md mx-auto py-12">
            <ErrorState
              title="Unable to load gallery"
              message="We're having trouble loading the gallery right now. Please check your connection and try again."
              onRetry={() => setRetryCount((c) => c + 1)}
              retryLabel="Try Again"
            />
          </div>
        ) : (
          <>
            {/* ===================================================
                ROOT VIEW: FOLDER / CATEGORY CARDS
            =================================================== */}
            {!currentFolder && (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {safeCategories.map((cat, idx) => (
                  <motion.div
                    key={cat.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: idx * 0.05 }}
                    onClick={() => navigateTo(cat.slug)}
                    data-cursor-text="Open"
                    className="h-full cursor-pointer"
                  >
                    <SpotlightCard
                      tilt={true}
                      maxTilt={7}
                      spotlightColor="rgba(7, 64, 92, 0.14)"
                      className="group card-lift-3d relative flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs transition-all duration-300 hover:border-[#07405C]/40 hover:shadow-2xl"
                    >
                      <BorderBeam
                        size={140}
                        duration={8}
                        delay={idx * 1.2}
                        colorFrom="#07405C"
                        colorTo="#DF1E26"
                      />

                      {/* Thumbnail Preview with Stanford-style hover zoom */}
                      <div className="relative aspect-4/3 w-full overflow-hidden bg-slate-100">
                        {cat.coverImageUrl ? (
                          <img
                            src={getImageUrl(cat.coverImageUrl, "", { width: 800 })}
                            alt={cat.name}
                            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                            onError={(e) => {
                              e.target.style.display = "none";
                            }}
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#07405C]/10 to-slate-200 text-[#07405C]">
                            <Folder size={48} strokeWidth={1.5} />
                          </div>
                        )}

                        {/* Subtle bottom gradient overlay for readability */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent opacity-60 transition-opacity duration-300 group-hover:opacity-75" />

                        {/* Photo/Subcategory count badge */}
                        <div className="absolute bottom-3 right-3 rounded-xl bg-black/60 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-md flex items-center gap-1.5 border border-white/20 shadow-sm">
                          {cat.subCategoryCount > 0 && cat.imageCount > 0 ? (
                            <>
                              <Layers size={13} className="text-cyan-300" />
                              <span>
                                {cat.subCategoryCount} folders •{" "}
                                {cat.imageCount} photos
                              </span>
                            </>
                          ) : cat.subCategoryCount > 0 ? (
                            <>
                              <Layers size={13} className="text-cyan-300" />
                              <span>{cat.subCategoryCount} folders</span>
                            </>
                          ) : (
                            <>
                              <ImageIcon size={13} className="text-rose-300" />
                              <span>{cat.imageCount || 0} photos</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Card Title */}
                      <div className="p-4 text-center">
                        <h3 className="font-display text-base font-bold text-[#101010] transition-colors duration-200 group-hover:text-[#DF1E26]">
                          {cat.name}
                        </h3>
                      </div>
                    </SpotlightCard>
                  </motion.div>
                ))}
              </div>
            )}

            {!currentFolder && safeCategories.length === 0 && !error && (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center max-w-md mx-auto">
                <ImageIcon size={48} className="mx-auto text-slate-400 mb-3" />
                <h3 className="text-lg font-bold text-slate-700">
                  No photo categories yet
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  New campus life and events moments will be added here soon.
                </p>
              </div>
            )}

            {/* ===================================================
                FOLDER VIEW: SUBCATEGORIES (IF ANY)
            =================================================== */}
            {currentFolder && safeSubcategories.length > 0 && (
              <div className="mb-12">
                <h2 className="mb-6 font-display text-xl font-bold text-[#101010] flex items-center gap-2">
                  <Folder size={20} className="text-[#07405C]" />
                  <span>Subfolders / Albums</span>
                </h2>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {safeSubcategories.map((sub, idx) => (
                    <motion.div
                      key={sub.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35, delay: idx * 0.05 }}
                      onClick={() => navigateTo(sub.slug)}
                      data-cursor-text="Open"
                      className="h-full cursor-pointer"
                    >
                      <SpotlightCard
                        tilt={true}
                        maxTilt={7}
                        spotlightColor="rgba(7, 64, 92, 0.14)"
                        className="group card-lift-3d relative flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs transition-all duration-300 hover:border-[#07405C]/40 hover:shadow-2xl"
                      >
                        <BorderBeam
                          size={140}
                          duration={8}
                          delay={idx * 1.2}
                          colorFrom="#07405C"
                          colorTo="#DF1E26"
                        />
                        <div className="relative aspect-4/3 w-full overflow-hidden bg-slate-100">
                          {sub.coverImageUrl ? (
                            <img
                              src={getImageUrl(sub.coverImageUrl, "", { width: 800 })}
                              alt={sub.name}
                              className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-slate-100 text-[#07405C]">
                              <Folder size={40} strokeWidth={1.5} />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent opacity-60 transition-opacity duration-300 group-hover:opacity-75" />
                          <div className="absolute bottom-3 right-3 rounded-xl bg-black/60 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-md flex items-center gap-1.5 border border-white/20 shadow-sm">
                            {sub.subCategoryCount > 0 && sub.imageCount > 0 ? (
                              <>
                                <Layers size={13} className="text-cyan-300" />
                                <span>
                                  {sub.subCategoryCount} folders •{" "}
                                  {sub.imageCount} photos
                                </span>
                              </>
                            ) : sub.subCategoryCount > 0 ? (
                              <>
                                <Layers size={13} className="text-cyan-300" />
                                <span>{sub.subCategoryCount} folders</span>
                              </>
                            ) : (
                              <>
                                <ImageIcon
                                  size={13}
                                  className="text-rose-300"
                                />
                                <span>{sub.imageCount || 0} photos</span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="p-4 text-center">
                          <h4 className="font-display text-base font-bold text-[#101010] transition-colors duration-200 group-hover:text-[#DF1E26]">
                            {sub.name}
                          </h4>
                        </div>
                      </SpotlightCard>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* ===================================================
                FOLDER VIEW: PHOTO GRID (IMAGE ONLY DISPLAY)
            =================================================== */}
            {currentFolder && safeImages.length > 0 && (
              <div>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {safeImages.map((img, idx) => (
                    <motion.div
                      key={img.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: idx * 0.04 }}
                      onClick={() => openLightbox(idx)}
                      data-cursor-text="View"
                      className="h-full aspect-4/3 cursor-pointer"
                    >
                      <SpotlightCard
                        tilt={true}
                        maxTilt={8}
                        spotlightColor="rgba(223, 30, 38, 0.16)"
                        className="group card-lift-3d relative h-full w-full overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs transition-all duration-300 hover:border-[#DF1E26]/50 hover:shadow-2xl p-0"
                      >
                        <img
                          src={getImageUrl(img.imageUrl, "", { width: 800 })}
                          alt={img.title || "Gallery photo"}
                          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                          loading="lazy"
                        />
                        {/* Hover Overlay with Zoom Icon and gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex items-end justify-between p-3.5">
                          <span className="text-xs font-semibold text-white drop-shadow-sm truncate">
                            {img.title || `Photo ${idx + 1}`}
                          </span>
                          <span className="rounded-lg bg-white/20 p-1.5 text-white backdrop-blur-md">
                            <ImageIcon size={14} />
                          </span>
                        </div>
                      </SpotlightCard>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty Folder State */}
            {currentFolder &&
              safeSubcategories.length === 0 &&
              safeImages.length === 0 && (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
                  <ImageIcon
                    size={48}
                    className="mx-auto text-slate-400 mb-3"
                  />
                  <h3 className="text-lg font-bold text-slate-700">
                    No photos in this folder yet
                  </h3>
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
          {lightboxIndex !== null && safeImages[lightboxIndex] && (
            <div
              role="dialog"
              aria-modal="true"
              className="fixed inset-0 z-80 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={closeLightbox}
                data-cursor-text="Close"
                aria-label="Close photo preview"
                className="absolute right-5 top-5 z-90 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 focus:outline-none cursor-pointer"
              >
                <X size={22} />
              </button>

              {/* Prev Button */}
              {safeImages.length > 1 && (
                <button
                  type="button"
                  onClick={prevImage}
                  data-cursor-text="Prev"
                  aria-label="Previous photo"
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-90 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/25 focus:outline-none cursor-pointer"
                >
                  <ChevronLeft size={28} />
                </button>
              )}

              {/* Next Button */}
              {safeImages.length > 1 && (
                <button
                  type="button"
                  onClick={nextImage}
                  data-cursor-text="Next"
                  aria-label="Next photo"
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-90 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/25 focus:outline-none cursor-pointer"
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
                  src={getImageUrl(safeImages[lightboxIndex].imageUrl)}
                  alt="Gallery photo"
                  className="max-h-[85vh] w-auto max-w-full object-contain mx-auto rounded-xl shadow-2xl"
                />
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
