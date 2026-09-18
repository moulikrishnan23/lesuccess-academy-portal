import { useEffect, useState } from 'react'
import { Plus, Edit2, Trash2, BookOpen, ExternalLink, Check, X } from 'lucide-react'
import apiClient from '../../../services/apiClient.js'
import CourseBadge from '../../../components/ui/CourseBadge.jsx'

export default function AdminCoursesTab({ showAlert }) {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCourse, setEditingCourse] = useState(null)
  const [form, setForm] = useState({
    name: '',
    shortDescription: '',
    durationMonths: 3,
    mode: 'BOTH',
    badge: '',
    badgeText: '',
    placementAssistance: true,
    syllabusUrl: '',
    enrollUrl: '',
    displayOrder: 0,
    isActive: true,
  })

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    setLoading(true)
    try {
      const { data } = await apiClient.get('/api/admin/courses?size=100')
      let items = []
      if (Array.isArray(data?.data?.content)) {
        items = data.data.content
      } else if (Array.isArray(data?.data?.items)) {
        items = data.data.items
      } else if (Array.isArray(data?.data)) {
        items = data.data
      }
      setCourses(items)
    } catch (err) {
      console.warn('Fallback to public /api/courses:', err)
      try {
        const { data } = await apiClient.get('/api/courses')
        const items = Array.isArray(data?.data) ? data.data : []
        setCourses(items)
      } catch (pubErr) {
        showAlert?.('Failed to load courses', 'error')
        setCourses([])
      }
    } finally {
      setLoading(false)
    }
  }

  const openCreateModal = () => {
    setEditingCourse(null)
    setForm({
      name: '',
      shortDescription: '',
      durationMonths: 3,
      mode: 'BOTH',
      badge: '',
      badgeText: '',
      placementAssistance: true,
      syllabusUrl: '',
      enrollUrl: '',
      displayOrder: courses.length + 1,
      isActive: true,
    })
    setIsModalOpen(true)
  }

  const openEditModal = (c) => {
    setEditingCourse(c)
    setForm({
      name: c.name || c.title || '',
      shortDescription: c.shortDescription || '',
      durationMonths: c.durationMonths || c.durationValue || 3,
      mode: c.mode || 'BOTH',
      badge: c.badge || '',
      badgeText: c.badgeText || c.badgeLabel || '',
      placementAssistance: Boolean(c.placementAssistance),
      syllabusUrl: c.syllabusUrl || '',
      enrollUrl: c.enrollUrl || '',
      displayOrder: c.displayOrder || 0,
      isActive: c.isActive !== false,
    })
    setIsModalOpen(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) {
      showAlert?.('Course name is required', 'error')
      return
    }

    const payload = {
      name: form.name.trim(),
      shortDescription: form.shortDescription.trim(),
      durationMonths: Number(form.durationMonths) || null,
      mode: form.mode,
      badge: form.badge ? form.badge : null,
      badgeText: form.badgeText.trim() ? form.badgeText.trim() : null,
      placementAssistance: Boolean(form.placementAssistance),
      syllabusUrl: form.syllabusUrl.trim() || null,
      enrollUrl: form.enrollUrl.trim() || null,
      displayOrder: Number(form.displayOrder) || 0,
      isActive: Boolean(form.isActive),
    }

    try {
      if (editingCourse) {
        await apiClient.put(`/api/admin/courses/${editingCourse.id}`, payload)
        showAlert?.('Course updated successfully')
      } else {
        await apiClient.post('/api/admin/courses', payload)
        showAlert?.('Course created successfully')
      }
      setIsModalOpen(false)
      fetchCourses()
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save course'
      showAlert?.(msg, 'error')
    }
  }

  const handleDelete = async (course) => {
    if (!window.confirm(`Are you sure you want to delete course "${course.name || course.title}"?`)) {
      return
    }
    try {
      await apiClient.delete(`/api/admin/courses/${course.id}`)
      showAlert?.('Course deleted')
      fetchCourses()
    } catch (err) {
      showAlert?.('Failed to delete course', 'error')
    }
  }

  return (
    <div>
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Courses Management</h2>
          <p className="text-sm text-slate-500">Manage course catalog, badges, and details displayed across the website.</p>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 rounded-xl bg-[#084b66] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#063c52] transition"
        >
          <Plus size={18} />
          <span>Add Course</span>
        </button>
      </div>

      {/* Courses List */}
      {loading ? (
        <div className="flex min-h-[300px] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-[#084b66]" />
        </div>
      ) : !Array.isArray(courses) || courses.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <BookOpen size={44} className="mx-auto text-slate-400 mb-3" />
          <h3 className="text-base font-bold text-slate-800">No courses found</h3>
          <p className="text-sm text-slate-500 mt-1">Get started by creating your first course.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3.5">Course Name</th>
                  <th className="px-6 py-3.5">Badge</th>
                  <th className="px-6 py-3.5">Duration</th>
                  <th className="px-6 py-3.5">Mode</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {Array.isArray(courses) && courses.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/70 transition">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">{c.name || c.title}</div>
                      <div className="text-xs text-slate-400 line-clamp-1 max-w-sm mt-0.5">
                        {c.shortDescription || 'No description provided'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {c.badge || c.badgeText || c.badgeLabel ? (
                        <CourseBadge badge={c.badge} badgeText={c.badgeText || c.badgeLabel} />
                      ) : (
                        <span className="text-xs text-slate-400 italic">None</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-700">
                      {c.durationMonths || c.durationValue ? `${c.durationMonths || c.durationValue} months` : 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700">
                        {c.mode || 'BOTH'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          c.isActive !== false ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {c.isActive !== false ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => openEditModal(c)}
                          className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-[#084b66] transition"
                          title="Edit Course"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(c)}
                          className="rounded-lg p-1.5 text-slate-500 hover:bg-red-50 hover:text-red-600 transition"
                          title="Delete Course"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Course Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-2xl bg-white p-6 sm:p-8 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-6">
              <h3 className="text-lg font-bold text-slate-900">
                {editingCourse ? 'Edit Course' : 'Create New Course'}
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
                  Course Name *
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Python : Full Stack Development"
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-[#084b66] focus:outline-none focus:ring-1 focus:ring-[#084b66]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                  Short Description
                </label>
                <textarea
                  rows={2}
                  value={form.shortDescription}
                  onChange={(e) => setForm({ ...form, shortDescription: e.target.value })}
                  placeholder="Brief summary displayed on course card..."
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-[#084b66] focus:outline-none focus:ring-1 focus:ring-[#084b66]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                    Duration (Months)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="48"
                    value={form.durationMonths}
                    onChange={(e) => setForm({ ...form, durationMonths: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-[#084b66] focus:outline-none focus:ring-1 focus:ring-[#084b66]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                    Learning Mode
                  </label>
                  <select
                    value={form.mode}
                    onChange={(e) => setForm({ ...form, mode: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-[#084b66] focus:outline-none focus:ring-1 focus:ring-[#084b66]"
                  >
                    <option value="BOTH">Offline / Online (Both)</option>
                    <option value="OFFLINE">Offline Only</option>
                    <option value="ONLINE">Online Only</option>
                  </select>
                </div>
              </div>

              {/* Badges Section */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-[#084b66]">
                  Course Badge / Pill Label
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Badge Style
                    </label>
                    <select
                      value={form.badge}
                      onChange={(e) => setForm({ ...form, badge: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm focus:border-[#084b66] focus:outline-none"
                    >
                      <option value="">No Badge</option>
                      <option value="HIGH_DEMAND">High Demand (Green)</option>
                      <option value="OFFER">Offer / 30% Offer (Pink/Red)</option>
                      <option value="BEST_SELLER">Best Seller (Yellow/Amber)</option>
                      <option value="MOST_ENROLLED">Most Enrolled (Blue)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Custom Badge Text (Optional)
                    </label>
                    <input
                      type="text"
                      value={form.badgeText}
                      onChange={(e) => setForm({ ...form, badgeText: e.target.value })}
                      placeholder="e.g. 30% Offer, High-demand"
                      className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm focus:border-[#084b66] focus:outline-none"
                    />
                  </div>
                </div>

                {(form.badge || form.badgeText) && (
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-xs text-slate-500">Live Preview:</span>
                    <CourseBadge badge={form.badge} badgeText={form.badgeText} />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={form.displayOrder}
                    onChange={(e) => setForm({ ...form, displayOrder: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-[#084b66] focus:outline-none focus:ring-1 focus:ring-[#084b66]"
                  />
                </div>

                <div className="flex flex-col justify-end space-y-2 pt-2">
                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.placementAssistance}
                      onChange={(e) => setForm({ ...form, placementAssistance: e.target.checked })}
                      className="h-4 w-4 rounded border-slate-300 text-[#084b66] focus:ring-[#084b66]"
                    />
                    <span className="text-xs font-semibold text-slate-700">Placement Assistance Included</span>
                  </label>

                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.isActive}
                      onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                      className="h-4 w-4 rounded border-slate-300 text-[#084b66] focus:ring-[#084b66]"
                    />
                    <span className="text-xs font-semibold text-slate-700">Course is Active / Visible</span>
                  </label>
                </div>
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
                  {editingCourse ? 'Update Course' : 'Create Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
