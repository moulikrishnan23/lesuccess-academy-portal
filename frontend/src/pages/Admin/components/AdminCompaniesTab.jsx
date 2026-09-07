import { useEffect, useState } from 'react'
import { Plus, Edit2, Trash2, Building2, Upload, X } from 'lucide-react'
import apiClient from '../../../services/apiClient.js'
import { getImageUrl } from '../../../utils/imageUtils.js'

export default function AdminCompaniesTab({ showAlert }) {
  const [companies, setCompanies] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCompany, setEditingCompany] = useState(null)
  const [uploadingLogo, setUploadingLogo] = useState(false)

  const [form, setForm] = useState({
    name: '',
    logoUrl: '',
    rowNumber: 1,
    displayOrder: 0,
    isActive: true,
  })

  useEffect(() => {
    fetchCompanies()
  }, [])

  const fetchCompanies = async () => {
    setLoading(true)
    try {
      const { data } = await apiClient.get('/api/admin/companies')
      setCompanies(data?.data || [])
    } catch (err) {
      console.warn('Fallback to public /api/companies:', err)
      try {
        const { data } = await apiClient.get('/api/companies')
        setCompanies(data?.data || [])
      } catch (pubErr) {
        showAlert?.('Failed to load companies', 'error')
      }
    } finally {
      setLoading(false)
    }
  }

  const openCreateModal = (row = 1) => {
    setEditingCompany(null)
    setForm({
      name: '',
      logoUrl: '',
      rowNumber: row,
      displayOrder: companies.length + 1,
      isActive: true,
    })
    setIsModalOpen(true)
  }

  const openEditModal = (c) => {
    setEditingCompany(c)
    setForm({
      name: c.name || '',
      logoUrl: c.logo || c.logoUrl || '',
      rowNumber: c.rowNumber || 1,
      displayOrder: c.displayOrder || 0,
      isActive: c.isActive !== false,
    })
    setIsModalOpen(true)
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)
    setUploadingLogo(true)

    try {
      const { data } = await apiClient.post('/api/admin/gallery/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      const uploadedUrl = data?.data?.url || (typeof data?.data === 'string' ? data.data : '')
      if (uploadedUrl) {
        setForm((prev) => ({ ...prev, logoUrl: uploadedUrl }))
        showAlert?.('Logo uploaded successfully')
      }
    } catch (err) {
      showAlert?.('Failed to upload logo', 'error')
    } finally {
      setUploadingLogo(false)
      e.target.value = ''
    }
  }

  const handleSave = async (e) => {
    e.preventDefault()
    const rawLogo = typeof form.logoUrl === 'string' ? form.logoUrl.trim() : (form.logoUrl?.url || '')
    if (!form.name.trim() || !rawLogo) {
      showAlert?.('Company Name and Logo are required', 'error')
      return
    }

    const payload = {
      name: form.name.trim(),
      logoUrl: rawLogo,
      rowNumber: Number(form.rowNumber) || 1,
      displayOrder: Number(form.displayOrder) || 0,
      isActive: Boolean(form.isActive),
    }

    try {
      if (editingCompany) {
        await apiClient.put(`/api/admin/companies/${editingCompany.id}`, payload)
        showAlert?.('Company partner updated successfully')
      } else {
        await apiClient.post('/api/admin/companies', payload)
        showAlert?.('Company partner added successfully')
      }
      setIsModalOpen(false)
      fetchCompanies()
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save company'
      showAlert?.(msg, 'error')
    }
  }

  const handleDelete = async (c) => {
    if (!window.confirm(`Are you sure you want to remove ${c.name}?`)) return
    try {
      await apiClient.delete(`/api/admin/companies/${c.id}`)
      showAlert?.('Company removed')
      fetchCompanies()
    } catch (err) {
      showAlert?.('Failed to delete company', 'error')
    }
  }

  const row1Companies = companies.filter((c) => (c.rowNumber || 1) === 1)
  const row2Companies = companies.filter((c) => c.rowNumber === 2)

  return (
    <div>
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Placement Companies & Partners</h2>
          <p className="text-sm text-slate-500">
            Manage company logos appearing in the "Choose Your Path / Where Students Work" marquee rows.
          </p>
        </div>
        <button
          type="button"
          onClick={() => openCreateModal(1)}
          className="inline-flex items-center gap-2 rounded-xl bg-[#084b66] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#063c52] transition"
        >
          <Plus size={18} />
          <span>Add Company</span>
        </button>
      </div>

      {loading ? (
        <div className="flex min-h-[300px] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-[#084b66]" />
        </div>
      ) : companies.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <Building2 size={44} className="mx-auto text-slate-400 mb-3" />
          <h3 className="text-base font-bold text-slate-800">No companies added yet</h3>
          <p className="text-sm text-slate-500 mt-1">Add placement partner logos to show in the marquee.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Row 1 */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#084b66] flex items-center gap-2">
                <span>Row 1 (Scrolls Left)</span>
                <span className="rounded-full bg-slate-100 text-slate-600 px-2 py-0.5 text-xs font-semibold">
                  {row1Companies.length}
                </span>
              </h3>
              <button
                type="button"
                onClick={() => openCreateModal(1)}
                className="text-xs font-semibold text-[#084b66] hover:underline"
              >
                + Add to Row 1
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {row1Companies.map((c) => (
                <div
                  key={c.id}
                  className="group relative flex flex-col items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-xs transition hover:border-[#084b66]/40 hover:shadow-md"
                >
                  <div className="flex h-16 w-full items-center justify-center p-2">
                    <img
                      src={getImageUrl(c.logo || c.logoUrl)}
                      alt={c.name}
                      className="max-h-12 max-w-full object-contain"
                    />
                  </div>
                  <div className="w-full text-center mt-2 pt-2 border-t border-slate-100">
                    <p className="font-semibold text-xs text-slate-800 truncate">{c.name}</p>
                    <div className="flex items-center justify-center gap-2 mt-2">
                      <button
                        type="button"
                        onClick={() => openEditModal(c)}
                        className="rounded p-1 text-slate-400 hover:text-[#084b66] hover:bg-slate-100"
                        title="Edit"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(c)}
                        className="rounded p-1 text-slate-400 hover:text-red-600 hover:bg-red-50"
                        title="Delete"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Row 2 */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#084b66] flex items-center gap-2">
                <span>Row 2 (Scrolls Right)</span>
                <span className="rounded-full bg-slate-100 text-slate-600 px-2 py-0.5 text-xs font-semibold">
                  {row2Companies.length}
                </span>
              </h3>
              <button
                type="button"
                onClick={() => openCreateModal(2)}
                className="text-xs font-semibold text-[#084b66] hover:underline"
              >
                + Add to Row 2
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {row2Companies.map((c) => (
                <div
                  key={c.id}
                  className="group relative flex flex-col items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-xs transition hover:border-[#084b66]/40 hover:shadow-md"
                >
                  <div className="flex h-16 w-full items-center justify-center p-2">
                    <img
                      src={getImageUrl(c.logo || c.logoUrl)}
                      alt={c.name}
                      className="max-h-12 max-w-full object-contain"
                    />
                  </div>
                  <div className="w-full text-center mt-2 pt-2 border-t border-slate-100">
                    <p className="font-semibold text-xs text-slate-800 truncate">{c.name}</p>
                    <div className="flex items-center justify-center gap-2 mt-2">
                      <button
                        type="button"
                        onClick={() => openEditModal(c)}
                        className="rounded p-1 text-slate-400 hover:text-[#084b66] hover:bg-slate-100"
                        title="Edit"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(c)}
                        className="rounded p-1 text-slate-400 hover:text-red-600 hover:bg-red-50"
                        title="Delete"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Company Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-5">
              <h3 className="text-lg font-bold text-slate-900">
                {editingCompany ? 'Edit Company Partner' : 'Add Company Partner'}
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
                  Company Name *
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Lavendel Consulting"
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-[#084b66] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                  Logo (URL or Upload) *
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={form.logoUrl}
                    onChange={(e) => setForm({ ...form, logoUrl: e.target.value })}
                    placeholder="/assets/companies/... or https://..."
                    className="flex-1 rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-[#084b66] focus:outline-none"
                  />
                  <label className="inline-flex items-center gap-1.5 cursor-pointer rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition">
                    <Upload size={14} />
                    <span>{uploadingLogo ? '...' : 'Upload'}</span>
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                  </label>
                </div>

                {Boolean(form.logoUrl) && (
                  <div className="mt-2 flex items-center gap-3">
                    <div className="h-10 w-24 p-1 rounded-lg border border-slate-200 bg-white flex items-center justify-center">
                      <img
                        src={getImageUrl(form.logoUrl, '/assets/companies/lavendel.png')}
                        alt="Logo preview"
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                    <span className="text-xs text-slate-400 truncate max-w-xs">
                      {typeof form.logoUrl === 'string' ? form.logoUrl : (form.logoUrl?.url || '')}
                    </span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                    Marquee Row
                  </label>
                  <select
                    value={form.rowNumber}
                    onChange={(e) => setForm({ ...form, rowNumber: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-[#084b66] focus:outline-none"
                  >
                    <option value={1}>Row 1 (Scrolls Left)</option>
                    <option value={2}>Row 2 (Scrolls Right)</option>
                  </select>
                </div>

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
              </div>

              <div>
                <label className="inline-flex items-center gap-2 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                    className="h-4 w-4 rounded border-slate-300 text-[#084b66] focus:ring-[#084b66]"
                  />
                  <span className="text-xs font-semibold text-slate-700">Logo Active / Visible</span>
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
                  {editingCompany ? 'Update Logo' : 'Add Logo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
