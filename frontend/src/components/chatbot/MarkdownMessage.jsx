import DOMPurify from 'dompurify'
import { useMemo } from 'react'

/**
 * Lightweight markdown renderer for chatbot replies.
 *
 * Supports: **bold**, *italic*, `inline code`, [links](/path),
 * unordered lists (- / *), ordered lists (1.), headings (##),
 * line breaks and paragraphs.
 *
 * Output is sanitised with DOMPurify before rendering. Only simple inline
 * tags and block elements are allowed — no images, scripts, or iframes.
 * Links are restricted to internal paths (starting with /).
 */

const ALLOWED_TAGS = ['b', 'strong', 'i', 'em', 'code', 'br', 'p', 'ul', 'ol', 'li', 'h3', 'h4', 'a']
const ALLOWED_ATTR = ['href']

function markdownToHtml(text) {
  if (!text) return ''

  // Normalise line endings
  let md = text.replace(/\r\n/g, '\n')

  // Escape HTML entities first (prevents injection)
  md = md
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  // Process line by line for block-level elements
  const lines = md.split('\n')
  const htmlLines = []
  let inList = null // 'ul' or 'ol'

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i]

    // Check for list items
    const ulMatch = line.match(/^(\s*)[-*]\s+(.+)/)
    const olMatch = line.match(/^(\s*)\d+[.)]\s+(.+)/)

    if (ulMatch) {
      if (inList !== 'ul') {
        if (inList) htmlLines.push(`</${inList}>`)
        htmlLines.push('<ul>')
        inList = 'ul'
      }
      htmlLines.push(`<li>${applyInline(ulMatch[2])}</li>`)
      continue
    }

    if (olMatch) {
      if (inList !== 'ol') {
        if (inList) htmlLines.push(`</${inList}>`)
        htmlLines.push('<ol>')
        inList = 'ol'
      }
      htmlLines.push(`<li>${applyInline(olMatch[2])}</li>`)
      continue
    }

    // Close any open list
    if (inList) {
      htmlLines.push(`</${inList}>`)
      inList = null
    }

    // Headings (## or ###)
    const headingMatch = line.match(/^(#{2,4})\s+(.+)/)
    if (headingMatch) {
      const level = Math.min(headingMatch[1].length, 4)
      htmlLines.push(`<h${level}>${applyInline(headingMatch[2])}</h${level}>`)
      continue
    }

    // Empty line = paragraph break
    if (line.trim() === '') {
      htmlLines.push('<br>')
      continue
    }

    // Regular text
    htmlLines.push(`<p>${applyInline(line)}</p>`)
  }

  // Close any trailing list
  if (inList) {
    htmlLines.push(`</${inList}>`)
  }

  return htmlLines.join('')
}

/**
 * Convert a markdown link to an anchor tag, but only for safe internal paths.
 * External URLs, protocol-relative, javascript: etc. are rendered as plain text.
 */
function safeLink(_match, linkText, url) {
  // Decode HTML entities in the URL so we can inspect the real characters
  const decoded = url.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')

  // Strip any http(s)://hostname prefix to extract just the path
  let path = decoded
  try {
    const parsed = new URL(decoded, 'http://localhost')
    if (decoded.startsWith('http://') || decoded.startsWith('https://')) {
      path = parsed.pathname + parsed.search + parsed.hash
    }
  } catch {
    // Not a valid URL — show as plain text
    return linkText
  }

  // Only allow internal paths starting with exactly one "/"
  if (!path.startsWith('/') || path.startsWith('//') || path.startsWith('/\\')) {
    return linkText
  }

  return `<a href="${path}">${linkText}</a>`
}

/** Apply inline formatting: links, bold, italic, inline code */
function applyInline(text) {
  return text
    // [link text](url)
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, safeLink)
    // `inline code`
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    // **bold**
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    // *italic* (but not inside **)
    .replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em>$1</em>')
}

export default function MarkdownMessage({ text, className }) {
  const sanitised = useMemo(() => {
    const raw = markdownToHtml(text)
    return DOMPurify.sanitize(raw, { ALLOWED_TAGS, ALLOWED_ATTR })
  }, [text])

  return (
    <div
      className={className}
      // Safe: content is escaped then sanitised with DOMPurify + allowlist.
      dangerouslySetInnerHTML={{ __html: sanitised }}
    />
  )
}
