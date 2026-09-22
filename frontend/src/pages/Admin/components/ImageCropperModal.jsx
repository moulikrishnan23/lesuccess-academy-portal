import { useState, useRef, useEffect, useCallback } from 'react'
import {
  X,
  ZoomIn,
  ZoomOut,
  RotateCw,
  FlipHorizontal,
  RotateCcw,
  Check,
  Eye,
  Move,
  Maximize2,
  Sliders,
  Sparkles,
  Loader2,
} from 'lucide-react'

export default function ImageCropperModal({
  isOpen,
  imageSrc,
  speakerName = 'Keynote Speaker',
  programTitle = 'Live Webinar',
  onClose,
  onApply,
  uploading = false,
}) {
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [rotation, setRotation] = useState(0)
  const [flipH, setFlipH] = useState(false)
  const [aspectRatio, setAspectRatio] = useState(4 / 3) // 4:3 default for webinar card
  const [aspectLabel, setAspectLabel] = useState('4:3')
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageDims, setImageDims] = useState({ width: 0, height: 0 })

  const containerRef = useRef(null)
  const imageRef = useRef(null)
  const isDraggingRef = useRef(false)
  const dragStartRef = useRef({ x: 0, y: 0 })
  const panStartRef = useRef({ x: 0, y: 0 })
  const previewCanvasRef = useRef(null)

  // Reset adjustments when a new image is loaded or modal opens
  useEffect(() => {
    if (isOpen) {
      setZoom(1)
      setPan({ x: 0, y: 0 })
      setRotation(0)
      setFlipH(false)
      setImageLoaded(false)
    }
  }, [isOpen, imageSrc])

  // Pre-load image to get natural dimensions
  useEffect(() => {
    if (!imageSrc) return
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      setImageDims({ width: img.naturalWidth, height: img.naturalHeight })
      setImageLoaded(true)
    }
    img.src = imageSrc
  }, [imageSrc])

  // Mouse / Touch Drag handlers
  const handleMouseDown = (e) => {
    e.preventDefault()
    isDraggingRef.current = true
    dragStartRef.current = { x: e.clientX, y: e.clientY }
    panStartRef.current = { ...pan }
  }

  const handleMouseMove = useCallback(
    (e) => {
      if (!isDraggingRef.current) return
      const dx = e.clientX - dragStartRef.current.x
      const dy = e.clientY - dragStartRef.current.y
      setPan({
        x: panStartRef.current.x + dx,
        y: panStartRef.current.y + dy,
      })
    },
    []
  )

  const handleMouseUp = () => {
    isDraggingRef.current = false
  }

  // Touch handlers
  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      isDraggingRef.current = true
      dragStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
      panStartRef.current = { ...pan }
    }
  }

  const handleTouchMove = (e) => {
    if (!isDraggingRef.current || e.touches.length !== 1) return
    const dx = e.touches[0].clientX - dragStartRef.current.x
    const dy = e.touches[0].clientY - dragStartRef.current.y
    setPan({
      x: panStartRef.current.x + dx,
      y: panStartRef.current.y + dy,
    })
  }

  const handleTouchEnd = () => {
    isDraggingRef.current = false
  }

  // Mouse wheel to zoom
  const handleWheel = (e) => {
    e.preventDefault()
    const delta = e.deltaY * -0.0015
    setZoom((prev) => Math.min(3.5, Math.max(1, +(prev + delta).toFixed(2))))
  }

  // Generate cropped output canvas
  const generateCroppedBlob = async () => {
    if (!imageRef.current) return null

    const outputWidth = 800
    const outputHeight = Math.round(800 / aspectRatio)

    const canvas = document.createElement('canvas')
    canvas.width = outputWidth
    canvas.height = outputHeight
    const ctx = canvas.getContext('2d')
    if (!ctx) return null

    // Background fill to clean dark blue/black
    ctx.fillStyle = '#01273C'
    ctx.fillRect(0, 0, outputWidth, outputHeight)

    // Base dimensions inside container
    const container = containerRef.current
    if (!container) return null

    const containerRect = container.getBoundingClientRect()
    const containerW = containerRect.width
    const containerH = containerRect.height

    const scaleFactor = outputWidth / containerW

    ctx.save()

    // Translate to canvas center
    ctx.translate(outputWidth / 2, outputHeight / 2)

    // Apply rotation
    ctx.rotate((rotation * Math.PI) / 180)

    // Apply flip
    ctx.scale(flipH ? -1 : 1, 1)

    // Apply pan (converted to canvas coordinates)
    const rad = (-rotation * Math.PI) / 180
    const cos = Math.cos(rad)
    const sin = Math.sin(rad)
    const rotatedPanX = (pan.x * cos - pan.y * sin) * (flipH ? -1 : 1)
    const rotatedPanY = pan.x * sin + pan.y * cos

    ctx.translate(rotatedPanX * scaleFactor, rotatedPanY * scaleFactor)

    // Draw the image scaled to fill/fit
    const img = imageRef.current
    const nw = img.naturalWidth
    const nh = img.naturalHeight
    const imgAspect = nw / nh

    let drawW, drawH
    if (imgAspect > aspectRatio) {
      drawH = outputHeight * zoom
      drawW = drawH * imgAspect
    } else {
      drawW = outputWidth * zoom
      drawH = drawW / imgAspect
    }

    ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH)
    ctx.restore()

    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(null)
            return
          }
          const file = new File([blob], 'cropped-program-speaker.jpg', {
            type: 'image/jpeg',
            lastModified: Date.now(),
          })
          resolve(file)
        },
        'image/jpeg',
        0.92
      )
    })
  }

  const handleApplyClick = async () => {
    const croppedFile = await generateCroppedBlob()
    if (croppedFile && onApply) {
      await onApply(croppedFile)
    }
  }

  const resetAdjustments = () => {
    setZoom(1)
    setPan({ x: 0, y: 0 })
    setRotation(0)
    setFlipH(false)
  }

  if (!isOpen || !imageSrc) return null

  // Calculate container aspect ratio styles
  const cropBoxHeight = 320
  const cropBoxWidth = Math.round(cropBoxHeight * aspectRatio)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-4xl rounded-3xl bg-white shadow-2xl flex flex-col max-h-[92vh] overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#07405C] text-white shadow-xs">
              <Sliders size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Crop & Frame Program Photo</h3>
              <p className="text-xs text-slate-500">
                Adjust zoom, position, and framing to ensure the face fits the webinar card without getting cut off.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={uploading}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition cursor-pointer disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 bg-slate-50/50">
          {/* LEFT: Interactive Cropper Canvas & Controls (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col items-center">
            {/* Aspect Ratio Selector Pills */}
            <div className="flex items-center gap-2 mb-3 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs text-xs font-semibold">
              <span className="text-slate-400 px-2 text-[11px] uppercase tracking-wider">Aspect Ratio:</span>
              {[
                { label: '4:3 (Card)', ratio: 4 / 3 },
                { label: '1:1 (Square)', ratio: 1 },
                { label: '16:9 (Wide)', ratio: 16 / 9 },
              ].map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => {
                    setAspectRatio(item.ratio)
                    setAspectLabel(item.label)
                  }}
                  className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                    aspectRatio === item.ratio
                      ? 'bg-[#07405C] text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Crop Viewport Box */}
            <div className="relative flex items-center justify-center p-3 bg-slate-900/90 rounded-2xl border border-slate-800 shadow-inner w-full">
              <div
                ref={containerRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onWheel={handleWheel}
                style={{
                  width: `${cropBoxWidth}px`,
                  height: `${cropBoxHeight}px`,
                  maxWidth: '100%',
                }}
                className="relative overflow-hidden rounded-xl bg-slate-950 border-2 border-white/60 shadow-2xl cursor-grab active:cursor-grabbing select-none"
              >
                {/* Image Under Transform */}
                <img
                  ref={imageRef}
                  src={imageSrc}
                  alt="Crop preview"
                  crossOrigin="anonymous"
                  draggable={false}
                  style={{
                    transform: `translate(${pan.x}px, ${pan.y}px) rotate(${rotation}deg) scale(${
                      flipH ? -1 : 1
                    }, 1) scale(${zoom})`,
                    transformOrigin: 'center center',
                    transition: isDraggingRef.current ? 'none' : 'transform 0.05s ease-out',
                  }}
                  className="h-full w-full object-contain pointer-events-none"
                />

                {/* Rule of Thirds Guideline Grid Overlay */}
                <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 border border-white/20">
                  <div className="border-r border-b border-white/20" />
                  <div className="border-r border-b border-white/20" />
                  <div className="border-b border-white/20" />
                  <div className="border-r border-b border-white/20" />
                  <div className="border-r border-b border-white/20" />
                  <div className="border-b border-white/20" />
                  <div className="border-r border-white/20" />
                  <div className="border-r border-white/20" />
                  <div />
                </div>

                {/* Drag / Pan Instruction Pill */}
                <div className="absolute bottom-2 inset-x-2 flex justify-center pointer-events-none">
                  <span className="inline-flex items-center gap-1.5 bg-black/70 backdrop-blur-md text-white/90 text-[10px] font-semibold px-2.5 py-1 rounded-full border border-white/20 shadow-xs">
                    <Move size={11} />
                    <span>Drag photo to center face • Scroll to zoom</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Transform Toolbar (Zoom, Rotate, Flip, Reset) */}
            <div className="w-full mt-4 space-y-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              {/* Zoom Controls */}
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-slate-600 shrink-0 flex items-center gap-1">
                  <ZoomIn size={14} className="text-[#07405C]" />
                  <span>Zoom ({zoom.toFixed(1)}x):</span>
                </span>
                <button
                  type="button"
                  onClick={() => setZoom((prev) => Math.max(1, +(prev - 0.2).toFixed(1)))}
                  className="p-1 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition"
                  title="Zoom Out"
                >
                  <ZoomOut size={14} />
                </button>
                <input
                  type="range"
                  min="1"
                  max="3"
                  step="0.05"
                  value={zoom}
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                  className="flex-1 accent-[#07405C] cursor-pointer h-1.5 bg-slate-200 rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => setZoom((prev) => Math.min(3, +(prev + 0.2).toFixed(1)))}
                  className="p-1 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition"
                  title="Zoom In"
                >
                  <ZoomIn size={14} />
                </button>
              </div>

              {/* Action Buttons: Rotate, Flip, Reset */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setRotation((prev) => (prev + 90) % 360)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white font-semibold text-slate-700 hover:bg-slate-100 hover:text-[#07405C] transition cursor-pointer"
                  >
                    <RotateCw size={13} />
                    <span>Rotate 90°</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFlipH((prev) => !prev)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white font-semibold text-slate-700 hover:bg-slate-100 hover:text-[#07405C] transition cursor-pointer"
                  >
                    <FlipHorizontal size={13} />
                    <span>Flip</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={resetAdjustments}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-slate-500 hover:text-[#DF1E26] font-semibold hover:underline transition cursor-pointer"
                >
                  <RotateCcw size={13} />
                  <span>Reset Adjustments</span>
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT: Real-Time Webinar Card Live Preview (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Eye size={16} className="text-[#07405C]" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Live Webinar Card Preview
                </h4>
              </div>
              <p className="text-[11px] text-slate-500 mb-3">
                Preview how the photo appears inside the live card with the speaker name badge.
              </p>

              {/* Card Container Mockup */}
              <div className="relative rounded-2xl bg-gradient-to-br from-[#07405C] via-[#024D72] to-[#01273C] p-4 text-white shadow-xl border border-white/20 overflow-hidden">
                {/* Top Badges */}
                <div className="flex items-center justify-between mb-3 text-[10px]">
                  <span className="rounded-full bg-[#DF1E26] text-white font-bold px-2.5 py-0.5 uppercase tracking-wide">
                    Free Webinar
                  </span>
                  <span className="rounded-full bg-white/20 backdrop-blur-sm text-white px-2 py-0.5 font-semibold">
                    Online Meet
                  </span>
                </div>

                {/* Framed Image Container with live transform */}
                <div className="relative aspect-[4/3] w-full max-h-56 rounded-xl overflow-hidden border border-white/30 bg-slate-950 shadow-md">
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      overflow: 'hidden',
                      position: 'relative',
                    }}
                  >
                    <img
                      src={imageSrc}
                      alt="Preview"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        transform: `translate(${pan.x * 0.7}px, ${pan.y * 0.7}px) rotate(${rotation}deg) scale(${
                          flipH ? -1 : 1
                        }, 1) scale(${zoom})`,
                        transformOrigin: 'center center',
                      }}
                      className="pointer-events-none select-none"
                    />
                  </div>

                  {/* Gradient Overlay & Speaker Name Tag */}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent p-2.5 pt-5 pointer-events-none">
                    <div className="text-xs font-bold text-white truncate">
                      {speakerName || 'Speaker Name'}
                    </div>
                    <div className="text-[10px] text-white/80">Keynote Speaker</div>
                  </div>
                </div>

                {/* Program Title Hint */}
                <div className="mt-3 pt-2.5 border-t border-white/15 text-[11px] text-white/80 truncate">
                  {programTitle || 'Full Stack Career Roadmap'}
                </div>
              </div>

              {/* Helpful Advice Alert */}
              <div className="mt-3 rounded-xl bg-amber-50 border border-amber-200/80 p-3 text-[11px] text-amber-900 flex items-start gap-2">
                <Sparkles size={14} className="text-amber-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Framing Tip:</strong> Center the speaker's eyes in the upper half of the frame so the bottom gradient tag sits neatly on their collar/chest.
                </span>
              </div>
            </div>

            {/* Bottom Actions inside right panel */}
            <div className="mt-6 pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={uploading}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApplyClick}
                disabled={uploading}
                className="inline-flex items-center gap-2 rounded-xl bg-[#07405C] px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#024D72] transition cursor-pointer disabled:opacity-50"
              >
                {uploading ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Processing & Uploading...</span>
                  </>
                ) : (
                  <>
                    <Check size={14} />
                    <span>Apply & Save Crop</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
