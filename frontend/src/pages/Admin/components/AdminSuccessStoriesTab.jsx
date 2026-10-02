import { useState, useEffect } from 'react'
import { Plus, Trash2, Edit2, CheckCircle, X, Image as ImageIcon, Video, ExternalLink, ArrowUp, ArrowDown } from 'lucide-react'
import { FaInstagram } from 'react-icons/fa6'
import apiClient from '../../../services/apiClient.js'
import { getImageUrl } from '../../../utils/imageUtils.js'
import InstagramReelEmbed from '../../../components/common/InstagramReelEmbed.jsx'

const isItemActive = (item) => Boolean(item?.isActive ?? item?.active ?? false)

export default function AdminSuccessStoriesTab({ showAlert }) {
  const [activeView, setActiveView] = useState('images') // 'images' | 'reels'
  const [loading, setLoading] = useState(true)

  const [images, setImages] = useState([])
  const [reels, setReels] = useState([])

  // Image Modal State
  const [isImgModalOpen, setIsImgModalOpen] = useState(false)
  const [editingImage, setEditingImage] = useState(null)
  const [imgForm, setImgForm] = useState({ imageUrl: '', caption: '', displayOrder: 0, isActive: true })
  const [uploadingImage, setUploadingImage] = useState(false)

  // Reel Modal State
  const [isReelModalOpen, setIsReelModalOpen] = useState(false)
  const [editingReel, setEditingReel] = useState(null)
  const [reelForm, setReelForm] = useState({ reelUrl: '', title: '', displayOrder: 0, isActive: true })

  const fetchData = async () => {
    setLoading(true)
    try {
      if (activeView === 'images') {
        const { data } = await apiClient.get('/api/admin/success-stories/images')
        setImages(data?.data || [])
      } else {
        const { data } = await apiClient.get('/api/admin/success-stories/reels')
        setReels(data?.data || [])
      }
    } catch (err) {
      showAlert(err?.message || `Failed to load success story ${activeView}`, 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let active = true
    const endpoint = activeView === 'images' ? '/api/admin/success-stories/images' : '/api/admin/success-stories/reels'
    
    apiClient.get(endpoint)
      .then(({ data }) => {
        if (!active) return
        if (activeView === 'images') {
          setImages(data?.data || [])
        } else {
          setReels(data?.data || [])
        }
      })
      .catch((err) => {
        if (!active) return
        showAlert(err?.message || `Failed to load success story ${activeView}`, 'error')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [activeView, showAlert])

  /* =========================================
     IMAGES MANAGEMENT
  ========================================= */
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 25 * 1024 * 1024) {
      showAlert('File size exceeds maximum permitted limit (25MB).', 'error')
      e.target.value = ''
      return
    }

    setUploadingImage(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const { data } = await apiClient.post('/api/admin/success-stories/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      const uploadedUrl = data?.data?.url
      if (uploadedUrl) {
        setImgForm((prev) => ({ ...prev, imageUrl: uploadedUrl }))
        showAlert('Image uploaded successfully')
      }
    } catch (err) {
      showAlert(err?.message || 'Image upload failed', 'error')
    } finally {
      setUploadingImage(false)
      e.target.value = ''
    }
  }

  const openAddImageModal = () => {
    setEditingImage(null)
    setImgForm({ imageUrl: '', caption: '', displayOrder: images.length, isActive: true })
    setIsImgModalOpen(true)
  }

  const openEditImageModal = (image) => {
    setEditingImage(image)
    setImgForm({
      imageUrl: image.imageUrl,
      caption: image.caption || '',
      displayOrder: image.displayOrder ?? 0,
      isActive: isItemActive(image),
    })
    setIsImgModalOpen(true)
  }

  const saveImage = async (e) => {
    e.preventDefault()
    if (!imgForm.imageUrl) {
      showAlert('Image is required', 'error')
      return
    }

    try {
      const payload = {
        imageUrl: imgForm.imageUrl,
        caption: imgForm.caption || '',
        displayOrder: Number(imgForm.displayOrder) || 0,
        isActive: Boolean(imgForm.isActive),
        active: Boolean(imgForm.isActive),
      }
      if (editingImage) {
        await apiClient.put(`/api/admin/success-stories/images/${editingImage.id}`, payload)
        showAlert('Success story image updated')
      } else {
        await apiClient.post('/api/admin/success-stories/images', payload)
        showAlert('Success story image created')
      }
      setIsImgModalOpen(false)
      fetchData()
    } catch (err) {
      showAlert(err?.message || 'Failed to save image', 'error')
    }
  }

  const toggleImageStatus = async (image) => {
    try {
      const nextStatus = !isItemActive(image)
      await apiClient.put(`/api/admin/success-stories/images/${image.id}`, {
        imageUrl: image.imageUrl,
        caption: image.caption || '',
        displayOrder: image.displayOrder ?? 0,
        isActive: nextStatus,
        active: nextStatus,
      })
      showAlert(`Image marked as ${nextStatus ? 'Active' : 'Inactive'}`)
      fetchData()
    } catch (err) {
      showAlert(err?.message || 'Failed to update status', 'error')
    }
  }

  const deleteImage = async (id) => {
    if (!window.confirm('Delete this success story image?')) return
    try {
      await apiClient.delete(`/api/admin/success-stories/images/${id}`)
      showAlert('Image deleted')
      fetchData()
    } catch (err) {
      showAlert(err?.message || 'Failed to delete image', 'error')
    }
  }

  /* =========================================
     REELS MANAGEMENT
  ========================================= */
  const openAddReelModal = () => {
    setEditingReel(null)
    setReelForm({ reelUrl: '', title: '', displayOrder: reels.length, isActive: true })
    setIsReelModalOpen(true)
  }

  const openEditReelModal = (reel) => {
    setEditingReel(reel)
    setReelForm({
      reelUrl: reel.reelUrl,
      title: reel.title || '',
      displayOrder: reel.displayOrder ?? 0,
      isActive: isItemActive(reel),
    })
    setIsReelModalOpen(true)
  }

  const saveReel = async (e) => {
    e.preventDefault()
    if (!reelForm.reelUrl.includes('instagram.com/reel/')) {
      showAlert('Must be a valid Instagram reel URL (https://www.instagram.com/reel/...)', 'error')
      return
    }

    try {
      const payload = {
        reelUrl: reelForm.reelUrl.trim(),
        title: reelForm.title ? reelForm.title.trim() : '',
        displayOrder: Number(reelForm.displayOrder) || 0,
        isActive: Boolean(reelForm.isActive),
        active: Boolean(reelForm.isActive),
      }
      if (editingReel) {
        await apiClient.put(`/api/admin/success-stories/reels/${editingReel.id}`, payload)
        showAlert('Success story reel updated')
      } else {
        await apiClient.post('/api/admin/success-stories/reels', payload)
        showAlert('Success story reel created')
      }
      setIsReelModalOpen(false)
      fetchData()
    } catch (err) {
      showAlert(err?.message || 'Failed to save reel', 'error')
    }
  }

  const toggleReelStatus = async (reel) => {
    try {
      const nextStatus = !isItemActive(reel)
      await apiClient.put(`/api/admin/success-stories/reels/${reel.id}`, {
        reelUrl: reel.reelUrl,
        title: reel.title || '',
        displayOrder: reel.displayOrder ?? 0,
        isActive: nextStatus,
        active: nextStatus,
      })
      showAlert(`Reel marked as ${nextStatus ? 'Active' : 'Inactive'}`)
      fetchData()
    } catch (err) {
      showAlert(err?.message || 'Failed to update status', 'error')
    }
  }

  const deleteReel = async (id) => {
    if (!window.confirm('Delete this reel?')) return
    try {
      await apiClient.delete(`/api/admin/success-stories/reels/${id}`)
      showAlert('Reel deleted')
      fetchData()
    } catch (err) {
      showAlert(err?.message || 'Failed to delete reel', 'error')
    }
  }

  const [reordering, setReordering] = useState(false)

  const handleMoveReel = async (reel, direction) => {
    if (reordering) return
    const sorted = [...reels].sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
    const currentIndex = sorted.findIndex((r) => r.id === reel.id)
    if (currentIndex === -1) return

    const targetIndex = currentIndex + direction
    if (targetIndex < 0 || targetIndex >= sorted.length) return

    const targetOrder = targetIndex + 1
    setReordering(true)
    try {
      await apiClient.put(`/api/admin/success-stories/reels/${reel.id}`, {
        reelUrl: reel.reelUrl,
        title: reel.title || '',
        displayOrder: targetOrder,
        isActive: isItemActive(reel),
        active: isItemActive(reel),
      })
      showAlert(`Reel moved ${direction === -1 ? 'up' : 'down'}`)
      await fetchData()
    } catch (err) {
      showAlert(err?.message || 'Failed to reorder reel', 'error')
    } finally {
      setReordering(false)
    }
  }

  const handleMoveImage = async (image, direction) => {
    if (reordering) return
    const sorted = [...images].sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
    const currentIndex = sorted.findIndex((img) => img.id === image.id)
    if (currentIndex === -1) return

    const targetIndex = currentIndex + direction
    if (targetIndex < 0 || targetIndex >= sorted.length) return

    const targetOrder = targetIndex + 1
    setReordering(true)
    try {
      await apiClient.put(`/api/admin/success-stories/images/${image.id}`, {
        imageUrl: image.imageUrl,
        caption: image.caption || '',
        displayOrder: targetOrder,
        isActive: isItemActive(image),
        active: isItemActive(image),
      })
      showAlert(`Image moved ${direction === -1 ? 'up' : 'down'}`)
      await fetchData()
    } catch (err) {
      showAlert(err?.message || 'Failed to reorder image', 'error')
    } finally {
      setReordering(false)
    }
  }

  const sortedImages = [...images].sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
  const sortedReels = [...reels].sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))

  return (
    <div>
      {/* View Toggle & Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-slate-900">Success Stories</h2>
          <p className="text-xs text-slate-500 mt-1">Manage success story images and Instagram reels.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveView('images')}
              className={`flex items-center gap-2 px-4 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                activeView === 'images' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <ImageIcon size={16} /> Images
            </button>
            <button
              onClick={() => setActiveView('reels')}
              className={`flex items-center gap-2 px-4 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                activeView === 'reels' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Video size={16} /> Reels
            </button>
          </div>

          <button
            onClick={activeView === 'images' ? openAddImageModal : openAddReelModal}
            className="inline-flex items-center gap-2 rounded-xl bg-[#084b66] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#073c52] transition cursor-pointer"
          >
            <Plus size={16} />
            <span>Add {activeView === 'images' ? 'Image' : 'Reel'}</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex py-12 justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-[#084b66]" />
        </div>
      ) : activeView === 'images' ? (
        // Images Grid
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {sortedImages.map((img, idx) => {
            const active = isItemActive(img)
            return (
              <div key={img.id} className={`rounded-xl border bg-white overflow-hidden shadow-xs transition ${!active ? 'opacity-65 border-slate-300 bg-slate-50/50' : 'border-slate-200 hover:shadow-md'}`}>
                <div className="aspect-[4/3] bg-slate-100 relative">
                  <img src={getImageUrl(img.imageUrl)} alt="Success Story" className="w-full h-full object-cover" />
                  
                  {/* IMAGE Badge */}
                  <div className="absolute top-2.5 left-2.5 rounded-md bg-[#084b66]/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-xs flex items-center gap-1 shadow-xs">
                    <ImageIcon size={11} />
                    <span>Image</span>
                  </div>

                  {/* Active Toggle Button */}
                  <button
                    type="button"
                    onClick={() => toggleImageStatus(img)}
                    className={`absolute top-2.5 right-2.5 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold shadow-xs transition cursor-pointer ${
                      active
                        ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border border-emerald-300'
                        : 'bg-slate-200 text-slate-700 hover:bg-slate-300 border border-slate-300'
                    }`}
                    title={active ? 'Click to deactivate' : 'Click to activate'}
                  >
                    {active ? <CheckCircle size={13} className="text-emerald-600" /> : <X size={13} className="text-slate-500" />}
                    <span>{active ? 'Active' : 'Inactive'}</span>
                  </button>
                </div>

                <div className="p-4">
                  <p className="text-sm font-medium text-slate-800 line-clamp-2 min-h-[40px]">{img.caption || 'No caption'}</p>
                  <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-slate-500">Order: {img.displayOrder}</span>
                      <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-0.5">
                        <button
                          type="button"
                          onClick={() => handleMoveImage(img, -1)}
                          disabled={idx === 0 || reordering}
                          className="p-1 rounded-md text-slate-600 hover:text-slate-900 hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition"
                          title={idx === 0 ? 'First image (cannot move up)' : 'Move Up'}
                          aria-label="Move Up"
                        >
                          <ArrowUp size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveImage(img, 1)}
                          disabled={idx === sortedImages.length - 1 || reordering}
                          className="p-1 rounded-md text-slate-600 hover:text-slate-900 hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition"
                          title={idx === sortedImages.length - 1 ? 'Last image (cannot move down)' : 'Move Down'}
                          aria-label="Move Down"
                        >
                          <ArrowDown size={13} />
                        </button>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => openEditImageModal(img)} className="p-1.5 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer" title="Edit Image">
                        <Edit2 size={14} />
                      </button>
                      <button onClick={() => deleteImage(img.id)} className="p-1.5 text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 rounded-lg cursor-pointer" title="Delete Image">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
          {sortedImages.length === 0 && (
            <div className="col-span-full py-12 text-center border-2 border-dashed border-slate-200 rounded-2xl">
              <ImageIcon size={48} className="mx-auto text-slate-300 mb-2" />
              <p className="text-slate-500 font-medium">No success story images found.</p>
            </div>
          )}
        </div>
      ) : (
        // Reels Grid
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {sortedReels.map((reel, idx) => {
            const active = isItemActive(reel)
            return (
              <div key={reel.id} className={`rounded-2xl border bg-white overflow-hidden shadow-xs transition flex flex-col justify-between ${!active ? 'opacity-70 border-slate-300 bg-slate-50/60' : 'border-slate-200 hover:shadow-md'}`}>
                {/* Header Badge & Active Toggle */}
                <div className="p-3 bg-slate-50/90 border-b border-slate-100 flex items-center justify-between gap-2">
                  <div className="rounded-full bg-gradient-to-r from-purple-600 via-pink-600 to-rose-500 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-white shadow-xs flex items-center gap-1.5">
                    <FaInstagram size={11} />
                    <span>Instagram Reel</span>
                  </div>

                  {/* Active Toggle Button */}
                  <button
                    type="button"
                    onClick={() => toggleReelStatus(reel)}
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold shadow-xs transition cursor-pointer ${
                      active
                        ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border border-emerald-300'
                        : 'bg-slate-200 text-slate-700 hover:bg-slate-300 border border-slate-300'
                    }`}
                    title={active ? 'Click to deactivate' : 'Click to activate'}
                  >
                    {active ? <CheckCircle size={12} className="text-emerald-600" /> : <X size={12} className="text-slate-500" />}
                    <span>{active ? 'Active' : 'Inactive'}</span>
                  </button>
                </div>

                {/* Actual Video Preview */}
                <div className="p-3 flex-1 flex flex-col justify-center items-center bg-slate-900/5">
                  <div className="w-full max-w-[240px] overflow-hidden rounded-xl shadow-xs">
                    <InstagramReelEmbed reelUrl={reel.reelUrl} title={reel.title} showViewMore={false} />
                  </div>
                </div>

                {/* Card Details & Actions */}
                <div className="p-4 bg-white border-t border-slate-100">
                  <h4 className="text-sm font-bold text-slate-900 line-clamp-1">
                    {reel.title || 'Untitled Instagram Reel'}
                  </h4>

                  <a
                    href={reel.reelUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-1.5 w-full justify-center px-3 py-1.5 rounded-lg bg-pink-50 hover:bg-pink-100 text-pink-700 hover:text-pink-800 text-xs font-semibold border border-pink-200/70 transition truncate group"
                    title={reel.reelUrl}
                  >
                    <FaInstagram size={13} className="shrink-0 text-pink-600" />
                    <span className="truncate">{reel.reelUrl}</span>
                    <ExternalLink size={12} className="shrink-0 text-pink-500 group-hover:translate-x-0.5 transition-transform" />
                  </a>

                  <div className="mt-3.5 flex items-center justify-between border-t border-slate-100 pt-3">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-slate-500">Order: {reel.displayOrder}</span>
                      <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-0.5">
                        <button
                          type="button"
                          onClick={() => handleMoveReel(reel, -1)}
                          disabled={idx === 0 || reordering}
                          className="p-1 rounded-md text-slate-600 hover:text-slate-900 hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
                          title={idx === 0 ? 'First reel (cannot move up)' : 'Move Up'}
                          aria-label="Move Up"
                        >
                          <ArrowUp size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveReel(reel, 1)}
                          disabled={idx === sortedReels.length - 1 || reordering}
                          className="p-1 rounded-md text-slate-600 hover:text-slate-900 hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
                          title={idx === sortedReels.length - 1 ? 'Last reel (cannot move down)' : 'Move Down'}
                          aria-label="Move Down"
                        >
                          <ArrowDown size={13} />
                        </button>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => openEditReelModal(reel)} className="p-1.5 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer" title="Edit Reel">
                        <Edit2 size={14} />
                      </button>
                      <button onClick={() => deleteReel(reel.id)} className="p-1.5 text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 rounded-lg cursor-pointer" title="Delete Reel">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
          {sortedReels.length === 0 && (
            <div className="col-span-full py-12 text-center border-2 border-dashed border-slate-200 rounded-2xl">
              <Video size={48} className="mx-auto text-slate-300 mb-2" />
              <p className="text-slate-500 font-medium">No Instagram reels found.</p>
            </div>
          )}
        </div>
      )}

      {/* MODALS */}
      
      {/* Image Modal */}
      {isImgModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between border-b px-5 py-4">
              <h3 className="font-bold text-lg">{editingImage ? 'Edit Image' : 'Add Image'}</h3>
              <button onClick={() => setIsImgModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
            </div>
            <form onSubmit={saveImage} className="p-5 overflow-y-auto space-y-4">
              
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Image</label>
                {imgForm.imageUrl ? (
                  <div className="relative rounded-lg overflow-hidden border">
                    <img src={getImageUrl(imgForm.imageUrl)} alt="Preview" className="w-full h-40 object-cover" />
                    <button type="button" onClick={() => setImgForm(p => ({...p, imageUrl: ''}))} className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-md shadow-sm"><X size={14}/></button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <ImageIcon className="w-8 h-8 text-slate-400 mb-2" />
                      <p className="text-sm text-slate-500">{uploadingImage ? 'Uploading...' : 'Click to upload image'}</p>
                    </div>
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploadingImage} />
                  </label>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Caption (Optional)</label>
                <input
                  type="text"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#084b66] focus:ring-1 focus:ring-[#084b66]"
                  value={imgForm.caption}
                  onChange={(e) => setImgForm(p => ({...p, caption: e.target.value}))}
                  placeholder="E.g., Placed at Google"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Display Order</label>
                  <input
                    type="number"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    value={imgForm.displayOrder}
                    onChange={(e) => setImgForm(p => ({...p, displayOrder: parseInt(e.target.value) || 0}))}
                  />
                </div>
                <div className="flex items-center pt-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="rounded text-[#084b66] focus:ring-[#084b66]"
                      checked={imgForm.isActive}
                      onChange={(e) => setImgForm(p => ({...p, isActive: e.target.checked}))}
                    />
                    <span className="text-sm font-medium text-slate-700">Active</span>
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t flex justify-end gap-3">
                <button type="button" onClick={() => setIsImgModalOpen(false)} className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
                <button type="submit" disabled={uploadingImage} className="px-4 py-2 text-sm font-semibold text-white bg-[#084b66] hover:bg-[#073c52] rounded-lg">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reel Modal */}
      {isReelModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between border-b px-5 py-4">
              <h3 className="font-bold text-lg">{editingReel ? 'Edit Reel' : 'Add Reel'}</h3>
              <button onClick={() => setIsReelModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
            </div>
            <form onSubmit={saveReel} className="p-5 overflow-y-auto space-y-4">
              
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Instagram Reel URL *</label>
                <input
                  type="url"
                  required
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#084b66] focus:ring-1 focus:ring-[#084b66]"
                  value={reelForm.reelUrl}
                  onChange={(e) => setReelForm(p => ({...p, reelUrl: e.target.value}))}
                  placeholder="https://www.instagram.com/reel/..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Title (Optional)</label>
                <input
                  type="text"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#084b66] focus:ring-1 focus:ring-[#084b66]"
                  value={reelForm.title}
                  onChange={(e) => setReelForm(p => ({...p, title: e.target.value}))}
                  placeholder="E.g., Student Review"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Display Order</label>
                  <input
                    type="number"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    value={reelForm.displayOrder}
                    onChange={(e) => setReelForm(p => ({...p, displayOrder: parseInt(e.target.value) || 0}))}
                  />
                </div>
                <div className="flex items-center pt-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="rounded text-[#084b66] focus:ring-[#084b66]"
                      checked={reelForm.isActive}
                      onChange={(e) => setReelForm(p => ({...p, isActive: e.target.checked}))}
                    />
                    <span className="text-sm font-medium text-slate-700">Active</span>
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t flex justify-end gap-3">
                <button type="button" onClick={() => setIsReelModalOpen(false)} className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 text-sm font-semibold text-white bg-[#084b66] hover:bg-[#073c52] rounded-lg">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
