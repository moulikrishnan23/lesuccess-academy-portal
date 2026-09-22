import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Download,
  Search,
  X,
  Clock,
  Sparkles,
  ArrowRight,
  BookOpen,
  Award,
  Layers,
  GraduationCap,
  Briefcase,
  CheckCircle2,
} from 'lucide-react'
import { downloadSyllabus } from '../../utils/syllabusUtils.js'
import { getCourseLogo } from '../../utils/imageUtils.js'
import Skeleton, { SkeletonText } from '../../components/ui/Skeleton.jsx'
import ErrorState from '../../components/ui/ErrorState.jsx'
import useCourses from '../../hooks/useCourses.js'
import useDocumentMeta from '../../hooks/useDocumentMeta.js'
import useReducedMotion from '../../hooks/useReducedMotion.js'
import {
  cardHover,
  cardReveal,
  fadeUp,
  ITEM_IN_VIEW,
  motionSafe,
  ONCE_IN_VIEW,
} from '../../animations/variants.js'

/* =========================================================
   HELPERS
========================================================= */

function splitDuration(value, unit) {
  const numeric = Number(value)
  if (!Number.isFinite(numeric)) return null

  const word = unit ? String(unit).toLowerCase() : 'hours'
  const singular = numeric === 1 && word.endsWith('s') ? word.slice(0, -1) : word

  return { value: numeric, unit: singular }
}

function getCourseTechPills(course) {
  if (Array.isArray(course?.techStack) && course.techStack.length > 0) {
    return course.techStack
      .map((t) => t.itemName || t.item_name || t.toolName || t.name)
      .filter(Boolean)
      .slice(0, 4)
  }
  const text = `${course?.slug || ''} ${course?.title || ''} ${course?.category || ''}`.toLowerCase()
  const pills = []
  if (text.includes('java')) pills.push('Java', 'Spring Boot', 'Hibernate', 'REST')
  else if (text.includes('python')) pills.push('Python', 'Django', 'FastAPI', 'PostgreSQL')
  else if (text.includes('mern') || text.includes('react')) pills.push('React', 'Node.js', 'Express', 'MongoDB')
  else if (text.includes('data science') || text.includes('machine learning')) pills.push('Python', 'Scikit-Learn', 'Pandas', 'NLP')
  else if (text.includes('data analytics') || text.includes('power bi')) pills.push('Power BI', 'SQL', 'Advanced Excel', 'Tableau')
  else if (text.includes('aws') || text.includes('cloud') || text.includes('devops')) pills.push('AWS', 'Docker', 'Kubernetes', 'CI/CD')
  else if (text.includes('cyber')) pills.push('Ethical Hacking', 'Network Sec', 'SIEM', 'Kali')
  else if (text.includes('digital') || text.includes('marketing')) pills.push('SEO', 'Google Ads', 'Meta Ads', 'Analytics')
  else pills.push('Live Projects', 'Mentorship', 'Certification')
  return pills.slice(0, 4)
}

/* =========================================================
   COURSE CARD (3-ZONE INTERACTIVE CARD)
========================================================= */

function CourseCard({ course, column, reduced }) {
  const duration = splitDuration(course.durationValue, course.durationUnit)
  const badgeLabel = course.badgeLabel || course.badgeText || (course.badge ? course.badge.replace(/_/g, ' ') : null)
  const techPills = getCourseTechPills(course)
  const isFeatured = Boolean(badgeLabel)

  return (
    <motion.li
      custom={column}
      variants={motionSafe(cardReveal, reduced)}
      initial="hidden"
      whileInView="visible"
      viewport={ITEM_IN_VIEW}
      whileHover={reduced ? undefined : cardHover.hover}
      className="h-full list-none"
    >
      <div
        className={`group relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border transition-all duration-300 bg-white hover:-translate-y-1.5 ${
          isFeatured
            ? 'border-[#07405C]/30 shadow-md shadow-[#07405C]/5 hover:border-[#07405C] hover:shadow-xl hover:shadow-[#07405C]/15'
            : 'border-slate-200/80 shadow-xs hover:border-[#07405C]/50 hover:shadow-xl hover:shadow-slate-200/70'
        }`}
      >
        {/* Top Accent Bar on Hover */}
        <span
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-[#07405C] via-[#024D72] to-[#DF1E26] origin-left scale-x-0 transition-transform duration-300 ease-out group-hover:scale-x-100 z-10"
        />

        {/* CLICKABLE UPPER + MIDDLE BODY */}
        <Link
          to={`/courses/${course.slug}`}
          className="flex flex-col flex-1 p-6 text-left cursor-pointer"
        >
          {/* ================= ZONE 1: HEADER ================= */}
          <div className="flex items-start justify-between gap-3 mb-4">
            {/* Course Tech Logo + Category Pill */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-50 border border-slate-200 p-2 shadow-xs transition-transform duration-300 group-hover:scale-105 group-hover:bg-white">
                <img
                  src={getCourseLogo(course)}
                  alt={`${course.title} icon`}
                  width="32"
                  height="32"
                  className="h-full w-full object-contain"
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.src = '/tech/api.svg'
                  }}
                />
              </div>

              <div className="min-w-0">
                <span className="inline-block truncate text-[11px] font-bold uppercase tracking-wider text-[#07405C] bg-[#07405C]/10 px-2 py-0.5 rounded-md">
                  {course.categoryGroup || course.category || 'Technology Track'}
                </span>
                {badgeLabel && (
                  <div className="mt-1">
                    <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-[#DF1E26] to-[#F44246] px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-white shadow-xs">
                      <Sparkles size={9} />
                      <span>{badgeLabel}</span>
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Duration Badge */}
            {duration ? (
              <div className="flex items-center gap-1 rounded-lg bg-slate-50 px-2.5 py-1 text-slate-700 border border-slate-200/80 shrink-0">
                <Clock size={12} className="text-[#07405C]" />
                <span className="text-xs font-bold text-slate-900">{duration.value}</span>
                <span className="text-[11px] font-medium text-slate-500 capitalize">{duration.unit}</span>
              </div>
            ) : null}
          </div>

          {/* ================= ZONE 2: BODY ================= */}
          <div className="grow">
            <h3 className="font-display text-lg font-bold text-slate-900 group-hover:text-[#07405C] transition-colors line-clamp-2 leading-snug">
              {course.title}
            </h3>

            <p className="mt-2 text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed">
              {course.shortDescription ||
                course.description ||
                'Comprehensive hands-on training with real-world industry project modules, 1-on-1 mentor guidance, and placement support.'}
            </p>

            {/* Tech Stack Pills */}
            {techPills.length > 0 && (
              <div className="mt-4 flex flex-wrap items-center gap-1.5">
                {techPills.map((tech, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700 group-hover:bg-slate-200/70 transition-colors"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            )}
          </div>
        </Link>

        {/* ================= ZONE 3: DUAL-ACTION FOOTER ================= */}
        <div className="flex items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/70 px-6 py-3.5">
          {/* Syllabus PDF Download Button */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              downloadSyllabus(course)
            }}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-xs transition hover:border-[#07405C] hover:bg-[#07405C] hover:text-white cursor-pointer active:scale-95"
            title={`Download ${course.title} Syllabus (PDF)`}
          >
            <Download size={13} />
            <span>Syllabus</span>
          </button>

          {/* Explore Course Link */}
          <Link
            to={`/courses/${course.slug}`}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#07405C] group-hover:text-[#DF1E26] transition-colors cursor-pointer"
          >
            <span>View Details</span>
            <ArrowRight size={14} className="transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </motion.li>
  )
}

/* =========================================================
   COURSE SKELETON
========================================================= */

function CourseCardSkeleton() {
  return (
    <li className="rounded-2xl border border-slate-200 bg-white p-6 list-none">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-12 w-12 rounded-xl" />
          <Skeleton className="h-5 w-24 rounded-md" />
        </div>
        <Skeleton className="h-6 w-16 rounded-md" />
      </div>
      <Skeleton className="mt-4 h-6 w-3/4 rounded-md" />
      <SkeletonText lines={2} className="mt-3" />
      <div className="mt-4 flex gap-1.5">
        <Skeleton className="h-5 w-14 rounded-md" />
        <Skeleton className="h-5 w-16 rounded-md" />
        <Skeleton className="h-5 w-12 rounded-md" />
      </div>
      <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
        <Skeleton className="h-7 w-24 rounded-lg" />
        <Skeleton className="h-5 w-20 rounded-md" />
      </div>
    </li>
  )
}

/* =========================================================
   MAIN COURSES CATALOG PAGE
========================================================= */

export default function CourseCatalogPage() {
  const reduced = useReducedMotion()
  const { courses, isLoading, error, refetch } = useCourses()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('ALL')

  useDocumentMeta({
    title: 'Courses & Programs — LeSuccess Academy',
    description:
      'Explore job-focused technology and career programs in Full Stack, Data Science, Cloud, DevOps, and Business with live projects and 100% placement guidance.',
  })

  // Derive unique categories dynamically
  const categories = useMemo(() => {
    const set = new Set()
    courses.forEach((c) => {
      const cat = c.categoryGroup || c.category
      if (cat && typeof cat === 'string' && cat.trim()) {
        set.add(cat.trim())
      }
    })
    return Array.from(set).sort()
  }, [courses])

  // Count items per category
  const categoryCounts = useMemo(() => {
    const counts = { ALL: courses.length }
    courses.forEach((c) => {
      const cat = c.categoryGroup || c.category
      if (cat) {
        counts[cat] = (counts[cat] || 0) + 1
      }
    })
    return counts
  }, [courses])

  // Filtered courses based on search & category
  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
      const cat = c.categoryGroup || c.category || ''
      const matchesCategory = selectedCategory === 'ALL' || cat === selectedCategory

      if (!matchesCategory) return false

      if (!searchQuery.trim()) return true

      const query = searchQuery.toLowerCase().trim()
      const title = (c.title || '').toLowerCase()
      const desc = (c.shortDescription || c.description || '').toLowerCase()
      const slug = (c.slug || '').toLowerCase()
      const categoryName = cat.toLowerCase()
      const techStackStr = Array.isArray(c.techStack)
        ? c.techStack.map((t) => (t.itemName || '').toLowerCase()).join(' ')
        : ''

      return (
        title.includes(query) ||
        desc.includes(query) ||
        slug.includes(query) ||
        categoryName.includes(query) ||
        techStackStr.includes(query)
      )
    })
  }, [courses, selectedCategory, searchQuery])

  const handleResetFilters = () => {
    setSearchQuery('')
    setSelectedCategory('ALL')
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* =========================================================
          HERO SECTION (LeSuccess Navy / Blue Brand Gradient)
      ========================================================= */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#024D72] via-[#07405C] to-[#013550] px-5 py-18 sm:px-8 lg:px-16 text-white text-center">
        {/* Decorative Glow Orbs */}
        <div
          aria-hidden="true"
          className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-cyan-400/10 blur-3xl pointer-events-none"
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-[#DF1E26]/15 blur-3xl pointer-events-none"
        />

        <div className="relative z-10 mx-auto max-w-4xl">
          <motion.div
            variants={motionSafe(fadeUp, reduced)}
            initial="hidden"
            animate="visible"
          >
            {/* Pill Tag */}
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white backdrop-blur-md shadow-xs mb-4">
              <GraduationCap size={14} className="text-[#DF1E26]" />
              <span>Job-Ready Learning Paths</span>
            </span>

            {/* Main Headline */}
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Master High-Demand Tech Skills
            </h1>

            {/* Value Prop Subtitle */}
            <p className="mt-4 text-base sm:text-lg text-white/80 max-w-2xl mx-auto leading-relaxed">
              Fast-track your career with industry-aligned curriculums, hands-on production codebases, dedicated 1-on-1 mentorship, and guaranteed placement assistance.
            </p>

            {/* Interactive Search Bar in Hero */}
            <div className="mt-8 mx-auto max-w-xl relative">
              <div className="relative flex items-center">
                <Search size={18} className="absolute left-4 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by track, language, or tool (e.g. Java, Python, AWS, React)..."
                  className="w-full rounded-2xl bg-white/95 text-slate-900 placeholder:text-slate-400 pl-11 pr-10 py-3.5 text-sm font-medium shadow-xl shadow-black/10 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#DF1E26] transition-all"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3.5 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                    title="Clear search"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>

            {/* Quick Feature Pills */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-white/85">
              <span className="flex items-center gap-1.5 bg-white/10 border border-white/15 px-3 py-1.5 rounded-full backdrop-blur-xs">
                <CheckCircle2 size={14} className="text-emerald-400" />
                <span>20+ Tech Specializations</span>
              </span>
              <span className="flex items-center gap-1.5 bg-white/10 border border-white/15 px-3 py-1.5 rounded-full backdrop-blur-xs">
                <CheckCircle2 size={14} className="text-emerald-400" />
                <span>100% Practical Live Projects</span>
              </span>
              <span className="flex items-center gap-1.5 bg-white/10 border border-white/15 px-3 py-1.5 rounded-full backdrop-blur-xs">
                <CheckCircle2 size={14} className="text-emerald-400" />
                <span>Placement Support & Mock Interviews</span>
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* =========================================================
          DISCOVERY & CATALOG SECTION
      ========================================================= */}
      <section
        aria-labelledby="catalog-title"
        className="mx-auto max-w-6xl px-5 py-12 sm:px-8 lg:py-16"
      >
        {/* Category Discovery Filter Chips */}
        <div className="flex flex-wrap items-center justify-center gap-2 pb-6 border-b border-slate-200">
          <button
            type="button"
            onClick={() => setSelectedCategory('ALL')}
            className={`relative rounded-xl px-4 py-2 text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              selectedCategory === 'ALL'
                ? 'bg-[#07405C] text-white shadow-md shadow-[#07405C]/20 scale-102'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <span>All Programs</span>
            <span
              className={`ml-2 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                selectedCategory === 'ALL' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
              }`}
            >
              {categoryCounts.ALL || courses.length}
            </span>
          </button>

          {categories.map((cat) => {
            const isSelected = selectedCategory === cat
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`relative rounded-xl px-4 py-2 text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#07405C] text-white shadow-md shadow-[#07405C]/20 scale-102'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <span>{cat}</span>
                {categoryCounts[cat] ? (
                  <span
                    className={`ml-2 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {categoryCounts[cat]}
                  </span>
                ) : null}
              </button>
            )
          })}
        </div>

        {/* Results Count Header */}
        <div className="mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 id="catalog-title" className="text-xl sm:text-2xl font-bold text-slate-900">
              {selectedCategory === 'ALL' ? 'All Career Tracks' : selectedCategory}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Showing <span className="font-bold text-slate-800">{filteredCourses.length}</span> of{' '}
              <span className="font-bold text-slate-800">{courses.length}</span> programs
              {searchQuery && <span> matching &ldquo;{searchQuery}&rdquo;</span>}
            </p>
          </div>

          {(searchQuery || selectedCategory !== 'ALL') && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#DF1E26] hover:underline cursor-pointer self-start sm:self-auto"
            >
              <X size={14} />
              <span>Reset all filters</span>
            </button>
          )}
        </div>

        {/* CATALOG GRID */}
        {isLoading ? (
          <ul
            aria-busy="true"
            aria-label="Loading courses"
            className="mt-8 grid list-none gap-6 p-0 sm:grid-cols-2 lg:grid-cols-3"
          >
            {Array.from({ length: 6 }, (_, index) => (
              <CourseCardSkeleton key={index} />
            ))}
          </ul>
        ) : error ? (
          <ErrorState
            className="mt-10"
            title="The course list didn't load"
            message={error?.message ?? 'The server did not respond. Try again in a moment.'}
            onRetry={refetch}
          />
        ) : filteredCourses.length === 0 ? (
          <div className="mt-12 rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center max-w-lg mx-auto shadow-xs">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 mb-4">
              <BookOpen size={28} />
            </div>
            <h3 className="text-base font-bold text-slate-800">No programs match your search</h3>
            <p className="mt-1 text-sm text-slate-500">
              We couldn&apos;t find any courses matching &ldquo;{searchQuery || selectedCategory}&rdquo;. Try adjusting your keywords or browse all tracks.
            </p>
            <div className="mt-6">
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-2 rounded-xl bg-[#07405C] px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-[#024D72] transition cursor-pointer"
              >
                <span>Browse All Courses</span>
              </button>
            </div>
          </div>
        ) : (
          <ul className="mt-8 grid list-none gap-6 p-0 sm:grid-cols-2 lg:grid-cols-3">
            {filteredCourses.map((course, index) => (
              <CourseCard
                key={course.id}
                course={course}
                column={index % 3}
                reduced={reduced}
              />
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
