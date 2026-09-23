import { useState, useEffect, useRef, useMemo } from 'react'
import {
  CalendarDays,
  Clock3,
  Video,
  Award,
  MapPin,
  Building2,
  Landmark,
  ChevronLeft,
  ChevronRight,
  User,
  Briefcase,
  Code2,
  Sparkles,
  Layers,
  CheckCircle2,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { fadeUp, motionSafe, ONCE_IN_VIEW } from '../../animations/variants.js'
import useReducedMotion from '../../hooks/useReducedMotion.js'
import { listUpcoming } from '../../services/upcomingProgramApi.js'
import { getImageUrl } from '../../utils/imageUtils.js'
import ProgramRegistrationModal from './ProgramRegistrationModal.jsx'

const INTERVAL_MS = 7000

/* =========================================================
   HELPERS
========================================================= */

function formatDate(dateStr) {
  if (!dateStr) return null
  try {
    const value = String(dateStr).trim()
    const parts = value.split('-')
    if (parts.length !== 3) return null
    const [y, m, d] = parts.map(Number)
    if (!Number.isInteger(y) || !Number.isInteger(m) || !Number.isInteger(d)) return null
    const date = new Date(y, m - 1, d)
    if (Number.isNaN(date.getTime())) return null
    return date.toLocaleDateString('en-IN', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  } catch {
    return null
  }
}

function formatTimeRange(startStr, endStr) {
  if (!startStr) return null
  try {
    const formatSingleTime = (timeValue) => {
      const value = String(timeValue).trim()
      const parts = value.split(':')
      if (parts.length < 2) return null
      const hour = Number(parts[0])
      const minute = Number(parts[1])
      if (
        !Number.isInteger(hour) ||
        !Number.isInteger(minute) ||
        hour < 0 ||
        hour > 23 ||
        minute < 0 ||
        minute > 59
      )
        return null
      const date = new Date(2000, 0, 1, hour, minute)
      return date
        .toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        })
        .toUpperCase()
    }
    const start = formatSingleTime(startStr)
    if (!start) return null
    if (!endStr) return start
    const end = formatSingleTime(endStr)
    if (!end) return start
    return `${start} - ${end}`
  } catch {
    return null
  }
}

export default function UpcomingPrograms() {
  const reduced = useReducedMotion()
  const [selectedCategory, setSelectedCategory] = useState('ALL') // 'ALL' | 'WEBINAR' | 'WORKSHOP' | 'INTERNSHIP'
  const [allPrograms, setAllPrograms] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const [direction, setDirection] = useState(1) // 1 = forward, -1 = backward
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false)
  const [selectedProgramForModal, setSelectedProgramForModal] = useState(null)

  const handleOpenRegister = (programToRegister) => {
    const target = programToRegister || currentProgram
    if (!target) return
    setSelectedProgramForModal(target)
    setIsRegisterModalOpen(true)
  }

  const handleCloseRegister = () => {
    setIsRegisterModalOpen(false)
    setSelectedProgramForModal(null)
  }
  const [registeredEvents, setRegisteredEvents] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('lesuccess_registered_events') || '{}')
    } catch {
      return {}
    }
  })

  const handleRegisterSuccess = (programId, regData) => {
    setRegisteredEvents((prev) => {
      const updated = { ...prev, [programId]: regData }
      try {
        localStorage.setItem('lesuccess_registered_events', JSON.stringify(updated))
      } catch (err) {
        console.error('Failed to cache registration', err)
      }
      return updated
    })
  }

  /* =======================================================
     FETCH UPCOMING PROGRAMS (100% DYNAMIC - NO HARDCODED DATA)
  ======================================================= */
  useEffect(() => {
    const controller = new AbortController()
    const fetchPrograms = async () => {
      setLoading(true)
      try {
        const list = await listUpcoming(null, { signal: controller.signal })
        if (Array.isArray(list)) {
          setAllPrograms(list)
        } else {
          setAllPrograms([])
        }
      } catch (error) {
        if (error?.name !== 'AbortError') {
          console.warn('Upcoming programs fetch error:', error)
          setAllPrograms([])
        }
      } finally {
        setLoading(false)
      }
    }

    fetchPrograms()
    return () => controller.abort()
  }, [])

  /* =======================================================
     FILTERED PROGRAMS BY CATEGORY
  ======================================================= */
  const filteredPrograms = useMemo(() => {
    if (selectedCategory === 'ALL') {
      return allPrograms
    }
    return allPrograms.filter(
      (p) => (p.type || '').toUpperCase() === selectedCategory
    )
  }, [allPrograms, selectedCategory])

  // Reset index when category changes
  const handleCategoryChange = (cat) => {
    if (cat === selectedCategory) return
    setSelectedCategory(cat)
    setCurrentIndex(0)
  }

  /* =======================================================
     AUTO SLIDE WITH PAUSE ON HOVER OR OPEN MODAL
  ======================================================= */
  useEffect(() => {
    if (filteredPrograms.length <= 1 || isHovered || isRegisterModalOpen) return undefined

    const timer = setInterval(() => {
      setDirection(1)
      setCurrentIndex((prev) => (prev + 1) % filteredPrograms.length)
    }, INTERVAL_MS)

    return () => clearInterval(timer)
  }, [filteredPrograms.length, isHovered, isRegisterModalOpen])

  /* =======================================================
     CAROUSEL NAVIGATION CONTROLS
  ======================================================= */
  const goToNext = () => {
    if (filteredPrograms.length <= 1) return
    setDirection(1)
    setCurrentIndex((prev) => (prev + 1) % filteredPrograms.length)
  }

  const goToPrev = () => {
    if (filteredPrograms.length <= 1) return
    setDirection(-1)
    setCurrentIndex((prev) => (prev - 1 + filteredPrograms.length) % filteredPrograms.length)
  }

  const goToSlide = (idx) => {
    if (idx === currentIndex) return
    setDirection(idx > currentIndex ? 1 : -1)
    setCurrentIndex(idx)
  }

  // Current active event
  const currentProgram = filteredPrograms[currentIndex] || filteredPrograms[0] || null
  const eventType = (currentProgram?.type || 'WEBINAR').toUpperCase()
  const isOffline = (currentProgram?.mode || '').toUpperCase() === 'OFFLINE'
  const isRegisteredForCurrent = Boolean(currentProgram?.id && registeredEvents[currentProgram.id])
  const registrationInfo = currentProgram?.id ? registeredEvents[currentProgram.id] : null
  const registeredMeetLink = registrationInfo?.meetLink || currentProgram?.meetLink

  // Type-specific badge styling
  const badgeColors = {
    WEBINAR: {
      bg: 'bg-gradient-to-r from-[#DF1E26] to-[#b8141b] text-white shadow-sm shadow-[#DF1E26]/20',
      tag: 'Free Webinar',
      accent: 'border-l-4 border-l-[#DF1E26]',
    },
    WORKSHOP: {
      bg: 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-sm shadow-amber-500/20',
      tag: 'Hands-on Workshop',
      accent: 'border-l-4 border-l-amber-500',
    },
    INTERNSHIP: {
      bg: 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-sm shadow-emerald-600/20',
      tag: 'Internship Program',
      accent: 'border-l-4 border-l-emerald-500',
    },
  }[eventType] || {
    bg: 'bg-[#07405C] text-white',
    tag: currentProgram?.label || 'Event',
    accent: 'border-l-4 border-l-[#07405C]',
  }

  const formattedDate = formatDate(currentProgram?.eventDate) || 'Upcoming'
  const formattedTime =
    formatTimeRange(currentProgram?.startTime, currentProgram?.endTime) || 'Flexible Timings'

  return (
    <section
      id="upcoming-events"
      className="w-full bg-gradient-to-br from-[#024D72] via-[#07405C] to-[#013550] px-4 sm:px-6 md:px-10 lg:px-20 py-20 relative overflow-hidden"
    >
      {/* Decorative ambient background */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none"
      />
      <div
        aria-hidden="true"
        className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-cyan-400/10 blur-3xl pointer-events-none"
      />
      <div
        aria-hidden="true"
        className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-[#DF1E26]/15 blur-3xl pointer-events-none"
      />

      <div className="mx-auto max-w-5xl relative z-10">
        {/* =================================================
            HEADER
        ================================================= */}
        <motion.div
          variants={motionSafe(fadeUp, reduced)}
          initial="hidden"
          whileInView="visible"
          viewport={ONCE_IN_VIEW}
          className="text-center"
        >
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white backdrop-blur-md shadow-xs mb-3">
            <Sparkles size={13} className="text-[#DF1E26]" />
            <span>Upcoming Programs & Events</span>
          </span>
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl md:text-5xl tracking-tight">
            Level Up With Live Sessions
          </h2>
          <p className="mt-3 text-base sm:text-lg text-white/80 max-w-2xl mx-auto leading-relaxed">
            Gain industry exposure, build hands-on projects, and learn live from experienced tech mentors.
          </p>
        </motion.div>

        {/* =================================================
            CATEGORY FILTER TABS
        ================================================= */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
          {[
            { id: 'ALL', label: 'All Events' },
            { id: 'WEBINAR', label: 'Webinars' },
            { id: 'WORKSHOP', label: 'Workshops' },
            { id: 'INTERNSHIP', label: 'Internships' },
          ].map((cat) => {
            const isActive = selectedCategory === cat.id
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleCategoryChange(cat.id)}
                className={`rounded-xl px-4 py-2 text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-white text-[#07405C] shadow-lg shadow-black/10 scale-102'
                    : 'bg-white/10 text-white/80 hover:bg-white/15 hover:text-white border border-white/10'
                }`}
              >
                {cat.label}
              </button>
            )
          })}
        </div>

        {/* =================================================
            EVENT CARD / CAROUSEL CONTAINER / EMPTY STATE
        ================================================= */}
        {loading ? (
          <div className="mt-12 flex min-h-[360px] items-center justify-center rounded-3xl bg-white/5 border border-white/10 p-12">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-white/20 border-t-white" />
          </div>
        ) : allPrograms.length === 0 ? (
          /* Clean empty state when no upcoming events exist */
          <div className="mt-12 mx-auto max-w-xl rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 p-8 sm:p-12 text-center text-white shadow-2xl">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 border border-white/25 text-white mb-4">
              <CalendarDays size={32} className="text-white/90" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white">
              No upcoming programs or events at the moment
            </h3>
            <p className="mt-3 text-sm text-white/80 max-w-md mx-auto leading-relaxed">
              Check back soon for new webinars, workshops, and internship programs, or book a free 1-on-1 live demo today.
            </p>
            <div className="mt-7">
              <a
                href="#demo-class"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#F44246] to-[#CA164B] px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:brightness-105 active:scale-95"
              >
                Book Free Demo
              </a>
            </div>
          </div>
        ) : filteredPrograms.length === 0 ? (
          /* Clean empty category filter state */
          <div className="mt-12 mx-auto max-w-lg rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-8 text-center text-white">
            <p className="text-sm font-semibold text-white/90">
              No upcoming {selectedCategory.toLowerCase()}s scheduled at the moment.
            </p>
            <button
              type="button"
              onClick={() => setSelectedCategory('ALL')}
              className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-cyan-300 hover:text-white underline cursor-pointer"
            >
              View all upcoming events ({allPrograms.length})
            </button>
          </div>
        ) : (
          <div
            className="mt-10 relative"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {/* CAROUSEL CONTROLS (Rendered when 2+ events exist) */}
            {filteredPrograms.length > 1 && (
              <div className="flex items-center justify-between mb-3 px-2">
                <div className="text-xs font-semibold text-white/70">
                  Showing <span className="text-white font-bold">{currentIndex + 1}</span> of{' '}
                  <span className="text-white font-bold">{filteredPrograms.length}</span> events
                  {isHovered && (
                    <span className="ml-2 text-[10px] uppercase font-bold text-amber-300 bg-amber-400/20 px-2 py-0.5 rounded-full">
                      Paused
                    </span>
                  )}
                </div>

                {/* Accessible Navigation Arrows */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={goToPrev}
                    aria-label="Previous upcoming event"
                    className="h-9 w-9 rounded-full bg-white/15 hover:bg-white/30 border border-white/20 text-white flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer backdrop-blur-sm shadow-xs"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={goToNext}
                    aria-label="Next upcoming event"
                    className="h-9 w-9 rounded-full bg-white/15 hover:bg-white/30 border border-white/20 text-white flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer backdrop-blur-sm shadow-xs"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            )}

            {/* MAIN CARD SURFACE */}
            <div className="group/eventcard relative mx-auto rounded-3xl bg-white shadow-2xl shadow-black/20 border border-white/40 overflow-hidden hover:shadow-[0_25px_60px_rgba(0,0,0,0.25)] transition-all duration-300">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentProgram?.id || currentIndex}
                  initial={{ opacity: 0, x: direction * 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: direction * -30 }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                  className="grid md:grid-cols-12 items-stretch"
                >
                  {/* LEFT VISUAL COLUMN (5 COLS) - Framed dedicated image layout */}
                  <div className="md:col-span-5 relative bg-gradient-to-br from-[#07405C] via-[#024D72] to-[#01273C] p-6 sm:p-7 flex flex-col justify-between text-white overflow-hidden min-h-[300px] md:min-h-[440px]">
                    {/* Top Badges */}
                    <div className="relative z-10 flex items-center justify-between gap-2 flex-wrap mb-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-extrabold uppercase tracking-wider ${badgeColors.bg}`}
                      >
                        {currentProgram?.label || badgeColors.tag}
                      </span>

                      <span className="inline-flex items-center gap-1 rounded-full bg-white/20 backdrop-blur-md px-2.5 py-1 text-[11px] font-bold text-white border border-white/25">
                        {isOffline ? <MapPin size={12} /> : <Video size={12} />}
                        <span>{isOffline ? 'In-Person Campus' : 'Online Meet'}</span>
                      </span>
                    </div>

                    {/* Centerpiece Visual / Framed Image Container */}
                    {eventType === 'INTERNSHIP' ? (
                      <div className="relative z-10 my-auto py-6 text-center">
                        <div className="mx-auto h-20 w-20 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md flex items-center justify-center shadow-inner mb-4">
                          <Briefcase size={36} className="text-emerald-400" />
                        </div>
                        <div className="inline-flex items-center gap-2 rounded-lg bg-emerald-500/20 border border-emerald-400/30 px-3 py-1 text-xs font-bold text-emerald-300">
                          <Code2 size={13} />
                          <span>Live Industry Internship</span>
                        </div>
                        <p className="text-xs text-white/80 mt-2 px-2">
                          Work with senior architects on real enterprise codebases.
                        </p>
                      </div>
                    ) : currentProgram?.imageUrl ? (
                      <div className="relative z-10 my-auto w-full max-w-xs sm:max-w-sm mx-auto aspect-[4/3] rounded-2xl overflow-hidden border border-white/25 bg-slate-900/60 shadow-lg group/img">
                        <img
                          src={getImageUrl(currentProgram.imageUrl)}
                          alt={currentProgram.speakerName || currentProgram.title}
                          className="h-full w-full object-cover object-center transition-transform duration-700 group-hover/eventcard:scale-105 group-hover/img:scale-105"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                          }}
                        />
                        {currentProgram.speakerName && (
                          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-3 pt-5">
                            <div className="text-xs sm:text-sm font-bold text-white leading-tight">
                              {currentProgram.speakerName}
                            </div>
                            <div className="text-[10px] sm:text-[11px] text-white/80">
                              {eventType === 'WORKSHOP' ? 'Lead Workshop Trainer' : 'Keynote Speaker'}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="relative z-10 my-auto py-6 text-center">
                        <div className="mx-auto h-20 w-20 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md flex items-center justify-center shadow-inner mb-4 text-white">
                          <User size={36} />
                        </div>
                        <div className="text-sm font-bold text-white">
                          {currentProgram?.speakerName || 'Faculty & Tech Mentors'}
                        </div>
                        <p className="text-xs text-white/70 mt-1">
                          {eventType === 'WORKSHOP' ? 'Hands-on Technical Workshop' : 'Live Interactive Webinar'}
                        </p>
                      </div>
                    )}

                    {/* Clean Bottom Info Bar (No duplicate avatar overlay) */}
                    <div className="relative z-10 pt-4 border-t border-white/15 flex items-center justify-between text-xs text-white/80">
                      <span className="truncate font-semibold">
                        {eventType === 'INTERNSHIP'
                          ? 'LeSuccess Innovation Cell'
                          : currentProgram?.speakerName || 'LeSuccess Faculty'}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-white/60 bg-white/10 px-2 py-0.5 rounded-md">
                        {currentProgram?.label || eventType}
                      </span>
                    </div>
                  </div>

                  {/* RIGHT CONTENT COLUMN (7 COLS) */}
                  <div className="md:col-span-7 p-6 sm:p-8 md:p-10 flex flex-col justify-between text-left bg-white">
                  <div>
                    {/* Top status & Certificate badge */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-xs font-bold text-emerald-700 tracking-wide uppercase">
                          Registrations Open
                        </span>
                      </div>

                      {currentProgram.certificateIncluded && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-xs font-bold text-amber-800">
                          <Award size={14} className="text-amber-600" />
                          <span>Certificate Included</span>
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight tracking-tight">
                      {currentProgram.title}
                    </h3>

                    {/* Topic description */}
                    <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">
                      {currentProgram.topic}
                    </p>

                    {/* Details Grid (Date, Time, Venue/Platform) */}
                    <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3.5 border-t border-slate-100 pt-5">
                      {/* DATE */}
                      <div className="flex items-start gap-2.5 rounded-xl bg-slate-50 p-2.5 border border-slate-100">
                        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#07405C]/10 text-[#07405C]">
                          <CalendarDays size={16} />
                        </div>
                        <div className="min-w-0">
                          <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Date
                          </span>
                          <span className="block text-xs font-bold text-slate-900 truncate">
                            {formattedDate}
                          </span>
                        </div>
                      </div>

                      {/* TIME */}
                      <div className="flex items-start gap-2.5 rounded-xl bg-slate-50 p-2.5 border border-slate-100">
                        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#07405C]/10 text-[#07405C]">
                          <Clock3 size={16} />
                        </div>
                        <div className="min-w-0">
                          <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Timing
                          </span>
                          <span className="block text-xs font-bold text-slate-900 truncate">
                            {formattedTime}
                          </span>
                        </div>
                      </div>

                      {/* PLATFORM / VENUE */}
                      <div className="flex items-start gap-2.5 rounded-xl bg-slate-50 p-2.5 border border-slate-100">
                        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#07405C]/10 text-[#07405C]">
                          {isOffline ? <MapPin size={16} /> : <Video size={16} />}
                        </div>
                        <div className="min-w-0">
                          <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            {isOffline ? 'Venue' : 'Platform'}
                          </span>
                          <span
                            className="block text-xs font-bold text-slate-900 truncate"
                            title={isOffline ? currentProgram.venueName || currentProgram.venueAddress : currentProgram.platform}
                          >
                            {isOffline
                              ? currentProgram.venueName || currentProgram.venueAddress || 'LeSuccess Campus'
                              : currentProgram.platform || 'Google Meet'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* OFFLINE DETAILS ACCORDION / BOX */}
                    {isOffline && (currentProgram.venueAddress || currentProgram.organizationName) && (
                      <div className="mt-4 rounded-xl bg-amber-50/70 border border-amber-200/80 p-3 space-y-1 text-xs">
                        {currentProgram.organizationName && (
                          <div className="flex items-center gap-2 text-slate-700">
                            <Building2 size={13} className="text-[#07405C] shrink-0" />
                            <span className="font-semibold text-slate-500">Host:</span>
                            <span className="font-bold text-slate-900">{currentProgram.organizationName}</span>
                          </div>
                        )}
                        {currentProgram.venueAddress && (
                          <div className="flex items-start gap-2 text-slate-700">
                            <MapPin size={13} className="text-[#DF1E26] shrink-0 mt-0.5" />
                            <span className="font-semibold text-slate-500">Address:</span>
                            <span className="text-slate-800 font-medium">{currentProgram.venueAddress}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* ACTION CTA BUTTONS */}
                  <div className="mt-8 flex flex-wrap items-center gap-3 pt-4 border-t border-slate-100">
                    {isRegisteredForCurrent ? (
                      <>
                        <div className="inline-flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-300 px-4 py-2.5 text-xs sm:text-sm font-bold text-emerald-700 select-none">
                          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                          <span>Registered For This Session</span>
                        </div>
                        {!isOffline && registeredMeetLink && (
                          <a
                            href={registeredMeetLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 rounded-xl bg-[#07405C] px-6 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md hover:bg-[#06334a] transition active:scale-98 cursor-pointer"
                          >
                            <Video size={16} />
                            <span>Join Google Meet</span>
                          </a>
                        )}
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleOpenRegister(currentProgram)}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#F44246] to-[#CA164B] px-7 py-3 text-sm font-bold text-white shadow-lg shadow-[#DF1E26]/20 transition hover:opacity-95 hover:shadow-xl hover:shadow-[#DF1E26]/30 active:scale-98 cursor-pointer"
                      >
                        <Sparkles size={16} />
                        <span>{eventType === 'WEBINAR' ? 'Register For Free' : eventType === 'WORKSHOP' ? 'Book Workshop Seat' : 'Apply For Internship'}</span>
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* SLIDE DOTS / INDICATORS (For 2+ items) */}
          {filteredPrograms.length > 1 && (
            <div className="mt-6 flex items-center justify-center gap-2">
              {filteredPrograms.map((p, idx) => (
                <button
                  key={p.id || idx}
                  type="button"
                  aria-label={`Go to event ${idx + 1}: ${p.title}`}
                  aria-current={idx === currentIndex ? 'true' : undefined}
                  onClick={() => goToSlide(idx)}
                  className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                    idx === currentIndex
                      ? 'w-8 bg-[#DF1E26]'
                      : 'w-2.5 bg-white/40 hover:bg-white/70'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
        )}
      </div>

      {/* REGISTRATION MODAL */}
      <ProgramRegistrationModal
        isOpen={isRegisterModalOpen && Boolean(selectedProgramForModal)}
        onClose={handleCloseRegister}
        program={selectedProgramForModal}
        activeType={selectedProgramForModal?.type || 'WEBINAR'}
        onRegisterSuccess={handleRegisterSuccess}
      />
    </section>
  )
}
