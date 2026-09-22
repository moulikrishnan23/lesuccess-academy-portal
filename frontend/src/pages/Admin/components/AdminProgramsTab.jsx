import { useEffect, useState } from 'react'
import {
  Calendar,
  Clock,
  Video,
  Award,
  Plus,
  Trash2,
  Edit2,
  ExternalLink,
  X,
  Filter,
  MapPin,
  Upload,
  User,
  Image as ImageIcon,
  Loader2,
  Crop,
} from 'lucide-react'
import apiClient from '../../../services/apiClient.js'
import { uploadProgramImage } from '../../../services/upcomingProgramApi.js'
import { getImageUrl } from '../../../utils/imageUtils.js'
import ImageCropperModal from './ImageCropperModal.jsx'

export default function AdminProgramsTab({ showAlert }) {
  const [programs, setPrograms] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState('ALL') // 'ALL' | 'WEBINAR' | 'WORKSHOP' | 'INTERNSHIP'
  const [uploadingImage, setUploadingImage] = useState(false)

  // Cropper Modal State
  const [isCropModalOpen, setIsCropModalOpen] = useState(false)
  const [cropImageSource, setCropImageSource] = useState('')

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProgram, setEditingProgram] = useState(null)
  const [form, setForm] = useState({
    type: 'WEBINAR',
    mode: 'ONLINE', // 'ONLINE' | 'OFFLINE'
    title: '',
    topic: '',
    label: '',
    speakerName: '',
    imageUrl: '',
    eventDate: '',
    startTime: '10:00',
    endTime: '12:00',
    platform: 'Google Meet',
    meetLink: '',
    venueAddress: '',
    organizationName: '',
    venueName: '',
    certificateIncluded: false,
    isActive: true,
  })

  useEffect(() => {
    fetchPrograms()
  }, [])

  // Body scroll lock
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = 'unset'
      }
    }
  }, [isModalOpen])

  const fetchPrograms = async () => {
    setLoading(true)
    try {
      const { data } = await apiClient.get('/api/admin/upcoming-programs?size=100')
      let items = []
      if (Array.isArray(data?.data?.content)) {
        items = data.data.content
      } else if (Array.isArray(data?.data?.items)) {
        items = data.data.items
      } else if (Array.isArray(data?.data)) {
        items = data.data
      }
      setPrograms(items)
    } catch (err) {
      console.warn('Fallback to public /api/upcoming-programs:', err)
      try {
        const { data } = await apiClient.get('/api/upcoming-programs')
        const items = Array.isArray(data?.data) ? data.data : []
        setPrograms(items)
      } catch (pubErr) {
        showAlert?.('Failed to load programs list', 'error')
        setPrograms([])
      }
    } finally {
      setLoading(false)
    }
  }

  const openCreateModal = (defaultType = 'WEBINAR') => {
    setEditingProgram(null)
    const today = new Date().toLocaleDateString('en-CA')
    const defaultMode = defaultType === 'INTERNSHIP' ? 'OFFLINE' : 'ONLINE'
    setForm({
      type: defaultType,
      mode: defaultMode,
      title: '',
      topic: '',
      label: defaultType === 'WEBINAR' ? 'Free Webinar' : defaultType === 'WORKSHOP' ? 'Hands-on Workshop' : 'Internship Program',
      speakerName: '',
      imageUrl: '',
      eventDate: today,
      startTime: '10:00',
      endTime: '12:00',
      platform: defaultMode === 'ONLINE' ? 'Google Meet' : 'LeSuccess Campus',
      meetLink: '',
      venueAddress: defaultMode === 'OFFLINE' ? 'LeSuccess Academy, Chennai' : '',
      organizationName: defaultMode === 'OFFLINE' ? 'LeSuccess Academy' : '',
      venueName: defaultMode === 'OFFLINE' ? 'LeSuccess Campus' : '',
      certificateIncluded: defaultType !== 'WEBINAR',
      isActive: true,
    })
    setIsModalOpen(true)
  }

  const openEditModal = (prog) => {
    setEditingProgram(prog)
    const progMode = prog.mode || (prog.type === 'INTERNSHIP' ? 'OFFLINE' : 'ONLINE')
    const imgVal = prog.imageUrl || prog.image || ''
    const safeImg = typeof imgVal === 'string' ? imgVal : (imgVal?.url || '')
    setForm({
      type: prog.type,
      mode: progMode,
      title: prog.title || '',
      topic: prog.topic || '',
      label: prog.label || '',
      speakerName: prog.speakerName || prog.trainerName || '',
      imageUrl: safeImg,
      eventDate: prog.eventDate || '',
      startTime: prog.startTime ? prog.startTime.substring(0, 5) : '',
      endTime: prog.endTime ? prog.endTime.substring(0, 5) : '',
      platform: prog.platform || (progMode === 'ONLINE' ? 'Google Meet' : 'LeSuccess Campus'),
      meetLink: prog.meetLink || '',
      venueAddress: prog.venueAddress || '',
      organizationName: prog.organizationName || '',
      venueName: prog.venueName || '',
      certificateIncluded: Boolean(prog.certificateIncluded),
      isActive: prog.isActive !== undefined ? Boolean(prog.isActive) : Boolean(prog.active),
    })
    setIsModalOpen(true)
  }

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const validTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!validTypes.includes(file.type)) {
      showAlert?.('Please select a JPG, PNG, or WebP image file', 'error')
      e.target.value = ''
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      showAlert?.('Image size must be less than 5MB', 'error')
      e.target.value = ''
      return
    }

    const objectUrl = URL.createObjectURL(file)
    setCropImageSource(objectUrl)
    setIsCropModalOpen(true)
    e.target.value = ''
  }

  const openCropForExistingImage = async () => {
    if (!form.imageUrl) return
    const resolvedUrl = getImageUrl(form.imageUrl)
    try {
      const res = await apiClient.get(resolvedUrl, { responseType: 'blob' })
      const blobUrl = URL.createObjectURL(res.data)
      setCropImageSource(blobUrl)
      setIsCropModalOpen(true)
    } catch (err) {
      console.warn('Blob fetch failed, falling back to direct URL:', err)
      setCropImageSource(resolvedUrl)
      setIsCropModalOpen(true)
    }
  }

  const handleApplyCroppedImage = async (croppedFile) => {
    setUploadingImage(true)
    try {
      const res = await uploadProgramImage(croppedFile)
      const url = res?.url || (typeof res === 'string' ? res : '')
      if (url) {
        setForm((prev) => ({ ...prev, imageUrl: url }))
        showAlert?.('Photo framed and saved successfully')
        setIsCropModalOpen(false)
      }
    } catch (err) {
      console.warn('Program upload failed, falling back to gallery upload:', err)
      try {
        const formData = new FormData()
        formData.append('file', croppedFile)
        const { data } = await apiClient.post('/api/admin/gallery/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        const uploadedUrl = data?.data?.url || (typeof data?.data === 'string' ? data.data : '')
        if (uploadedUrl) {
          setForm((prev) => ({ ...prev, imageUrl: uploadedUrl }))
          showAlert?.('Photo framed and saved successfully')
          setIsCropModalOpen(false)
        }
      } catch (fallbackErr) {
        showAlert?.(fallbackErr?.response?.data?.message || 'Failed to upload photo', 'error')
      }
    } finally {
      setUploadingImage(false)
    }
  }

  const handleRemoveImage = () => {
    setForm((prev) => ({ ...prev, imageUrl: '' }))
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.title.trim() || !form.topic.trim() || !form.eventDate) {
      showAlert?.('Title, Topic and Event Date are required', 'error')
      return
    }

    if (form.mode === 'ONLINE' && !form.meetLink?.trim()) {
      showAlert?.('Google Meet Link is required for Online programs', 'error')
      return
    }
    if (form.mode === 'OFFLINE' && !form.venueAddress?.trim()) {
      showAlert?.('Venue Address is required for Offline programs', 'error')
      return
    }

    const payload = {
      ...form,
      speakerName: form.speakerName?.trim() || null,
      imageUrl: form.imageUrl?.trim() || null,
      label: form.label?.trim() || null,
      organizationName: form.organizationName?.trim() || null,
      venueName: form.venueName?.trim() || null,
      platform: form.platform?.trim() || null,
      meetLink: form.mode === 'ONLINE' ? form.meetLink?.trim() || null : null,
      venueAddress: form.mode === 'OFFLINE' ? form.venueAddress?.trim() || null : null,
      startTime: form.startTime && form.startTime.length === 5 ? `${form.startTime}:00` : form.startTime,
      endTime: form.endTime && form.endTime.length === 5 ? `${form.endTime}:00` : form.endTime,
      isActive: Boolean(form.isActive),
      active: Boolean(form.isActive),
    }

    try {
      if (editingProgram) {
        await apiClient.put(`/api/admin/upcoming-programs/${editingProgram.id}`, payload)
        showAlert?.('Program updated successfully')
      } else {
        await apiClient.post('/api/admin/upcoming-programs', payload)
        showAlert?.('Program scheduled successfully')
      }
      setIsModalOpen(false)
      fetchPrograms()
    } catch (err) {
      const fieldMsg = err.response?.data?.errors?.[0]?.message
      const msg = fieldMsg || err.response?.data?.message || 'Failed to save program'
      showAlert?.(msg, 'error')
    }
  }

  const handleDelete = async (prog) => {
    if (!window.confirm(`Are you sure you want to delete "${prog.title}"?`)) return
    try {
      await apiClient.delete(`/api/admin/upcoming-programs/${prog.id}`)
      showAlert?.('Program deleted')
      fetchPrograms()
    } catch (err) {
      showAlert?.('Failed to delete program', 'error')
    }
  }

  const filtered = filterType === 'ALL' ? programs : programs.filter((p) => p.type === filterType)

  return (
    <div>
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Programs & Events</h2>
          <p className="text-sm text-slate-500">Manage Webinars, Workshops, and Internship programs displayed on the website.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center rounded-xl border border-slate-200 bg-white p-1 text-xs font-medium text-slate-600 shadow-xs">
            <Filter size={14} className="ml-2 text-slate-400" />
            {['ALL', 'WEBINAR', 'WORKSHOP', 'INTERNSHIP'].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setFilterType(t)}
                className={`rounded-lg px-2.5 py-1 transition cursor-pointer ${
                  filterType === t ? 'bg-[#07405C] text-white font-semibold' : 'hover:bg-slate-100'
                }`}
              >
                {t === 'ALL' ? 'All' : t.charAt(0) + t.slice(1).toLowerCase()}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => openCreateModal(filterType === 'ALL' ? 'WEBINAR' : filterType)}
            className="inline-flex items-center gap-2 rounded-xl bg-[#07405C] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#024D72] transition cursor-pointer"
          >
            <Plus size={18} />
            <span>Add Event</span>
          </button>
        </div>
      </div>

      {/* Programs Cards / Table */}
      {loading ? (
        <div className="flex min-h-[300px] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-[#07405C]" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <Calendar size={44} className="mx-auto text-slate-400 mb-3" />
          <h3 className="text-base font-bold text-slate-800">No programs found</h3>
          <p className="text-sm text-slate-500 mt-1">Schedule an upcoming webinar, workshop, or internship.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((p) => {
            const badgeBg =
              p.type === 'WEBINAR'
                ? 'bg-blue-100 text-blue-800 border-blue-200'
                : p.type === 'WORKSHOP'
                ? 'bg-amber-100 text-amber-800 border-amber-200'
                : 'bg-emerald-100 text-emerald-800 border-emerald-200'

            const isOffline = (p.mode || '').toUpperCase() === 'OFFLINE'

            return (
              <div
                key={p.id}
                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-xs transition hover:border-[#07405C]/40 hover:shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider ${badgeBg}`}>
                        {p.label || p.type}
                      </span>
                      <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-bold ${
                        isOffline ? 'bg-amber-50 text-amber-900 border-amber-200' : 'bg-blue-50 text-[#07405C] border-blue-200'
                      }`}>
                        {isOffline ? <MapPin size={11} /> : <Video size={11} />}
                        <span>{isOffline ? 'Offline' : 'Online'}</span>
                      </span>
                    </div>

                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${
                        (p.isActive !== undefined ? p.isActive : p.active) ? 'text-emerald-700 bg-emerald-50' : 'text-slate-500 bg-slate-100'
                      }`}
                    >
                      {(p.isActive !== undefined ? p.isActive : p.active) ? 'Active' : 'Draft'}
                    </span>
                  </div>

                  <h3 className="font-display text-base font-bold text-slate-900 line-clamp-1">{p.title}</h3>
                  <p className="mt-1 text-sm font-medium text-slate-600 line-clamp-2">{p.topic}</p>

                  {/* Speaker / Program Visual info */}
                  {(p.speakerName || p.imageUrl) && (
                    <div className="mt-3 flex items-center gap-2.5 rounded-xl bg-slate-50 p-2 border border-slate-100">
                      {p.imageUrl ? (
                        <img
                          src={getImageUrl(p.imageUrl)}
                          alt={p.speakerName || 'Program visual'}
                          className="h-8 w-8 rounded-lg object-cover border border-slate-200 shrink-0"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                          }}
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-lg bg-[#07405C]/10 text-[#07405C] flex items-center justify-center text-xs font-bold shrink-0">
                          {p.speakerName ? p.speakerName.charAt(0).toUpperCase() : <User size={14} />}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-slate-800 truncate">
                          {p.speakerName || (p.type === 'INTERNSHIP' ? 'Internship Program' : 'Featured Speaker')}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {p.type === 'WORKSHOP' ? 'Lead Trainer' : p.type === 'INTERNSHIP' ? 'Internship Visual' : 'Speaker'}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="mt-4 space-y-2 border-t border-slate-100 pt-4 text-xs text-slate-500">
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-[#07405C]" />
                      <span>{p.eventDate}</span>
                      {p.startTime && (
                        <>
                          <span className="text-slate-300">•</span>
                          <Clock size={14} className="text-[#07405C]" />
                          <span>{p.startTime.substring(0, 5)} {p.endTime ? `- ${p.endTime.substring(0, 5)}` : ''}</span>
                        </>
                      )}
                    </div>

                    {isOffline ? (
                      <div className="flex items-start gap-2 text-slate-600">
                        <MapPin size={14} className="text-[#DF1E26] shrink-0 mt-0.5" />
                        <span className="line-clamp-2">{p.venueAddress || 'Venue: LeSuccess Campus'}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-slate-600">
                        <Video size={14} className="text-[#07405C] shrink-0" />
                        <span>{p.platform || 'Google Meet'}</span>
                      </div>
                    )}

                    {p.certificateIncluded && (
                      <div className="flex items-center gap-2 text-emerald-700 font-medium">
                        <Award size={14} />
                        <span>Certificate Included</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
                  {!isOffline && p.meetLink ? (
                    <a
                      href={p.meetLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[#07405C] hover:underline"
                    >
                      <span>Join Meet</span>
                      <ExternalLink size={12} />
                    </a>
                  ) : isOffline ? (
                    <span className="text-xs text-slate-600 font-medium truncate max-w-[160px]" title={p.venueAddress}>
                      📍 {p.venueAddress || 'In-Person Venue'}
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400 italic">No link</span>
                  )}

                  <div className="inline-flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => openEditModal(p)}
                      className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-[#07405C] transition cursor-pointer"
                      title="Edit Event"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(p)}
                      className="rounded-lg p-1.5 text-slate-500 hover:bg-red-50 hover:text-[#DF1E26] transition cursor-pointer"
                      title="Delete Event"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Program Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="relative w-full max-w-xl rounded-2xl bg-white shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
            {/* Fixed Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white shrink-0">
              <h3 className="text-lg font-bold text-slate-900">
                {editingProgram ? 'Edit Program' : 'Schedule New Event'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Form wrapper */}
            <form onSubmit={handleSave} className="flex flex-col flex-1 overflow-hidden">
              {/* Internal Scrollable Body */}
              <div className="p-6 overflow-y-auto flex-1 overscroll-contain space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                      Program Type *
                    </label>
                    <select
                      value={form.type}
                      onChange={(e) => setForm({ ...form, type: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-[#07405C] focus:outline-none bg-white"
                    >
                      <option value="WEBINAR">Webinar</option>
                      <option value="WORKSHOP">Workshop</option>
                      <option value="INTERNSHIP">Internship</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                      Display Label (Pill)
                    </label>
                    <input
                      type="text"
                      value={form.label}
                      onChange={(e) => setForm({ ...form, label: e.target.value })}
                      placeholder="e.g. Free Webinar"
                      className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-[#07405C] focus:outline-none focus:ring-1 focus:ring-[#07405C]"
                    />
                  </div>
                </div>

                {/* Mode Selector */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                    Event Mode *
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, mode: 'ONLINE', platform: form.platform || 'Google Meet' })}
                      className={`flex items-center justify-center gap-2 rounded-xl border p-2.5 text-xs font-bold transition cursor-pointer ${
                        form.mode === 'ONLINE'
                          ? 'border-[#07405C] bg-[#07405C] text-white shadow-xs'
                          : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <Video size={14} />
                      <span>Online (Google Meet)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, mode: 'OFFLINE', platform: form.platform || 'LeSuccess Campus' })}
                      className={`flex items-center justify-center gap-2 rounded-xl border p-2.5 text-xs font-bold transition cursor-pointer ${
                        form.mode === 'OFFLINE'
                          ? 'border-[#07405C] bg-[#07405C] text-white shadow-xs'
                          : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <MapPin size={14} />
                      <span>Offline (Venue)</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="e.g. Master Full Stack with Python"
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-[#07405C] focus:outline-none focus:ring-1 focus:ring-[#07405C]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                    Topic / Subtitle *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.topic}
                    onChange={(e) => setForm({ ...form, topic: e.target.value })}
                    placeholder="e.g. Hands-on coding session with Industry Experts"
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-[#07405C] focus:outline-none focus:ring-1 focus:ring-[#07405C]"
                  />
                </div>

                {/* Dynamic Speaker / Trainer / Program Visual Section */}
                <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#07405C] flex items-center gap-1.5">
                      {form.type === 'INTERNSHIP' ? (
                        <>
                          <ImageIcon size={14} />
                          <span>Internship Details & Visual</span>
                        </>
                      ) : (
                        <>
                          <User size={14} />
                          <span>{form.type === 'WORKSHOP' ? 'Workshop Trainer' : 'Webinar Speaker'}</span>
                        </>
                      )}
                    </span>
                    {form.type === 'INTERNSHIP' && (
                      <span className="text-[11px] font-medium text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                        Speaker photo not required
                      </span>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                      {form.type === 'WEBINAR'
                        ? 'Speaker Name & Title'
                        : form.type === 'WORKSHOP'
                        ? 'Trainer Name & Title'
                        : 'Program Coordinator / Mentor (Optional)'}
                    </label>
                    <input
                      type="text"
                      value={form.speakerName}
                      onChange={(e) => setForm({ ...form, speakerName: e.target.value })}
                      placeholder={
                        form.type === 'WEBINAR'
                          ? 'e.g. Dr. Rajesh Kumar, Lead AI Architect'
                          : form.type === 'WORKSHOP'
                          ? 'e.g. Priya Sundaram, Senior Full Stack Trainer'
                          : 'e.g. LeSuccess Industry Mentorship Team'
                      }
                      className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm focus:border-[#07405C] focus:outline-none focus:ring-1 focus:ring-[#07405C]"
                    />
                  </div>

                  {/* Image Upload Area */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                      {form.type === 'INTERNSHIP' ? 'Program Banner / Tech Logo (Optional)' : 'Speaker / Trainer Photo'}
                    </label>

                    {form.imageUrl ? (
                      <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                            Current Image (4:3 Card Frame)
                          </span>
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700">
                            ✓ Attached
                          </span>
                        </div>

                        {/* Framed 4:3 Card Preview matching public card */}
                        <div className="relative mx-auto w-full max-w-sm aspect-[4/3] rounded-xl overflow-hidden border border-slate-300 bg-slate-900 shadow-md group">
                          <img
                            src={getImageUrl(form.imageUrl)}
                            alt="Current program visual"
                            className="h-full w-full object-cover object-center"
                            onError={(e) => {
                              e.currentTarget.src = '/home/team/dummy.png'
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                            <span className="text-xs font-semibold text-white truncate">{form.imageUrl}</span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                          <button
                            type="button"
                            onClick={openCropForExistingImage}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-[#07405C] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#024D72] transition cursor-pointer"
                            title="Crop & Adjust Framing"
                          >
                            <Crop size={14} />
                            <span>Crop / Adjust Image</span>
                          </button>
                          <label className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition cursor-pointer shadow-2xs">
                            <Upload size={14} />
                            <span>Replace Image</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleImageUpload}
                              disabled={uploadingImage}
                              className="hidden"
                            />
                          </label>
                          <button
                            type="button"
                            onClick={handleRemoveImage}
                            className="inline-flex items-center gap-1 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-100 transition cursor-pointer"
                            title="Remove Image"
                          >
                            <Trash2 size={14} />
                            <span>Remove</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-white p-4 hover:border-[#07405C] transition cursor-pointer text-center group">
                        {uploadingImage ? (
                          <div className="flex items-center gap-2 text-xs text-[#07405C] font-semibold">
                            <Loader2 size={16} className="animate-spin" />
                            <span>Uploading image...</span>
                          </div>
                        ) : (
                          <>
                            <Upload size={20} className="text-slate-400 group-hover:text-[#07405C] transition mb-1" />
                            <span className="text-xs font-semibold text-slate-700">
                              {form.type === 'INTERNSHIP'
                                ? 'Upload Optional Program Banner or Logo'
                                : 'Upload Speaker / Trainer Photo'}
                            </span>
                            <span className="text-[10px] text-slate-400 mt-0.5">PNG, JPG or WebP (max 5MB)</span>
                          </>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          disabled={uploadingImage}
                          className="hidden"
                        />
                      </label>
                    )}
                    {form.type === 'INTERNSHIP' && (
                      <p className="text-[11px] text-slate-400 mt-1">
                        Note: Internships render modern tech gradients and company branding automatically. No person photo is needed.
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                      Event Date *
                    </label>
                    <input
                      type="date"
                      required
                      min={new Date().toLocaleDateString('en-CA')}
                      value={form.eventDate}
                      onChange={(e) => setForm({ ...form, eventDate: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-[#07405C] focus:outline-none focus:ring-1 focus:ring-[#07405C]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                      Start Time
                    </label>
                    <input
                      type="time"
                      value={form.startTime}
                      onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-[#07405C] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                      End Time
                    </label>
                    <input
                      type="time"
                      value={form.endTime}
                      onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-[#07405C] focus:outline-none"
                    />
                  </div>
                </div>

                {/* Conditional Fields based on Mode */}
                {form.mode === 'ONLINE' ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                        Google Meet Link *
                      </label>
                      <input
                        type="url"
                        required
                        value={form.meetLink}
                        onChange={(e) => setForm({ ...form, meetLink: e.target.value })}
                        placeholder="https://meet.google.com/xyz-abcd-efg"
                        className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-[#07405C] focus:outline-none focus:ring-1 focus:ring-[#07405C]"
                      />
                      <p className="text-[11px] text-slate-400 mt-1">Learners can click "Join Google Meet" directly on the website.</p>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                        Platform Name
                      </label>
                      <input
                        type="text"
                        value={form.platform}
                        onChange={(e) => setForm({ ...form, platform: e.target.value })}
                        placeholder="Google Meet"
                        className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-[#07405C] focus:outline-none focus:ring-1 focus:ring-[#07405C]"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                        Organization / Company Name
                      </label>
                      <input
                        type="text"
                        value={form.organizationName}
                        onChange={(e) => setForm({ ...form, organizationName: e.target.value })}
                        placeholder="e.g. ABC Technologies Pvt Ltd"
                        className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-[#07405C] focus:outline-none focus:ring-1 focus:ring-[#07405C]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                        Venue / Hall Name
                      </label>
                      <input
                        type="text"
                        value={form.venueName}
                        onChange={(e) => setForm({ ...form, venueName: e.target.value })}
                        placeholder="e.g. ABC Technologies Main Campus"
                        className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-[#07405C] focus:outline-none focus:ring-1 focus:ring-[#07405C]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                        Venue Address *
                      </label>
                      <input
                        type="text"
                        required
                        value={form.venueAddress}
                        onChange={(e) => setForm({ ...form, venueAddress: e.target.value })}
                        placeholder="e.g. 2nd Floor, Anna Nagar, Chennai - 600040"
                        className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-[#07405C] focus:outline-none focus:ring-1 focus:ring-[#07405C]"
                      />
                      <p className="text-[11px] text-slate-400 mt-1">Full postal address shown to learners on the website.</p>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                        Campus / Hall Name (short)
                      </label>
                      <input
                        type="text"
                        value={form.platform}
                        onChange={(e) => setForm({ ...form, platform: e.target.value })}
                        placeholder="e.g. LeSuccess Main Campus"
                        className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-[#07405C] focus:outline-none focus:ring-1 focus:ring-[#07405C]"
                      />
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-6 pt-2">
                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.certificateIncluded}
                      onChange={(e) => setForm({ ...form, certificateIncluded: e.target.checked })}
                      className="h-4 w-4 rounded border-slate-300 text-[#07405C] focus:ring-[#07405C]"
                    />
                    <span className="text-xs font-semibold text-slate-700">Certificate Included</span>
                  </label>

                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.isActive}
                      onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                      className="h-4 w-4 rounded border-slate-300 text-[#07405C] focus:ring-[#07405C]"
                    />
                    <span className="text-xs font-semibold text-slate-700">Visible on Site</span>
                  </label>
                </div>
              </div>

              {/* Fixed Footer */}
              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#07405C] px-5 py-2 text-sm font-semibold text-white hover:bg-[#024D72] transition shadow-sm cursor-pointer"
                >
                  {editingProgram ? 'Update Event' : 'Schedule Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Interactive Crop & Editing Modal */}
      <ImageCropperModal
        isOpen={isCropModalOpen}
        imageSrc={cropImageSource}
        speakerName={form.speakerName || 'Speaker Name'}
        programTitle={form.title || 'Upcoming Event'}
        onClose={() => setIsCropModalOpen(false)}
        onApply={handleApplyCroppedImage}
        uploading={uploadingImage}
      />
    </div>
  )
}
