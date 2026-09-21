/**
 * The five public forms, described as data.
 *
 * Every source below is fetched, paged and rendered by the same code in
 * MessagesTable.jsx. Only these declarations differ, because the five backend
 * DTOs are genuinely uneven: ConnectWithUsResponse carries four usable fields,
 * ContactMessageResponse eleven, and DemoBookingResponse has no name at all —
 * it identifies a booking by course and mobile number.
 *
 * Adding a sixth form should mean adding an entry here and nothing else.
 *
 * `statusOptions` absent means the backend offers no status endpoint for that
 * form, and the table renders no status control. That is the only switch: the
 * table never special-cases a source by id.
 *
 * Column `width` is a CSS width applied through the table's <colgroup>. The
 * table is `table-fixed` and never scrolls sideways, so these widths are what
 * hold every column at the same x position on every row; they should total
 * roughly 100% per source, counting `statusWidth` where a status column exists.
 *
 * Column `type` drives formatting only:
 *   'text'     plain string
 *   'date'     ISO timestamp -> locale string
 *   'course'   courseId -> course name, resolved by the parent tab
 *   'long'     free text, clamped with the full value in a title tooltip
 *   'enum'     backend constant -> Title Case for display
 */

export const MESSAGE_SOURCES = [
  {
    id: 'contact',
    label: 'Contact',
    /* Contact page form. The only source exposing free-text `message`. */
    path: '/api/contact-messages',
    statusPath: '/api/contact-messages',
    statusMethod: 'put',
    statusField: 'status',
    statusOptions: ['NEW', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'],
    statusWidth: '11%',
    filters: [
      { key: 'status', type: 'enum', label: 'Status', options: ['NEW', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'] },
      { key: 'search', type: 'search', label: 'Search name, email or message' },
    ],
    columns: [
      { key: 'name', label: 'Name', type: 'text', width: '9%' },
      { key: 'email', label: 'Email', type: 'text', width: '14%' },
      { key: 'phone', label: 'Phone', type: 'text', width: '9%' },
      { key: 'whoYouAre', label: 'Who They Are', type: 'text', width: '9%' },
      { key: 'lookingFor', label: 'Looking For', type: 'text', width: '9%' },
      { key: 'location', label: 'Location', type: 'text', width: '7%' },
      { key: 'message', label: 'Message', type: 'long', width: '22%' },
      { key: 'createdAt', label: 'Received', type: 'date', width: '10%' },
    ],
  },
  {
    id: 'leads',
    label: 'Leads',
    /* Lead capture, used by several forms — `source` says which one. */
    path: '/api/leads',
    statusPath: '/api/leads',
    statusMethod: 'put',
    statusField: 'status',
    statusOptions: ['NEW', 'CONTACTED', 'CONVERTED', 'CLOSED'],
    statusWidth: '11%',
    filters: [
      { key: 'status', type: 'enum', label: 'Status', options: ['NEW', 'CONTACTED', 'CONVERTED', 'CLOSED'] },
      {
        key: 'source',
        type: 'enum',
        label: 'Source form',
        options: ['HOME_DEMO_FORM', 'HOME_CONNECT_FORM', 'SERVICE_CTA_FORM', 'COURSE_ENROLL_FORM'],
      },
    ],
    columns: [
      { key: 'name', label: 'Name', type: 'text', width: '13%' },
      { key: 'mobile', label: 'Mobile', type: 'text', width: '11%' },
      { key: 'email', label: 'Email', type: 'text', width: '17%' },
      { key: 'courseId', label: 'Course', type: 'course', width: '14%' },
      { key: 'lookingFor', label: 'Looking For', type: 'text', width: '12%' },
      { key: 'source', label: 'Source', type: 'enum', width: '12%' },
      { key: 'createdAt', label: 'Received', type: 'date', width: '10%' },
    ],
  },
  {
    id: 'connect',
    label: 'Connect with Us',
    /* Home page "Connect with Us". Read-only: no status endpoint exists. */
    path: '/api/connect-with-us',
    filters: [{ key: 'search', type: 'search', label: 'Search name, email or mobile' }],
    columns: [
      { key: 'name', label: 'Name', type: 'text', width: '25%' },
      { key: 'mobile', label: 'Mobile', type: 'text', width: '20%' },
      { key: 'email', label: 'Email', type: 'text', width: '33%' },
      { key: 'createdAt', label: 'Received', type: 'date', width: '22%' },
    ],
  },
  {
    id: 'enquiries',
    label: 'Course Enquiries',
    /* Course enquiry modal. Read-only: no status endpoint exists. */
    path: '/api/course-enquiries',
    filters: [
      { key: 'courseId', type: 'course', label: 'Course' },
      { key: 'search', type: 'search', label: 'Search name, email or mobile' },
    ],
    columns: [
      { key: 'name', label: 'Name', type: 'text', width: '15%' },
      { key: 'mobile', label: 'Mobile', type: 'text', width: '12%' },
      { key: 'email', label: 'Email', type: 'text', width: '20%' },
      { key: 'location', label: 'Location', type: 'text', width: '12%' },
      { key: 'courseId', label: 'Course', type: 'course', width: '16%' },
      { key: 'currentStatus', label: 'Current Status', type: 'text', width: '12%' },
      { key: 'createdAt', label: 'Received', type: 'date', width: '13%' },
    ],
  },
  {
    id: 'demo',
    label: 'Demo Bookings',
    /*
     * Home page demo-class form. Note the admin path prefix and PATCH verb:
     * this is the one source that differs from the other two writable ones, and
     * it carries no name field — a booking is course + mobile number.
     */
    path: '/api/admin/demo-bookings',
    statusPath: '/api/admin/demo-bookings',
    statusMethod: 'patch',
    statusField: 'status',
    statusOptions: ['PENDING', 'CONTACTED', 'ENROLLED'],
    statusWidth: '20%',
    filters: [
      { key: 'status', type: 'enum', label: 'Status', options: ['PENDING', 'CONTACTED', 'ENROLLED'] },
    ],
    columns: [
      { key: 'courseName', label: 'Course', type: 'text', width: '32%' },
      { key: 'mobileNumber', label: 'Mobile', type: 'text', width: '24%' },
      { key: 'createdAt', label: 'Received', type: 'date', width: '24%' },
    ],
  },
]

/** BACKEND_CONSTANT -> "Backend Constant", for display only. */
export function humanizeEnum(value) {
  if (typeof value !== 'string' || !value) return ''
  return value
    .toLowerCase()
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

/** Tailwind classes per status. Unknown values fall through to neutral slate. */
export const STATUS_STYLES = {
  NEW: 'bg-blue-50 text-blue-700 border-blue-200',
  PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
  IN_PROGRESS: 'bg-amber-50 text-amber-700 border-amber-200',
  CONTACTED: 'bg-violet-50 text-violet-700 border-violet-200',
  RESOLVED: 'bg-green-50 text-green-700 border-green-200',
  CONVERTED: 'bg-green-50 text-green-700 border-green-200',
  ENROLLED: 'bg-green-50 text-green-700 border-green-200',
  CLOSED: 'bg-slate-100 text-slate-600 border-slate-200',
}

export default MESSAGE_SOURCES
