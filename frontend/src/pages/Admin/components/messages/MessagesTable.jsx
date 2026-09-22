import { useCallback, useEffect, useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Inbox, RefreshCw } from 'lucide-react'
import { listMessages, updateMessageStatus } from '../../../../services/messagesApi.js'
import { STATUS_STYLES, humanizeEnum } from './messageSources.js'

const PAGE_SIZE = 20
const SEARCH_DEBOUNCE_MS = 400

/**
 * One message source, rendered.
 *
 * Every source shares this component; what varies comes from `source`, the
 * declaration in messageSources.js. Nothing here branches on `source.id` — a
 * source without `statusOptions` simply has no status column, which is how the
 * two read-only forms stay read-only without a special case.
 */
export default function MessagesTable({ source, courseNames, showAlert }) {
  const [page, setPage] = useState(0)
  const [filters, setFilters] = useState({})
  const [searchInput, setSearchInput] = useState('')
  const [data, setData] = useState({ items: [], totalPages: 0, totalElements: 0 })
  const [loadError, setLoadError] = useState(null)
  const [savingId, setSavingId] = useState(null)
  // Bumped to force a refetch of the page currently on screen.
  const [reloadToken, setReloadToken] = useState(0)

  const hasStatus = Array.isArray(source.statusOptions) && source.statusOptions.length > 0
  const searchFilter = source.filters?.find((f) => f.type === 'search')

  /*
    Per-source state is NOT reset here. AdminMessagesTab keys this component on
    the source id, so switching subtabs remounts it and every useState above
    starts fresh. An effect doing the same work would be a second, weaker copy
    of that guarantee — and would set state synchronously on mount for nothing.
  */

  // Debounced, so typing a name is one request rather than one per keystroke.
  useEffect(() => {
    if (!searchFilter) return undefined

    const timer = setTimeout(() => {
      setFilters((prev) => {
        if ((prev[searchFilter.key] ?? '') === searchInput) return prev
        return { ...prev, [searchFilter.key]: searchInput }
      })
      setPage(0)
    }, SEARCH_DEBOUNCE_MS)

    return () => clearTimeout(timer)
  }, [searchInput, searchFilter])

  /*
    One string identifying the request the current props/state call for. Loading
    is DERIVED from it rather than stored: `isLoading` is simply "the request I
    want is not the request I last completed". That keeps the effect free of a
    synchronous setState on every param change, and makes it impossible for a
    loading flag to get stuck true when a request is superseded mid-flight.
  */
  const requestKey = JSON.stringify({ path: source.path, filters, page, reloadToken })
  const [loadedKey, setLoadedKey] = useState(null)
  const isLoading = loadedKey !== requestKey

  useEffect(() => {
    const controller = new AbortController()
    let ignore = false

    listMessages(source.path, {
      params: { ...filters, page, size: PAGE_SIZE },
      signal: controller.signal,
    })
      .then((result) => {
        if (ignore) return
        setData(result)
        setLoadError(null)
        setLoadedKey(requestKey)
      })
      .catch((err) => {
        if (ignore || err?.isCanceled) return
        /*
          Surfaced in place rather than swallowed. These endpoints are
          ADMIN/MANAGER only, so a 401/403 here is the most likely failure and
          an empty table would misreport it as "no messages".
        */
        setLoadError(err?.message || 'Could not load messages.')
        setData({ items: [], totalPages: 0, totalElements: 0 })
        setLoadedKey(requestKey)
      })

    return () => {
      ignore = true
      controller.abort()
    }
    // requestKey encodes path, filters, page and reloadToken.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestKey])

  const setFilter = useCallback((key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
    setPage(0)
  }, [])

  const handleStatusChange = useCallback(
    async (row, nextStatus) => {
      setSavingId(row.id)
      try {
        await updateMessageStatus(source.statusPath, {
          id: row.id,
          status: nextStatus,
          method: source.statusMethod,
        })
        showAlert(`Status updated to ${humanizeEnum(nextStatus)}`)
        // Refetch rather than patching local state: a status change can move a
        // row out of the active filter, and the server decides that, not us.
        setReloadToken((n) => n + 1)
      } catch (err) {
        showAlert(err?.message || 'Could not update status', 'error')
      } finally {
        setSavingId(null)
      }
    },
    [source.statusPath, source.statusMethod, showAlert],
  )

  const courseLabel = useCallback(
    (id) => {
      if (id === null || id === undefined || id === '') return '—'
      return courseNames?.[id] ?? `#${id}`
    },
    [courseNames],
  )

  const renderCell = useCallback(
    (row, column) => {
      const value = row[column.key]

      if (value === null || value === undefined || value === '') return '—'

      switch (column.type) {
        case 'date':
          return formatDate(value)
        case 'course':
          return courseLabel(value)
        case 'enum':
          return humanizeEnum(value)
        case 'long':
          // Wrapped, not truncated: the message body is the point of the row,
          // so it is readable in place rather than hidden behind a tooltip.
          return <span className="block break-words whitespace-pre-wrap">{String(value)}</span>
        default:
          return String(value)
      }
    },
    [courseLabel],
  )

  const courseOptions = useMemo(
    () => Object.entries(courseNames ?? {}).map(([id, name]) => ({ id, name })),
    [courseNames],
  )

  const columnCount = source.columns.length + (hasStatus ? 1 : 0)

  return (
    <div>
      {/* Filters */}
      {source.filters?.length ? (
        <div className="mb-4 flex flex-wrap items-end gap-3">
          {source.filters.map((filter) => {
            if (filter.type === 'search') {
              return (
                <label key={filter.key} className="flex flex-col gap-1">
                  <span className="text-xs font-semibold text-slate-600">{filter.label}</span>
                  <input
                    type="search"
                    value={searchInput}
                    onChange={(event) => setSearchInput(event.target.value)}
                    placeholder={filter.label}
                    className="w-64 rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </label>
              )
            }

            const options =
              filter.type === 'course'
                ? courseOptions.map((c) => ({ value: c.id, label: c.name }))
                : (filter.options ?? []).map((v) => ({ value: v, label: humanizeEnum(v) }))

            return (
              <label key={filter.key} className="flex flex-col gap-1">
                <span className="text-xs font-semibold text-slate-600">{filter.label}</span>
                <select
                  value={filters[filter.key] ?? ''}
                  onChange={(event) => setFilter(filter.key, event.target.value)}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                >
                  <option value="">All</option>
                  {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </label>
            )
          })}

          <button
            type="button"
            onClick={() => setReloadToken((n) => n + 1)}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
          >
            <RefreshCw size={14} />
            Refresh
          </button>
        </div>
      ) : null}

      {loadError ? (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {loadError}
        </div>
      ) : null}

      {/*
        No horizontal scroll: `table-fixed` plus the per-column widths declared
        in messageSources.js means every column sits at the same x position on
        every row and the table never exceeds its container. Cells wrap instead
        of overflowing, which is why long values need `break-words` — a long
        email with no spaces has no natural wrap point and would otherwise push
        the column wide again.
      */}
      <div className="rounded-xl border border-slate-200 bg-white">
        <table className="w-full table-fixed divide-y divide-slate-200 text-sm">
          <colgroup>
            {source.columns.map((column) => (
              <col key={column.key} style={column.width ? { width: column.width } : undefined} />
            ))}
            {hasStatus ? <col style={{ width: source.statusWidth ?? '11%' }} /> : null}
          </colgroup>
          <thead className="bg-slate-50">
            <tr>
              {source.columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-bold break-words text-slate-600"
                >
                  {column.label}
                </th>
              ))}
              {hasStatus ? (
                <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-slate-600">
                  Status
                </th>
              ) : null}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr>
                <td colSpan={columnCount} className="px-4 py-10 text-center text-slate-500">
                  Loading...
                </td>
              </tr>
            ) : data.items.length === 0 ? (
              <tr>
                <td colSpan={columnCount} className="px-4 py-12 text-center text-slate-500">
                  <Inbox size={28} className="mx-auto mb-2 text-slate-300" />
                  {loadError ? 'Could not load these messages.' : 'No messages yet.'}
                </td>
              </tr>
            ) : (
              data.items.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50">
                  {source.columns.map((column) => (
                    <td
                      key={column.key}
                      className="px-4 py-3 align-top break-words text-slate-700"
                    >
                      {renderCell(row, column)}
                    </td>
                  ))}

                  {hasStatus ? (
                    <td className="px-4 py-3 align-top">
                      <select
                        value={row[source.statusField] ?? ''}
                        disabled={savingId === row.id}
                        onChange={(event) => handleStatusChange(row, event.target.value)}
                        /*
                          w-full matters: without it the select is sized by its
                          widest option ("In Progress"), and that intrinsic
                          width overrides the colgroup, pushing the whole table
                          past its container and bringing the scrollbar back.
                        */
                        className={`w-full min-w-0 rounded-lg border px-2 py-1 text-xs font-bold disabled:opacity-50 ${
                          STATUS_STYLES[row[source.statusField]] ??
                          'bg-slate-100 text-slate-600 border-slate-200'
                        }`}
                      >
                        {source.statusOptions.map((option) => (
                          <option key={option} value={option}>
                            {humanizeEnum(option)}
                          </option>
                        ))}
                      </select>
                    </td>
                  ) : null}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex items-center justify-between text-xs text-slate-600">
        <span>
          {data.totalElements} {data.totalElements === 1 ? 'message' : 'messages'}
          {data.totalPages > 1 ? ` · page ${page + 1} of ${data.totalPages}` : ''}
        </span>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0 || isLoading}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-2 font-bold disabled:opacity-40"
          >
            <ChevronLeft size={14} />
            Previous
          </button>
          <button
            type="button"
            onClick={() => setPage((p) => p + 1)}
            disabled={page + 1 >= data.totalPages || isLoading}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-2 font-bold disabled:opacity-40"
          >
            Next
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}

/** ISO timestamp -> local date and time; unparseable values pass through. */
function formatDate(value) {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return String(value)
  return parsed.toLocaleString()
}
