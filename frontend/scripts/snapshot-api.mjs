/**
 * Saves the public catalogue responses into src/data/apiSnapshot.json, which
 * AppDataContext shows to first-time visitors while the live API is still
 * answering (the Render backend can take minutes to wake from sleep).
 *
 * Runs before every `npm run build`. It never fails the build: if the API is
 * unreachable, the committed snapshot is kept as-is and a warning is printed.
 * Set SKIP_API_SNAPSHOT=1 to skip it entirely (e.g. offline local builds).
 *
 *   npm run snapshot        refresh the snapshot by hand
 */
import { readFile, writeFile } from 'node:fs/promises'

const OUT_FILE = new URL('../src/data/apiSnapshot.json', import.meta.url)
const DEFAULT_API = 'https://lesuccess-academy-portal.onrender.com'

// Raw response bodies, stored exactly as the API returns them so AppDataContext
// parses them with the same code as a live response.
const ENDPOINTS = [
  '/api/courses',
  '/api/team-members',
  '/api/team-categories',
  '/api/upcoming-programs',
  '/api/gallery/categories',
  '/api/success-stories',
]

// A sleeping Render service takes 1-2 minutes to answer its first request.
const WAKE_TIMEOUT_MS = 150_000
const REQUEST_TIMEOUT_MS = 30_000

function apiBase() {
  const raw = (process.env.VITE_API_BASE_URL || '').trim().replace(/\/+$/, '').replace(/\/api$/, '')
  return raw && !/localhost|127\.0\.0\.1/.test(raw) ? raw : DEFAULT_API
}

async function getJson(url, timeoutMs) {
  const res = await fetch(url, { signal: AbortSignal.timeout(timeoutMs) })
  if (!res.ok) throw new Error(`${url} answered ${res.status}`)
  const body = await res.json()
  if (body?.success === false || body?.data === undefined) {
    throw new Error(`${url} returned no data`)
  }
  return body
}

async function main() {
  if (process.env.SKIP_API_SNAPSHOT) {
    console.log('[snapshot] SKIP_API_SNAPSHOT set; keeping the committed snapshot.')
    return
  }

  const base = apiBase()
  console.log(`[snapshot] Fetching public data from ${base} ...`)

  const bodies = {}
  // The first request also wakes the backend, so it gets the long timeout.
  bodies[ENDPOINTS[0]] = await getJson(base + ENDPOINTS[0], WAKE_TIMEOUT_MS)
  const rest = await Promise.all(
    ENDPOINTS.slice(1).map((path) => getJson(base + path, REQUEST_TIMEOUT_MS)),
  )
  ENDPOINTS.slice(1).forEach((path, i) => { bodies[path] = rest[i] })

  // Write only when something changed, so rebuilds don't dirty the git tree.
  const previous = await readFile(OUT_FILE, 'utf8').then(JSON.parse).catch(() => null)
  if (previous && JSON.stringify(previous.bodies) === JSON.stringify(bodies)) {
    console.log('[snapshot] Unchanged.')
    return
  }
  const snapshot = { generatedAt: new Date().toISOString(), bodies }
  await writeFile(OUT_FILE, JSON.stringify(snapshot) + '\n')
  console.log(`[snapshot] Wrote ${ENDPOINTS.length} responses to src/data/apiSnapshot.json.`)
}

main().catch((err) => {
  console.warn(`[snapshot] Skipped, keeping the committed snapshot: ${err.message}`)
})
