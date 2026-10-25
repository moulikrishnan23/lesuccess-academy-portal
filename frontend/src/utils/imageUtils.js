import { API_BASE_URL } from '../services/apiClient.js'

/**
 * Resolves an image URL to a valid loadable URL across environments.
 *
 * Cases handled:
 * 1. External URLs: 'https://...', 'http://...', 'data:...', 'blob:...' -> returned as-is
 * 2. Backend uploaded files: '/uploads/...' or 'uploads/...' -> prefixed with VITE_API_BASE_URL (e.g. 'http://localhost:8080/uploads/...')
 * 3. Frontend static assets: '/images/...' or 'images/...' -> resolved from frontend public directory
 */
export const getImageUrl = (url, fallback = '', { width } = {}) => {
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
    return width ? optimizeCloudinaryUrl(trimmed, width) : trimmed
  }

  const apiBase = API_BASE_URL

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

const CLOUDINARY_IMAGE_UPLOAD = /^(https?:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/)(.+)$/i

/**
 * Asks Cloudinary to serve a delivery-optimised copy of an uploaded image.
 *
 * Admin uploads are stored as the original file (phone photos of 600-700 KB were
 * being shown in 64px logo slots). `f_auto` picks WebP/AVIF per browser,
 * `q_auto` picks a visually lossless quality, and `c_limit,w_N` scales down —
 * never up — to the size the slot actually needs. Cloudinary caches each
 * variant on its CDN after the first request.
 *
 * Non-Cloudinary URLs, videos, and URLs that already carry a transformation
 * are returned unchanged.
 */
export function optimizeCloudinaryUrl(url, width) {
  const match = CLOUDINARY_IMAGE_UPLOAD.exec(url)
  if (!match) return url
  const [, prefix, rest] = match
  // An existing transformation segment ("c_fill,w_200/...", "f_auto/...") wins.
  if (/^[a-z]{1,3}_[^/]*\//i.test(rest)) return url

  const transforms = ['f_auto', 'q_auto']
  if (Number.isFinite(width) && width > 0) {
    transforms.push('c_limit', `w_${Math.round(width)}`)
  }
  return `${prefix}${transforms.join(',')}/${rest}`
}
