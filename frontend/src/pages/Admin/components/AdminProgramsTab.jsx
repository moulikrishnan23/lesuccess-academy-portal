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
} from 'lucide-react'
import apiClient from '../../../services/apiClient.js'

export default function AdminProgramsTab({ showAlert }) {
  const [programs, setPrograms] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState('ALL') // 'ALL' | 'WEBINAR' | 'WORKSHOP' | 'INTERNSHIP'

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProgram, setEditingProgram] = useState(null)
  const [form, setForm] = useState({
    type: 'WEBINAR',
    title: '',
    topic: '',
    label: '',
    eventDate: '',
    startTime: '10:00',
    endTime: '12:00',
    platform: 'Google Meet',
    meetLink: '',
    certificateIncluded: false,
    isActive: true,
  })

  useEffect(() => {
    fetchPrograms()
  }, [])

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
    const today = new Date().toISOString().split('T')[0]
    setForm({
      type: defaultType,
      title: '',
      topic: '',
      label: defaultType === 'WEBINAR' ? 'Free Webinar' : defaultType === 'WORKSHOP' ? 'Hands-on Workshop' : 'Internship Program',
      eventDate: today,
      startTime: '10:00',
      endTime: '12:00',
      platform: defaultType === 'INTERNSHIP' ? 'LeSuccess Campus' : 'Google Meet',
      meetLink: '',
      certificateIncluded: defaultType !== 'WEBINAR',
      isActive: true,
    })
    setIsModalOpen(true)
  }

  const openEditModal = (prog) => {
    setEditingProgram(prog)
    setForm({
      type: prog.type,
      title: prog.title || '',
      topic: prog.topic || '',
      label: prog.label || '',
      eventDate: prog.eventDate || '',
      startTime: prog.startTime ? prog.startTime.substring(0, 5) : '',
      endTime: prog.endTime ? prog.endTime.substring(0, 5) : '',
      platform: prog.platform || '',
      meetLink: prog.meetLink || '',
      certificateIncluded: Boolean(prog.certificateIncluded),
      isActive: Boolean(prog.isActive),
    })
    setIsModalOpen(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.title.trim() || !form.topic.trim() || !form.eventDate) {
      showAlert?.('Title, Topic and Event Date are required', 'error')
      return
    }

    const payload = {
      ...form,
      startTime: form.startTime.length === 5 ? `${form.startTime}:00` : form.startTime,
      endTime: form.endTime && form.endTime.length === 5 ? `${form.endTime}:00` : form.endTime,
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
      const msg = err.response?.data?.message || 'Failed to save program'
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
                className={`rounded-lg px-2.5 py-1 transition ${
                  filterType === t ? 'bg-[#084b66] text-white font-semibold' : 'hover:bg-slate-100'
                }`}
              >
                {t === 'ALL' ? 'All' : t.charAt(0) + t.slice(1).toLowerCase()}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => openCreateModal(filterType === 'ALL' ? 'WEBINAR' : filterType)}
            className="inline-flex items-center gap-2 rounded-xl bg-[#084b66] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#063c52] transition"
          >
            <Plus size={18} />
            <span>Add Event</span>
          </button>
        </div>
      </div>

      {/* Programs Cards / Table */}
      {loading ? (
        <div className="flex min-h-[300px] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-[#084b66]" />
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

            return (
              <div
                key={p.id}
                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-xs transition hover:border-[#084b66]/40 hover:shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider ${badgeBg}`}>
                      {p.label || p.type}
                    </span>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${
                        p.isActive ? 'text-emerald-700 bg-emerald-50' : 'text-slate-500 bg-slate-100'
                      }`}
                    >
                      {p.isActive ? 'Active' : 'Draft'}
                    </span>
                  </div>

                  <h3 className="font-display text-base font-bold text-slate-900 line-clamp-1">{p.title}</h3>
                  <p className="mt-1 text-sm font-medium text-slate-600 line-clamp-2">{p.topic}</p>

                  <div className="mt-4 space-y-2 border-t border-slate-100 pt-4 text-xs text-slate-500">
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-[#084b66]" />
                      <span>{p.eventDate}</span>
                      {p.startTime && (
                        <>
                          <span className="text-slate-300">•</span>
                          <Clock size={14} className="text-[#084b66]" />
                          <span>{p.startTime.substring(0, 5)} {p.endTime ? `- ${p.endTime.substring(0, 5)}` : ''}</span>
                        </>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Video size={14} className="text-[#084b66]" />
                      <span>{p.platform || 'Online'}</span>
                    </div>

                    {p.certificateIncluded && (
                      <div className="flex items-center gap-2 text-emerald-700">
                        <Award size={14} />
                        <span>Certificate Included</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
                  {p.meetLink ? (
                    <a
                      href={p.meetLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[#084b66] hover:underline"
                    >
                      <span>Join Link</span>
                      <ExternalLink size={12} />
                    </a>
                  ) : (
                    <span className="text-xs text-slate-400 italic">No link</span>
                  )}

                  <div className="inline-flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => openEditModal(p)}
                      className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-[#084b66] transition"
                      title="Edit Event"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(p)}
                      className="rounded-lg p-1.5 text-slate-500 hover:bg-red-50 hover:text-red-600 transition"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 sm:p-8 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-6">
              <h3 className="text-lg font-bold text-slate-900">
                {editingProgram ? 'Edit Program' : 'Schedule New Event'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                  Program Type *
                </label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-[#084b66] focus:outline-none"
                >
                  <option value="WEBINAR">Webinar</option>
                  <option value="WORKSHOP">Workshop</option>
                  <option value="INTERNSHIP">Internship</option>
                </select>
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
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-[#084b66] focus:outline-none focus:ring-1 focus:ring-[#084b66]"
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
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-[#084b66] focus:outline-none focus:ring-1 focus:ring-[#084b66]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                    Display Label (Pill)
                  </label>
                  <input
                    type="text"
                    value={form.label}
                    onChange={(e) => setForm({ ...form, label: e.target.value })}
                    placeholder="e.g. Free Webinar"
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-[#084b66] focus:outline-none focus:ring-1 focus:ring-[#084b66]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                    Event Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={form.eventDate}
                    onChange={(e) => setForm({ ...form, eventDate: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-[#084b66] focus:outline-none focus:ring-1 focus:ring-[#084b66]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={form.startTime}
                    onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-[#084b66] focus:outline-none"
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
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-[#084b66] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                    Platform
                  </label>
                  <input
                    type="text"
                    value={form.platform}
                    onChange={(e) => setForm({ ...form, platform: e.target.value })}
                    placeholder="e.g. Google Meet, Zoom"
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-[#084b66] focus:outline-none focus:ring-1 focus:ring-[#084b66]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                    Meeting / Registration Link
                  </label>
                  <input
                    type="url"
                    value={form.meetLink}
                    onChange={(e) => setForm({ ...form, meetLink: e.target.value })}
                    placeholder="https://..."
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-[#084b66] focus:outline-none focus:ring-1 focus:ring-[#084b66]"
                  />
                </div>
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.certificateIncluded}
                    onChange={(e) => setForm({ ...form, certificateIncluded: e.target.checked })}
                    className="h-4 w-4 rounded border-slate-300 text-[#084b66] focus:ring-[#084b66]"
                  />
                  <span className="text-xs font-semibold text-slate-700">Certificate Included</span>
                </label>

                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                    className="h-4 w-4 rounded border-slate-300 text-[#084b66] focus:ring-[#084b66]"
                  />
                  <span className="text-xs font-semibold text-slate-700">Visible on Site</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#084b66] px-5 py-2 text-sm font-semibold text-white hover:bg-[#063c52] transition shadow-sm"
                >
                  {editingProgram ? 'Update Event' : 'Schedule Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
