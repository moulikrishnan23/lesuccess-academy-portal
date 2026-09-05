import apiClient from './apiClient.js'
import {
  isMockEnabled,
  mockGetCourseBySlug,
  mockGetCourses,
} from '../mocks/mockGateway.js'

/**
 * Sort helper — the contract says modules and tech stack arrive ordered by
 * displayOrder, but sorting here costs nothing and removes the assumption.
 */
function byDisplayOrder(a, b) {
  return (a.displayOrder ?? 0) - (b.displayOrder ?? 0)
}

/**
 * Pull the nested collections off the course payload.
 *
 * The contract puts them on `modules` and `techStack`. Spring's default
 * serialization of a snake_case entity would give `tech_stack`, so both are
 * read here rather than in the components.
 *
 * TODO(backend): drop the snake_case fallbacks once the real payload is
 * confirmed — do not "fix" this by changing the agreed contract.
 */
function readCollection(raw, camelKey, snakeKey) {
  const value = raw?.[camelKey] ?? raw?.[snakeKey]
  return Array.isArray(value) ? value : []
}

function normalizeModule(raw) {
  return {
    id: raw.id,
    title: raw.title ?? '',
    description: raw.description ?? '',
    displayOrder: raw.displayOrder ?? raw.display_order ?? 0,
  }
}

function normalizeTechStackItem(raw) {
  return {
    id: raw.id,
    groupName: raw.groupName ?? raw.group_name ?? 'Other',
    itemName: raw.itemName ?? raw.item_name ?? '',
    iconUrl: raw.iconUrl ?? raw.icon_url ?? null,
    displayOrder: raw.displayOrder ?? raw.display_order ?? 0,
  }
}

/**
 * `roleColumns` / `roleBullets` are JSON columns on the Course row, so a real
 * payload may deliver them as an array, as a JSON string, or not at all.
 * Anything that is not an array of the expected shape collapses to [], which
 * is the signal the role section uses to hide itself rather than render an
 * empty card.
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

function normalizeCourse(raw) {
  return {
    id: raw.id,
    title: raw.title ?? '',
    slug: raw.slug ?? '',
    category: raw.category ?? null,
    /*
     * Catalog grouping label ("Full Stack", "Data", "Cloud"), separate from
     * `category` because `category` is the short course name the "Why Learn …?"
     * and "What is …?" headings are built from. Collapsing the two would give
     * Data Science the heading "Why Learn Data?".
     */
    categoryGroup: raw.categoryGroup ?? raw.category_group ?? null,
    shortDescription: raw.shortDescription ?? raw.short_description ?? '',
    description: raw.description ?? '',
    durationValue: raw.durationValue ?? raw.duration_value ?? null,
    durationUnit: raw.durationUnit ?? raw.duration_unit ?? null,
    mode: raw.mode ?? null,
    price: raw.price ?? null,
    discountPrice: raw.discountPrice ?? raw.discount_price ?? null,
    discountLabel: raw.discountLabel ?? raw.discount_label ?? null,
    badgeLabel: raw.badgeLabel ?? raw.badge_label ?? null,
    iconUrl: raw.iconUrl ?? raw.icon_url ?? null,
    heroImageUrl: raw.heroImageUrl ?? raw.hero_image_url ?? null,
    syllabusFileUrl: raw.syllabusFileUrl ?? raw.syllabus_file_url ?? null,
    status: raw.status ?? null,
    // Drives WhatYoullLearnToDoSection. Was hardcoded per category in the
    // component; it is course content, so it lives on the course.
    roleHeading: raw.roleHeading ?? raw.role_heading ?? null,
    roleIntro: raw.roleIntro ?? raw.role_intro ?? null,
    roleColumns: readJsonArray(raw.roleColumns ?? raw.role_columns, normalizeRoleColumn),
    roleBullets: readJsonArray(raw.roleBullets ?? raw.role_bullets, normalizeRoleBullet),
  }
}

/**
 * Split the single course response into the three things the page renders.
 * Keeping them separate means a section can show its own empty state without
 * reaching into the course object.
 */
export function normalizeCourseDetail(raw) {
  return {
    course: normalizeCourse(raw ?? {}),
    modules: readCollection(raw, 'modules', 'course_modules')
      .map(normalizeModule)
      .sort(byDisplayOrder),
    // NOT sorted here: displayOrder on tech stack items restarts at 1 within
    // each group, so a global sort would interleave Front End with Back End.
    // TechStackSection groups first, then sorts within each group.
    techStack: readCollection(raw, 'techStack', 'tech_stack').map(normalizeTechStackItem),
  }
}

/**
 * The catalog list. Same course fields as the detail response, without the
 * nested modules and tech stack — a card needs the summary, not the syllabus.
 *
 * A paginated payload arrives as `{ content: [...] }`, matching the shape
 * normalizeTestimonials already handles, so both are read here.
 */
export function normalizeCourseList(raw) {
  const list = Array.isArray(raw) ? raw : (raw?.content ?? [])
  return list.map(normalizeCourse)
}

/**
 * GET /api/courses
 * @returns {Promise<Object[]>} Published courses, in catalog order.
 */
export async function getAll({ signal } = {}) {
  if (isMockEnabled()) {
    return normalizeCourseList(await mockGetCourses())
  }

  const { data } = await apiClient.get('/api/courses', { signal })
  // Backend wraps in ApiResponse<T>; real list/page is in data.data
  return normalizeCourseList(data?.data ?? data)
}

/**
 * GET /api/courses/{slug}
 * @returns {Promise<{course: Object, modules: Object[], techStack: Object[]}>}
 * @throws {import('../utils/apiError.js').ApiError} 404 when the slug is unknown.
 */
export async function getBySlug(slug, { signal } = {}) {
  if (isMockEnabled()) {
    return normalizeCourseDetail(await mockGetCourseBySlug(slug))
  }

  const { data } = await apiClient.get(`/api/courses/${encodeURIComponent(slug)}`, {
    signal,
  })
  return normalizeCourseDetail(data?.data ?? data)
}

export default { getAll, getBySlug, normalizeCourseDetail, normalizeCourseList }
