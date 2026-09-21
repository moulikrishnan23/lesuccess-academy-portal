/**
 * Tab label -> the section id it anchors to.
 *
 * Kept out of CourseTabs.jsx so that file exports only a component — a module
 * that mixes components and constants breaks Vite's fast refresh.
 */
export const DEFAULT_TABS = [
  { id: 'about', label: 'About' },
  { id: 'curriculum', label: 'Course' },
  { id: 'certificate', label: 'Certificate' },
  { id: 'testimonials', label: 'Testimonials' },
]
