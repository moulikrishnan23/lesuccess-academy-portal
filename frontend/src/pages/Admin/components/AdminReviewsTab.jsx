import { useState, useEffect } from 'react'
import {
  Star,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  RefreshCw,
  Search,
  X,
  MessageSquare,
} from 'lucide-react'
import apiClient from '../../../services/apiClient.js'

export default function AdminReviewsTab({ showAlert }) {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingReview, setEditingReview] = useState(null)
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState({
    studentName: '',
    rating: 5,
    source: 'Google',
    reviewDate: 'Recently',
    reviewerRole: '1 review',
    reviewText: '',
    likesCount: 0,
    isActive: true,
  })

  const fetchReviews = async () => {
    setLoading(true)
    try {
      const res = await apiClient.get('/api/admin/testimonials')
      const data = res?.data?.data || res?.data
      if (Array.isArray(data)) {
        setReviews(data)
      } else {
        setReviews([])
      }
    } catch (err) {
      if (showAlert) showAlert('Failed to load testimonials', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReviews()
  }, [])

  const openCreateModal = () => {
    setEditingReview(null)
    setForm({
      studentName: '',
      rating: 5,
      source: 'Google',
      reviewDate: 'Recently',
      reviewerRole: '1 review',
      reviewText: '',
      likesCount: 0,
      isActive: true,
    })
    setIsModalOpen(true)
  }

  const openEditModal = (review) => {
    setEditingReview(review)
    setForm({
      studentName: review.studentName || '',
      rating: review.rating || 5,
      source: review.source || 'Google',
      reviewDate: review.reviewDate || 'Recently',
      reviewerRole: review.reviewerRole || '1 review',
      reviewText: review.reviewText || '',
      likesCount: review.likesCount || 0,
      isActive: review.isActive !== undefined ? review.isActive : true,
    })
    setIsModalOpen(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.studentName.trim() || !form.reviewText.trim()) {
      if (showAlert) showAlert('Name and review text are required', 'error')
      return
    }

    setSaving(true)
    try {
      const payload = {
        studentName: form.studentName.trim(),
        rating: Number(form.rating) || 5,
        source: form.source.trim() || 'Google',
        reviewDate: form.reviewDate.trim() || 'Recently',
        reviewerRole: form.reviewerRole.trim() || '1 review',
        reviewText: form.reviewText.trim(),
        likesCount: Number(form.likesCount) || 0,
        isActive: form.isActive,
      }

      if (editingReview) {
        await apiClient.put(`/api/admin/testimonials/${editingReview.id}`, payload)
        if (showAlert) showAlert('Review updated successfully')
      } else {
        await apiClient.post('/api/admin/testimonials', payload)
        if (showAlert) showAlert('New review added successfully')
      }
      setIsModalOpen(false)
      fetchReviews()
    } catch (err) {
      if (showAlert) showAlert(err?.message || 'Failed to save review', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return
    try {
      await apiClient.delete(`/api/admin/testimonials/${id}`)
      if (showAlert) showAlert('Review deleted successfully')
      fetchReviews()
    } catch (err) {
      if (showAlert) showAlert('Failed to delete review', 'error')
    }
  }

  const handleToggleStatus = async (review) => {
    try {
      const updated = {
        studentName: review.studentName,
        rating: review.rating,
        source: review.source,
        reviewDate: review.reviewDate,
        reviewerRole: review.reviewerRole,
        reviewText: review.reviewText,
        likesCount: review.likesCount,
        isActive: !review.isActive,
      }
      await apiClient.put(`/api/admin/testimonials/${review.id}`, updated)
      if (showAlert) showAlert(`Review marked as ${!review.isActive ? 'Active' : 'Inactive'}`)
      fetchReviews()
    } catch (err) {
      if (showAlert) showAlert('Failed to toggle review status', 'error')
    }
  }

  const filtered = reviews.filter((r) => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (
      (r.studentName || '').toLowerCase().includes(q) ||
      (r.reviewText || '').toLowerCase().includes(q) ||
      (r.source || '').toLowerCase().includes(q)
    )
  })

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Testimonials & Reviews Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage student Google reviews and website testimonials shown on the public landing page.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchReviews}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition cursor-pointer"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#084b66] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#073c52] transition cursor-pointer"
          >
            <Plus size={15} />
            <span>Add Review</span>
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative w-full sm:w-80">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search reviews by name or text..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-10 pr-4 text-xs text-slate-800 placeholder-slate-400 focus:border-[#084b66] focus:outline-none focus:ring-1 focus:ring-[#084b66]"
        />
      </div>

      {/* Reviews Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Reviewer Name</th>
                <th className="px-5 py-3.5">Rating</th>
                <th className="px-5 py-3.5">Source</th>
                <th className="px-5 py-3.5">Date</th>
                <th className="px-5 py-3.5">Role / Badge</th>
                <th className="px-5 py-3.5 max-w-sm">Review Text</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <RefreshCw size={24} className="mx-auto animate-spin text-[#084b66] mb-2" />
                    Loading reviews...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No reviews found.
                  </td>
                </tr>
              ) : (
                filtered.map((rev) => (
                  <tr key={rev.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-3.5 font-bold text-slate-900">{rev.studentName}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex text-[#ffb800]">
                        {[...Array(rev.rating || 5)].map((_, i) => (
                          <Star key={i} size={13} fill="#ffb800" stroke="#ffb800" />
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                        {rev.source || 'Google'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-500">{rev.reviewDate || 'Recently'}</td>
                    <td className="px-5 py-3.5 text-slate-600">{rev.reviewerRole || '1 review'}</td>
                    <td className="px-5 py-3.5 max-w-xs truncate text-slate-600 italic">
                      &ldquo;{rev.reviewText}&rdquo;
                    </td>
                    <td className="px-5 py-3.5">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(rev)}
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold transition cursor-pointer ${
                          rev.isActive
                            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                        }`}
                      >
                        {rev.isActive ? <CheckCircle size={11} /> : <XCircle size={11} />}
                        <span>{rev.isActive ? 'Active' : 'Inactive'}</span>
                      </button>
                    </td>
                    <td className="px-5 py-3.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEditModal(rev)}
                          className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition cursor-pointer"
                          title="Edit Review"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(rev.id)}
                          className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-50 transition cursor-pointer"
                          title="Delete Review"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Review Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white p-6 sm:p-8 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">
                {editingReview ? 'Edit Review' : 'Add New Review'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Reviewer Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Shalini Shalini"
                  value={form.studentName}
                  onChange={(e) => setForm({ ...form, studentName: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-slate-800 focus:border-[#084b66] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Rating (1 to 5)</label>
                  <select
                    value={form.rating}
                    onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-slate-800 focus:border-[#084b66] focus:outline-none"
                  >
                    <option value={5}>5 Stars</option>
                    <option value={4}>4 Stars</option>
                    <option value={3}>3 Stars</option>
                    <option value={2}>2 Stars</option>
                    <option value={1}>1 Star</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Source</label>
                  <select
                    value={form.source}
                    onChange={(e) => setForm({ ...form, source: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-slate-800 focus:border-[#084b66] focus:outline-none"
                  >
                    <option value="Google">Google</option>
                    <option value="Website">Website</option>
                    <option value="LinkedIn">LinkedIn</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Review Date</label>
                  <input
                    type="text"
                    placeholder="e.g. 3 months ago"
                    value={form.reviewDate}
                    onChange={(e) => setForm({ ...form, reviewDate: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-slate-800 focus:border-[#084b66] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Reviewer Role / Count</label>
                  <input
                    type="text"
                    placeholder="e.g. 1 review or Full Stack Java"
                    value={form.reviewerRole}
                    onChange={(e) => setForm({ ...form, reviewerRole: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-slate-800 focus:border-[#084b66] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Review Text *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Student testimonial feedback..."
                  value={form.reviewText}
                  onChange={(e) => setForm({ ...form, reviewText: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-slate-800 focus:border-[#084b66] focus:outline-none resize-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="revIsActive"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  className="h-4 w-4 rounded border-slate-300 text-[#084b66] focus:ring-[#084b66]"
                />
                <label htmlFor="revIsActive" className="text-slate-700 font-medium cursor-pointer">
                  Active (Display publicly on website)
                </label>
              </div>

              <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-[#084b66] px-5 py-2 text-xs font-bold text-white hover:bg-[#073c52] shadow-sm disabled:opacity-60"
                >
                  {saving ? 'Saving...' : editingReview ? 'Save Changes' : 'Add Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
