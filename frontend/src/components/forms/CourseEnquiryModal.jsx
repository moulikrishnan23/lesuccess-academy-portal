import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, Send, X } from 'lucide-react'
import courseEnquiryApi from '../../services/courseEnquiryApi.js'
import useCourses from '../../hooks/useCourses.js'
import { normalizeMobile } from '../../utils/validation.js'

const CURRENTLY_YOU_ARE_OPTIONS = [
  'College Student',
  'Working Professional',
  'Fresher / Job Seeker',
  'Career Switcher',
  'Other',
]

export default function CourseEnquiryModal({ isOpen, onClose }) {
  /*
   * The dropdown renders the live catalogue only. It used to fall back to four
   * hardcoded courses with ids 1-4 when the catalogue had not loaded, which was
   * harmless while courseId went unvalidated — but POST /api/course-enquiries now
   * requires the id to name a published course, so a fallback id would either be
   * rejected outright or, worse, file the enquiry against whichever real course
   * happens to hold that id.
   *
   * Losing the fallback costs nothing the visitor cares about: the course is
   * optional, so if the catalogue is unreachable the enquiry still sends on name
   * and mobile alone and a counsellor asks which course on the call back.
   */
  const { courses } = useCourses()
  const availableCourses = courses

  const [form, setForm] = useState({
    name: '',
    mobile: '',
    email: '',
    location: '',
    courseId: '',
    currentlyYouAre: '',
  })

  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState(null) // 'success' | 'error'
  const [errorMessage, setErrorMessage] = useState('')

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

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }))
    }
  }

  const validate = () => {
    const errs = {}
    if (!form.name.trim()) errs.name = 'Name is required'

    const cleanPhone = normalizeMobile(form.mobile)
    if (!form.mobile.trim()) {
      errs.mobile = 'Mobile number is required'
    } else if (!/^(\+91[6-9]\d{9}|[6-9]\d{9})$/.test(cleanPhone)) {
      errs.mobile = 'Enter a valid 10-digit Indian mobile number'
    }

    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      errs.email = 'Enter a valid email address'
    }

    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setIsSubmitting(true)
    setSubmitStatus(null)
    setErrorMessage('')

    try {
      /*
       * Its own endpoint and its own table, not POST /api/leads.
       *
       * This form used to post as a COURSE_ENROLL_FORM lead, which meant every
       * navbar enquiry was counted as a course enrolment, and location, role and
       * course had to be flattened into one `lookingFor` string — they are real
       * columns on course_enquiry now, so they travel as themselves.
       */
      await courseEnquiryApi.submit({
        name: form.name,
        mobile: form.mobile,
        email: form.email,
        location: form.location,
        courseId: form.courseId,
        currentStatus: form.currentlyYouAre,
      })

      setSubmitStatus('success')
    } catch (err) {
      setSubmitStatus('error')
      const fieldErrors = err?.fieldErrors ?? {}
      setErrors((prev) => ({ ...prev, ...fieldErrors }))

      const fieldMsg =
        fieldErrors.mobile ||
        fieldErrors.name ||
        fieldErrors.email ||
        fieldErrors.courseId ||
        Object.values(fieldErrors)[0]
      setErrorMessage(fieldMsg || err?.message || 'Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResetAndClose = () => {
    setForm({
      name: '',
      mobile: '',
      email: '',
      location: '',
      courseId: '',
      currentlyYouAre: '',
    })
    setErrors({})
    setSubmitStatus(null)
    setErrorMessage('')
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="enquiry-modal-title"
          className="fixed inset-0 z-70 flex items-center justify-center p-4 sm:p-6"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#101010]/75 backdrop-blur-xs"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="relative w-full max-w-2xl rounded-3xl bg-white p-6 sm:p-8 md:p-10 shadow-2xl z-10 overflow-hidden border border-slate-100"
          >
            {/* Top-Right Circular Close Button */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close Enquiry Form"
              className="absolute right-5 top-5 sm:right-7 sm:top-7 flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-400 transition-colors hover:border-[#DF1E26] hover:text-[#DF1E26] focus:outline-none focus:ring-2 focus:ring-[#07405C] cursor-pointer"
            >
              <X size={18} strokeWidth={2} />
            </button>

            {/* Header */}
            <div className="pr-10">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#DF1E26]/10 px-3 py-1 text-xs font-bold text-[#DF1E26] mb-2">
                FAST TRACK CONSULTATION
              </span>
              <h2
                id="enquiry-modal-title"
                className="font-display text-2xl font-bold tracking-tight text-[#101010] sm:text-3xl"
              >
                Course Enquiry
              </h2>
              <p className="mt-1 text-sm text-slate-600 sm:text-base">
                Get dedicated career counseling and syllabus details tailored to your goals.
              </p>
            </div>

            {submitStatus === 'success' ? (
              <div className="py-10 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-600">
                  <svg
                    className="h-8 w-8"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-navy-900">Thank You!</h3>
                <p className="mt-2 text-sm text-slate-600 sm:text-base">
                  Your enquiry has been received. Our counsellors will contact you shortly.
                </p>
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="mt-6 inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-[#F44246] to-[#CA164B] px-8 py-2.5 text-sm font-semibold text-white shadow-md transition hover:opacity-95 cursor-pointer"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="mt-6 sm:mt-7">
                {errorMessage && (
                  <div className="mb-4 rounded-lg bg-red-50 p-3 text-xs font-medium text-red-600 sm:text-sm">
                    {errorMessage}
                  </div>
                )}

                {/* 2-Column Responsive Grid */}
                <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
                  {/* Name */}
                  <div>
                    <label
                      htmlFor="enquiry-name"
                      className="mb-1.5 block text-xs font-medium text-slate-700 sm:text-sm"
                    >
                      Name
                    </label>
                    <input
                      id="enquiry-name"
                      type="text"
                      value={form.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      disabled={isSubmitting}
                      className={`h-11 w-full rounded-lg border bg-[#f6f7f9] px-3.5 text-sm text-slate-800 transition focus:bg-white focus:outline-none focus:ring-2 ${
                        errors.name
                          ? 'border-red-500 focus:ring-red-300'
                          : 'border-slate-300 focus:border-transparent focus:ring-[#07405C]'
                      }`}
                    />
                    {errors.name && (
                      <p className="mt-1 text-xs text-red-600">{errors.name}</p>
                    )}
                  </div>

                  {/* Mobile Number */}
                  <div>
                    <label
                      htmlFor="enquiry-mobile"
                      className="mb-1.5 block text-xs font-medium text-slate-700 sm:text-sm"
                    >
                      Mobile Number
                    </label>
                    <input
                      id="enquiry-mobile"
                      type="tel"
                      value={form.mobile}
                      onChange={(e) => handleChange('mobile', e.target.value)}
                      disabled={isSubmitting}
                      className={`h-11 w-full rounded-lg border bg-[#f6f7f9] px-3.5 text-sm text-slate-800 transition focus:bg-white focus:outline-none focus:ring-2 ${
                        errors.mobile
                          ? 'border-red-500 focus:ring-red-300'
                          : 'border-slate-300 focus:border-transparent focus:ring-[#07405C]'
                      }`}
                    />
                    {errors.mobile && (
                      <p className="mt-1 text-xs text-red-600">{errors.mobile}</p>
                    )}
                  </div>

                  {/* Email ID */}
                  <div>
                    <label
                      htmlFor="enquiry-email"
                      className="mb-1.5 block text-xs font-medium text-slate-700 sm:text-sm"
                    >
                      Email ID
                    </label>
                    <input
                      id="enquiry-email"
                      type="email"
                      value={form.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      disabled={isSubmitting}
                      className={`h-11 w-full rounded-lg border bg-[#f6f7f9] px-3.5 text-sm text-slate-800 transition focus:bg-white focus:outline-none focus:ring-2 ${
                        errors.email
                          ? 'border-red-500 focus:ring-red-300'
                          : 'border-slate-300 focus:border-transparent focus:ring-[#07405C]'
                      }`}
                    />
                    {errors.email && (
                      <p className="mt-1 text-xs text-red-600">{errors.email}</p>
                    )}
                  </div>

                  {/* Location */}
                  <div>
                    <label
                      htmlFor="enquiry-location"
                      className="mb-1.5 block text-xs font-medium text-slate-700 sm:text-sm"
                    >
                      Location
                    </label>
                    <input
                      id="enquiry-location"
                      type="text"
                      value={form.location}
                      onChange={(e) => handleChange('location', e.target.value)}
                      disabled={isSubmitting}
                      className="h-11 w-full rounded-lg border border-slate-300 bg-[#f6f7f9] px-3.5 text-sm text-slate-800 transition focus:bg-white focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#07405C]"
                    />
                  </div>

                  {/* Select Your Course */}
                  <div>
                    <label
                      htmlFor="enquiry-course"
                      className="mb-1.5 block text-xs font-medium text-slate-700 sm:text-sm"
                    >
                      Select Your Course
                    </label>
                    <div className="relative">
                      <select
                        id="enquiry-course"
                        value={form.courseId}
                        onChange={(e) => handleChange('courseId', e.target.value)}
                        disabled={isSubmitting}
                        className="h-11 w-full appearance-none rounded-lg border border-slate-300 bg-[#f6f7f9] px-3.5 pr-10 text-sm text-slate-800 transition focus:bg-white focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#07405C]"
                      >
                        <option value="">Select course</option>
                        {availableCourses.map((c) => (
                          <option key={c.id || c.slug} value={c.id || ''}>
                            {c.title || c.name}
                          </option>
                        ))}
                      </select>
                      <ChevronDown
                        size={18}
                        className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500"
                      />
                    </div>
                  </div>

                  {/* Currently you are a */}
                  <div>
                    <label
                      htmlFor="enquiry-role"
                      className="mb-1.5 block text-xs font-medium text-slate-700 sm:text-sm"
                    >
                      Currently you are a
                    </label>
                    <div className="relative">
                      <select
                        id="enquiry-role"
                        value={form.currentlyYouAre}
                        onChange={(e) => handleChange('currentlyYouAre', e.target.value)}
                        disabled={isSubmitting}
                        className="h-11 w-full appearance-none rounded-lg border border-slate-300 bg-[#f6f7f9] px-3.5 pr-10 text-sm text-slate-800 transition focus:bg-white focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#07405C]"
                      >
                        <option value="">Select role</option>
                        {CURRENTLY_YOU_ARE_OPTIONS.map((role) => (
                          <option key={role} value={role}>
                            {role}
                          </option>
                        ))}
                      </select>
                      <ChevronDown
                        size={18}
                        className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Centered Red Gradient Send Button */}
                <div className="mt-8 flex justify-center">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#F44246] to-[#CA164B] px-12 py-3.5 text-sm sm:text-base font-bold text-white shadow-lg transition hover:brightness-105 active:scale-98 disabled:opacity-50 cursor-pointer"
                  >
                    <span>{isSubmitting ? 'Sending…' : 'Send'}</span>
                    <Send size={16} className="-rotate-12 transform" />
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
