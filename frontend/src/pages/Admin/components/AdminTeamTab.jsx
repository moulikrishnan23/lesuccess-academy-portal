import { useEffect, useState } from 'react'
import { Plus, Edit2, Trash2, Users, Upload, X, Star, ChevronUp, ChevronDown } from 'lucide-react'
import apiClient from '../../../services/apiClient.js'
import { getImageUrl } from '../../../utils/imageUtils.js'

export default function AdminTeamTab({ showAlert }) {
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingMember, setEditingMember] = useState(null)
  const [uploadingImage, setUploadingImage] = useState(false)

  // Categories state
  const [categories, setCategories] = useState([])
  const [newCategoryName, setNewCategoryName] = useState('')
  const [showAddCategoryInput, setShowAddCategoryInput] = useState(false)
  const [savingCategory, setSavingCategory] = useState(false)

  const [form, setForm] = useState({
    name: '',
    role: '',
    department: '',
    email: '',
    imageUrl: '',
    isFeatured: false,
    displayOrder: 0,
    isActive: true,
  })

  useEffect(() => {
    fetchMembers()
    fetchCategories()
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

  const fetchCategories = async () => {
    try {
      const { data } = await apiClient.get('/api/team-categories')
      const cats = Array.isArray(data?.data) ? data.data : []
      if (cats.length > 0) {
        setCategories(cats)
      } else {
        setCategories([
          { id: 1, name: 'Management Team' },
          { id: 2, name: 'Our Mentors' },
        ])
      }
    } catch (_err) {
      setCategories([
        { id: 1, name: 'Management Team' },
        { id: 2, name: 'Our Mentors' },
      ])
    }
  }

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return
    setSavingCategory(true)
    try {
      const { data } = await apiClient.post('/api/admin/team-categories', {
        name: newCategoryName.trim(),
        displayOrder: categories.length + 1,
      })
      showAlert?.('Category created successfully')
      const created = data?.data || { name: newCategoryName.trim() }
      setForm((prev) => ({ ...prev, department: created.name }))
      setNewCategoryName('')
      setShowAddCategoryInput(false)
      fetchCategories()
    } catch (err) {
      showAlert?.(err?.response?.data?.message || 'Failed to create category', 'error')
    } finally {
      setSavingCategory(false)
    }
  }

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

  const handleMove = async (m, direction) => {
    const currentIdx = members.findIndex((item) => item.id === m.id)
    if (currentIdx === -1) return
    const targetIdx = direction === 'up' ? currentIdx - 1 : currentIdx + 1
    if (targetIdx < 0 || targetIdx >= members.length) return
    const targetOrder = members[targetIdx].displayOrder || (targetIdx + 1)
    try {
      await apiClient.put(`/api/admin/team-members/${m.id}/order?displayOrder=${targetOrder}`)
      showAlert?.('Order updated successfully')
      fetchMembers()
    } catch (err) {
      showAlert?.('Failed to update order', 'error')
    }
  }

  const openCreateModal = async () => {
    setEditingMember(null)
    let nextOrder = members.length + 1
    try {
      const res = await apiClient.get('/api/admin/team-members/next-order')
      if (res?.data?.data) {
        nextOrder = res.data.data
      }
    } catch (_e) {
      const maxOrd = members.reduce((max, item) => Math.max(max, item.displayOrder || 0), 0)
      nextOrder = maxOrd + 1
    }
    setForm({
      name: '',
      role: '',
      department: categories[0]?.name || 'Management Team',
      experience: '',
      skills: '',
      email: '',
      imageUrl: '',
      bio: '',
      isFeatured: false,
      displayOrder: nextOrder,
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
      department: m.department || '',
      experience: m.experience || '',
      skills: m.skills || '',
      email: m.email || '',
      imageUrl: safeImg,
      bio: m.bio || '',
      isFeatured: Boolean(m.featured || m.isFeatured),
      displayOrder: m.displayOrder || 0,
      isActive: m.isActive !== false,
    })
    setIsModalOpen(true)
  }

  const handleFileUpload = async (e) => {
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
      department: form.department ? form.department.trim() : '',
      experience: form.experience ? form.experience.trim() : '',
      skills: form.skills ? form.skills.trim() : '',
      email: form.email.trim(),
      imageUrl: rawImg || '/home/team/dummy.png',
      bio: form.bio ? form.bio.trim() : '',
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

  // Active category filter tab
  const [selectedCategory, setSelectedCategory] = useState('ALL')

  const isMemberFeatured = (m) => Boolean(m.featured || m.isFeatured)

  const featuredMembers = members.filter(isMemberFeatured)
  const nonFeaturedMembers = members.filter((m) => !isMemberFeatured(m))

  const categoryFilteredMembers = selectedCategory === 'ALL'
    ? members
    : members.filter((m) => (m.department || m.category) === selectedCategory)

  return (
    <div className="space-y-8">
      {/* Top Header & Metrics Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-bold text-slate-900">Team Members Management</h2>
            <span className="inline-flex items-center rounded-full bg-[#07405C]/10 px-2.5 py-0.5 text-xs font-bold text-[#07405C]">
              {members.length} {members.length === 1 ? 'Profile' : 'Profiles'}
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage leadership, management, and mentor profiles displayed across the website.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Quick Metrics Chips */}
          <div className="hidden sm:flex items-center gap-2 bg-slate-100/80 rounded-xl p-1 border border-slate-200/80 text-xs">
            <div className="flex items-center gap-1.5 px-3 py-1 bg-white rounded-lg shadow-2xs font-semibold text-slate-700">
              <Star size={12} className="text-amber-500 fill-amber-500" />
              <span>{featuredMembers.length} Featured</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-slate-600 font-medium">
              <Users size={12} className="text-[#07405C]" />
              <span>{categories.length} Categories</span>
            </div>
          </div>

          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 rounded-xl bg-[#07405C] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#024D72] transition cursor-pointer"
          >
            <Plus size={18} />
            <span>Add Team Member</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex min-h-[300px] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-[#07405C]" />
        </div>
      ) : members.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <Users size={44} className="mx-auto text-slate-400 mb-3" />
          <h3 className="text-base font-bold text-slate-800">No team members found</h3>
          <p className="text-sm text-slate-500 mt-1">Add your leadership and faculty profiles.</p>
        </div>
      ) : (
        <>
          {/* SECTION 1: FEATURED LEADERSHIP SHOWCASE */}
          <div className="rounded-3xl border border-amber-200/80 bg-linear-to-b from-amber-50/40 via-white to-white p-5 sm:p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-400 text-amber-950 shadow-xs">
                  <Star size={18} fill="currentColor" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    Featured Leadership Showcase
                    <span className="rounded-full bg-amber-100 text-amber-900 font-bold text-[11px] px-2.5 py-0.5 border border-amber-200">
                      {featuredMembers.length}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Highlighted on the Homepage hero/team section and at the top of the Our Team page.
                  </p>
                </div>
              </div>
            </div>

            {featuredMembers.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-amber-200 bg-amber-50/20 p-8 text-center">
                <Star size={32} className="mx-auto text-amber-300 mb-2" />
                <p className="text-xs font-semibold text-slate-700">No featured leaders selected</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Edit a team member and enable "Featured (Top Row)" to pin them here.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                {featuredMembers.map((m) => {
                  const globalIdx = members.findIndex((item) => item.id === m.id)
                  const categoryName = m.category || m.department || 'Management Team'

                  return (
                    <div
                      key={m.id}
                      className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-amber-200/90 bg-white shadow-xs transition hover:border-[#07405C]/50 hover:shadow-md"
                    >
                      {/* Photo Container with Top Badges in a Non-Colliding Flex Row */}
                      <div
                        className="relative aspect-383/400 w-full overflow-hidden bg-cover bg-center bg-no-repeat flex items-center justify-center"
                        style={{ backgroundImage: "url('/home/TeamBg.png')" }}
                      >
                        <img
                          src={getImageUrl(m.image || m.imageUrl, '/home/team/dummy.png')}
                          alt={m.name || 'Featured team member'}
                          className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-102"
                          onError={(e) => {
                            e.target.src = '/home/team/dummy.png'
                          }}
                        />

                        {/* Structured Non-Colliding Top Bar */}
                        <div className="absolute top-0 inset-x-0 p-2.5 flex items-start justify-between gap-1.5 z-10 pointer-events-none">
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-bold text-amber-950 shadow-xs shrink-0 select-none">
                            <Star size={10} fill="currentColor" />
                            <span>Featured</span>
                          </span>

                          <span className="inline-flex items-center rounded-full bg-[#DF1E26] px-2 py-0.5 text-[10px] font-bold text-white shadow-xs max-w-[55%] truncate select-none" title={categoryName}>
                            {categoryName}
                          </span>
                        </div>
                      </div>

                      {/* Details Area — No Premature Cutoffs */}
                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-bold text-slate-900 text-base leading-snug line-clamp-2 min-h-[2.5rem] flex items-center" title={m.name}>
                              {m.name}
                            </h4>
                            <span className="text-[11px] font-bold text-[#07405C] bg-[#07405C]/5 px-2 py-0.5 rounded-md shrink-0 border border-[#07405C]/10">
                              #{m.displayOrder ?? globalIdx + 1}
                            </span>
                          </div>

                          <p className="text-xs font-semibold text-[#07405C] leading-normal line-clamp-2 min-h-[2rem] mt-1" title={m.role}>
                            {m.role}
                          </p>

                          {m.email && (
                            <p className="text-xs text-slate-400 truncate mt-2" title={m.email}>
                              {m.email}
                            </p>
                          )}
                        </div>

                        {/* Bottom Actions Bar */}
                        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${
                              m.isActive !== false ? 'text-emerald-700 bg-emerald-50' : 'text-slate-400 bg-slate-100'
                            }`}
                          >
                            {m.isActive !== false ? 'Active' : 'Hidden'}
                          </span>

                          <div className="inline-flex items-center gap-1">
                            {/* Reordering Controls */}
                            <div className="inline-flex items-center border border-slate-200 rounded-lg p-0.5 bg-slate-50 mr-1">
                              <button
                                type="button"
                                onClick={() => handleMove(m, 'up')}
                                disabled={globalIdx <= 0}
                                className="rounded p-1 text-slate-500 hover:bg-white hover:text-[#07405C] disabled:opacity-25 transition cursor-pointer"
                                title="Move Up"
                              >
                                <ChevronUp size={13} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleMove(m, 'down')}
                                disabled={globalIdx >= members.length - 1}
                                className="rounded p-1 text-slate-500 hover:bg-white hover:text-[#07405C] disabled:opacity-25 transition cursor-pointer"
                                title="Move Down"
                              >
                                <ChevronDown size={13} />
                              </button>
                            </div>

                            <button
                              type="button"
                              onClick={() => openEditModal(m)}
                              className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-[#07405C] transition cursor-pointer"
                              title="Edit Member"
                            >
                              <Edit2 size={15} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(m)}
                              className="rounded-lg p-1.5 text-slate-500 hover:bg-red-50 hover:text-[#DF1E26] transition cursor-pointer"
                              title="Delete Member"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* SECTION 2: ALL / CATEGORY TEAM ROSTER */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Department & Category Roster
                </h3>
                <p className="text-xs text-slate-500">
                  Filter and organize team members by their department or role.
                </p>
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
                <button
                  type="button"
                  onClick={() => setSelectedCategory('ALL')}
                  className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition cursor-pointer shrink-0 ${
                    selectedCategory === 'ALL'
                      ? 'bg-[#07405C] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                  }`}
                >
                  All ({members.length})
                </button>

                {categories.map((cat) => {
                  const count = members.filter((m) => (m.department || m.category) === cat.name).length
                  const isSelected = selectedCategory === cat.name
                  return (
                    <button
                      key={cat.id || cat.name}
                      type="button"
                      onClick={() => setSelectedCategory(cat.name)}
                      className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition cursor-pointer shrink-0 ${
                        isSelected
                          ? 'bg-[#07405C] text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                      }`}
                    >
                      {cat.name} ({count})
                    </button>
                  )
                })}
              </div>
            </div>

            {categoryFilteredMembers.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
                <Users size={36} className="mx-auto text-slate-400 mb-2" />
                <h4 className="text-sm font-bold text-slate-800">No members in this category</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Assign members to this department or add a new team profile.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {categoryFilteredMembers.map((m) => {
                  const globalIdx = members.findIndex((item) => item.id === m.id)
                  const categoryName = m.category || m.department || 'Management Team'
                  const isFeatured = isMemberFeatured(m)

                  return (
                    <div
                      key={m.id}
                      className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs transition hover:border-[#07405C]/40 hover:shadow-md"
                    >
                      {/* Photo Area with TeamBg Treatment */}
                      <div
                        className="relative aspect-383/400 w-full overflow-hidden bg-cover bg-center bg-no-repeat flex items-center justify-center"
                        style={{ backgroundImage: "url('/home/TeamBg.png')" }}
                      >
                        <img
                          src={getImageUrl(m.image || m.imageUrl, '/home/team/dummy.png')}
                          alt={m.name || 'Team member'}
                          className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-102"
                          onError={(e) => {
                            e.target.src = '/home/team/dummy.png'
                          }}
                        />

                        {/* Top Badges Bar in Flex Layout — Never Colliding */}
                        <div className="absolute top-0 inset-x-0 p-2.5 flex items-start justify-between gap-1.5 z-10 pointer-events-none">
                          {isFeatured ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/95 px-2 py-0.5 text-[10px] font-bold text-amber-950 shadow-xs shrink-0 select-none">
                              <Star size={10} fill="currentColor" />
                              <span>Featured</span>
                            </span>
                          ) : (
                            <span />
                          )}

                          <span className="inline-flex items-center rounded-full bg-[#DF1E26] px-2.5 py-0.5 text-[10px] font-bold text-white shadow-xs max-w-[60%] truncate select-none" title={categoryName}>
                            {categoryName}
                          </span>
                        </div>
                      </div>

                      {/* Details Area */}
                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-bold text-slate-900 text-base leading-snug line-clamp-2 min-h-[2.5rem] flex items-center" title={m.name}>
                              {m.name}
                            </h4>
                            <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded shrink-0 border border-slate-200">
                              #{m.displayOrder ?? globalIdx + 1}
                            </span>
                          </div>

                          <p className="text-xs font-semibold text-[#07405C] leading-normal line-clamp-2 min-h-[2rem] mt-1" title={m.role}>
                            {m.role}
                          </p>

                          {m.email && (
                            <p className="text-xs text-slate-400 truncate mt-2" title={m.email}>
                              {m.email}
                            </p>
                          )}
                        </div>

                        {/* Bottom Actions Bar */}
                        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${
                              m.isActive !== false ? 'text-emerald-700 bg-emerald-50' : 'text-slate-400 bg-slate-100'
                            }`}
                          >
                            {m.isActive !== false ? 'Active' : 'Hidden'}
                          </span>

                          <div className="inline-flex items-center gap-1">
                            {/* Reordering Controls */}
                            <div className="inline-flex items-center border border-slate-200 rounded-lg p-0.5 bg-slate-50 mr-1">
                              <button
                                type="button"
                                onClick={() => handleMove(m, 'up')}
                                disabled={globalIdx <= 0}
                                className="rounded p-1 text-slate-500 hover:bg-white hover:text-[#07405C] disabled:opacity-25 transition cursor-pointer"
                                title="Move Up"
                              >
                                <ChevronUp size={13} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleMove(m, 'down')}
                                disabled={globalIdx >= members.length - 1}
                                className="rounded p-1 text-slate-500 hover:bg-white hover:text-[#07405C] disabled:opacity-25 transition cursor-pointer"
                                title="Move Down"
                              >
                                <ChevronDown size={13} />
                              </button>
                            </div>

                            <button
                              type="button"
                              onClick={() => openEditModal(m)}
                              className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-[#07405C] transition cursor-pointer"
                              title="Edit Member"
                            >
                              <Edit2 size={15} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(m)}
                              className="rounded-lg p-1.5 text-slate-500 hover:bg-red-50 hover:text-[#DF1E26] transition cursor-pointer"
                              title="Delete Member"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </>
      )}

      {/* Member Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="relative w-full max-w-xl rounded-2xl bg-white shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
            {/* Fixed Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white shrink-0">
              <h3 className="text-lg font-bold text-slate-900">
                {editingMember ? 'Edit Team Member' : 'Add Team Member'}
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
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-[#07405C] focus:outline-none focus:ring-1 focus:ring-[#07405C]"
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
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-[#07405C] focus:outline-none focus:ring-1 focus:ring-[#07405C]"
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
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-[#07405C] focus:outline-none focus:ring-1 focus:ring-[#07405C]"
                  />
                </div>

                {/* Team Category Selector */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
                      Team Category
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowAddCategoryInput(!showAddCategoryInput)}
                      className="text-xs font-semibold text-[#07405C] hover:underline cursor-pointer"
                    >
                      {showAddCategoryInput ? 'Cancel' : '+ Add New Category'}
                    </button>
                  </div>

                  {showAddCategoryInput && (
                    <div className="flex gap-2 mb-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                      <input
                        type="text"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        placeholder="Enter category name (e.g. Academic Team)..."
                        className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs focus:border-[#07405C] focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleCreateCategory}
                        disabled={savingCategory || !newCategoryName.trim()}
                        className="rounded-lg bg-[#07405C] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#024D72] transition disabled:opacity-50 cursor-pointer"
                      >
                        {savingCategory ? '...' : 'Save'}
                      </button>
                    </div>
                  )}

                  <select
                    value={form.department}
                    onChange={(e) => setForm({ ...form, department: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-[#07405C] focus:outline-none focus:ring-1 focus:ring-[#07405C] bg-white"
                  >
                    <option value="">Select Category (Default: None)...</option>
                    {categories.map((c) => (
                      <option key={c.id || c.name} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                    {form.department && !categories.some((c) => c.name === form.department) && (
                      <option value={form.department}>{form.department}</option>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                    Years of Experience
                  </label>
                  <input
                    type="text"
                    value={form.experience}
                    onChange={(e) => setForm({ ...form, experience: e.target.value })}
                    placeholder="e.g. 15+ Years in IT Leadership"
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-[#07405C] focus:outline-none focus:ring-1 focus:ring-[#07405C]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                    Area of Expertise (Comma-separated)
                  </label>
                  <input
                    type="text"
                    value={form.skills}
                    onChange={(e) => setForm({ ...form, skills: e.target.value })}
                    placeholder="e.g. Java, Spring Boot, Microservices, React"
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-[#07405C] focus:outline-none focus:ring-1 focus:ring-[#07405C]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                    Bio / About
                  </label>
                  <textarea
                    rows={3}
                    value={form.bio}
                    onChange={(e) => setForm({ ...form, bio: e.target.value })}
                    placeholder="Detailed professional background and contributions..."
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-[#07405C] focus:outline-none focus:ring-1 focus:ring-[#07405C]"
                  />
                </div>

                {/* Profile Photo Upload */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    Profile Photo
                  </label>

                  {form.imageUrl ? (
                    <div className="flex items-center gap-3.5 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                      <div
                        className="h-16 w-16 overflow-hidden rounded-xl bg-cover bg-center border border-slate-200 shrink-0 shadow-xs"
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
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-800 truncate">
                          {typeof form.imageUrl === 'string' ? form.imageUrl.split('/').pop() || form.imageUrl : 'Profile Image'}
                        </p>
                        <p className="text-[11px] text-emerald-600 font-medium mt-0.5">Photo attached</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <label className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer transition shadow-2xs">
                          <Upload size={13} />
                          <span>{uploadingImage ? 'Uploading...' : 'Replace'}</span>
                          <input
                            type="file"
                            accept="image/png, image/jpeg, image/webp"
                            onChange={handleFileUpload}
                            disabled={uploadingImage}
                            className="hidden"
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => setForm((prev) => ({ ...prev, imageUrl: '' }))}
                          className="rounded-xl p-2 text-red-500 hover:bg-red-50 transition cursor-pointer"
                          title="Remove photo"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/60 p-5 hover:border-[#07405C] hover:bg-slate-50 transition cursor-pointer text-center group">
                      {uploadingImage ? (
                        <div className="flex items-center gap-2 text-xs text-[#07405C] font-semibold py-2">
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#07405C] border-t-transparent" />
                          <span>Uploading photo...</span>
                        </div>
                      ) : (
                        <>
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-400 group-hover:text-[#07405C] group-hover:border-[#07405C]/30 shadow-2xs mb-2 transition">
                            <Upload size={18} />
                          </div>
                          <span className="text-xs font-bold text-slate-800">Choose Profile Photo from Computer</span>
                          <span className="text-[11px] text-slate-400 mt-0.5">Supports JPG, PNG, WebP (max 5MB)</span>
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/png, image/jpeg, image/webp"
                        onChange={handleFileUpload}
                        disabled={uploadingImage}
                        className="hidden"
                      />
                    </label>
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
                      className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-[#07405C] focus:outline-none"
                    />
                  </div>

                  <div className="flex flex-col justify-end space-y-2 pt-2">
                    <label className="inline-flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.isFeatured}
                        onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                        className="h-4 w-4 rounded border-slate-300 text-[#07405C] focus:ring-[#07405C]"
                      />
                      <span className="text-xs font-semibold text-slate-700">Featured (Top Row)</span>
                    </label>

                    <label className="inline-flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.isActive}
                        onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                        className="h-4 w-4 rounded border-slate-300 text-[#07405C] focus:ring-[#07405C]"
                      />
                      <span className="text-xs font-semibold text-slate-700">Profile Active</span>
                    </label>
                  </div>
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
