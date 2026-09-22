import apiClient from './apiClient.js'
import {
  isMockEnabled,
  mockGetCourseBySlug,
  mockGetCourses,
} from '../mocks/mockGateway.js'

/*
 * KEY CASING IS SETTLED — the snake_case fallbacks this file used to carry are
 * gone.
 *
 * CourseResponse / CourseModuleResponse are plain Lombok @Data DTOs and
 * application.yml configures Jackson with `default-property-inclusion: non_null`
 * and nothing else — no PropertyNamingStrategy anywhere in the backend — so
 * every key on the wire is the camelCase Java field name. The fixtures in
 * src/mocks/catalog.js are camelCase too. Neither path could ever produce
 * `short_description`, so reading for it was dead code.
 *
 * `non_null` also means a null field is OMITTED rather than sent as null, which
 * is why every read below still needs its own default.
 */

/**
 * Sort helper — CourseService#listModules already orders by displayOrder
 * (findByCourseIdOrderByDisplayOrderAsc), but sorting here costs nothing and
 * removes the assumption.
 */
function byDisplayOrder(a, b) {
  return (a.displayOrder ?? 0) - (b.displayOrder ?? 0)
}

function readCollection(raw, key) {
  const value = raw?.[key]
  return Array.isArray(value) ? value : []
}

function normalizeModule(raw) {
  let topics = []
  if (Array.isArray(raw?.topics)) {
    topics = raw.topics
  } else if (typeof raw?.content === 'string') {
    try {
      const parsed = JSON.parse(raw.content)
      if (Array.isArray(parsed)) topics = parsed
    } catch {
      topics = raw.content.split('\n').map((s) => s.trim()).filter(Boolean)
    }
  } else if (typeof raw?.description === 'string') {
    topics = raw.description.split('\n').map((s) => s.trim()).filter(Boolean)
  }

  return {
    id: raw.id,
    title: raw.title ?? '',
    // The backend calls the body `content` (CourseModuleResponse.content, from
    // the course_module.content TEXT column); the fixtures and the syllabus
    // accordion call it `description`. Both are read so neither side has to move.
    description: raw.description ?? raw.content ?? '',
    displayOrder: raw.displayOrder ?? 0,
  }
}

function normalizeTechStackItem(raw) {
  return {
    id: raw.id,
    groupName: raw.groupName ?? 'Other',
    itemName: raw.itemName ?? '',
    iconUrl: raw.iconUrl ?? null,
    displayOrder: raw.displayOrder ?? 0,
  }
}

/**
 * `roleColumns` / `roleBullets` are intended as JSON columns on the Course row,
 * so a payload may deliver them as an array, as a JSON string, or not at all.
 * Anything that is not an array of the expected shape collapses to [], which
 * is the signal the role section uses to hide itself rather than render an
 * empty card.
 *
 * NOTE: the current backend Course entity has no role columns at all, so on the
 * live path these always collapse to [] and the section hides itself. Left as
 * is — that is the correct degradation, and the string branch stays because the
 * column type, once it exists, is JSON.
 */
function readJsonArray(value, itemMapper) {
  let parsed = value

  if (typeof parsed === 'string') {
    try {
      parsed = JSON.parse(parsed)
    } catch {
      return []
    }
  }

  if (!Array.isArray(parsed)) return []

  return parsed.map(itemMapper).filter(Boolean)
}

function normalizeRoleColumn(raw) {
  const label = typeof raw?.label === 'string' ? raw.label.trim() : ''
  const description = typeof raw?.description === 'string' ? raw.description.trim() : ''

  // A column with no label has nothing to head it; drop it rather than render
  // a floating paragraph that reads as a layout bug.
  return label ? { label, description } : null
}

function normalizeRoleBullet(raw) {
  return typeof raw === 'string' && raw.trim() ? raw.trim() : null
}

/*
 * Fields marked NOT SERVED below exist in the fixtures and are read by the
 * components, but CourseResponse does not carry them today. They are kept
 * rather than deleted: the mock path still supplies them, and each component
 * already handles the null/'' case by hiding its own section. Removing them
 * here would only move the same emptiness somewhere less obvious.
 *
 * CourseResponse actually serves: id, name, title, slug, shortDescription,
 * durationMonths, durationValue, durationUnit, mode, badge, badgeText,
 * badgeLabel, placementAssistance, syllabusUrl, enrollUrl, isActive,
 * displayOrder, modules, createdAt, updatedAt.
 */
function normalizeCourse(raw) {
  return {
    id: raw.id,
    // `title` is an explicit alias for `name` on CourseResponse; `name` is read
    // as a fallback so a payload built without the alias still renders.
    title: raw.title ?? raw.name ?? '',
    slug: raw.slug ?? '',
    category: raw.category ?? null, // NOT SERVED by CourseResponse
    /*
     * Catalog grouping label ("Full Stack", "Data", "Cloud"), separate from
     * `category` because `category` is the short course name the "Why Learn …?"
     * and "What is …?" headings are built from. Collapsing the two would give
     * Data Science the heading "Why Learn Data?".
     */
    categoryGroup: raw.categoryGroup ?? null, // NOT SERVED by CourseResponse
    shortDescription: raw.shortDescription ?? '',
    description: raw.description ?? '', // NOT SERVED by CourseResponse
    durationValue: raw.durationValue ?? raw.durationMonths ?? null,
    // CourseResponse sets this to the literal "months" whenever durationMonths
    // is non-null, and omits it otherwise.
    durationUnit: raw.durationUnit ?? null,
    mode: raw.mode ?? null,
    price: raw.price ?? null, // NOT SERVED by CourseResponse
    discountPrice: raw.discountPrice ?? null, // NOT SERVED
    discountLabel: raw.discountLabel ?? null, // NOT SERVED
    badgeLabel: raw.badgeLabel ?? raw.badgeText ?? null,
    iconUrl: raw.iconUrl ?? null, // NOT SERVED
    heroImageUrl: raw.heroImageUrl ?? null, // NOT SERVED
    // The backend calls it `syllabusUrl` (Course.syllabus_url); the fixtures and
    // the download button call it `syllabusFileUrl`.
    syllabusFileUrl: raw.syllabusFileUrl ?? raw.syllabusUrl ?? null,
    status: raw.status ?? null, // NOT SERVED — the backend models this as a boolean
    // Drives WhatYoullLearnToDoSection. Was hardcoded per category in the
    // component; it is course content, so it lives on the course.
    roleHeading: raw.roleHeading ?? null, // NOT SERVED
    roleIntro: raw.roleIntro ?? null, // NOT SERVED
    roleColumns: readJsonArray(raw.roleColumns, normalizeRoleColumn), // NOT SERVED
    roleBullets: readJsonArray(raw.roleBullets, normalizeRoleBullet), // NOT SERVED
  }
}

/**
 * Split the single course response into the three things the page renders.
 * Keeping them separate means a section can show its own empty state without
 * reaching into the course object.
 *
 * `modules` is populated by CourseService#getByIdOrSlug and omitted entirely on
 * the list endpoint, where it is null. There is no tech stack in the backend at
 * all — no entity, no DTO field, no endpoint — so `techStack` is always [] on
 * the live path and TechStackSection hides itself. That is a missing backend
 * feature, not a shape mismatch to normalize around.
 */
export function normalizeCourseDetail(raw) {
  const toolsList = readCollection(raw, 'techStack', 'tech_stack')
  const fallbackTools = readCollection(raw, 'tools', 'course_tools')
  const techItems = toolsList.length > 0 ? toolsList : fallbackTools

  return {
    course: normalizeCourse(raw ?? {}),
    modules: readCollection(raw, 'modules').map(normalizeModule).sort(byDisplayOrder),
    // NOT sorted here: displayOrder on tech stack items restarts at 1 within
    // each group, so a global sort would interleave Front End with Back End.
    // TechStackSection groups first, then sorts within each group.
    techStack: readCollection(raw, 'techStack').map(normalizeTechStackItem),
  }
}

/**
 * The catalog list. Same course fields as the detail response, without the
 * nested modules — a card needs the summary, not the syllabus.
 *
 * GET /api/courses returns `ApiResponse<List<CourseResponse>>`, a bare array.
 * The `{ content: [...] }` page unwrapping that used to be here belongs to
 * /api/admin/courses (`PageResponse<CourseResponse>`), which this service never
 * calls, so it has been removed.
 */
export function normalizeCourseList(raw) {
  return (Array.isArray(raw) ? raw : []).map(normalizeCourse)
}

/**
 * GET /api/courses
 * @returns {Promise<Object[]>} Active courses, ordered by displayOrder.
 */
export async function getAll({ signal } = {}) {
  try {
    const { data } = await apiClient.get('/api/courses', { signal })
    // Backend wraps in ApiResponse<T>; real list/page is in data.data
    return normalizeCourseList(data?.data ?? data)
  } catch (err) {
    if (isMockEnabled()) {
      return normalizeCourseList(await mockGetCourses())
    }
    throw err
  }

  const { data } = await apiClient.get('/api/courses', { signal })
  // Backend wraps in ApiResponse<T>; real list is in data.data
  return normalizeCourseList(data?.data ?? data)
}

/**
 * GET /api/courses/{idOrSlug}
 * @returns {Promise<{course: Object, modules: Object[], techStack: Object[]}>}
 * @throws {import('../utils/apiError.js').ApiError} 404 when the slug is unknown.
 */
export async function getBySlug(slug, { signal } = {}) {
  try {
    const { data } = await apiClient.get(`/api/courses/${encodeURIComponent(slug)}`, {
      signal,
    })
    return normalizeCourseDetail(data?.data ?? data)
  } catch (err) {
    if (isMockEnabled()) {
      return normalizeCourseDetail(await mockGetCourseBySlug(slug))
    }
    throw err
  }
}

export default { getAll, getBySlug, normalizeCourseDetail, normalizeCourseList }
