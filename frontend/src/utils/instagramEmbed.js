/**
 * Robust singleton Instagram embed script loader and processor.
 * Prevents multiple script injections, duplicate tags, and infinite effect loops.
 */

let scriptLoadingPromise = null

export function loadInstagramScript() {
  if (typeof window === 'undefined') return Promise.resolve(null)
  
  if (window.instgrm?.Embeds) {
    return Promise.resolve(window.instgrm)
  }
  
  if (scriptLoadingPromise) {
    return scriptLoadingPromise
  }

  scriptLoadingPromise = new Promise((resolve) => {
    // Check if script is already present in document
    const existing = document.querySelector('script[src*="instagram.com/embed.js"]')
    if (existing) {
      if (window.instgrm?.Embeds) {
        resolve(window.instgrm)
      } else {
        existing.addEventListener('load', () => resolve(window.instgrm), { once: true })
        existing.addEventListener('error', () => resolve(null), { once: true })
      }
      return
    }

    const script = document.createElement('script')
    script.src = 'https://www.instagram.com/embed.js'
    script.async = true
    script.defer = true
    script.onload = () => resolve(window.instgrm)
    script.onerror = () => {
      console.warn('Could not load Instagram embed script')
      resolve(null)
    }
    document.body.appendChild(script)
  })

  return scriptLoadingPromise
}

export function processInstagramEmbeds() {
  if (typeof window === 'undefined') return
  loadInstagramScript().then(() => {
    try {
      if (window.instgrm?.Embeds?.process) {
        window.instgrm.Embeds.process()
      }
    } catch (e) {
      console.warn('Instagram embeds processing notice:', e)
    }
  })
}

export function getReelShortcode(url) {
  if (!url) return ''
  const trimmed = url.trim()
  const match = trimmed.match(/instagram\.com\/(?:reel|reels|p|tv|share\/reel)\/([A-Za-z0-9_-]+)/i)
  if (match && match[1]) {
    return match[1]
  }
  if (/^[A-Za-z0-9_-]{9,15}$/.test(trimmed)) {
    return trimmed
  }
  return ''
}

export function getCleanReelUrl(url) {
  if (!url) return ''
  const shortcode = getReelShortcode(url)
  if (shortcode) {
    return `https://www.instagram.com/reel/${shortcode}/`
  }
  return url.trim()
}

