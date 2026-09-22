import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X, Calendar, Clock, Video, Briefcase, CheckCircle2, Send, AlertCircle, MapPin } from 'lucide-react'
import apiClient from '../../services/apiClient.js'
import { normalizeMobile } from '../../utils/validation.js'

export default function ProgramRegistrationModal({ isOpen, onClose, program, activeType = 'WEBINAR' }) {
  const [name, setName] = useState('')
  const [mobileNumber, setMobileNumber] = useState('')
  const [email, setEmail] = useState('')
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [serverError, setServerError] = useState('')

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
      setServerError('Unable to register: Invalid program selected.')
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

      await apiClient.post(`/api/upcoming-programs/${program.id}/register`, payload)
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
    onClose()
  }

  const isWebinar = activeType === 'WEBINAR'
  const actionText = isWebinar ? 'Register for Webinar' : 'Apply for Internship'

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
                  {program?.badge || (isWebinar ? 'Free Webinar' : 'Internship Program')}
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
                {program?.title || actionText}
              </h2>
              {program?.topic && (
                <p className="mt-1 text-xs sm:text-sm text-slate-500 line-clamp-2">
                  {program.topic}
                </p>
              )}
            </div>

            {/* Program Quick Specs */}
            <div className="mt-4 flex flex-wrap gap-3 py-2.5 px-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600">
              {program?.displayDate && (
                <div className="flex items-center gap-1.5">
                  <Calendar size={14} className="text-[#DF1E26]" />
                  <span className="font-semibold text-slate-800">{program.displayDate}</span>
                </div>
              )}
              {program?.displayTime && (
                <div className="flex items-center gap-1.5">
                  <Clock size={14} className="text-[#07405C]" />
                  <span className="font-semibold text-slate-800">{program.displayTime}</span>
                </div>
              )}
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
              <div className="py-8 text-center animate-fadeIn">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <CheckCircle2 size={32} />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Registration Confirmed!</h3>
                <p className="mt-2 text-xs sm:text-sm text-slate-600 max-w-sm mx-auto">
                  Thank you, <span className="font-semibold text-slate-900">{name}</span>. Your seat for{' '}
                  <span className="font-semibold text-slate-900">{program?.title}</span> has been reserved. We will send reminders and joining details to your contact number.
                </p>
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