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

/**
 * Returns a high-quality logo URL for a course entity or mock course,
 * ensuring no course is missing its logo.
 */
export const getCourseLogo = (course) => {
  const icon = course?.iconUrl || course?.icon_url || course?.logoUrl || course?.logo_url
  if (icon && typeof icon === 'string' && icon.trim()) {
    return getImageUrl(icon)
  }
  const text = `${course?.slug || ''} ${course?.title || ''} ${course?.name || ''}`.toLowerCase()
  if (text.includes('python')) return '/tech/python.svg'
  if (text.includes('java')) return '/tech/java.svg'
  if (text.includes('data') || text.includes('analytics') || text.includes('bi')) return '/tech/powerbi.svg'
  if (text.includes('aws') || text.includes('cloud') || text.includes('devops')) return '/tech/aws.svg'
  if (text.includes('react') || text.includes('frontend')) return '/tech/react.svg'
  if (text.includes('django')) return '/tech/django.svg'
  if (text.includes('docker') || text.includes('kubernetes')) return '/tech/docker.svg'
  if (text.includes('sql') || text.includes('database')) return '/tech/mysql.svg'
  if (text.includes('excel')) return '/tech/excel.svg'
  return '/tech/api.svg'
}
