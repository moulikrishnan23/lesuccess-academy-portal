/**
 * Resolves an image URL to a valid loadable URL across environments.
 *
 * Cases handled:
 * 1. External URLs: 'https://...', 'http://...', 'data:...', 'blob:...' -> returned as-is
 * 2. Backend uploaded files: '/uploads/...' or 'uploads/...' -> prefixed with VITE_API_BASE_URL (e.g. 'http://localhost:8080/uploads/...')
 * 3. Frontend static assets: '/images/...' or 'images/...' -> resolved from frontend public directory
 */
export const getImageUrl = (url, fallback = '') => {
  let target = url
  if (target && typeof target === 'object') {
    target = target.url || target.imageUrl || target.logoUrl || target.src || ''
  }

  if (!target || typeof target !== 'string') {
    return fallback || ''
  }

  const trimmed = target.trim()
  if (!trimmed) {
    return fallback || ''
  }

  // Already absolute or data/blob URL
  if (/^(https?:|\/\/|data:|blob:)/i.test(trimmed)) {
    return trimmed
  }

  const apiBase = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '')

  // Backend upload path
  if (trimmed.startsWith('/uploads/') || trimmed.startsWith('uploads/')) {
    const cleanPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`
    return apiBase ? `${apiBase}${cleanPath}` : cleanPath
  }

  // Frontend public static asset
  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`
}

/** Shown for a course whose logo has not been uploaded yet. */
export const COURSE_LOGO_PLACEHOLDER = '/tech/api.svg'

/**
 * The logo URL for a course: its own uploaded icon, or a neutral placeholder.
 *
 * @param {object} course
 * @returns {string} always a renderable URL, never null
 */
export const getCourseLogo = (course) => {
  /*
   * The course's own icon, or the neutral placeholder - never a guess.
   *
   * There used to be a keyword ladder here (python -> python.svg, java ->
   * java.svg, and so on) below this check. It only ever ran for a course with no
   * iconUrl, which since the admin panel gained a logo uploader means a course
   * an admin has not given a logo to - and for those it picked an icon by
   * matching words in the title, so "Java : Full Stack" and "DSA with Python /
   * Java" got the same one and anything unrecognised got nothing. A missing
   * logo is now visibly missing, which is a thing an admin can see and fix.
   */
  const icon = course?.iconUrl || course?.icon_url || course?.logoUrl || course?.logo_url
  if (icon && typeof icon === 'string' && icon.trim()) {
    return getImageUrl(icon)
  }

  return COURSE_LOGO_PLACEHOLDER
}
