import { useEffect, useState, useRef } from 'react'
import {
  Plus,
  Edit2,
  Trash2,
  BookOpen,
  ExternalLink,
  Check,
  X,
  Upload,
  Image as ImageIcon,
  Search,
  Sparkles,
  ArrowUp,
  ArrowDown,
  Wrench,
  ListOrdered,
  FileText,
  Loader2,
} from 'lucide-react'
import apiClient from '../../../services/apiClient.js'
import CourseBadge from '../../../components/ui/CourseBadge.jsx'
import { getImageUrl } from '../../../utils/imageUtils.js'
// Shared with the public offer banner: the banner rotates through exactly the
// courses this tab lists under Group 1, so both read the test from one place.
import { isBatchCourse } from '../../../utils/courseOfferUtils.js'

const PRESET_ICONS = [
  { name: 'Java', url: '/tech/java.svg' },
  { name: 'Spring Boot', url: '/tech/springboot.svg' },
  { name: 'Hibernate', url: '/tech/hibernate.svg' },
  { name: 'Maven', url: '/tech/maven.svg' },
  { name: 'Python', url: '/tech/python.svg' },
  { name: 'Django', url: '/tech/django.svg' },
  { name: 'Flask', url: '/tech/flask.svg' },
  { name: 'React', url: '/tech/react.svg' },
  { name: 'JavaScript', url: '/tech/javascript.svg' },
  { name: 'HTML5', url: '/tech/html5.svg' },
  { name: 'CSS3', url: '/tech/css3.svg' },
  { name: 'Bootstrap', url: '/tech/bootstrap.svg' },
  { name: 'MySQL', url: '/tech/mysql.svg' },
  { name: 'PostgreSQL', url: '/tech/postgresql.svg' },
  { name: 'SQLite', url: '/tech/sqlite.svg' },
  { name: 'AWS', url: '/tech/aws.svg' },
  { name: 'Docker', url: '/tech/docker.svg' },
  { name: 'Git', url: '/tech/git.svg' },
  { name: 'GitHub', url: '/tech/github.svg' },
  { name: 'Postman', url: '/tech/postman.svg' },
  { name: 'Power BI', url: '/tech/powerbi.svg' },
  { name: 'Excel', url: '/tech/excel.svg' },
  { name: 'REST API', url: '/tech/api.svg' },
]

export default function AdminCoursesTab({ showAlert }) {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCourse, setEditingCourse] = useState(null)

  const [activeModalTab, setActiveModalTab] = useState('basic') // 'basic' | 'tools' | 'curriculum' | 'content' | 'media'
  const [loadingDetails, setLoadingDetails] = useState(false)
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState({
    name: '',
    category: '',
    shortDescription: '',
    description: '',
    roleHeading: '',
    roleIntro: '',
    durationMonths: 3,
    mode: 'BOTH',
    badge: '',
    badgeText: '',
    placementAssistance: true,
    syllabusUrl: '',
    enrollUrl: '',
    iconUrl: '',
    displayOrder: 0,
    isActive: true,
  })

  // Role Bullets list
  const [roleBullets, setRoleBullets] = useState([])
  const [newBulletText, setNewBulletText] = useState('')

  // Tool List
  const [tools, setTools] = useState([])
  const [newTool, setNewTool] = useState({ toolName: '', groupName: 'Tools', iconUrl: '' })

  // Modules & Topics List
  const [modules, setModules] = useState([])
  const [newModuleTitle, setNewModuleTitle] = useState('')
  const [newTopicInputs, setNewTopicInputs] = useState({}) // moduleIndex -> topic text

  const [searchTerm, setSearchTerm] = useState('')
  const [showInactive, setShowInactive] = useState(true)
  const [selectedGroup, setSelectedGroup] = useState('all') // 'all' | 'batch' | 'normal'
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [uploadingToolIcon, setUploadingToolIcon] = useState(false)
  const [logoMode, setLogoMode] = useState('upload')
  const fileInputRef = useRef(null)

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isModalOpen])

  useEffect(() => {
    fetchCourses()
  }, [])

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
    if (!validTypes.includes(file.type)) {
      showAlert?.('Please select a PNG, SVG, JPG, or WebP image file', 'error')
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      showAlert?.('Logo file size must be less than 5MB', 'error')
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }

    setUploadingLogo(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      let uploadUrl = ''
      try {
        const res = await apiClient.post('/api/admin/courses/upload-logo', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        uploadUrl = res?.data?.data?.url || res?.data?.url
      } catch (err) {
        // Fallback to gallery upload endpoint
        const res = await apiClient.post('/api/admin/gallery/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        uploadUrl = res?.data?.data?.url || res?.data?.url
      }
      if (uploadUrl) {
        setForm((prev) => ({ ...prev, iconUrl: uploadUrl }))
        showAlert?.('Logo uploaded successfully')
      }
    } catch (err) {
      showAlert?.('Failed to upload course logo', 'error')
    } finally {
      setUploadingLogo(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleToolIconUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
    if (!validTypes.includes(file.type)) {
      showAlert?.('Please select a PNG, SVG, JPG, or WebP image file', 'error')
      e.target.value = ''
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      showAlert?.('Icon file size must be less than 5MB', 'error')
      e.target.value = ''
      return
    }

    setUploadingToolIcon(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await apiClient.post('/api/admin/gallery/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      const url = res?.data?.data?.url || (typeof res?.data === 'string' ? res.data : '')
      if (url) {
        setNewTool((prev) => ({ ...prev, iconUrl: url }))
        showAlert?.('Tool icon uploaded successfully')
      }
    } catch (_err) {
      showAlert?.('Failed to upload tool icon', 'error')
    } finally {
      setUploadingToolIcon(false)
      e.target.value = ''
    }
  }

  const fetchCourses = async () => {
    setLoading(true)
    try {
      const { data } = await apiClient.get('/api/admin/courses?size=200')
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
    setActiveModalTab('basic')
    setForm({
      name: '',
      category: '',
      shortDescription: '',
      description: '',
      roleHeading: '',
      roleIntro: '',
      durationMonths: 3,
      mode: 'BOTH',
      badge: '',
      badgeText: '',
      placementAssistance: true,
      syllabusUrl: '',
      enrollUrl: '',
      iconUrl: '',
      displayOrder: courses.length + 1,
      isActive: true,
    })
    setRoleBullets([])
    setTools([])
    setModules([])
    setNewTopicInputs({})
    setIsModalOpen(true)
  }

  const openEditModal = async (c) => {
    setEditingCourse(c)
    setIsModalOpen(true)
    setActiveModalTab('basic')
    setLoadingDetails(true)

    setForm({
      name: c.name || c.title || '',
      category: c.category || '',
      shortDescription: c.shortDescription || '',
      description: c.description || '',
      roleHeading: c.roleHeading || '',
      roleIntro: c.roleIntro || '',
      durationMonths: c.durationMonths || c.durationValue || 3,
      mode: c.mode || 'BOTH',
      badge: c.badge || '',
      badgeText: c.badgeText || c.badgeLabel || '',
      placementAssistance: Boolean(c.placementAssistance),
      syllabusUrl: c.syllabusUrl || '',
      enrollUrl: c.enrollUrl || '',
      iconUrl: c.iconUrl || c.icon_url || '',
      displayOrder: c.displayOrder || 0,
      isActive: c.isActive !== false,
    })

    setRoleBullets([])
    setTools([])
    setModules([])
    setNewTopicInputs({})

    try {
      const { data } = await apiClient.get(`/api/courses/${c.id}`)
      const detail = data?.data || data
      if (detail) {
        setForm((prev) => ({
          ...prev,
          category: detail.category || prev.category || '',
          shortDescription: detail.shortDescription || prev.shortDescription || '',
          description: detail.description || prev.description || '',
          roleHeading: detail.roleHeading || prev.roleHeading || '',
          roleIntro: detail.roleIntro || prev.roleIntro || '',
          iconUrl: detail.iconUrl || detail.icon_url || prev.iconUrl || '',
        }))

        // Role bullets
        if (Array.isArray(detail.roleBulletsList) && detail.roleBulletsList.length > 0) {
          setRoleBullets(detail.roleBulletsList)
        } else if (typeof detail.roleBullets === 'string') {
          try {
            const parsed = JSON.parse(detail.roleBullets)
            if (Array.isArray(parsed)) setRoleBullets(parsed)
            else setRoleBullets(detail.roleBullets.split('\n').filter(Boolean))
          } catch {
            setRoleBullets(detail.roleBullets.split('\n').filter(Boolean))
          }
        }

        // Tools
        const fetchedTools = detail.tools || detail.techStack || []
        setTools(
          fetchedTools.map((t, idx) => ({
            id: t.id,
            toolName: t.toolName || t.itemName || '',
            groupName: t.groupName || 'Tools',
            iconUrl: t.iconUrl || '',
            displayOrder: t.displayOrder || idx + 1,
          }))
        )

        // Modules
        const fetchedModules = detail.modules || []
        setModules(
          fetchedModules.map((m, idx) => {
            let topics = []
            if (Array.isArray(m.topics)) {
              topics = m.topics
            } else if (typeof m.content === 'string') {
              try {
                const parsed = JSON.parse(m.content)
                if (Array.isArray(parsed)) topics = parsed
                else topics = m.content.split('\n').map((s) => s.trim()).filter(Boolean)
              } catch {
                topics = m.content.split('\n').map((s) => s.trim()).filter(Boolean)
              }
            } else if (typeof m.description === 'string') {
              topics = m.description.split('\n').map((s) => s.trim()).filter(Boolean)
            }
            return {
              id: m.id,
              title: m.title || `Module ${idx + 1}`,
              topics,
              displayOrder: m.displayOrder || idx + 1,
            }
          })
        )
      }
    } catch (err) {
      console.warn('Could not load course deep details:', err)
    } finally {
      setLoadingDetails(false)
    }
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) {
      showAlert?.('Course name is required', 'error')
      setActiveModalTab('basic')
      return
    }

    setSaving(true)
    const payload = {
      name: form.name.trim(),
      category: form.category?.trim() || null,
      shortDescription: form.shortDescription?.trim() || null,
      description: form.description?.trim() || null,
      roleHeading: form.roleHeading?.trim() || null,
      roleIntro: form.roleIntro?.trim() || null,
      roleBulletsList: roleBullets.filter((b) => b && b.trim()),
      durationMonths: Number(form.durationMonths) || null,
      mode: form.mode,
      badge: form.badge ? form.badge : null,
      badgeText: form.badgeText?.trim() ? form.badgeText.trim() : null,
      placementAssistance: Boolean(form.placementAssistance),
      syllabusUrl: form.syllabusUrl?.trim() || null,
      enrollUrl: form.enrollUrl?.trim() || null,
      iconUrl: form.iconUrl ? form.iconUrl.trim() : null,
      displayOrder: Number(form.displayOrder) || 0,
      isActive: Boolean(form.isActive),
      tools: tools.map((t, idx) => ({
        id: t.id && !String(t.id).startsWith('temp-') ? t.id : null,
        toolName: t.toolName.trim(),
        groupName: t.groupName?.trim() || 'Tools',
        iconUrl: t.iconUrl?.trim() || null,
        displayOrder: idx + 1,
      })),
      modules: modules.map((m, idx) => ({
        id: m.id && !String(m.id).startsWith('temp-') ? m.id : null,
        title: m.title.trim(),
        topics: (m.topics || []).filter((top) => top && top.trim()),
        displayOrder: idx + 1,
      })),
    }

    try {
      if (editingCourse) {
        await apiClient.put(`/api/admin/courses/${editingCourse.id}`, payload)
        showAlert?.('Course and all content updated successfully')
      } else {
        await apiClient.post('/api/admin/courses', payload)
        showAlert?.('Course created successfully')
      }
      setIsModalOpen(false)
      fetchCourses()
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save course'
      showAlert?.(msg, 'error')
    } finally {
      setSaving(false)
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

  // ── Tool List Handlers ──
  const handleAddTool = () => {
    if (!newTool.toolName.trim()) return
    const autoPreset = PRESET_ICONS.find(
      (p) => p.name.toLowerCase() === newTool.toolName.trim().toLowerCase()
    )
    const iconUrl = newTool.iconUrl.trim() || autoPreset?.url || ''
    setTools([
      ...tools,
      {
        id: `temp-${Date.now()}-${Math.random()}`,
        toolName: newTool.toolName.trim(),
        groupName: newTool.groupName.trim() || 'Tools',
        iconUrl,
        displayOrder: tools.length + 1,
      },
    ])
    setNewTool({ toolName: '', groupName: newTool.groupName || 'Tools', iconUrl: '' })
  }

  const handleRemoveTool = (index) => {
    setTools(tools.filter((_, i) => i !== index))
  }

  const handleMoveTool = (index, direction) => {
    const targetIndex = index + direction
    if (targetIndex < 0 || targetIndex >= tools.length) return
    const copy = [...tools]
    const temp = copy[index]
    copy[index] = copy[targetIndex]
    copy[targetIndex] = temp
    setTools(copy)
  }

  const handleUpdateTool = (index, field, value) => {
    const copy = [...tools]
    copy[index] = { ...copy[index], [field]: value }
    setTools(copy)
  }

  // ── Modules & Topics Handlers ──
  const handleAddModule = () => {
    if (!newModuleTitle.trim()) return
    setModules([
      ...modules,
      {
        id: `temp-${Date.now()}-${Math.random()}`,
        title: newModuleTitle.trim(),
        topics: [],
        displayOrder: modules.length + 1,
      },
    ])
    setNewModuleTitle('')
  }

  const handleRemoveModule = (modIndex) => {
    setModules(modules.filter((_, i) => i !== modIndex))
  }

  const handleMoveModule = (modIndex, direction) => {
    const targetIndex = modIndex + direction
    if (targetIndex < 0 || targetIndex >= modules.length) return
    const copy = [...modules]
    const temp = copy[modIndex]
    copy[modIndex] = copy[targetIndex]
    copy[targetIndex] = temp
    setModules(copy)
  }

  const handleUpdateModuleTitle = (modIndex, title) => {
    const copy = [...modules]
    copy[modIndex] = { ...copy[modIndex], title }
    setModules(copy)
  }

  const handleAddTopic = (modIndex) => {
    const topicText = (newTopicInputs[modIndex] || '').trim()
    if (!topicText) return
    const copy = [...modules]
    const currentTopics = copy[modIndex].topics || []
    copy[modIndex] = {
      ...copy[modIndex],
      topics: [...currentTopics, topicText],
    }
    setModules(copy)
    setNewTopicInputs({ ...newTopicInputs, [modIndex]: '' })
  }

  const handleRemoveTopic = (modIndex, topicIndex) => {
    const copy = [...modules]
    copy[modIndex] = {
      ...copy[modIndex],
      topics: copy[modIndex].topics.filter((_, i) => i !== topicIndex),
    }
    setModules(copy)
  }

  const handleMoveTopic = (modIndex, topicIndex, direction) => {
    const copy = [...modules]
    const topics = [...(copy[modIndex].topics || [])]
    const targetIndex = topicIndex + direction
    if (targetIndex < 0 || targetIndex >= topics.length) return
    const temp = topics[topicIndex]
    topics[topicIndex] = topics[targetIndex]
    topics[targetIndex] = temp
    copy[modIndex] = { ...copy[modIndex], topics }
    setModules(copy)
  }

  const handleUpdateTopic = (modIndex, topicIndex, value) => {
    const copy = [...modules]
    const topics = [...(copy[modIndex].topics || [])]
    topics[topicIndex] = value
    copy[modIndex] = { ...copy[modIndex], topics }
    setModules(copy)
  }

  // ── Role Bullets Handlers ──
  const handleAddRoleBullet = () => {
    if (!newBulletText.trim()) return
    setRoleBullets([...roleBullets, newBulletText.trim()])
    setNewBulletText('')
  }

  const handleRemoveRoleBullet = (index) => {
    setRoleBullets(roleBullets.filter((_, i) => i !== index))
  }

  const handleUpdateRoleBullet = (index, value) => {
    const copy = [...roleBullets]
    copy[index] = value
    setRoleBullets(copy)
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

      {/* Search and Category Filter Controls */}
      <div className="mb-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by course name or badge..."
            className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2 text-sm text-slate-700 placeholder-slate-400 focus:border-[#084b66] focus:outline-none shadow-2xs"
          />
        </div>

        {/* Group Selector Pill Tabs & Stats */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Logical Group Tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200/80">
            <button
              type="button"
              onClick={() => setSelectedGroup('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedGroup === 'all'
                  ? 'bg-white text-[#084b66] shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Courses ({courses.length})
            </button>
            <button
              type="button"
              onClick={() => setSelectedGroup('batch')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedGroup === 'batch'
                  ? 'bg-white text-emerald-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles size={13} className="text-emerald-600" />
              Batch Courses ({courses.filter(isBatchCourse).length})
            </button>
            <button
              type="button"
              onClick={() => setSelectedGroup('normal')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedGroup === 'normal'
                  ? 'bg-white text-slate-800 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BookOpen size={13} className="text-slate-500" />
              Normal Courses ({courses.filter((c) => !Boolean(c.badge || c.badgeText || c.badgeLabel)).length})
            </button>
          </div>

          {/* Inactive toggle */}
          <label className="inline-flex items-center gap-1.5 text-xs text-slate-600 font-medium cursor-pointer ml-2">
            <input
              type="checkbox"
              checked={showInactive}
              onChange={(e) => setShowInactive(e.target.checked)}
              className="rounded border-slate-300 text-[#084b66] focus:ring-[#084b66]"
            />
            Show Inactive
          </label>
        </div>
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
      ) : (() => {
        const term = searchTerm.toLowerCase()
        const filtered = courses.filter((c) => {
          if (!showInactive && c.isActive === false) return false
          const name = (c.name || c.title || '').toLowerCase()
          const badge = (c.badge || c.badgeText || c.badgeLabel || '').toLowerCase()
          return name.includes(term) || badge.includes(term)
        })

        const batchCourses = filtered.filter(isBatchCourse)
        const normalCourses = filtered.filter((c) => !isBatchCourse(c))

        const renderTable = (list, groupTitle, groupIcon, groupTheme) => {
          if (list.length === 0) {
            return (
              <div className="rounded-xl border border-dashed border-slate-200 bg-white p-6 text-center text-xs text-slate-400">
                No {groupTitle.toLowerCase()} matching the current filter.
              </div>
            )
          }

          return (
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3.5">Course Name</th>
                      <th className="px-6 py-3.5">Batch Category</th>
                      <th className="px-6 py-3.5">Badge</th>
                      <th className="px-6 py-3.5">Duration</th>
                      <th className="px-6 py-3.5">Mode</th>
                      <th className="px-6 py-3.5">Status</th>
                      <th className="px-6 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {list.map((c) => {
                      const hasBatch = isBatchCourse(c)
                      return (
                        <tr key={c.id} className="hover:bg-slate-50/70 transition">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 shrink-0 flex items-center justify-center rounded-xl border border-slate-200 bg-white p-1.5 shadow-2xs">
                                <img
                                  src={getImageUrl(c.iconUrl || c.icon_url, '/tech/api.svg')}
                                  alt=""
                                  className="h-full w-full object-contain"
                                  onError={(e) => { e.currentTarget.src = '/tech/api.svg' }}
                                />
                              </div>
                              <div className="min-w-0">
                                <div className="font-semibold text-slate-900">{c.name || c.title}</div>
                                <div className="text-xs text-slate-400 line-clamp-1 max-w-sm mt-0.5">
                                  {c.shortDescription || 'No description provided'}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {hasBatch ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <Sparkles size={12} className="text-emerald-600" />
                                Batch Course
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                                <BookOpen size={12} className="text-slate-400" />
                                Normal Course
                              </span>
                            )}
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
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )
        }

        return (
          <div className="space-y-8">
            {/* Show Group 1: Batch Courses if 'all' or 'batch' is selected */}
            {(selectedGroup === 'all' || selectedGroup === 'batch') && (
              <div>
                <div className="flex items-center justify-between mb-3 px-1">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 shadow-2xs">
                      <Sparkles size={16} />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">Group 1 — Batch Courses</h3>
                      <p className="text-xs text-slate-500">Courses currently running with active batch schedules and featured badges</p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {batchCourses.length} {batchCourses.length === 1 ? 'Course' : 'Courses'}
                  </span>
                </div>
                {renderTable(batchCourses, 'Batch Courses', Sparkles, 'emerald')}
              </div>
            )}

            {/* Show Group 2: Normal Courses if 'all' or 'normal' is selected */}
            {(selectedGroup === 'all' || selectedGroup === 'normal') && (
              <div>
                <div className="flex items-center justify-between mb-3 px-1">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-600 shadow-2xs">
                      <BookOpen size={16} />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">Group 2 — Normal Courses</h3>
                      <p className="text-xs text-slate-500">Standard catalog courses without an active batch badge</p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                    {normalCourses.length} {normalCourses.length === 1 ? 'Course' : 'Courses'}
                  </span>
                </div>
                {renderTable(normalCourses, 'Normal Courses', BookOpen, 'slate')}
              </div>
            )}
          </div>
        )
      })()}

      {/* Course Modal — Fixed Header, Fixed Footer, Internal Scroll Body */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-4xl rounded-2xl bg-white shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
            {/* 1. Fixed Header (Always visible) */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white shrink-0">
              <div className="min-w-0 pr-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-slate-900">
                    {editingCourse ? 'Edit Course & Content' : 'Create New Course'}
                  </h3>
                  {form.badge && (
                    <CourseBadge badge={form.badge} badgeText={form.badgeText || form.badge} />
                  )}
                </div>
                <p className="text-xs text-slate-500 truncate mt-0.5">
                  {editingCourse
                    ? `${editingCourse.name || editingCourse.title} — Manage tools, modules, and public details`
                    : 'Add a new course with curriculum, tech stack, and landing content'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition shrink-0"
              >
                <X size={20} />
              </button>
            </div>

            {/* 2. Modal Navigation Tabs (Fixed under header) */}
            <div className="flex items-center gap-1.5 px-6 py-2 bg-slate-50 border-b border-slate-200 shrink-0 overflow-x-auto">
              <button
                type="button"
                onClick={() => setActiveModalTab('basic')}
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                  activeModalTab === 'basic'
                    ? 'bg-white text-[#084b66] shadow-2xs border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <BookOpen size={14} />
                <span>1. General Info & Badge</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveModalTab('tools')}
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                  activeModalTab === 'tools'
                    ? 'bg-white text-[#084b66] shadow-2xs border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Wrench size={14} />
                <span>2. Tool List</span>
                <span className="ml-1 rounded-full px-1.5 py-0.2 bg-[#084b66]/10 text-[#084b66] text-[10px] font-bold">
                  {tools.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveModalTab('curriculum')}
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                  activeModalTab === 'curriculum'
                    ? 'bg-white text-[#084b66] shadow-2xs border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <ListOrdered size={14} />
                <span>3. Topics You Will Learn</span>
                <span className="ml-1 rounded-full px-1.5 py-0.2 bg-[#084b66]/10 text-[#084b66] text-[10px] font-bold">
                  {modules.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveModalTab('content')}
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                  activeModalTab === 'content'
                    ? 'bg-white text-[#084b66] shadow-2xs border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <FileText size={14} />
                <span>4. Why Learn & Role Copy</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveModalTab('media')}
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                  activeModalTab === 'media'
                    ? 'bg-white text-[#084b66] shadow-2xs border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <ImageIcon size={14} />
                <span>5. Media & Links</span>
              </button>
            </div>

            {/* 3. Scrollable Form Body (ONLY this scrolls internally) */}
            <form
              id="course-manage-form"
              onSubmit={handleSave}
              className="p-6 overflow-y-auto flex-1 overscroll-contain space-y-6"
            >
              {loadingDetails && (
                <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-700">
                  <Loader2 size={16} className="animate-spin shrink-0" />
                  <span>Loading full course curriculum and tool stack from server...</span>
                </div>
              )}

              {/* TAB 1: BASIC INFO & BADGE */}
              {activeModalTab === 'basic' && (
                <div className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
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
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                        Short Subject / Category (for headings)
                      </label>
                      <input
                        type="text"
                        value={form.category}
                        onChange={(e) => setForm({ ...form, category: e.target.value })}
                        placeholder="e.g. Python Full Stack"
                        className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-[#084b66] focus:outline-none focus:ring-1 focus:ring-[#084b66]"
                      />
                      <span className="text-[11px] text-slate-400 mt-1 block">
                        Used in headings like "Why Learn [Category]?"
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                      Short Description (Course Card Summary)
                    </label>
                    <textarea
                      rows={2}
                      value={form.shortDescription}
                      onChange={(e) => setForm({ ...form, shortDescription: e.target.value })}
                      placeholder="Brief 1-2 sentence summary displayed on the catalog card..."
                      className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-[#084b66] focus:outline-none focus:ring-1 focus:ring-[#084b66]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                        Duration (Months)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="48"
                        value={form.durationMonths}
                        onChange={(e) => setForm({ ...form, durationMonths: e.target.value })}
                        className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-[#084b66] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                        Learning Mode
                      </label>
                      <select
                        value={form.mode}
                        onChange={(e) => setForm({ ...form, mode: e.target.value })}
                        className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-[#084b66] focus:outline-none"
                      >
                        <option value="BOTH">Offline / Online (Both)</option>
                        <option value="OFFLINE">Offline Only</option>
                        <option value="ONLINE">Online Only</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
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

                  {/* Badges Section */}
                  <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-bold uppercase tracking-wider text-[#084b66]">
                        Course Badge / Category
                      </div>
                      <span className="text-[11px] text-slate-500">Highlights on course card</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          Badge Style / Category
                        </label>
                        <select
                          value={form.badge}
                          onChange={(e) => {
                            const val = e.target.value
                            let suggestedText = form.badgeText
                            if (!form.badgeText || ['High-demand', '30% Offer', 'Best Seller', 'Most Enrolled', 'Trending', 'Popular', 'New', 'Limited Seats'].includes(form.badgeText)) {
                              if (val === 'HIGH_DEMAND') suggestedText = 'High-demand'
                              else if (val === 'OFFER') suggestedText = '30% Offer'
                              else if (val === 'BEST_SELLER') suggestedText = 'Best Seller'
                              else if (val === 'MOST_ENROLLED') suggestedText = 'Most Enrolled'
                              else if (val === 'TRENDING') suggestedText = 'Trending'
                              else if (val === 'POPULAR') suggestedText = 'Popular'
                              else if (val === 'NEW') suggestedText = 'New'
                              else if (val === 'LIMITED_SEATS') suggestedText = 'Limited Seats'
                            }
                            setForm({ ...form, badge: val, badgeText: suggestedText })
                          }}
                          className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm focus:border-[#084b66] focus:outline-none"
                        >
                          <option value="">No Badge</option>
                          <option value="MOST_ENROLLED">Most Enrolled (Blue)</option>
                          <option value="OFFER">30% Offer / Offer (Pink/Red)</option>
                          <option value="TRENDING">Trending (Purple)</option>
                          <option value="HIGH_DEMAND">High Demand (Green)</option>
                          <option value="BEST_SELLER">Best Seller (Yellow/Amber)</option>
                          <option value="NEW">New (Cyan)</option>
                          <option value="LIMITED_SEATS">Limited Seats (Rose)</option>
                          <option value="POPULAR">Popular (Orange)</option>
                          <option value="CUSTOM">Custom Badge...</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          Badge Text / Label
                        </label>
                        <input
                          type="text"
                          value={form.badgeText}
                          onChange={(e) => setForm({ ...form, badgeText: e.target.value })}
                          placeholder="e.g. 30% Offer, Trending, Best Seller..."
                          className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm focus:border-[#084b66] focus:outline-none"
                        />
                      </div>
                    </div>

                    {(form.badge || form.badgeText) && (
                      <div className="flex items-center gap-2 pt-2 border-t border-slate-200/60">
                        <span className="text-xs font-medium text-slate-500">Live Badge Preview:</span>
                        <CourseBadge badge={form.badge} badgeText={form.badgeText} />
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-6 pt-2">
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
              )}

              {/* TAB 2: TOOL LIST MANAGEMENT */}
              {activeModalTab === 'tools' && (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Tool List Management</h4>
                    <p className="text-xs text-slate-500">
                      Manage tools, libraries, and frameworks displayed in the "What is {form.category || form.name || 'this course'}?" section.
                    </p>
                  </div>

                  {/* Add New Tool Box */}
                  <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 space-y-3">
                    <div className="text-xs font-bold uppercase tracking-wider text-[#084b66]">
                      + Add Tool to Course
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-medium text-slate-600 mb-1">
                          Tool Name *
                        </label>
                        <input
                          type="text"
                          value={newTool.toolName}
                          onChange={(e) => setNewTool({ ...newTool, toolName: e.target.value })}
                          placeholder="e.g. Docker, Spring Boot, MySQL"
                          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs focus:border-[#084b66] focus:outline-none"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault()
                              handleAddTool()
                            }
                          }}
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-slate-600 mb-1">
                          Group / Category
                        </label>
                        <select
                          value={newTool.groupName}
                          onChange={(e) => setNewTool({ ...newTool, groupName: e.target.value })}
                          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs focus:border-[#084b66] focus:outline-none"
                        >
                          <option value="Tools">Tools</option>
                          <option value="Front End">Front End</option>
                          <option value="Back End">Back End</option>
                          <option value="Database">Database</option>
                          <option value="Tools & Deploy">Tools & Deploy</option>
                          <option value="Soft Skill">Soft Skill</option>
                          <option value="Cloud">Cloud</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-slate-600 mb-1">
                          Icon (Upload or URL)
                        </label>
                        <div className="flex gap-1.5">
                          <input
                            type="text"
                            value={newTool.iconUrl}
                            onChange={(e) => setNewTool({ ...newTool, iconUrl: e.target.value })}
                            placeholder="e.g. /tech/docker.svg"
                            className="flex-1 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs focus:border-[#084b66] focus:outline-none"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault()
                                handleAddTool()
                              }
                            }}
                          />
                          <label className="inline-flex items-center gap-1 rounded-xl border border-slate-300 bg-white px-2.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer transition shrink-0 shadow-2xs">
                            <Upload size={13} />
                            <span>{uploadingToolIcon ? '...' : 'Upload'}</span>
                            <input
                              type="file"
                              accept="image/png, image/jpeg, image/webp, image/svg+xml"
                              onChange={handleToolIconUpload}
                              disabled={uploadingToolIcon}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Quick Pick Presets */}
                    <div>
                      <span className="text-[11px] text-slate-400 block mb-1.5 font-medium">Quick Icon Presets:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {PRESET_ICONS.slice(0, 16).map((preset) => (
                          <button
                            key={preset.name}
                            type="button"
                            onClick={() => {
                              setNewTool({
                                ...newTool,
                                toolName: newTool.toolName || preset.name,
                                iconUrl: preset.url,
                              })
                            }}
                            className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white border border-slate-200 text-[11px] font-medium text-slate-700 hover:border-[#084b66] hover:text-[#084b66] transition shadow-2xs"
                          >
                            <img src={preset.url} alt="" className="w-3.5 h-3.5 object-contain" />
                            <span>{preset.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-end pt-1">
                      <button
                        type="button"
                        onClick={handleAddTool}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-[#084b66] px-4 py-2 text-xs font-semibold text-white hover:bg-[#063c52] transition shadow-2xs"
                      >
                        <Plus size={14} />
                        <span>Add Tool</span>
                      </button>
                    </div>
                  </div>

                  {/* Tools List */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-700">Course Tools ({tools.length})</span>
                      <span className="text-[11px] text-slate-400">Use arrows to reorder tools</span>
                    </div>

                    {tools.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-xs text-slate-400">
                        No tools added yet. Use the form above to add tools like Java, Spring Boot, MySQL, React, Docker, Git.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {tools.map((tool, idx) => (
                          <div
                            key={tool.id || idx}
                            className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition shadow-2xs"
                          >
                            {/* Reorder Buttons */}
                            <div className="flex flex-col gap-0.5">
                              <button
                                type="button"
                                disabled={idx === 0}
                                onClick={() => handleMoveTool(idx, -1)}
                                className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30"
                                title="Move Up"
                              >
                                <ArrowUp size={12} />
                              </button>
                              <button
                                type="button"
                                disabled={idx === tools.length - 1}
                                onClick={() => handleMoveTool(idx, 1)}
                                className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30"
                                title="Move Down"
                              >
                                <ArrowDown size={12} />
                              </button>
                            </div>

                            {/* Icon Preview */}
                            <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center p-1 shrink-0">
                              {tool.iconUrl ? (
                                <img
                                  src={tool.iconUrl}
                                  alt=""
                                  className="w-full h-full object-contain"
                                  onError={(e) => { e.currentTarget.style.opacity = '0.3' }}
                                />
                              ) : (
                                <span className="text-[10px] font-bold text-slate-400">
                                  {tool.toolName?.substring(0, 2).toUpperCase() || '•'}
                                </span>
                              )}
                            </div>

                            {/* Tool Name Input */}
                            <div className="flex-1 min-w-0">
                              <input
                                type="text"
                                value={tool.toolName}
                                onChange={(e) => handleUpdateTool(idx, 'toolName', e.target.value)}
                                placeholder="Tool name"
                                className="w-full rounded-lg border border-transparent hover:border-slate-200 focus:border-[#084b66] px-2 py-1 text-xs font-semibold text-slate-800 focus:outline-none bg-transparent"
                              />
                            </div>

                            {/* Group Tag Input */}
                            <div className="w-28 shrink-0">
                              <select
                                value={tool.groupName || 'Tools'}
                                onChange={(e) => handleUpdateTool(idx, 'groupName', e.target.value)}
                                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-medium text-slate-600 focus:outline-none"
                              >
                                <option value="Tools">Tools</option>
                                <option value="Front End">Front End</option>
                                <option value="Back End">Back End</option>
                                <option value="Database">Database</option>
                                <option value="Tools & Deploy">Tools & Deploy</option>
                                <option value="Soft Skill">Soft Skill</option>
                                <option value="Cloud">Cloud</option>
                              </select>
                            </div>

                            {/* Icon URL Input */}
                            <div className="w-36 shrink-0 hidden sm:block">
                              <input
                                type="text"
                                value={tool.iconUrl || ''}
                                onChange={(e) => handleUpdateTool(idx, 'iconUrl', e.target.value)}
                                placeholder="Icon URL"
                                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] text-slate-500 focus:outline-none"
                              />
                            </div>

                            {/* Delete Tool */}
                            <button
                              type="button"
                              onClick={() => handleRemoveTool(idx)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                              title="Delete Tool"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: CURRICULUM (MODULES & TOPICS) */}
              {activeModalTab === 'curriculum' && (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Topics You Will Learn (Modules & Topics)</h4>
                    <p className="text-xs text-slate-500">
                      Manage syllabus modules and the individual bullet topics displayed in the curriculum accordion.
                    </p>
                  </div>

                  {/* Add New Module Box */}
                  <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={newModuleTitle}
                        onChange={(e) => setNewModuleTitle(e.target.value)}
                        placeholder="e.g. Module 1: Java Basics"
                        className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs focus:border-[#084b66] focus:outline-none"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            handleAddModule()
                          }
                        }}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleAddModule}
                      className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#084b66] px-4 py-2 text-xs font-semibold text-white hover:bg-[#063c52] transition shadow-2xs shrink-0"
                    >
                      <Plus size={14} />
                      <span>Add Module</span>
                    </button>
                  </div>

                  {/* Modules List */}
                  {modules.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-xs text-slate-400">
                      No curriculum modules created yet. Add your first module using the form above.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {modules.map((mod, modIdx) => (
                        <div
                          key={mod.id || modIdx}
                          className="rounded-xl border border-slate-200 bg-white p-4 space-y-3 shadow-2xs"
                        >
                          {/* Module Header Bar */}
                          <div className="flex items-center gap-2">
                            <div className="flex flex-col gap-0.5">
                              <button
                                type="button"
                                disabled={modIdx === 0}
                                onClick={() => handleMoveModule(modIdx, -1)}
                                className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30"
                                title="Move Module Up"
                              >
                                <ArrowUp size={12} />
                              </button>
                              <button
                                type="button"
                                disabled={modIdx === modules.length - 1}
                                onClick={() => handleMoveModule(modIdx, 1)}
                                className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30"
                                title="Move Module Down"
                              >
                                <ArrowDown size={12} />
                              </button>
                            </div>

                            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#084b66]/10 text-xs font-bold text-[#084b66]">
                              {modIdx + 1}
                            </span>

                            <input
                              type="text"
                              value={mod.title}
                              onChange={(e) => handleUpdateModuleTitle(modIdx, e.target.value)}
                              placeholder="Module title"
                              className="flex-1 rounded-lg border border-transparent hover:border-slate-200 focus:border-[#084b66] px-2 py-1 text-sm font-bold text-slate-900 focus:outline-none"
                            />

                            <span className="text-[11px] font-semibold text-slate-500 px-2 py-0.5 rounded-full bg-slate-100">
                              {(mod.topics || []).length} topics
                            </span>

                            <button
                              type="button"
                              onClick={() => handleRemoveModule(modIdx)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                              title="Delete Module"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>

                          {/* Topics List under this Module */}
                          <div className="pl-8 pt-1 border-t border-slate-100 space-y-2">
                            {/* Add Topic Input */}
                            <div className="flex items-center gap-2 pt-1">
                              <input
                                type="text"
                                value={newTopicInputs[modIdx] || ''}
                                onChange={(e) =>
                                  setNewTopicInputs({ ...newTopicInputs, [modIdx]: e.target.value })
                                }
                                placeholder="Add topic bullet (e.g. Variables and Data Types)..."
                                className="flex-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-700 placeholder-slate-400 focus:border-[#084b66] focus:outline-none"
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault()
                                    handleAddTopic(modIdx)
                                  }
                                }}
                              />
                              <button
                                type="button"
                                onClick={() => handleAddTopic(modIdx)}
                                className="inline-flex items-center gap-1 rounded-lg bg-slate-100 hover:bg-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition"
                              >
                                <Plus size={13} />
                                <span>Add Topic</span>
                              </button>
                            </div>

                            {/* Existing Topic Bullets */}
                            {(mod.topics || []).length === 0 ? (
                              <div className="text-[11px] text-slate-400 italic py-1">
                                No topics in this module yet. Type above to add topics.
                              </div>
                            ) : (
                              <div className="space-y-1.5 pt-1">
                                {(mod.topics || []).map((topic, topIdx) => (
                                  <div
                                    key={topIdx}
                                    className="flex items-center gap-2 group bg-slate-50/80 rounded-lg px-2.5 py-1 text-xs border border-slate-100 hover:border-slate-200"
                                  >
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#084b66] shrink-0" />
                                    <input
                                      type="text"
                                      value={topic}
                                      onChange={(e) => handleUpdateTopic(modIdx, topIdx, e.target.value)}
                                      className="flex-1 bg-transparent border-none text-xs text-slate-700 focus:outline-none focus:bg-white px-1 py-0.5 rounded"
                                    />
                                    <button
                                      type="button"
                                      disabled={topIdx === 0}
                                      onClick={() => handleMoveTopic(modIdx, topIdx, -1)}
                                      className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-slate-700 p-0.5 disabled:opacity-0"
                                      title="Move topic up"
                                    >
                                      <ArrowUp size={11} />
                                    </button>
                                    <button
                                      type="button"
                                      disabled={topIdx === (mod.topics || []).length - 1}
                                      onClick={() => handleMoveTopic(modIdx, topIdx, 1)}
                                      className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-slate-700 p-0.5 disabled:opacity-0"
                                      title="Move topic down"
                                    >
                                      <ArrowDown size={11} />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveTopic(modIdx, topIdx)}
                                      className="text-slate-400 hover:text-red-600 p-0.5"
                                      title="Remove topic"
                                    >
                                      <X size={13} />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: WHY LEARN & ROLE SECTION COPY */}
              {activeModalTab === 'content' && (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Course Page Copy & Description</h4>
                    <p className="text-xs text-slate-500">
                      Manage the detailed course description and career role overview shown to visitors.
                    </p>
                  </div>

                  {/* Why Learn Description */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                      "Why Learn {form.category || form.name}?" Section Description
                    </label>
                    <textarea
                      rows={5}
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      placeholder="Enter the detailed paragraph explaining why students should learn this course. Supports plain text or HTML <p> tags..."
                      className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-800 focus:border-[#084b66] focus:outline-none"
                    />
                    <span className="text-[11px] text-slate-400 mt-1 block">
                      Displayed on the Course Details page right below the banner tabs.
                    </span>
                  </div>

                  {/* What does a [Role] do? */}
                  <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-4">
                    <div className="text-xs font-bold uppercase tracking-wider text-[#084b66]">
                      Career Role Section ("What does a [Role] do?")
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Role Heading
                      </label>
                      <input
                        type="text"
                        value={form.roleHeading}
                        onChange={(e) => setForm({ ...form, roleHeading: e.target.value })}
                        placeholder="e.g. What does a Full Stack Developer do?"
                        className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs focus:border-[#084b66] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Role Intro Paragraph
                      </label>
                      <textarea
                        rows={2}
                        value={form.roleIntro}
                        onChange={(e) => setForm({ ...form, roleIntro: e.target.value })}
                        placeholder="e.g. The front end and back end require different skill sets. Full stack developers work across both..."
                        className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs focus:border-[#084b66] focus:outline-none"
                      />
                    </div>

                    {/* Role Bullets */}
                    <div className="space-y-2 pt-1 border-t border-slate-200/60">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-medium text-slate-700">
                          Role Responsibilities (Bullet Points)
                        </label>
                        <span className="text-[11px] text-slate-400">{roleBullets.length} bullets</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={newBulletText}
                          onChange={(e) => setNewBulletText(e.target.value)}
                          placeholder="e.g. Design the application structure, APIs, and database..."
                          className="flex-1 rounded-xl border border-slate-300 bg-white px-3.5 py-1.5 text-xs focus:border-[#084b66] focus:outline-none"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault()
                              handleAddRoleBullet()
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={handleAddRoleBullet}
                          className="inline-flex items-center gap-1 rounded-xl bg-slate-200 hover:bg-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 transition"
                        >
                          <Plus size={14} />
                          <span>Add</span>
                        </button>
                      </div>

                      {roleBullets.length > 0 && (
                        <div className="space-y-1.5 pt-1">
                          {roleBullets.map((bullet, bIdx) => (
                            <div
                              key={bIdx}
                              className="flex items-center gap-2 bg-white rounded-lg p-2 border border-slate-200 text-xs"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                              <input
                                type="text"
                                value={bullet}
                                onChange={(e) => handleUpdateRoleBullet(bIdx, e.target.value)}
                                className="flex-1 bg-transparent border-none text-xs text-slate-700 focus:outline-none"
                              />
                              <button
                                type="button"
                                onClick={() => handleRemoveRoleBullet(bIdx)}
                                className="p-1 rounded text-slate-400 hover:text-red-600"
                                title="Delete bullet"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: MEDIA & LINKS */}
              {activeModalTab === 'media' && (
                <div className="space-y-5">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Media, Syllabus & Links</h4>
                    <p className="text-xs text-slate-500">Configure logo upload, syllabus PDF download link, and custom enrollment links.</p>
                  </div>

                  {/* Course Logo / Image Upload */}
                  <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-bold uppercase tracking-wider text-[#084b66]">
                        Course Logo / Icon
                      </div>
                      <div className="flex items-center gap-1 bg-slate-200/70 p-0.5 rounded-lg text-xs">
                        <button
                          type="button"
                          onClick={() => setLogoMode('upload')}
                          className={`px-2.5 py-1 rounded-md font-medium transition ${
                            logoMode === 'upload' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          Direct Upload
                        </button>
                        <button
                          type="button"
                          onClick={() => setLogoMode('url')}
                          className={`px-2.5 py-1 rounded-md font-medium transition ${
                            logoMode === 'url' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          Image URL
                        </button>
                      </div>
                    </div>

                    {form.iconUrl ? (
                      <div className="flex items-center gap-3.5 bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
                        <div className="h-14 w-14 flex items-center justify-center rounded-xl border border-slate-200 bg-slate-50 p-1.5 shadow-2xs shrink-0">
                          <img
                            src={getImageUrl(form.iconUrl)}
                            alt="Course Logo Preview"
                            className="h-full w-full object-contain"
                            onError={(e) => { e.currentTarget.style.opacity = '0.3' }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold text-slate-800 truncate">
                            {typeof form.iconUrl === 'string' ? form.iconUrl.split('/').pop() || form.iconUrl : 'Course Logo'}
                          </div>
                          <div className="text-[11px] text-emerald-600 font-medium mt-0.5">Logo attached</div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <label
                            htmlFor="course-logo-file-input"
                            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer transition shadow-2xs"
                          >
                            <Upload size={13} />
                            <span>{uploadingLogo ? 'Uploading...' : 'Replace'}</span>
                          </label>
                          <button
                            type="button"
                            onClick={() => setForm({ ...form, iconUrl: '' })}
                            className="rounded-xl p-2 text-red-500 hover:bg-red-50 transition cursor-pointer"
                            title="Remove logo"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleLogoUpload}
                          accept="image/png, image/jpeg, image/webp, image/svg+xml"
                          className="hidden"
                          id="course-logo-file-input"
                        />
                      </div>
                    ) : logoMode === 'upload' ? (
                      <div>
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleLogoUpload}
                          accept="image/png, image/jpeg, image/webp, image/svg+xml"
                          className="hidden"
                          id="course-logo-file-input"
                        />
                        <label
                          htmlFor="course-logo-file-input"
                          className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-white p-5 hover:border-[#084b66] transition cursor-pointer text-center group"
                        >
                          {uploadingLogo ? (
                            <div className="flex items-center gap-2 text-xs text-[#084b66] font-semibold py-2">
                              <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#084b66] border-t-transparent" />
                              <span>Uploading logo...</span>
                            </div>
                          ) : (
                            <>
                              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 border border-slate-200 text-slate-400 group-hover:text-[#084b66] group-hover:border-[#084b66]/30 shadow-2xs mb-2 transition">
                                <Upload size={18} />
                              </div>
                              <span className="text-xs font-bold text-slate-800">Choose Course Logo from Computer</span>
                              <span className="text-[11px] text-slate-400 mt-0.5">Supports PNG, SVG, JPG, WebP (max 5MB)</span>
                            </>
                          )}
                        </label>
                      </div>
                    ) : (
                      <div>
                        <input
                          type="text"
                          value={form.iconUrl}
                          onChange={(e) => setForm({ ...form, iconUrl: e.target.value })}
                          placeholder="Paste image URL (https://... or /tech/...)"
                          className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm focus:border-[#084b66] focus:outline-none"
                        />
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                        Syllabus PDF URL
                      </label>
                      <input
                        type="text"
                        value={form.syllabusUrl}
                        onChange={(e) => setForm({ ...form, syllabusUrl: e.target.value })}
                        placeholder="e.g. /syllabus/python.pdf"
                        className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-[#084b66] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                        Custom Enroll URL (Optional)
                      </label>
                      <input
                        type="text"
                        value={form.enrollUrl}
                        onChange={(e) => setForm({ ...form, enrollUrl: e.target.value })}
                        placeholder="e.g. /courses/python-full-stack"
                        className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-[#084b66] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}
            </form>

            {/* 4. Fixed Footer (Always visible) */}
            <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-200 bg-slate-50 shrink-0">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition shadow-2xs"
              >
                Cancel
              </button>
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-500 hidden sm:inline">
                  {tools.length} Tools | {modules.length} Modules
                </span>
                <button
                  type="submit"
                  form="course-manage-form"
                  disabled={saving || loadingDetails}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#084b66] px-6 py-2 text-sm font-semibold text-white hover:bg-[#063c52] transition shadow-sm disabled:opacity-50"
                >
                  {saving && <Loader2 size={16} className="animate-spin" />}
                  <span>{saving ? 'Saving...' : editingCourse ? 'Save Changes' : 'Create Course'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
