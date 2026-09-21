import { useEffect, useMemo, useState } from 'react'
import apiClient from '../../../services/apiClient.js'
import MessagesTable from './messages/MessagesTable.jsx'
import { MESSAGE_SOURCES } from './messages/messageSources.js'

/**
 * Messages: every submission the public site's forms produce, one subtab per
 * form.
 *
 * This component owns only what the subtabs share — which one is active, and
 * the course id -> name map. The table itself, and everything that differs
 * between forms, lives in ./messages/.
 */
export default function AdminMessagesTab({ showAlert }) {
  const [activeSourceId, setActiveSourceId] = useState(MESSAGE_SOURCES[0].id)
  const [courseNames, setCourseNames] = useState({})

  /*
    LeadResponse and CourseEnquiryResponse carry `courseId` but no course name,
    so the id is resolved here once for every subtab rather than per row. A
    failure is not surfaced: the table falls back to "#12", which is still
    usable, and an alert about the course list would be noise on a page whose
    subject is messages.
  */
  useEffect(() => {
    const controller = new AbortController()
    let ignore = false

    apiClient
      .get('/api/courses', { signal: controller.signal })
      .then(({ data }) => {
        if (ignore) return
        const courses = data?.data ?? data
        if (!Array.isArray(courses)) return

        setCourseNames(
          courses.reduce((acc, course) => {
            const label = course.title || course.name
            if (course.id !== undefined && label) acc[course.id] = label
            return acc
          }, {}),
        )
      })
      .catch(() => {
        if (ignore) return
        setCourseNames({})
      })

    return () => {
      ignore = true
      controller.abort()
    }
  }, [])

  const activeSource = useMemo(
    () => MESSAGE_SOURCES.find((s) => s.id === activeSourceId) ?? MESSAGE_SOURCES[0],
    [activeSourceId],
  )

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-display text-xl font-bold text-slate-900">Messages</h2>
        <p className="mt-1 text-sm text-slate-600">
          Submissions from the public site, grouped by the form that produced them.
        </p>
      </div>

      {/* Subtab bar. Same shape as the dashboard's main tab bar, one level in. */}
      <div className="mb-6 border-b border-slate-200">
        <nav className="flex flex-wrap gap-1 pb-2" aria-label="Message sources">
          {MESSAGE_SOURCES.map((source) => {
            const isActive = source.id === activeSource.id
            return (
              <button
                key={source.id}
                type="button"
                aria-current={isActive ? 'page' : undefined}
                onClick={() => setActiveSourceId(source.id)}
                className={`rounded-lg px-3 py-2 text-xs font-bold whitespace-nowrap transition ${
                  isActive
                    ? 'bg-[#084b66] text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {source.label}
              </button>
            )
          })}
        </nav>
      </div>

      {/*
        Keyed on the source id so switching subtabs remounts the table. The
        table also resets its own state on a source change; the key makes that
        unmissable rather than dependent on an effect firing in the right order.
      */}
      <MessagesTable
        key={activeSource.id}
        source={activeSource}
        courseNames={courseNames}
        showAlert={showAlert}
      />
    </div>
  )
}
