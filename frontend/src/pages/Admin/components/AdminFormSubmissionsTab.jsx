import { useState, useEffect, useMemo } from 'react'
import {
  Search,
  Download,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Filter,
  RefreshCw,
  Trash2,
  CalendarCheck,
  GraduationCap,
  PhoneCall,
  BookOpen,
  UserCheck,
  MessageSquare,
  Briefcase,
  X,
  ExternalLink,
} from 'lucide-react'
import apiClient from '../../../services/apiClient.js'

const FORM_CONFIGS = {
  'demo-bookings': {
    title: 'Demo Class Bookings',
    description: 'Student bookings submitted from the Book Demo Class section.',
    endpoint: '/api/admin/demo-bookings',
    icon: CalendarCheck,
    exportName: 'Demo_Bookings',
    columns: [
      { key: 'name', label: 'Name' },
      { key: 'email', label: 'Email Address' },
      { key: 'mobileNumber', label: 'Mobile' },
      { key: 'courseName', label: 'Course' },
      { key: 'status', label: 'Status' },
      { key: 'createdAt', label: 'Booked Date' },
    ],
    statusOptions: ['PENDING', 'CONTACTED', 'ENROLLED'],
    statusUpdateEndpoint: (id) => `/api/admin/demo-bookings/${id}/status`,
    statusUpdateMethod: 'patch',
  },
  registrations: {
    title: 'Program Registrations',
    description: 'Upcoming program registrations for webinars, workshops, and internships.',
    endpoint: '/api/admin/upcoming-programs/registrations',
    icon: GraduationCap,
    exportName: 'Program_Registrations',
    columns: [
      { key: 'fullName', label: 'Name' },
      { key: 'phoneNumber', label: 'Phone' },
      { key: 'email', label: 'Email' },
      { key: 'programTitle', label: 'Program / Event' },
      { key: 'programType', label: 'Type' },
      { key: 'mode', label: 'Mode' },
      { key: 'locationInfo', label: 'Meet Link / Venue' },
      { key: 'createdAt', label: 'Registered Date' },
    ],
  },
  'connect-with-us': {
    title: 'Connect With Us Submissions',
    description: 'Callback and connection requests submitted by prospective students.',
    endpoint: '/api/connect-with-us',
    icon: PhoneCall,
    exportName: 'Connect_With_Us',
    columns: [
      { key: 'fullName', label: 'Name' },
      { key: 'phoneNumber', label: 'Phone' },
      { key: 'email', label: 'Email' },
      { key: 'message', label: 'Message / Interest' },
      { key: 'createdAt', label: 'Date' },
    ],
  },
  'course-enquiries': {
    title: 'Course Enquiries',
    description: 'Direct inquiries submitted from course syllabus and detail pages.',
    endpoint: '/api/course-enquiries',
    icon: BookOpen,
    exportName: 'Course_Enquiries',
    columns: [
      { key: 'fullName', label: 'Name' },
      { key: 'mobileNumber', label: 'Mobile' },
      { key: 'email', label: 'Email' },
      { key: 'courseTitle', label: 'Course' },
      { key: 'message', label: 'Query / Notes' },
      { key: 'createdAt', label: 'Date' },
    ],
  },
  leads: {
    title: 'Enroll Now Leads',
    description: 'Enrollment leads captured from the Enroll Now dialog.',
    endpoint: '/api/leads',
    endpointParams: { source: 'COURSE_ENROLL_FORM' },
    icon: UserCheck,
    exportName: 'Enroll_Now_Leads',
    columns: [
      { key: 'name', label: 'Name' },
      { key: 'phoneNumber', label: 'Phone' },
      { key: 'email', label: 'Email' },
      { key: 'preferredCourse', label: 'Preferred Course' },
      { key: 'learningMode', label: 'Learning Mode' },
      { key: 'status', label: 'Status' },
      { key: 'createdAt', label: 'Date' },
    ],
    statusOptions: ['NEW', 'CONTACTED', 'QUALIFIED', 'LOST', 'CONVERTED'],
    statusUpdateEndpoint: (id) => `/api/leads/${id}/status`,
    statusUpdateMethod: 'patch',
  },
  services: {
    title: 'Services Form Submissions',
    description: 'Inquiries submitted from the Services page CTA form.',
    endpoint: '/api/leads',
    endpointParams: { source: 'SERVICE_CTA_FORM' },
    icon: Briefcase,
    exportName: 'Services_Submissions',
    columns: [
      { key: 'name', label: 'Name' },
      { key: 'mobile', label: 'Mobile Number' },
      { key: 'email', label: 'Email' },
      { key: 'lookingFor', label: 'Service / Requirement' },
      { key: 'status', label: 'Status' },
      { key: 'createdAt', label: 'Date & Time' },
    ],
    statusOptions: ['NEW', 'CONTACTED', 'QUALIFIED', 'LOST', 'CONVERTED'],
    statusUpdateEndpoint: (id) => `/api/leads/${id}/status`,
    statusUpdateMethod: 'patch',
  },
  'contact-messages': {
    title: 'Contact Messages',
    description: 'Direct messages submitted through the Contact Us page form.',
    endpoint: '/api/contact-messages',
    icon: MessageSquare,
    exportName: 'Contact_Messages',
    columns: [
      { key: 'name', label: 'Name' },
      { key: 'mobile', label: 'Mobile' },
      { key: 'email', label: 'Email' },
      { key: 'whoYouAre', label: 'Role' },
      { key: 'lookingFor', label: 'Looking For' },
      { key: 'location', label: 'Location' },
      { key: 'status', label: 'Status' },
      { key: 'createdAt', label: 'Date' },
    ],
    statusOptions: ['NEW', 'READ', 'RESOLVED', 'ARCHIVED'],
    statusUpdateEndpoint: (id) => `/api/contact-messages/${id}/status`,
    statusUpdateMethod: 'put',
  },
}

function resolveFieldValue(item, key) {
  if (!item) return ''
  const val = item[key]
  if (val !== undefined && val !== null && String(val).trim() !== '') {
    return val
  }

  // Resilient fallback aliases so real submitted data never displays as empty / '-'
  if (key === 'fullName' || key === 'name') {
    return item.fullName || item.name || ''
  }
  if (key === 'phoneNumber' || key === 'mobileNumber' || key === 'mobile' || key === 'phone') {
    return item.phoneNumber || item.mobileNumber || item.mobile || item.phone || ''
  }
  if (key === 'preferredCourse' || key === 'courseName' || key === 'courseTitle' || key === 'programTitle') {
    return item.preferredCourse || item.courseName || item.courseTitle || item.programTitle || ''
  }
  if (key === 'message' || key === 'query' || key === 'lookingFor' || key === 'notes') {
    return item.message || item.query || item.lookingFor || item.notes || ''
  }
  if (key === 'learningMode') {
    return item.learningMode || ''
  }
  if (key === 'mode') {
    return item.mode || 'ONLINE'
  }
  if (key === 'locationInfo') {
    return item.locationInfo || item.meetLink || item.venueAddress || '-'
  }
  if (key === 'email') {
    return item.email || ''
  }
  if (key === 'whoYouAre') {
    return item.whoYouAre || ''
  }
  if (key === 'programType' || key === 'type') {
    return item.programType || item.type || ''
  }
  return val !== undefined && val !== null ? val : ''
}

function formatDate(dateStr) {
  if (!dateStr) return '-'
  try {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return dateStr
    return d.toLocaleString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })
  } catch (_e) {
    return dateStr
  }
}

function getStatusBadge(status) {
  if (!status) return null
  const s = String(status).toUpperCase()
  if (s === 'PENDING' || s === 'NEW') {
    return <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 border border-amber-200">Pending</span>
  }
  if (s === 'CONTACTED' || s === 'READ') {
    return <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 border border-blue-200">Contacted</span>
  }
  if (s === 'ENROLLED' || s === 'RESOLVED' || s === 'CONVERTED') {
    return <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">Enrolled / Resolved</span>
  }
  return <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">{status}</span>
}

export default function AdminFormSubmissionsTab({ formType = 'demo-bookings', showAlert }) {
  const config = FORM_CONFIGS[formType] || FORM_CONFIGS['demo-bookings']
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(20)
  const [totalPages, setTotalPages] = useState(1)
  const [totalElements, setTotalElements] = useState(0)
  const [selectedItem, setSelectedItem] = useState(null)
  const [updatingId, setUpdatingId] = useState(null)

  const fetchData = async () => {
    setLoading(true)
    try {
      const params = {
        page,
        size: pageSize,
        sortBy: 'createdAt',
        sortDir: 'desc',
        ...(config.endpointParams || {}),
      }
      if (search.trim()) params.search = search.trim()
      if (statusFilter !== 'ALL') params.status = statusFilter

      const res = await apiClient.get(config.endpoint, { params })
      const resData = res?.data?.data || res?.data

      if (resData?.content && Array.isArray(resData.content)) {
        setItems(resData.content)
        setTotalPages(resData.totalPages || 1)
        setTotalElements(resData.totalElements || resData.content.length)
      } else if (Array.isArray(resData)) {
        setItems(resData)
        setTotalPages(1)
        setTotalElements(resData.length)
      } else {
        setItems([])
        setTotalElements(0)
      }
    } catch (err) {
      setItems([])
      setTotalElements(0)
      if (showAlert) showAlert(`Failed to load ${config.title}`, 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setPage(0)
    setSearch('')
    setStatusFilter('ALL')
  }, [formType])

  useEffect(() => {
    fetchData()
  }, [formType, page, pageSize, statusFilter])

  // Body scroll lock when detail modal is open
  useEffect(() => {
    if (selectedItem) {
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = 'unset'
      }
    }
  }, [selectedItem])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    setPage(0)
    fetchData()
  }

  // Client-side filtering when backend doesn't filter search
  const filteredItems = useMemo(() => {
    if (!search.trim()) return items
    const term = search.toLowerCase()
    return items.filter((item) => {
      const name = String(resolveFieldValue(item, 'name')).toLowerCase()
      const email = String(resolveFieldValue(item, 'email')).toLowerCase()
      const mobile = String(resolveFieldValue(item, 'phoneNumber')).toLowerCase()
      const course = String(resolveFieldValue(item, 'preferredCourse')).toLowerCase()
      const msg = String(resolveFieldValue(item, 'message')).toLowerCase()
      return (
        name.includes(term) ||
        email.includes(term) ||
        mobile.includes(term) ||
        course.includes(term) ||
        msg.includes(term)
      )
    })
  }, [items, search])

  // Status update handler
  const handleUpdateStatus = async (item, newStatus) => {
    if (!config.statusUpdateEndpoint) return
    setUpdatingId(item.id)
    try {
      const url = config.statusUpdateEndpoint(item.id)
      const payload = { status: newStatus }
      if (config.statusUpdateMethod === 'put') {
        await apiClient.put(url, payload)
      } else {
        await apiClient.patch(url, payload)
      }
      if (showAlert) showAlert(`Status updated to ${newStatus}`)
      if (selectedItem && selectedItem.id === item.id) {
        setSelectedItem({ ...selectedItem, status: newStatus })
      }
      fetchData()
    } catch (err) {
      if (showAlert) showAlert(err?.message || 'Failed to update status', 'error')
    } finally {
      setUpdatingId(null)
    }
  }

  // CSV Export handler
  const handleExportCsv = () => {
    if (!filteredItems.length) {
      if (showAlert) showAlert('No records to export', 'error')
      return
    }
    const headers = config.columns.map((col) => `"${col.label}"`).join(',')
    const rows = filteredItems.map((item) =>
      config.columns
        .map((col) => {
          let val = resolveFieldValue(item, col.key)
          if (col.key === 'createdAt') val = formatDate(val)
          val = val === null || val === undefined ? '' : String(val).replace(/"/g, '""')
          return `"${val}"`
        })
        .join(',')
    )
    const csvContent = [headers, ...rows].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.setAttribute('download', `${config.exportName}_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    if (showAlert) showAlert(`Exported ${filteredItems.length} records`)
  }

  const Icon = config.icon

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#084b66] text-white shadow-sm">
            <Icon size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{config.title}</h1>
            <p className="text-xs text-slate-500 mt-0.5">{config.description}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchData}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition cursor-pointer"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
          <button
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#084b66] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#073c52] transition cursor-pointer"
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, email, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-10 pr-4 text-xs text-slate-800 placeholder-slate-400 focus:border-[#07405C] focus:outline-none focus:ring-1 focus:ring-[#07405C]"
          />
        </form>

        {/* Status Filter */}
        {config.statusOptions && (
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-medium text-slate-500">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 focus:border-[#07405C] focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              {config.statusOptions.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Data Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5">#</th>
                {config.columns.map((col) => (
                  <th key={col.key} className="px-5 py-3.5">
                    {col.label}
                  </th>
                ))}
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={config.columns.length + 2} className="py-12 text-center text-slate-400">
                    <RefreshCw size={24} className="mx-auto animate-spin text-[#07405C] mb-2" />
                    Loading submissions...
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={config.columns.length + 2} className="py-12 text-center text-slate-400">
                    {search.trim() || statusFilter !== 'ALL'
                      ? 'No submissions found matching your filters.'
                      : formType === 'registrations'
                      ? 'No program registrations yet.'
                      : `No ${config.title.toLowerCase()} yet.`}
                  </td>
                </tr>
              ) : (
                filteredItems.map((item, idx) => (
                  <tr key={item.id || idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-3.5 text-slate-400 font-mono text-[11px]">
                      {page * pageSize + idx + 1}
                    </td>
                    {config.columns.map((col) => {
                      let val = resolveFieldValue(item, col.key)
                      if (col.key === 'createdAt') val = formatDate(val)

                      if (col.key === 'status') {
                        return (
                          <td key={col.key} className="px-5 py-3.5">
                            {getStatusBadge(val)}
                          </td>
                        )
                      }

                      if (col.key === 'mode') {
                        const isOff = String(val).toUpperCase() === 'OFFLINE'
                        return (
                          <td key={col.key} className="px-5 py-3.5">
                            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold ${
                              isOff ? 'bg-amber-50 text-amber-900 border border-amber-200' : 'bg-blue-50 text-[#07405C] border border-blue-200'
                            }`}>
                              {isOff ? 'Offline' : 'Online'}
                            </span>
                          </td>
                        )
                      }

                      if (col.key === 'locationInfo') {
                        if (val && (String(val).startsWith('http://') || String(val).startsWith('https://'))) {
                          return (
                            <td key={col.key} className="px-5 py-3.5 max-w-xs truncate font-medium text-slate-800">
                              <a
                                href={val}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#07405C] hover:underline inline-flex items-center gap-1"
                              >
                                <span>Join Meet</span>
                                <ExternalLink size={12} />
                              </a>
                            </td>
                          )
                        }
                        return (
                          <td key={col.key} className="px-5 py-3.5 max-w-xs truncate font-medium text-slate-800" title={val}>
                            {val || '-'}
                          </td>
                        )
                      }

                      if (col.key === 'email') {
                        return (
                          <td key={col.key} className="px-5 py-3.5 font-medium text-slate-800">
                            {val ? (
                              <a href={`mailto:${val}`} className="text-[#07405C] hover:underline">
                                {val}
                              </a>
                            ) : (
                              <span className="text-slate-400 italic">Not provided</span>
                            )}
                          </td>
                        )
                      }

                      return (
                        <td key={col.key} className="px-5 py-3.5 max-w-xs truncate font-medium text-slate-800">
                          {val || '-'}
                        </td>
                      )
                    })}

                    <td className="px-5 py-3.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        {config.statusOptions && (
                          <select
                            value={item.status || ''}
                            onChange={(e) => handleUpdateStatus(item, e.target.value)}
                            disabled={updatingId === item.id}
                            className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
                          >
                            {config.statusOptions.map((opt) => (
                              <option key={opt} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </select>
                        )}
                        <button
                          type="button"
                          onClick={() => setSelectedItem(item)}
                          className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition cursor-pointer"
                          title="View Details"
                        >
                          <Eye size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-5 py-3.5 border-t border-slate-200 bg-slate-50/50 text-xs text-slate-500 gap-3">
          <span>
            Showing {filteredItems.length} of {totalElements} total records
          </span>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <span>Rows per page:</span>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
              >
                Previous
              </button>
              <span className="px-2 font-medium text-slate-700">
                Page {page + 1} of {Math.max(1, totalPages)}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Details Modal */}
      {selectedItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/60 backdrop-blur-xs animate-fadeIn"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="relative w-full max-w-xl rounded-2xl bg-white shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Fixed Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white shrink-0">
              <div className="flex items-center gap-2">
                <Icon size={20} className="text-[#07405C]" />
                <h3 className="text-base font-bold text-slate-900">{config.title} Details</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="p-6 overflow-y-auto flex-1 overscroll-contain space-y-3 text-xs sm:text-sm">
              {config.columns.map((col) => {
                let val = resolveFieldValue(selectedItem, col.key)
                if (col.key === 'createdAt') val = formatDate(val)
                return (
                  <div
                    key={col.key}
                    className="flex flex-col sm:flex-row sm:items-start justify-between py-2.5 border-b border-slate-100 gap-1"
                  >
                    <span className="font-semibold text-slate-500 uppercase tracking-wider text-[11px] shrink-0 sm:w-1/3">
                      {col.label}
                    </span>
                    <span className="font-medium text-slate-900 break-words sm:w-2/3 sm:text-right">
                      {val === null || val === undefined || val === '' ? '-' : String(val)}
                    </span>
                  </div>
                )
              })}

              {/* Extra details if available */}
              {Object.entries(selectedItem).map(([key, val]) => {
                if (
                  key === 'id' ||
                  typeof val === 'object' ||
                  config.columns.some((c) => c.key === key) ||
                  ['fullName', 'name', 'mobile', 'mobileNumber', 'phoneNumber', 'phone', 'preferredCourse', 'courseName', 'courseTitle', 'programTitle', 'message', 'query', 'learningMode', 'status', 'createdAt'].includes(key)
                ) {
                  return null
                }
                return (
                  <div
                    key={key}
                    className="flex flex-col sm:flex-row sm:items-start justify-between py-2.5 border-b border-slate-100 gap-1"
                  >
                    <span className="font-semibold text-slate-500 uppercase tracking-wider text-[11px] shrink-0 sm:w-1/3">
                      {key.replace(/([A-Z])/g, ' $1')}
                    </span>
                    <span className="font-medium text-slate-900 break-words sm:w-2/3 sm:text-right">
                      {val === null || val === undefined || val === '' ? '-' : String(val)}
                    </span>
                  </div>
                )
              })}
            </div>

            {/* Fixed Footer */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50 shrink-0">
              {config.statusOptions ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-500">Status:</span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {config.statusOptions.map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => handleUpdateStatus(selectedItem, st)}
                        disabled={selectedItem.status === st || updatingId === selectedItem.id}
                        className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition cursor-pointer ${
                          selectedItem.status === st
                            ? 'bg-[#084b66] text-white'
                            : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>
              ) : <div />}
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
