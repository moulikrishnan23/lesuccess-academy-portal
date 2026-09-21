import { useEffect } from 'react'

const SITE_NAME = 'LeSuccess Academy'

/**
 * Sets the document title and meta description.
 *
 * TODO(seo): `react-helmet-async` is not a dependency of this project, so this
 * writes to the DOM directly. That covers client-side navigation and anything
 * that executes JavaScript, but crawlers reading the raw HTML still see
 * index.html's static tags, and Open Graph / canonical tags are not handled at
 * all. Proper SEO for course pages needs either react-helmet-async plus
 * prerendering, or server-rendered meta from the Spring side.
 */
export default function useDocumentMeta({ title, description }) {
  useEffect(() => {
    if (!title) return undefined

    const previousTitle = document.title
    document.title = `${title} | ${SITE_NAME}`

    return () => {
      document.title = previousTitle
    }
  }, [title])

  useEffect(() => {
    if (!description) return undefined

    let tag = document.querySelector('meta[name="description"]')
    let created = false

    if (!tag) {
      tag = document.createElement('meta')
      tag.setAttribute('name', 'description')
      document.head.appendChild(tag)
      created = true
    }

    const previous = tag.getAttribute('content')
    // Search engines truncate around 160 characters; trim on a word boundary.
    tag.setAttribute('content', description.slice(0, 158).replace(/\s+\S*$/, ''))

    return () => {
      if (created) tag.remove()
      else if (previous !== null) tag.setAttribute('content', previous)
    }
  }, [description])
}
