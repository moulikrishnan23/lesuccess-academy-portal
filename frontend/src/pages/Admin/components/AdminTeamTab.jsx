import { useEffect, useState } from 'react'
import { Plus, Edit2, Trash2, Users, Upload, X, Star } from 'lucide-react'
import apiClient from '../../../services/apiClient.js'
import { getImageUrl } from '../../../utils/imageUtils.js'

export default function AdminTeamTab({ showAlert }) {
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingMember, setEditingMember] = useState(null)
  const [uploadingImage, setUploadingImage] = useState(false)

  const [form, setForm] = useState({
    name: '',
    role: '',
    email: '',
    imageUrl: '',
    isFeatured: false,
    displayOrder: 0,
    isActive: true,
  })

  useEffect(() => {
    fetchMembers()
  }, [])

  const fetchMembers = async () => {
    setLoading(true)
    try {
      const { data } = await apiClient.get('/api/admin/team-members')
      setMembers(data?.data || [])
    } catch (err) {
      console.warn('Fallback to public /api/team-members:', err)
      try {
        const { data } = await apiClient.get('/api/team-members')
        setMembers(data?.data || [])
      } catch (pubErr) {
        showAlert?.('Failed to load team members', 'error')
      }
    } finally {
      setLoading(false)
    }
  }

  const openCreateModal = () => {
    setEditingMember(null)
    setForm({
      name: '',
      role: '',
      email: '',
      imageUrl: '',
      isFeatured: false,
      displayOrder: members.length + 1,
      isActive: true,
    })
    setIsModalOpen(true)
  }

  const openEditModal = (m) => {
    setEditingMember(m)
    const imgVal = m.image || m.imageUrl || ''
    const safeImg = typeof imgVal === 'string' ? imgVal : (imgVal?.url || '')
    setForm({
      name: m.name || '',
      role: m.role || '',
      email: m.email || '',
      imageUrl: safeImg,
      isFeatured: Boolean(m.featured || m.isFeatured),
      displayOrder: m.displayOrder || 0,
      isActive: m.isActive !== false,
    })
    setIsModalOpen(true)
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)
    setUploadingImage(true)

    try {
      const { data } = await apiClient.post('/api/admin/gallery/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      const uploadedUrl = data?.data?.url || (typeof data?.data === 'string' ? data.data : '')
      if (uploadedUrl) {
        setForm((prev) => ({ ...prev, imageUrl: uploadedUrl }))
        showAlert?.('Photo uploaded successfully')
      }
    } catch (err) {
      showAlert?.('Failed to upload image', 'error')
    } finally {
      setUploadingImage(false)
      e.target.value = ''
    }
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.name.trim() || !form.role.trim() || !form.email.trim()) {
      showAlert?.('Name, Role, and Email are required', 'error')
      return
    }

    const rawImg = typeof form.imageUrl === 'string' ? form.imageUrl.trim() : (form.imageUrl?.url || '')
    const payload = {
      name: form.name.trim(),
      role: form.role.trim(),
      email: form.email.trim(),
      imageUrl: rawImg || '/home/team/dummy.png',
      isFeatured: Boolean(form.isFeatured),
      displayOrder: Number(form.displayOrder) || 0,
      isActive: Boolean(form.isActive),
    }

    try {
      if (editingMember) {
        await apiClient.put(`/api/admin/team-members/${editingMember.id}`, payload)
        showAlert?.('Team member updated successfully')
      } else {
        await apiClient.post('/api/admin/team-members', payload)
        showAlert?.('Team member added successfully')
      }
      setIsModalOpen(false)
      fetchMembers()
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save team member'
      showAlert?.(msg, 'error')
    }
  }

  const handleDelete = async (m) => {
    if (!window.confirm(`Are you sure you want to remove ${m.name}?`)) return
    try {
      await apiClient.delete(`/api/admin/team-members/${m.id}`)
      showAlert?.('Team member removed')
      fetchMembers()
    } catch (err) {
      showAlert?.('Failed to delete member', 'error')
    }
  }

  return (
    <div>
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Team Members Management</h2>
          <p className="text-sm text-slate-500">
            Manage leadership and team profiles displayed in the "Our Team" section.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 rounded-xl bg-[#084b66] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#063c52] transition"
        >
          <Plus size={18} />
          <span>Add Team Member</span>
        </button>
      </div>

      {/* Members Grid */}
      {loading ? (
        <div className="flex min-h-[300px] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-[#084b66]" />
        </div>
      ) : members.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <Users size={44} className="mx-auto text-slate-400 mb-3" />
          <h3 className="text-base font-bold text-slate-800">No team members found</h3>
          <p className="text-sm text-slate-500 mt-1">Add your leadership and faculty profiles.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {members.map((m) => (
            <div
              key={m.id}
              className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs transition hover:border-[#084b66]/40 hover:shadow-md"
            >
              {/* Photo Area with TeamBg Treatment */}
              <div
                className="relative aspect-383/400 w-full overflow-hidden bg-cover bg-center bg-no-repeat flex items-center justify-center"
                style={{ backgroundImage: "url('/home/TeamBg.png')" }}
              >
                <img
                  src={getImageUrl(m.image || m.imageUrl, '/home/team/dummy.png')}
                  alt={m.name || 'Team member'}
                  className="h-full w-full object-contain"
                  onError={(e) => {
                    e.target.src = '/home/team/dummy.png'
                  }}
                />
                {Boolean(m.featured || m.isFeatured) && (
                  <div className="absolute top-3 left-3 rounded-full bg-amber-400/90 text-amber-950 px-2.5 py-0.5 text-xs font-bold flex items-center gap-1 shadow-xs">
                    <Star size={12} fill="currentColor" />
                    <span>Featured</span>
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="p-4">
                <h3 className="font-bold text-slate-900 text-base line-clamp-1">{m.name}</h3>
                <p className="text-xs font-medium text-[#084b66] line-clamp-1 mt-0.5">{m.role}</p>
                <p className="text-xs text-slate-400 truncate mt-2">{m.email}</p>

                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${
                      m.isActive !== false ? 'text-emerald-700 bg-emerald-50' : 'text-slate-400 bg-slate-100'
                    }`}
                  >
                    {m.isActive !== false ? 'Active' : 'Hidden'}
                  </span>

                  <div className="inline-flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => openEditModal(m)}
                      className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-[#084b66] transition"
                      title="Edit Member"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(m)}
                      className="rounded-lg p-1.5 text-slate-500 hover:bg-red-50 hover:text-red-600 transition"
                      title="Delete Member"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Member Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 sm:p-8 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-6">
              <h3 className="text-lg font-bold text-slate-900">
                {editingMember ? 'Edit Team Member' : 'Add Team Member'}
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
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Rathinavel Rajagopal"
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-[#084b66] focus:outline-none focus:ring-1 focus:ring-[#084b66]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                  Designation / Role *
                </label>
                <input
                  type="text"
                  required
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  placeholder="e.g. Director, Senior Mentor"
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-[#084b66] focus:outline-none focus:ring-1 focus:ring-[#084b66]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="name@lesuccess.in"
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-[#084b66] focus:outline-none focus:ring-1 focus:ring-[#084b66]"
                />
              </div>

              {/* Photo upload / URL */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                  Profile Photo (URL or Upload)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={form.imageUrl}
                    onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                    placeholder="/home/team/... or https://..."
                    className="flex-1 rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-[#084b66] focus:outline-none"
                  />
                  <label className="inline-flex items-center gap-1.5 cursor-pointer rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition">
                    <Upload size={14} />
                    <span>{uploadingImage ? '...' : 'Upload'}</span>
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                  </label>
                </div>
                {Boolean(form.imageUrl) && (
                  <div className="mt-2 flex items-center gap-3">
                    <div
                      className="h-12 w-12 overflow-hidden rounded-lg bg-cover bg-center border border-slate-200"
                      style={{ backgroundImage: "url('/home/TeamBg.png')" }}
                    >
                      <img
                        src={getImageUrl(form.imageUrl, '/home/team/dummy.png')}
                        alt="Preview"
                        className="h-full w-full object-contain"
                        onError={(e) => {
                          e.target.src = '/home/team/dummy.png'
                        }}
                      />
                    </div>
                    <span className="text-xs text-slate-400 truncate max-w-xs">
                      {typeof form.imageUrl === 'string' ? form.imageUrl : (form.imageUrl?.url || '')}
                    </span>
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
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-[#084b66] focus:outline-none"
                  />
                </div>

                <div className="flex flex-col justify-end space-y-2 pt-2">
                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.isFeatured}
                      onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                      className="h-4 w-4 rounded border-slate-300 text-[#084b66] focus:ring-[#084b66]"
                    />
                    <span className="text-xs font-semibold text-slate-700">Featured (Top Row)</span>
                  </label>

                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.isActive}
                      onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                      className="h-4 w-4 rounded border-slate-300 text-[#084b66] focus:ring-[#084b66]"
                    />
                    <span className="text-xs font-semibold text-slate-700">Profile Active</span>
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
                  {editingMember ? 'Update Profile' : 'Add Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
