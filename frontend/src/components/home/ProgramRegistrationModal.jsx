import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X, Calendar, Clock, Video, Briefcase, CheckCircle2, Send, AlertCircle, MapPin, Copy } from 'lucide-react'
import apiClient from '../../services/apiClient.js'
import { normalizeMobile } from '../../utils/validation.js'

function formatModalDate(dateStr) {
  if (!dateStr) return null
  try {
    const parts = String(dateStr).trim().split('-')
    if (parts.length !== 3) return dateStr
    const [y, m, d] = parts.map(Number)
    const date = new Date(y, m - 1, d)
    if (Number.isNaN(date.getTime())) return dateStr
    return date.toLocaleDateString('en-IN', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  } catch {
    return dateStr
  }
}

function formatModalTime(timeStr) {
  if (!timeStr) return null
  try {
    const parts = String(timeStr).trim().split(':')
    if (parts.length < 2) return timeStr
    const [h, min] = parts.map(Number)
    const date = new Date(2000, 0, 1, h, min)
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  } catch {
    return timeStr
  }
}

export default function ProgramRegistrationModal({ isOpen, onClose, program, activeType = 'WEBINAR', onRegisterSuccess }) {
  const [name, setName] = useState('')
  const [mobileNumber, setMobileNumber] = useState('')
  const [email, setEmail] = useState('')
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [serverError, setServerError] = useState('')
  const [registrationResult, setRegistrationResult] = useState(null)
  const [copiedMeet, setCopiedMeet] = useState(false)

  const resolvedType = (program?.type || activeType || 'WEBINAR').toUpperCase()
  const isWebinar = resolvedType === 'WEBINAR'
  const isWorkshop = resolvedType === 'WORKSHOP'
  const isInternship = resolvedType === 'INTERNSHIP'

  const eventTypeName = isWebinar ? 'Webinar' : isWorkshop ? 'Workshop' : 'Internship'
  const modalHeading = isWebinar
    ? 'Register for Webinar'
    : isWorkshop
    ? 'Register for Workshop'
    : 'Apply for Internship'

  const actionText = isWebinar
    ? 'Register for Webinar'
    : isWorkshop
    ? 'Register for Workshop'
    : 'Apply for Internship'

  const displayEventDate =
    program?.displayDate || formatModalDate(program?.eventDate) || 'Upcoming'
  const formattedStartTime = formatModalTime(program?.startTime)
  const formattedEndTime = formatModalTime(program?.endTime)
  const displayEventTime =
    program?.displayTime ||
    (formattedStartTime && formattedEndTime
      ? `${formattedStartTime} - ${formattedEndTime}`
      : formattedStartTime || 'Flexible Timings')

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const validate = () => {
    const errs = {}
    if (!name.trim()) {
      errs.name = 'Full name is required'
    }

    const cleanMobile = normalizeMobile(mobileNumber)
    if (!mobileNumber.trim()) {
      errs.mobileNumber = 'Mobile number is required'
    } else if (!/^(\+91[6-9]\d{9}|[6-9]\d{9})$/.test(cleanMobile)) {
      errs.mobileNumber = 'Enter a valid 10-digit Indian mobile number'
    }

    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errs.email = 'Enter a valid email address'
    }

    return errs
  }

  const isProgOffline = (program?.mode || '').toUpperCase() === 'OFFLINE' || Boolean(program?.venueAddress)

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }

    if (!program?.id) {
      setServerError(`Unable to register: Selected ${eventTypeName.toLowerCase()} is missing or invalid. Please close and re-select the event.`)
      return
    }

    setIsSubmitting(true)
    setServerError('')

    try {
      const payload = {
        name: name.trim(),
        mobileNumber: normalizeMobile(mobileNumber),
        email: email.trim() || undefined,
        mode: isProgOffline ? 'OFFLINE' : 'ONLINE',
        venueAddress: isProgOffline ? (program.venueAddress || program.platform) : undefined,
      }

      const res = await apiClient.post(`/api/upcoming-programs/${program.id}/register`, payload)
      const regData = res?.data?.data
      setRegistrationResult(regData)
      if (regData) {
        try {
          const stored = JSON.parse(localStorage.getItem('lesuccess_registered_events') || '{}')
          stored[program.id] = regData
          localStorage.setItem('lesuccess_registered_events', JSON.stringify(stored))
        } catch (e) {
          console.error('Failed to cache registration', e)
        }
      }
      onRegisterSuccess?.(program.id, regData)
      setIsSuccess(true)
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Registration failed. Please try again.'
      setServerError(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResetAndClose = () => {
    setName('')
    setMobileNumber('')
    setEmail('')
    setErrors({})
    setIsSuccess(false)
    setServerError('')
    setRegistrationResult(null)
    setCopiedMeet(false)
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="program-modal-title"
          className="fixed inset-0 z-70 flex items-center justify-center p-4 sm:p-6"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleResetAndClose}
            className="fixed inset-0 bg-[#101010]/70 backdrop-blur-xs"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="relative w-full max-w-lg rounded-3xl bg-white p-6 sm:p-8 shadow-2xl z-10 overflow-hidden"
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={handleResetAndClose}
              aria-label="Close Registration Form"
              className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-400 transition-colors hover:border-slate-400 hover:text-slate-700 focus:outline-none cursor-pointer"
            >
              <X size={18} />
            </button>

            {/* Header / Program Summary */}
            <div className="pr-10">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#DF1E26]/10 px-2.5 py-0.5 text-xs font-bold text-[#DF1E26] border border-[#DF1E26]/20">
                  {program?.badge || program?.label || (isWebinar ? 'Free Webinar' : isWorkshop ? 'Hands-on Workshop' : 'Internship Program')}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
                  {isProgOffline ? <MapPin size={12} className="text-[#DF1E26]" /> : <Video size={12} className="text-[#07405C]" />}
                  <span>{isProgOffline ? 'Offline (In-Person)' : 'Online (Google Meet)'}</span>
                </span>
              </div>
              <h2
                id="program-modal-title"
                className="font-display text-xl sm:text-2xl font-bold tracking-tight text-slate-900"
              >
                {modalHeading}
              </h2>
              {program?.topic && (
                <p className="mt-1 text-xs sm:text-sm text-slate-500 line-clamp-2">
                  {program.topic}
                </p>
              )}
            </div>

            {/* Program Quick Specs */}
            <div className="mt-3.5 flex flex-wrap gap-3 py-2 px-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600">
              <div className="flex items-center gap-1.5">
                <Calendar size={14} className="text-[#DF1E26]" />
                <span className="font-semibold text-slate-800">{displayEventDate}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock size={14} className="text-[#07405C]" />
                <span className="font-semibold text-slate-800">{displayEventTime}</span>
              </div>
              {isProgOffline ? (
                <div className="flex items-center gap-1.5 min-w-0">
                  <MapPin size={14} className="text-[#DF1E26] shrink-0" />
                  <span className="font-semibold text-slate-800 truncate max-w-xs" title={[program?.organizationName, program?.venueName, program?.venueAddress].filter(Boolean).join(' • ') || program?.platform || 'LeSuccess Campus'}>
                    {[program?.organizationName, program?.venueName || program?.venueAddress].filter(Boolean).join(' • ') || program?.venueAddress || program?.platform || 'LeSuccess Campus'}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <Video size={14} className="text-[#07405C]" />
                  <span className="font-semibold text-slate-800">{program?.platform || 'Google Meet'}</span>
                </div>
              )}
            </div>

            {/* Content Body */}
            {isSuccess ? (
              <div className="py-6 text-center animate-fadeIn">
                <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <CheckCircle2 size={32} />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Registration Confirmed!</h3>
                <p className="mt-1.5 text-xs sm:text-sm text-slate-600 max-w-sm mx-auto">
                  Thank you, <span className="font-semibold text-slate-900">{name}</span>. Your seat for{' '}
                  <span className="font-semibold text-slate-900">{program?.title}</span> ({eventTypeName}) has been confirmed.
                </p>

                {/* Live Session Access Card for Online Events when meet link is provided */}
                {!isProgOffline && (registrationResult?.meetLink || program?.meetLink) && (
                  <div className="mt-5 rounded-2xl border-2 border-emerald-200 bg-emerald-50/80 p-4 text-left shadow-xs">
                    <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs sm:text-sm mb-1.5">
                      <Video size={16} className="text-emerald-600 shrink-0" />
                      <span>Your Live Session Access Link</span>
                    </div>
                    <p className="text-xs text-emerald-800 mb-3">
                      Your Google Meet link has been unlocked. Join directly at the scheduled time:
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
                      <a
                        href={registrationResult?.meetLink || program?.meetLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-[#07405C] px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-sm hover:bg-[#06334a] transition active:scale-98"
                      >
                        <Video size={15} />
                        <span>Join Google Meet Now</span>
                      </a>
                      <button
                        type="button"
                        onClick={() => {
                          const link = registrationResult?.meetLink || program?.meetLink
                          if (link && navigator.clipboard) {
                            navigator.clipboard.writeText(link)
                            setCopiedMeet(true)
                            setTimeout(() => setCopiedMeet(false), 2500)
                          }
                        }}
                        className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-emerald-300 bg-white px-3.5 py-2.5 text-xs font-bold text-emerald-800 hover:bg-emerald-50 transition cursor-pointer"
                      >
                        {copiedMeet ? (
                          <>
                            <CheckCircle2 size={14} className="text-emerald-600" />
                            <span>Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy size={14} />
                            <span>Copy Link</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {isProgOffline && (
                  <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3.5 text-left text-xs text-amber-900">
                    <div className="font-bold flex items-center gap-1.5 text-amber-950 mb-1">
                      <MapPin size={14} className="text-[#DF1E26]" />
                      <span>In-Person Attendance Confirmed</span>
                    </div>
                    <div>
                      {program?.venueAddress || 'LeSuccess Campus'} — Please arrive 15 minutes before the session starts.
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="mt-6 inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-[#F44246] to-[#CA164B] px-8 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md transition hover:brightness-105 cursor-pointer"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="mt-5 space-y-3.5">
                {serverError && (
                  <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs font-medium text-red-600 border border-red-200">
                    <AlertCircle size={16} className="shrink-0" />
                    <span>{serverError}</span>
                  </div>
                )}

                {/* Selected Event / Program (Read-Only) */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-700">
                      {eventTypeName} *
                    </label>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#07405C] bg-[#07405C]/10 px-2 py-0.5 rounded">
                      Event Type: {eventTypeName}
                    </span>
                  </div>
                  <input
                    type="text"
                    readOnly
                    value={program?.title || ''}
                    disabled
                    className="h-10.5 w-full rounded-xl border border-slate-200 bg-slate-100/80 px-3.5 text-xs sm:text-sm font-bold text-slate-800 cursor-not-allowed select-none"
                  />
                </div>

                {/* Name */}
                <div>
                  <label htmlFor="reg-name" className="mb-1 block text-xs font-semibold text-slate-700">
                    Full Name *
                  </label>
                  <input
                    id="reg-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value)
                      if (errors.name) setErrors((prev) => ({ ...prev, name: null }))
                    }}
                    placeholder="Enter your full name"
                    disabled={isSubmitting}
                    className={`h-10.5 w-full rounded-xl border bg-slate-50/60 px-3.5 text-xs sm:text-sm text-slate-900 transition focus:bg-white focus:outline-none focus:ring-2 ${errors.name ? 'border-red-400 focus:ring-red-400' : 'border-slate-200 focus:ring-[#07405C]'}`}
                  />
                  {errors.name && <p className="mt-1 text-[11px] text-red-600">{errors.name}</p>}
                </div>

                {/* Mobile Number */}
                <div>
                  <label htmlFor="reg-mobile" className="mb-1 block text-xs font-semibold text-slate-700">
                    Mobile Number *
                  </label>
                  <input
                    id="reg-mobile"
                    type="tel"
                    required
                    value={mobileNumber}
                    onChange={(e) => {
                      setMobileNumber(e.target.value)
                      if (errors.mobileNumber) setErrors((prev) => ({ ...prev, mobileNumber: null }))
                    }}
                    placeholder="10-digit mobile number"
                    disabled={isSubmitting}
                    className={`h-10.5 w-full rounded-xl border bg-slate-50/60 px-3.5 text-xs sm:text-sm text-slate-900 transition focus:bg-white focus:outline-none focus:ring-2 ${errors.mobileNumber ? 'border-red-400 focus:ring-red-400' : 'border-slate-200 focus:ring-[#07405C]'}`}
                  />
                  {errors.mobileNumber && <p className="mt-1 text-[11px] text-red-600">{errors.mobileNumber}</p>}
                </div>

                {/* Email Address */}
                <div>
                  <label htmlFor="reg-email" className="mb-1 block text-xs font-semibold text-slate-700">
                    Email Address (Optional)
                  </label>
                  <input
                    id="reg-email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      if (errors.email) setErrors((prev) => ({ ...prev, email: null }))
                    }}
                    placeholder="name@example.com"
                    disabled={isSubmitting}
                    className={`h-10.5 w-full rounded-xl border bg-slate-50/60 px-3.5 text-xs sm:text-sm text-slate-900 transition focus:bg-white focus:outline-none focus:ring-2 ${errors.email ? 'border-red-400 focus:ring-red-400' : 'border-slate-200 focus:ring-[#07405C]'}`}
                  />
                  {errors.email && <p className="mt-1 text-[11px] text-red-600">{errors.email}</p>}
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#F44246] to-[#CA164B] py-3 text-xs sm:text-sm font-bold text-white shadow-md transition hover:brightness-105 active:scale-98 disabled:opacity-60 cursor-pointer"
                  >
                    <span>{isSubmitting ? 'Registering…' : actionText}</span>
                    <Send size={15} />
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}