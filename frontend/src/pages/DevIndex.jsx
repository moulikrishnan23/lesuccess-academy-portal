import { Link } from 'react-router-dom'

/**
 * PLACEHOLDER — delete when the real home page lands.
 *
 * Exists only so `/` isn't a blank screen while the course detail page is the
 * only route in the app. Lists every seeded course and the dev state switches
 * described in src/mocks/README.md.
 *
 * The slugs are written out rather than imported from src/mocks, so this page
 * keeps the rule that nothing outside src/services/ pulls the fixtures into a
 * bundle.
 */
const COURSE_LINKS = [
  { slug: 'full-stack-java', label: 'Full Stack Java', note: '300 Hours · 5 groups · 2 role columns' },
  { slug: 'python-full-stack-development', label: 'Full Stack Python', note: 'Course_Page.pdf reference · validated' },
  { slug: 'frontend-developer-ui-ux-design', label: 'Frontend Developer - UI/UX Design', note: '180 Hours · 4 groups' },
  { slug: 'mern-full-stack', label: 'MERN Full Stack', note: '300 Hours · 5 groups' },
  { slug: 'mean-full-stack', label: 'MEAN Full Stack', note: '300 Hours · 5 groups' },
  { slug: 'c-and-cpp', label: 'C and C++', note: '120 Hours · 3 groups · 1 role column' },
  { slug: 'dsa-with-python-java', label: 'DSA with Python / Java', note: '120 Hours · 4 groups' },
  { slug: 'data-analytics', label: 'Data Analytics', note: '160 Hours · 4 groups' },
  { slug: 'data-science', label: 'Data Science', note: '180 Hours · 4 groups' },
  { slug: 'artificial-intelligence-and-machine-learning', label: 'Artificial Intelligence and Machine Learning', note: '160 Hours · 4 groups' },
  { slug: 'aws-the-ultimate', label: 'AWS - The Ultimate', note: '90 Hours · 4 groups · 1 role column' },
  { slug: 'aws-and-devops', label: 'AWS & DevOps', note: '160 Hours · 4 groups' },
  { slug: 'data-engineering', label: 'Data Engineering', note: '160 Hours · 4 groups' },
  { slug: 'digital-marketing', label: 'Digital Marketing', note: '160 Hours · 4 groups' },
  { slug: 'gen-ai', label: 'Gen AI', note: '60 Hours · 3 groups · 1 role column' },
  { slug: 'agentic-ai', label: 'Agentic AI', note: '60 Hours · 3 groups' },
  { slug: 'servicenow', label: 'ServiceNow', note: '80 Hours · 3 groups · 1 role column' },
  { slug: 'cybersecurity', label: 'Cybersecurity', note: '80 Hours · 3 groups · Defence / Offence' },
  { slug: 'tally', label: 'Tally', note: '90 Hours · 4 groups · 1 role column' },
  { slug: 'placement-readiness-program', label: 'Placement Readiness Program', note: '120 Hours · 4 groups' },
]

const STATE_LINKS = [
  { to: '/courses/does-not-exist', label: 'Unknown slug', note: '404 state' },
  { to: '/courses/python-full-stack-development?mockState=slow', label: 'Slow network', note: '5s delay — skeletons' },
  { to: '/courses/python-full-stack-development?mockState=error', label: 'Failed request', note: 'Error state with retry' },
  { to: '/courses/python-full-stack-development?mockState=empty', label: 'Empty collections', note: 'No modules, stack or reviews' },
]

function LinkList({ items }) {
  return (
    <ul className="mt-5 list-none space-y-px overflow-hidden rounded-card border border-line bg-line p-0">
      {items.map((item) => (
        <li key={item.to}>
          <Link
            to={item.to}
            className="flex items-baseline justify-between gap-4 bg-white px-5 py-4 transition-colors hover:bg-section"
          >
            <span className="font-semibold text-navy-800">{item.label}</span>
            <span className="shrink-0 text-xs text-ink-muted">{item.note}</span>
          </Link>
        </li>
      ))}
    </ul>
  )
}

export default function DevIndex() {
  const courses = COURSE_LINKS.map((course) => ({
    ...course,
    to: `/courses/${course.slug}`,
  }))

  return (
    <div className="mx-auto max-w-2xl px-5 py-20 sm:px-8">
      <p className="text-xs font-semibold tracking-[0.12em] text-brand uppercase">
        Development only
      </p>
      <h1 className="mt-3 font-display text-3xl font-semibold text-navy-800">
        Course page states
      </h1>
      <p className="mt-3 text-ink-soft">
        This screen is scaffolding for the course detail route. Remove it once the
        real home page exists.
      </p>

      <h2 className="mt-10 text-sm font-semibold tracking-[0.08em] text-ink-soft uppercase">
        Catalog — {courses.length} courses
      </h2>
      <LinkList items={courses} />

      <h2 className="mt-10 text-sm font-semibold tracking-[0.08em] text-ink-soft uppercase">
        Page states
      </h2>
      <LinkList items={STATE_LINKS} />
    </div>
  )
}
