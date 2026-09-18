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
