import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Folder,
  Image as ImageIcon,
  Plus,
  Trash2,
  Edit2,
  Upload,
  ArrowLeft,
  ExternalLink,
  LogOut,
  Layers,
  X,
  CheckCircle,
  BookOpen,
  Calendar,
  Users as UsersIcon,
  Building2,
  ShieldCheck,
  Star,
  LayoutDashboard,
  CalendarCheck,
  GraduationCap,
  PhoneCall,
  UserCheck,
  MessageSquare,
  Briefcase,
  Menu,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import apiClient from '../../services/apiClient.js'
import { getImageUrl } from '../../utils/imageUtils.js'
import AdminCoursesTab from './components/AdminCoursesTab.jsx'
import AdminProgramsTab from './components/AdminProgramsTab.jsx'
import AdminTeamTab from './components/AdminTeamTab.jsx'
import AdminCompaniesTab from './components/AdminCompaniesTab.jsx'
import AdminUsersTab from './components/AdminUsersTab.jsx'
import AdminOverviewTab from './components/AdminOverviewTab.jsx'
import AdminFormSubmissionsTab from './components/AdminFormSubmissionsTab.jsx'
import AdminReviewsTab from './components/AdminReviewsTab.jsx'
import AdminMessagesTab from './components/AdminMessagesTab.jsx'

export default function AdminDashboard() {
  const { user, logout } = useAuth()
  const [activeTab, setActiveTab] = useState('overview') // 'overview' | 'gallery' | 'courses' | 'programs' | 'team' | 'reviews' | 'companies' | 'users' | form submissions
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  // Folders state
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState(null) // for photos view
  const [images, setImages] = useState([])
  const [imagesLoading, setImagesLoading] = useState(false)

  // Category Modal State
  const [isCatModalOpen, setIsCatModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [catForm, setCatForm] = useState({
    name: '',
    slug: '',
    description: '',
    coverImageUrl: '',
    parentId: '',
  })

  // Image Modal State
  const [isImgModalOpen, setIsImgModalOpen] = useState(false)
  const [editingImage, setEditingImage] = useState(null)
  const [uploadMode, setUploadMode] = useState('bulk') // 'bulk' | 'single'
  const [selectedBatchFiles, setSelectedBatchFiles] = useState([])
  const [uploadProgress, setUploadProgress] = useState(0)
  const [imgForm, setImgForm] = useState({
    title: '',
    imageUrl: '',
    caption: '',
  })
  const [uploadingFile, setUploadingFile] = useState(false)

  // Alerts
  const [alert, setAlert] = useState(null)

  useEffect(() => {
    fetchCategories()
  }, [])

  const showAlert = (message, type = 'success') => {
    setAlert({ message, type })
    setTimeout(() => setAlert(null), 4000)
  }

  const fetchCategories = async () => {
    setLoading(true)
    try {
      const { data } = await apiClient.get('/api/admin/gallery/categories')
      setCategories(data?.data || [])
    } catch (err) {
      showAlert('Failed to load gallery categories', 'error')
    } finally {
      setLoading(false)
    }
  }

  const fetchCategoryImages = async (categoryId) => {
    setImagesLoading(true)
    try {
      const { data } = await apiClient.get(`/api/admin/gallery/categories/${categoryId}/images`)
      setImages(data?.data || [])
    } catch (err) {
      showAlert('Failed to load category images', 'error')
    } finally {
      setImagesLoading(false)
    }
  }

  /* =========================================================
     CATEGORY ACTIONS
  ========================================================= */

  const openCreateCategoryModal = () => {
    setEditingCategory(null)
    setCatForm({
      name: '',
      slug: '',
      description: '',
      coverImageUrl: '',
      parentId: '',
    })
    setIsCatModalOpen(true)
  }

  const openEditCategoryModal = (category) => {
    setEditingCategory(category)
    setCatForm({
      name: category.name || '',
      slug: category.slug || '',
      description: category.description || '',
      coverImageUrl: category.coverImageUrl || '',
      parentId: category.parentId ? String(category.parentId) : '',
    })
    setIsCatModalOpen(true)
  }

  const handleSaveCategory = async (e) => {
    e.preventDefault()
    if (!catForm.name.trim()) return

    const payload = {
      name: catForm.name.trim(),
      slug: catForm.slug.trim() || undefined,
      description: catForm.description.trim() || undefined,
      coverImageUrl: catForm.coverImageUrl.trim() || undefined,
      parentId: catForm.parentId ? Number(catForm.parentId) : null,
    }

    try {
      if (editingCategory) {
        await apiClient.put(`/api/admin/gallery/categories/${editingCategory.id}`, payload)
        showAlert(`Folder "${payload.name}" updated successfully`)
      } else {
        await apiClient.post('/api/admin/gallery/categories', payload)
        showAlert(`Folder "${payload.name}" created successfully`)
      }
      setIsCatModalOpen(false)
      fetchCategories()
    } catch (err) {
      showAlert(err?.message || 'Failed to save folder', 'error')
    }
  }

  const handleDeleteCategory = async (categoryId, categoryName) => {
    if (!window.confirm(`Are you sure you want to delete folder "${categoryName}"? This will also delete all pictures inside it.`)) {
      return
    }

    try {
      await apiClient.delete(`/api/admin/gallery/categories/${categoryId}`)
      showAlert(`Folder "${categoryName}" deleted successfully`)
      if (selectedCategory?.id === categoryId) {
        setSelectedCategory(null)
      }
      fetchCategories()
    } catch (err) {
      showAlert('Failed to delete folder', 'error')
    }
  }

  /* =========================================================
     IMAGE ACTIONS
  ========================================================= */

  const openCategoryPhotos = (category) => {
    setSelectedCategory(category)
    fetchCategoryImages(category.id)
  }

  const closeImgModal = () => {
    if (uploadingFile) return
    selectedBatchFiles.forEach((f) => URL.revokeObjectURL(f.previewUrl))
    setSelectedBatchFiles([])
    setUploadProgress(0)
    setIsImgModalOpen(false)
  }

  const openAddImageModal = () => {
    setEditingImage(null)
    setUploadMode('bulk')
    selectedBatchFiles.forEach((f) => URL.revokeObjectURL(f.previewUrl))
    setSelectedBatchFiles([])
    setUploadProgress(0)
    setImgForm({
      title: '',
      imageUrl: '',
      caption: '',
    })
    setIsImgModalOpen(true)
  }

  const openEditImageModal = (image) => {
    setEditingImage(image)
    setUploadMode('single')
    selectedBatchFiles.forEach((f) => URL.revokeObjectURL(f.previewUrl))
    setSelectedBatchFiles([])
    setUploadProgress(0)
    setImgForm({
      title: image.title || '',
      imageUrl: image.imageUrl || '',
      caption: image.caption || '',
    })
    setIsImgModalOpen(true)
  }

  const handleBulkFileSelect = (e) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return

    const oversized = files.filter((f) => f.size > 25 * 1024 * 1024)
    if (oversized.length > 0) {
      showAlert(`${oversized.length} image(s) exceed 25MB limit and were skipped.`, 'error')
    }

    const validFiles = files.filter((f) => f.size <= 25 * 1024 * 1024)
    const newItems = validFiles.map((file) => ({
      id: Math.random().toString(36).substring(2, 9),
      file,
      name: file.name,
      size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
      previewUrl: URL.createObjectURL(file),
    }))

    setSelectedBatchFiles((prev) => [...prev, ...newItems])
    e.target.value = ''
  }

  const removeBatchFile = (id) => {
    setSelectedBatchFiles((prev) => {
      const removed = prev.find((f) => f.id === id)
      if (removed) URL.revokeObjectURL(removed.previewUrl)
      return prev.filter((f) => f.id !== id)
    })
  }

  const clearBatchFiles = () => {
    selectedBatchFiles.forEach((f) => URL.revokeObjectURL(f.previewUrl))
    setSelectedBatchFiles([])
  }

  const handleUploadBatch = async () => {
    if (!selectedBatchFiles.length || !selectedCategory) return

    setUploadingFile(true)
    setUploadProgress(0)

    const formData = new FormData()
    selectedBatchFiles.forEach((item) => {
      formData.append('files', item.file)
    })

    try {
      const { data } = await apiClient.post(
        `/api/admin/gallery/categories/${selectedCategory.id}/upload-images`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total)
              setUploadProgress(percent)
            }
          },
        }
      )

      showAlert(`${data?.data?.length || selectedBatchFiles.length} photos uploaded successfully!`)
      clearBatchFiles()
      setIsImgModalOpen(false)
      fetchCategoryImages(selectedCategory.id)
      fetchCategories()
    } catch (err) {
      const errMsg = err?.response?.data?.message || err?.message || 'Failed to upload images'
      showAlert(errMsg, 'error')
    } finally {
      setUploadingFile(false)
      setUploadProgress(0)
    }
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 25 * 1024 * 1024) {
      showAlert('File size exceeds maximum permitted limit (25MB). Please upload a smaller image.', 'error')
      e.target.value = ''
      return
    }

    setUploadingFile(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const { data } = await apiClient.post('/api/admin/gallery/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      const uploadedUrl = data?.data?.url
      if (uploadedUrl) {
        setImgForm((prev) => ({ ...prev, imageUrl: uploadedUrl }))
        showAlert('Image uploaded successfully')
      }
    } catch (err) {
      const errMsg = err?.response?.data?.message || err?.message || 'File upload failed'
      showAlert(errMsg, 'error')
    } finally {
      setUploadingFile(false)
      e.target.value = ''
    }
  }

  const handleCoverFileUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 25 * 1024 * 1024) {
      showAlert('File size exceeds maximum permitted limit (25MB). Please upload a smaller image.', 'error')
      e.target.value = ''
      return
    }

    setUploadingFile(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const { data } = await apiClient.post('/api/admin/gallery/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      const uploadedUrl = data?.data?.url
      if (uploadedUrl) {
        setCatForm((prev) => ({ ...prev, coverImageUrl: uploadedUrl }))
        showAlert('Cover image uploaded successfully')
      }
    } catch (err) {
      const errMsg = err?.response?.data?.message || err?.message || 'Cover image upload failed'
      showAlert(errMsg, 'error')
    } finally {
      setUploadingFile(false)
      e.target.value = ''
    }
  }

  const handleSaveImage = async (e) => {
    e.preventDefault()
    if (!imgForm.imageUrl.trim() || !selectedCategory) return

    const payload = {
      categoryId: selectedCategory.id,
      title: imgForm.title.trim() || undefined,
      imageUrl: imgForm.imageUrl.trim(),
      caption: imgForm.caption.trim() || undefined,
    }

    try {
      if (editingImage) {
        await apiClient.put(`/api/admin/gallery/images/${editingImage.id}`, payload)
        showAlert('Image updated successfully')
      } else {
        await apiClient.post('/api/admin/gallery/images', payload)
        showAlert('Image added to gallery folder successfully')
      }
      setIsImgModalOpen(false)
      fetchCategoryImages(selectedCategory.id)
      fetchCategories() // update image counts
    } catch (err) {
      showAlert(err?.message || 'Failed to save image', 'error')
    }
  }

  const handleDeleteImage = async (imageId) => {
    if (!window.confirm('Are you sure you want to delete this photo?')) return

    try {
      await apiClient.delete(`/api/admin/gallery/images/${imageId}`)
      showAlert('Photo deleted successfully')
      fetchCategoryImages(selectedCategory.id)
      fetchCategories()
    } catch (err) {
      showAlert('Failed to delete photo', 'error')
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* =====================================================
          TOP NAVIGATION BAR
      ===================================================== */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white shadow-xs">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <span className="rounded-lg bg-[#084b66] px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">
              Admin Portal
            </span>
            <span className="font-display text-lg font-bold text-slate-800">
              Dashboard
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              to="/gallery"
              target="_blank"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-[#084b66] transition"
            >
              <span>View Public Site</span>
              <ExternalLink size={14} />
            </Link>

            <div className="hidden sm:block text-right">
              <p className="text-xs font-bold text-slate-800">{user?.fullName || 'Administrator'}</p>
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

      {/* =====================================================
          TAB NAVIGATION BAR (Website Management)
      ===================================================== */}
      <div className="border-b border-slate-200 bg-white shadow-2xs">
        <div className="mx-auto flex max-w-7xl overflow-x-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-1 sm:space-x-2 py-2">
            {[
              { id: 'overview', label: 'Overview', icon: LayoutDashboard },
              { id: 'gallery', label: 'Gallery', icon: Folder },
              { id: 'courses', label: 'Courses', icon: BookOpen },
              { id: 'programs', label: 'Programs & Events', icon: Calendar },
              { id: 'team', label: 'Team Members', icon: UsersIcon },
              { id: 'reviews', label: 'Reviews', icon: Star },
              { id: 'companies', label: 'Companies', icon: Building2 },
              { id: 'users', label: 'User Management', icon: ShieldCheck },
            ].map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab.id)
                    setSelectedCategory(null)
                  }}
                  className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-[#084b66] text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Icon size={16} />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Main 2-Column Layout matching Reference Image 3 */}
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT SIDEBAR: Form Submissions */}
          <aside className="lg:col-span-3">
            {/* Sidebar Section Title */}
            <div className="mb-3 px-1">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Form Submissions
              </h3>
            </div>

            {/* 6 Form Submission Buttons */}
            <div className="flex flex-col gap-2.5">
              {[
                { id: 'demo-bookings', label: 'Demo Bookings', icon: CalendarCheck },
                { id: 'registrations', label: 'Webinar/Workshop/Internship', icon: GraduationCap },
                { id: 'connect-with-us', label: 'Connect with us', icon: PhoneCall },
                { id: 'course-enquiries', label: 'Course Enquiry', icon: BookOpen },
                { id: 'leads', label: 'Enroll Now', icon: UserCheck },
                { id: 'services', label: 'Services Form', icon: Briefcase },
                { id: 'contact-messages', label: 'Contact Us', icon: MessageSquare },
              ].map((item) => {
                const Icon = item.icon
                const isActive = activeTab === item.id
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setActiveTab(item.id)
                      setSelectedCategory(null)
                    }}
                    className={`w-full flex items-center justify-between rounded-xl px-4 py-3.5 text-xs font-bold text-left transition border shadow-2xs cursor-pointer ${
                      isActive
                        ? 'bg-[#084b66] text-white border-[#084b66] shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                    }`}
                  >
                    <span className="truncate">{item.label}</span>
                    <Icon size={16} className={isActive ? 'text-white' : 'text-slate-400'} />
                  </button>
                )
              })}
            </div>
          </aside>

          {/* RIGHT MAIN CONTENT AREA */}
          <main className="lg:col-span-9 min-w-0">
            {/* Alert notification */}
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

            {/* Tab Views */}
            {activeTab === 'overview' && (
              <AdminOverviewTab onNavigateTab={(tab) => setActiveTab(tab)} showAlert={showAlert} />
            )}
            {activeTab === 'courses' && <AdminCoursesTab showAlert={showAlert} />}
            {activeTab === 'programs' && <AdminProgramsTab showAlert={showAlert} />}
            {activeTab === 'team' && <AdminTeamTab showAlert={showAlert} />}
            {activeTab === 'reviews' && <AdminReviewsTab showAlert={showAlert} />}
            {activeTab === 'companies' && <AdminCompaniesTab showAlert={showAlert} />}
            {activeTab === 'users' && <AdminUsersTab showAlert={showAlert} />}
            {activeTab === 'messages' && <AdminMessagesTab showAlert={showAlert} />}

            {/* Form Submission Views */}
            {[
              'demo-bookings',
              'registrations',
              'connect-with-us',
              'course-enquiries',
              'leads',
              'services',
              'contact-messages',
            ].includes(activeTab) && (
              <AdminFormSubmissionsTab formType={activeTab} showAlert={showAlert} />
            )}

        {activeTab === 'gallery' && (
          <>
            {/* =====================================================
                VIEW 1: CATEGORIES / FOLDERS LIST
            ===================================================== */}
            {!selectedCategory ? (
          <div>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="font-display text-2xl font-bold text-slate-900">
                  Gallery Folders & Categories
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  Create, organize, and manage folders that appear on the public Gallery page.
                </p>
              </div>

              <button
                type="button"
                onClick={openCreateCategoryModal}
                className="inline-flex items-center gap-2 rounded-xl bg-[#084b66] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#073c52] transition"
              >
                <Plus size={18} />
                <span>Add New Folder</span>
              </button>
            </div>

            {loading ? (
              <div className="flex min-h-[30vh] items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-[#084b66]" />
              </div>
            ) : categories.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
                <Folder size={48} className="mx-auto text-slate-300 mb-3" />
                <h3 className="text-base font-bold text-slate-700">No folders created yet</h3>
                <p className="text-xs text-slate-500 mt-1">Click "Add New Folder" to create your first gallery folder.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {categories.map((cat) => (
                  <div
                    key={cat.id}
                    className="flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs transition hover:shadow-md"
                  >
                    {/* Thumbnail */}
                    <div
                      onClick={() => openCategoryPhotos(cat)}
                      className="relative aspect-4/3 w-full cursor-pointer overflow-hidden bg-slate-100"
                    >
                      {cat.coverImageUrl ? (
                        <img
                          src={getImageUrl(cat.coverImageUrl)}
                          alt={cat.name}
                          className="h-full w-full object-cover transition hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-[#084b66] bg-slate-100">
                          <Folder size={44} strokeWidth={1.5} />
                        </div>
                      )}

                      {/* Badges */}
                      <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
                        {cat.parentId && (
                          <span className="rounded-md bg-amber-500/90 px-2 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider backdrop-blur-xs">
                            Subfolder
                          </span>
                        )}
                      </div>

                      <div className="absolute bottom-2.5 right-2.5 rounded-md bg-black/60 px-2 py-1 text-[11px] font-medium text-white backdrop-blur-xs flex items-center gap-1">
                        <ImageIcon size={12} />
                        <span>{cat.imageCount} photos</span>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-4">
                      <h3 className="font-display text-base font-bold text-slate-900 line-clamp-1">
                        {cat.name}
                      </h3>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">/{cat.slug}</p>
                      {cat.description && (
                        <p className="mt-1 text-xs text-slate-500 line-clamp-1">
                          {cat.description}
                        </p>
                      )}

                      {/* Action buttons */}
                      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                        <button
                          type="button"
                          onClick={() => openCategoryPhotos(cat)}
                          className="text-xs font-semibold text-[#084b66] hover:underline flex items-center gap-1"
                        >
                          <ImageIcon size={14} />
                          <span>Photos ({cat.imageCount})</span>
                        </button>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => openEditCategoryModal(cat)}
                            title="Edit Folder"
                            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition"
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteCategory(cat.id, cat.name)}
                            title="Delete Folder"
                            className="rounded-lg p-1.5 text-red-500 hover:bg-red-50 hover:text-red-700 transition"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* =====================================================
             VIEW 2: PHOTOS INSIDE SELECTED FOLDER
          ===================================================== */
          <div>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedCategory(null)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  <ArrowLeft size={16} />
                  <span>Back to Folders</span>
                </button>
                <div>
                  <h2 className="font-display text-2xl font-bold text-slate-900">
                    {selectedCategory.name}
                  </h2>
                  <p className="text-xs text-slate-500">
                    Manage pictures uploaded in this gallery folder.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={openAddImageModal}
                className="inline-flex items-center gap-2 rounded-xl bg-[#084b66] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#073c52] transition"
              >
                <Plus size={18} />
                <span>Add Photo</span>
              </button>
            </div>

            {imagesLoading ? (
              <div className="flex min-h-[30vh] items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-[#084b66]" />
              </div>
            ) : images.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
                <ImageIcon size={48} className="mx-auto text-slate-300 mb-3" />
                <h3 className="text-base font-bold text-slate-700">No photos in this folder yet</h3>
                <p className="text-xs text-slate-500 mt-1">Click "Add Photo" to upload or insert pictures.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {images.map((img, idx) => (
                  <div
                    key={img.id}
                    className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs transition hover:shadow-md"
                  >
                    <div className="aspect-4/3 w-full overflow-hidden bg-slate-100">
                      <img
                        src={getImageUrl(img.imageUrl)}
                        alt={img.title || `Picture ${idx + 1}`}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="p-3.5">
                      <h4 className="font-semibold text-sm text-slate-800 line-clamp-1">
                        {img.title || `Picture ${idx + 1}`}
                      </h4>
                      {img.caption && (
                        <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                          {img.caption}
                        </p>
                      )}

                      <div className="mt-3 flex items-center justify-end gap-1.5 border-t border-slate-100 pt-2.5">
                        <button
                          type="button"
                          onClick={() => openEditImageModal(img)}
                          className="rounded-lg p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteImage(img.id)}
                          className="rounded-lg p-1 text-red-500 hover:bg-red-50 hover:text-red-700"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
          </>
        )}
      </main>
        </div>
      </div>

      {/* =====================================================
          MODAL 1: CREATE / EDIT FOLDER
      ===================================================== */}
      {isCatModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 sm:p-8 shadow-2xl">
            <button
              type="button"
              onClick={() => setIsCatModalOpen(false)}
              className="absolute right-5 top-5 text-slate-400 hover:text-slate-600"
            >
              <X size={20} />
            </button>

            <h3 className="font-display text-xl font-bold text-[#084b66]">
              {editingCategory ? 'Edit Folder' : 'Create New Folder'}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Configure folder name, cover image, and optional parent category.
            </p>

            <form onSubmit={handleSaveCategory} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Folder Name *
                </label>
                <input
                  type="text"
                  value={catForm.name}
                  onChange={(e) => setCatForm({ ...catForm, name: e.target.value })}
                  placeholder="e.g. Onam 2026, Campus Hiring"
                  required
                  className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm focus:border-[#084b66] focus:outline-none focus:ring-2 focus:ring-[#084b66]/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  URL Slug (optional)
                </label>
                <input
                  type="text"
                  value={catForm.slug}
                  onChange={(e) => setCatForm({ ...catForm, slug: e.target.value })}
                  placeholder="e.g. onam-2026 (auto-generated if blank)"
                  className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm focus:border-[#084b66] focus:outline-none focus:ring-2 focus:ring-[#084b66]/20"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Cover Image URL
                  </label>
                  <label className="cursor-pointer text-[11px] font-semibold text-[#084b66] hover:underline">
                    {uploadingFile ? 'Uploading…' : '+ Upload cover image'}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCoverFileUpload}
                      disabled={uploadingFile}
                      className="hidden"
                    />
                  </label>
                </div>
                <input
                  type="text"
                  value={catForm.coverImageUrl}
                  onChange={(e) => setCatForm({ ...catForm, coverImageUrl: e.target.value })}
                  placeholder="e.g. /images/gallery/gallery-1.png or /uploads/gallery/..."
                  className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm focus:border-[#084b66] focus:outline-none focus:ring-2 focus:ring-[#084b66]/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Parent Category (for Subfolders)
                </label>
                <select
                  value={catForm.parentId}
                  onChange={(e) => setCatForm({ ...catForm, parentId: e.target.value })}
                  className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm focus:border-[#084b66] focus:outline-none focus:ring-2 focus:ring-[#084b66]/20"
                >
                  <option value="">None (Top-Level Folder)</option>
                  {categories
                    .filter((c) => !c.parentId && (!editingCategory || c.id !== editingCategory.id))
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={catForm.description}
                  onChange={(e) => setCatForm({ ...catForm, description: e.target.value })}
                  placeholder="Short description of this album"
                  className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:border-[#084b66] focus:outline-none focus:ring-2 focus:ring-[#084b66]/20"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCatModalOpen(false)}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-[#084b66] px-5 py-2 text-xs font-semibold text-white hover:bg-[#073c52]"
                >
                  Save Folder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================
          MODAL 2: ADD / EDIT PHOTO (BULK & SINGLE)
      ===================================================== */}
      {isImgModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="relative w-full max-w-xl rounded-2xl bg-white p-6 sm:p-7 shadow-2xl">
            <button
              type="button"
              onClick={closeImgModal}
              disabled={uploadingFile}
              className="absolute right-5 top-5 text-slate-400 hover:text-slate-600 disabled:opacity-50"
            >
              <X size={20} />
            </button>

            <h3 className="font-display text-xl font-bold text-[#084b66]">
              {editingImage ? 'Edit Photo' : `Add Photos to "${selectedCategory?.name}"`}
            </h3>

            {/* Mode Switcher when adding photos */}
            {!editingImage && (
              <div className="mt-4 flex border-b border-slate-200">
                <button
                  type="button"
                  onClick={() => setUploadMode('bulk')}
                  disabled={uploadingFile}
                  className={`pb-2.5 text-xs font-bold transition border-b-2 mr-6 ${
                    uploadMode === 'bulk'
                      ? 'border-[#084b66] text-[#084b66]'
                      : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  Upload Multiple Images (Bulk)
                </button>
                <button
                  type="button"
                  onClick={() => setUploadMode('single')}
                  disabled={uploadingFile}
                  className={`pb-2.5 text-xs font-bold transition border-b-2 ${
                    uploadMode === 'single'
                      ? 'border-[#084b66] text-[#084b66]'
                      : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  Single Image / URL
                </button>
              </div>
            )}

            {/* BULK UPLOAD MODE */}
            {!editingImage && uploadMode === 'bulk' ? (
              <div className="mt-5 space-y-4">
                {/* Multiple File Selection Input */}
                <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/70 p-6 text-center hover:bg-slate-50 transition">
                  <Upload size={32} className="mx-auto text-slate-400 mb-2" />
                  <label className="cursor-pointer inline-block rounded-xl bg-[#084b66] px-4 py-2 text-xs font-semibold text-white hover:bg-[#073c52] transition shadow-xs">
                    {uploadingFile ? 'Uploading images…' : 'Select Multiple Images from Computer'}
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleBulkFileSelect}
                      disabled={uploadingFile}
                      className="hidden"
                    />
                  </label>
                  <p className="text-[12px] text-slate-500 mt-2">
                    Select multiple JPG, PNG, WebP photos (up to 25MB each)
                  </p>
                </div>

                {/* Previews with Individual Removal */}
                {selectedBatchFiles.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-700">
                        Selected Images ({selectedBatchFiles.length})
                      </span>
                      {!uploadingFile && (
                        <button
                          type="button"
                          onClick={clearBatchFiles}
                          className="text-red-500 hover:underline font-semibold"
                        >
                          Clear All
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-56 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-2.5">
                      {selectedBatchFiles.map((item) => (
                        <div
                          key={item.id}
                          className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xs"
                        >
                          <div className="aspect-4/3 w-full overflow-hidden bg-slate-100">
                            <img
                              src={item.previewUrl}
                              alt={item.name}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div className="p-1.5 text-[11px]">
                            <p className="truncate font-medium text-slate-700" title={item.name}>
                              {item.name}
                            </p>
                            <p className="text-[10px] text-slate-400">{item.size}</p>
                          </div>
                          {!uploadingFile && (
                            <button
                              type="button"
                              onClick={() => removeBatchFile(item.id)}
                              title={`Remove ${item.name}`}
                              className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-white transition hover:bg-red-600 shadow-sm"
                            >
                              <X size={13} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Upload Progress Bar */}
                {uploadingFile && (
                  <div className="space-y-1.5 pt-1">
                    <div className="flex justify-between text-xs font-semibold text-slate-700">
                      <span>Uploading {selectedBatchFiles.length} images...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                      <div
                        className="h-full bg-[#084b66] transition-all duration-150 ease-out"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Modal Footer Actions */}
                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={closeImgModal}
                    disabled={uploadingFile}
                    className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleUploadBatch}
                    disabled={uploadingFile || selectedBatchFiles.length === 0}
                    className="inline-flex items-center gap-2 rounded-lg bg-[#084b66] px-5 py-2 text-xs font-semibold text-white hover:bg-[#073c52] disabled:opacity-50 transition shadow-xs"
                  >
                    {uploadingFile ? (
                      <>
                        <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        <span>Uploading ({uploadProgress}%)</span>
                      </>
                    ) : (
                      <>
                        <Upload size={14} />
                        <span>
                          Upload {selectedBatchFiles.length > 0 ? `${selectedBatchFiles.length} Images` : 'Images'}
                        </span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              /* SINGLE PHOTO / URL FORM */
              <form onSubmit={handleSaveImage} className="mt-5 space-y-4">
                {/* File Upload Option */}
                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-center">
                  <Upload size={24} className="mx-auto text-slate-400 mb-2" />
                  <label className="cursor-pointer inline-block text-xs font-semibold text-[#084b66] hover:underline">
                    {uploadingFile ? 'Uploading file…' : 'Click here to upload an image from computer'}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      disabled={uploadingFile}
                      className="hidden"
                    />
                  </label>
                  <p className="text-[11px] text-slate-400 mt-0.5">Supports JPG, PNG, WebP (up to 25MB)</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Or Paste Image URL *
                  </label>
                  <input
                    type="text"
                    value={imgForm.imageUrl}
                    onChange={(e) => setImgForm({ ...imgForm, imageUrl: e.target.value })}
                    placeholder="e.g. /images/gallery/gallery-1.png or /uploads/gallery/..."
                    required
                    className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm focus:border-[#084b66] focus:outline-none focus:ring-2 focus:ring-[#084b66]/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Photo Title (optional)
                  </label>
                  <input
                    type="text"
                    value={imgForm.title}
                    onChange={(e) => setImgForm({ ...imgForm, title: e.target.value })}
                    placeholder="e.g. Picture 1"
                    className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm focus:border-[#084b66] focus:outline-none focus:ring-2 focus:ring-[#084b66]/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Caption / Details (optional)
                  </label>
                  <input
                    type="text"
                    value={imgForm.caption}
                    onChange={(e) => setImgForm({ ...imgForm, caption: e.target.value })}
                    placeholder="Brief note or event detail"
                    className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm focus:border-[#084b66] focus:outline-none focus:ring-2 focus:ring-[#084b66]/20"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={closeImgModal}
                    className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={uploadingFile || !imgForm.imageUrl}
                    className="rounded-lg bg-[#084b66] px-5 py-2 text-xs font-semibold text-white hover:bg-[#073c52] disabled:opacity-50"
                  >
                    Save Photo
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
