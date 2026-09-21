import DOMPurify from 'dompurify'

/**
 * `course.description` is rich text authored in the admin dashboard, so it is
 * untrusted input as far as this page is concerned — an admin account with a
 * pasted payload is enough to land a script on a public page.
 *
 * Everything that reaches dangerouslySetInnerHTML goes through here first.
 *
 * The allowlist is intentionally narrow: prose and links, no media, no ids, no
 * styles. Widen it deliberately if the editor gains a feature, not reflexively.
 */
const CONFIG = {
  ALLOWED_TAGS: [
    'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's',
    'ul', 'ol', 'li',
    'h3', 'h4', 'h5',
    'blockquote', 'a', 'span',
  ],
  ALLOWED_ATTR: ['href', 'title', 'target', 'rel'],
  ALLOW_DATA_ATTR: false,
}

// Force links out of the tab safely — target="_blank" without noopener leaves
// window.opener pointing at us.
DOMPurify.addHook('afterSanitizeAttributes', (node) => {
  if (node.tagName === 'A' && node.hasAttribute('href')) {
    node.setAttribute('target', '_blank')
    node.setAttribute('rel', 'noopener noreferrer')
  }
})

/** @returns {string} HTML safe to pass to dangerouslySetInnerHTML. */
export function sanitizeHtml(dirty) {
  if (!dirty) return ''
  return DOMPurify.sanitize(String(dirty), CONFIG)
}

/** Strip every tag — for meta descriptions, which must be plain text. */
export function toPlainText(dirty) {
  if (!dirty) return ''
  return DOMPurify.sanitize(String(dirty), { ALLOWED_TAGS: [], ALLOWED_ATTR: [] })
    .replace(/\s+/g, ' ')
    .trim()
}
