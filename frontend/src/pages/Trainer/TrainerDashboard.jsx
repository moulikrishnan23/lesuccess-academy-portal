import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Calendar,
  Clock,
  Video,
  Award,
  Plus,
  Trash2,
  Edit2,
  ExternalLink,
  LogOut,
  X,
  CheckCircle,
  Filter,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import apiClient from '../../services/apiClient.js'

export default function TrainerDashboard() {
  const { user, logout } = useAuth()

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

  // Alert State
  const [alert, setAlert] = useState(null)

  useEffect(() => {
    fetchPrograms()
  }, [])

  const showAlert = (message, type = 'success') => {
    setAlert({ message, type })
    setTimeout(() => setAlert(null), 4000)
  }

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
        showAlert('Failed to load programs list', 'error')
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

  const handleSaveProgram = async (e) => {
    e.preventDefault()
    if (!form.title.trim() || !form.eventDate) return

    const payload = {
      type: form.type,
      title: form.title.trim(),
      topic: form.topic.trim() || null,
      label: form.label.trim() || null,
      eventDate: form.eventDate,
      startTime: form.startTime ? `${form.startTime}:00` : null,
      endTime: form.endTime ? `${form.endTime}:00` : null,
      platform: form.platform.trim() || null,
      meetLink: form.meetLink.trim() || null,
      certificateIncluded: form.certificateIncluded,
      isActive: form.isActive,
    }

    try {
      if (editingProgram) {
        await apiClient.put(`/api/admin/upcoming-programs/${editingProgram.id}`, payload)
        showAlert(`Program "${payload.title}" updated successfully!`)
      } else {
        await apiClient.post('/api/admin/upcoming-programs', payload)
        showAlert(`New ${payload.type} "${payload.title}" created successfully!`)
      }
      setIsModalOpen(false)
      fetchPrograms()
    } catch (err) {
      const msg = err?.fieldErrors
        ? Object.values(err.fieldErrors).join(', ')
        : err?.message || 'Failed to save program'
      showAlert(msg, 'error')
    }
  }

  const handleDeleteProgram = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return

    try {
      await apiClient.delete(`/api/admin/upcoming-programs/${id}`)
      showAlert(`Program "${title}" deleted successfully`)
      fetchPrograms()
    } catch (err) {
      showAlert('Failed to delete program', 'error')
    }
  }

  const filteredPrograms =
    filterType === 'ALL'
      ? programs
      : programs.filter((p) => String(p.type).toUpperCase() === filterType)

  return (
    <div className="min-h-screen bg-slate-50">
      {/* =====================================================
          TOP NAVIGATION BAR
      ===================================================== */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white shadow-xs">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <span className="rounded-lg bg-[#e51d48] px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">
              Trainer Portal
            </span>
            <span className="font-display text-lg font-bold text-slate-800">
              Webinars, Workshops & Internships
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              to="/#programs"
              target="_blank"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-[#084b66] transition"
            >
              <span>View on Home Page</span>
              <ExternalLink size={14} />
            </Link>

            <div className="hidden sm:block text-right">
              <p className="text-xs font-bold text-slate-800">{user?.fullName || 'Lead Trainer'}</p>
              <p className="text-[11px] text-slate-400">{user?.email}</p>
            </div>

            <button
              type="button"
              onClick={logout}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
            >
              <LogOut size={14} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Alert */}
        {alert && (
          <div
            className={`mb-6 flex items-center justify-between rounded-xl p-4 text-sm font-medium ${
              alert.type === 'error'
                ? 'bg-red-50 text-red-700 border border-red-200'
                : 'bg-green-50 text-green-700 border border-green-200'
            }`}
          >
            <span>{alert.message}</span>
            <button type="button" onClick={() => setAlert(null)}>
              <X size={16} />
            </button>
          </div>
        )}

        {/* Dashboard Title & Actions */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-slate-900">
              Upcoming Programs Management
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Add or update live training events. Changes will immediately appear on the website Home Page.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => openCreateModal('WEBINAR')}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#084b66] px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#073c52] transition"
            >
              <Plus size={15} />
              <span>Add Webinar</span>
            </button>
            <button
              type="button"
              onClick={() => openCreateModal('WORKSHOP')}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#e51d48] px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#c70f44] transition"
            >
              <Plus size={15} />
              <span>Add Workshop</span>
            </button>
            <button
              type="button"
              onClick={() => openCreateModal('INTERNSHIP')}
              className="inline-flex items-center gap-1.5 rounded-xl bg-amber-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-amber-700 transition"
            >
              <Plus size={15} />
              <span>Add Internship</span>
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6 flex items-center gap-2 border-b border-slate-200 pb-3">
          <Filter size={16} className="text-slate-400 mr-1" />
          {['ALL', 'WEBINAR', 'WORKSHOP', 'INTERNSHIP'].map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setFilterType(type)}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition ${
                filterType === type
                  ? 'bg-[#084b66] text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              {type === 'ALL' ? 'All Programs' : type.charAt(0) + type.slice(1).toLowerCase() + 's'}
            </button>
          ))}
        </div>

        {/* Programs Table / Cards */}
        {loading ? (
          <div className="flex min-h-[30vh] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-[#084b66]" />
          </div>
        ) : filteredPrograms.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <Calendar size={48} className="mx-auto text-slate-300 mb-3" />
            <h3 className="text-base font-bold text-slate-700">No programs found</h3>
            <p className="text-xs text-slate-500 mt-1">
              Add a new Webinar, Workshop, or Internship to see it here and on the Home Page.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {filteredPrograms.map((prog) => (
              <div
                key={prog.id}
                className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition hover:shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`rounded-md px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        prog.type === 'WEBINAR'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : prog.type === 'WORKSHOP'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {prog.type}
                    </span>

                    <span
                      className={`h-2.5 w-2.5 rounded-full ${
                        prog.isActive ? 'bg-green-500' : 'bg-slate-300'
                      }`}
                      title={prog.isActive ? 'Active on Home Page' : 'Inactive'}
                    />
                  </div>

                  <h3 className="mt-3 font-display text-base font-bold text-slate-900 line-clamp-1">
                    {prog.title}
                  </h3>
                  {prog.topic && (
                    <p className="mt-1 line-clamp-2 text-xs text-slate-500">{prog.topic}</p>
                  )}

                  <div className="mt-4 space-y-1.5 border-t border-slate-100 pt-3 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-slate-400" />
                      <span>{prog.eventDate}</span>
                    </div>

                    {(prog.startTime || prog.endTime) && (
                      <div className="flex items-center gap-2">
                        <Clock size={14} className="text-slate-400" />
                        <span>
                          {prog.startTime ? prog.startTime.substring(0, 5) : ''}
                          {prog.endTime ? ` - ${prog.endTime.substring(0, 5)}` : ''}
                        </span>
                      </div>
                    )}

                    {prog.platform && (
                      <div className="flex items-center gap-2">
                        <Video size={14} className="text-slate-400" />
                        <span>{prog.platform}</span>
                      </div>
                    )}

                    {prog.certificateIncluded && (
                      <div className="flex items-center gap-2 text-amber-700 font-medium">
                        <Award size={14} />
                        <span>Certificate Included</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-end gap-1.5 border-t border-slate-100 pt-3">
                  <button
                    type="button"
                    onClick={() => openEditModal(prog)}
                    title="Edit Program"
                    className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteProgram(prog.id, prog.title)}
                    title="Delete Program"
                    className="rounded-lg p-1.5 text-red-500 hover:bg-red-50 hover:text-red-700 transition"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* =====================================================
          PROGRAM MODAL: ADD / EDIT
      ===================================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="absolute right-5 top-5 text-slate-400 hover:text-slate-600"
            >
              <X size={20} />
            </button>

            <h3 className="font-display text-xl font-bold text-[#084b66]">
              {editingProgram ? 'Edit Training Program' : 'Add New Training Program'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              This event will automatically be presented to learners on the Home Page.
            </p>

            <form onSubmit={handleSaveProgram} className="mt-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Program Type *
                  </label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm focus:border-[#084b66] focus:outline-none"
                  >
                    <option value="WEBINAR">Webinar</option>
                    <option value="WORKSHOP">Workshop</option>
                    <option value="INTERNSHIP">Internship</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Badge / Label
                  </label>
                  <input
                    type="text"
                    value={form.label}
                    onChange={(e) => setForm({ ...form, label: e.target.value })}
                    placeholder="e.g. Free Webinar"
                    className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm focus:border-[#084b66] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Program Title *
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Full Stack Developer Interview Masterclass"
                  required
                  className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm focus:border-[#084b66] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Topic / Summary
                </label>
                <textarea
                  rows={2}
                  value={form.topic}
                  onChange={(e) => setForm({ ...form, topic: e.target.value })}
                  placeholder="Brief description of the topics covered in this session"
                  className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:border-[#084b66] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Event Date *
                  </label>
                  <input
                    type="date"
                    value={form.eventDate}
                    onChange={(e) => setForm({ ...form, eventDate: e.target.value })}
                    required
                    className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm focus:border-[#084b66] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={form.startTime}
                    onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                    className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm focus:border-[#084b66] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={form.endTime}
                    onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                    className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm focus:border-[#084b66] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Platform / Location
                  </label>
                  <input
                    type="text"
                    value={form.platform}
                    onChange={(e) => setForm({ ...form, platform: e.target.value })}
                    placeholder="e.g. Google Meet, LeSuccess Campus"
                    className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm focus:border-[#084b66] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Meet / Registration Link
                  </label>
                  <input
                    type="url"
                    value={form.meetLink}
                    onChange={(e) => setForm({ ...form, meetLink: e.target.value })}
                    placeholder="https://meet.google.com/..."
                    className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm focus:border-[#084b66] focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-6 pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={form.certificateIncluded}
                    onChange={(e) => setForm({ ...form, certificateIncluded: e.target.checked })}
                    className="h-4 w-4 rounded-md border-slate-300 text-[#084b66]"
                  />
                  <span>Certificate Included</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                    className="h-4 w-4 rounded-md border-slate-300 text-[#084b66]"
                  />
                  <span>Publish / Active on Home Page</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-[#084b66] px-5 py-2 text-xs font-semibold text-white hover:bg-[#073c52]"
                >
                  Save Program
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
