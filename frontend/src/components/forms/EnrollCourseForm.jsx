import { forwardRef, useEffect, useId, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Button from '../ui/Button.jsx'
import useLeadSubmit from '../../hooks/useLeadSubmit.js'
import useReducedMotion from '../../hooks/useReducedMotion.js'
import { crossFade, errorShake, motionSafe } from '../../animations/variants.js'
import { normalizeMobile, validateEnrollForm } from '../../utils/validation.js'
import { LEAD_SOURCE } from '../../services/leadApi.js'

const EMPTY_FORM = { name: '', mobile: '', email: '' }

/**
 * Enroll-card field: a small grey label above a bordered input box, matching
 * the card in Course_Page.pdf.
 */
function Field({
  id,
  label,
  type = 'text',
  value,
  onChange,
  error,
  disabled,
  inputMode,
  autoComplete,
  inputRef,
  reduced,
}) {
  const errorId = `${id}-error`

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-xs font-semibold text-navy-800/85">
        {label}
      </label>

      <input
        id={id}
        ref={inputRef}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        inputMode={inputMode}
        autoComplete={autoComplete}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? errorId : undefined}
        className={`h-10.5 w-full rounded-lg border bg-white px-3.5 text-sm text-navy-800 transition-colors focus:outline-none focus:ring-2 focus:ring-brand/20 disabled:opacity-60 ${
          error ? 'border-danger' : 'border-line-strong focus:border-brand'
        }`}
      />

      <AnimatePresence initial={false}>
        {error ? (
          <motion.p
            key="error"
            id={errorId}
            role="alert"
            variants={motionSafe(errorShake, reduced)}
            initial="hidden"
            animate="visible"
            exit={reduced ? undefined : 'exit'}
            className="mt-1 text-[0.75rem] text-danger"
          >
            {error}
          </motion.p>
        ) : null}
      </AnimatePresence>
    </div>
  )
}

/**
 * The enroll card.
 *
 * Submission goes through useLeadSubmit, which owns the request; this component
 * owns the fields, the client-side rules and what success looks like. It never
 * navigates — on success it swaps itself for a confirmation.
 *
 * The forwarded ref lands on the wrapper so the page can scroll to it from the
 * hero and mid-page CTAs.
 */
const EnrollCourseForm = forwardRef(function EnrollCourseForm(
  { courseId, courseName, discountLabel, className = '' },
  ref,
) {
  const baseId = useId()
  const reduced = useReducedMotion()
  // live: this form posts for real; the mock gateway still serves everything
  // else. Without it, useLeadSubmit defaults to live:false and every submission
  // resolves via mockSubmitLead while VITE_USE_MOCKS is 'true' — showing the
  // confirmation panel below without ever reaching the backend.
  const { submit, isSubmitting, isSuccess, error, fieldErrors, reset } = useLeadSubmit({
    live: true,
  })

  const [values, setValues] = useState(EMPTY_FORM)
  const [learningMode, setLearningMode] = useState('Online')
  const [clientErrors, setClientErrors] = useState({})
  // Validate on change only after the first submit, so the form doesn't scold
  // someone who is still typing their name.
  const [hasSubmitted, setHasSubmitted] = useState(false)

  const nameInputRef = useRef(null)
  const successRef = useRef(null)

  // Server-side field errors sit alongside client ones; the server wins.
  const errors = { ...clientErrors, ...fieldErrors }

  const setField = (field) => (nextValue) => {
    setValues((current) => {
      const next = { ...current, [field]: nextValue }
      if (hasSubmitted) setClientErrors(validateEnrollForm(next))
      return next
    })
  }

  // Move focus to the confirmation so screen reader users are told it worked.
  useEffect(() => {
    if (isSuccess) successRef.current?.focus()
  }, [isSuccess])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setHasSubmitted(true)

    const validationErrors = validateEnrollForm(values)
    setClientErrors(validationErrors)

    if (Object.keys(validationErrors).length > 0) {
      // Send focus to the first problem rather than leaving it on the button.
      const firstField = ['name', 'mobile', 'email'].find((f) => validationErrors[f])
      document.getElementById(`${baseId}-${firstField}`)?.focus()
      return
    }

    await submit({
      name: values.name,
      mobile: normalizeMobile(values.mobile),
      email: values.email,
      courseId,
      courseName,
      learningMode,
      source: LEAD_SOURCE.COURSE_ENROLL_FORM,
    })
  }

  const handleReset = () => {
    setValues(EMPTY_FORM)
    setClientErrors({})
    setHasSubmitted(false)
    reset()
    nameInputRef.current?.focus()
  }

  return (
    <div
      ref={ref}
      id="enroll"
      // scroll-mt keeps the card clear of the sticky tab bar when jumped to.
      /*
        Elevation instead of an outline.

        A 1px grey border and one flat shadow read as a boxed-off panel. Real
        depth comes from stacking shadows the way light actually falls: a tight
        contact shadow directly under the card, a mid shadow for its body, and a
        wide, very soft one for the ambient cast. The hairline ring replaces the
        border so the white card still holds an edge against a white page
        without drawing a box around itself.
      */
      className={`scroll-mt-28 rounded-2xl bg-white ring-1 ring-navy-900/[0.06] shadow-[0_1px_2px_rgba(18,58,92,0.05),0_8px_20px_-8px_rgba(18,58,92,0.14),0_28px_56px_-28px_rgba(18,58,92,0.30)] ${className}`}
    >
      {/* Brand cap — the reference card's navy bar, carrying the site gradient. */}
      <div aria-hidden="true" className="bg-brand-gradient h-1.5" />

      <div className="p-5 sm:p-6">
        <AnimatePresence mode="wait" initial={false}>
          {isSuccess ? (
            <motion.div
              key="success"
              variants={motionSafe(crossFade, reduced)}
              initial="hidden"
              animate="visible"
              exit={reduced ? undefined : 'exit'}
            >
              <div
                ref={successRef}
                tabIndex={-1}
                className="rounded-lg bg-green-soft px-4 py-5 text-center outline-none"
              >
                <p className="font-display text-base font-semibold text-navy-800">
                  Thanks — we have your details
                </p>
                <p className="mt-2 text-[0.8125rem] leading-relaxed text-ink-soft">
                  A counsellor will call you within one working day to confirm your
                  batch and answer your questions.
                </p>
              </div>

              <button
                type="button"
                onClick={handleReset}
                className="mt-4 w-full text-[0.8125rem] font-medium text-brand underline underline-offset-4"
              >
                Send another enquiry
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              variants={motionSafe(crossFade, reduced)}
              initial="hidden"
              animate="visible"
              exit={reduced ? undefined : 'exit'}
            >
              <div className="mb-4 sm:mb-5 flex items-center justify-between gap-2">
                <h3 className="font-display text-lg sm:text-xl font-bold text-navy-800 tracking-tight">
                  Enroll This Course
                </h3>

                {/* Per-course data — absent when there is no offer. */}
                {discountLabel ? (
                  <span className="shrink-0 rounded-md bg-[#DF1E26]/10 px-2.5 py-0.5 text-[0.7rem] font-bold text-[#DF1E26] border border-[#DF1E26]/20">
                    {discountLabel}
                  </span>
                ) : null}
              </div>

              <form onSubmit={handleSubmit} noValidate className="space-y-3 sm:space-y-3.5">
                <Field
                  id={`${baseId}-name`}
                  label="Name"
                  value={values.name}
                  onChange={setField('name')}
                  error={errors.name}
                  disabled={isSubmitting}
                  autoComplete="name"
                  inputRef={nameInputRef}
                  reduced={reduced}
                />

                <Field
                  id={`${baseId}-mobile`}
                  label="Mobile Number"
                  type="tel"
                  inputMode="numeric"
                  value={values.mobile}
                  onChange={setField('mobile')}
                  error={errors.mobile}
                  disabled={isSubmitting}
                  autoComplete="tel"
                  reduced={reduced}
                />

                <Field
                  id={`${baseId}-email`}
                  label="Email ID"
                  type="email"
                  inputMode="email"
                  value={values.email}
                  onChange={setField('email')}
                  error={errors.email}
                  disabled={isSubmitting}
                  autoComplete="email"
                  reduced={reduced}
                />

                {/* Learning Mode (Online / Offline) */}
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-navy-800/85">
                    Learning Mode
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {['Online', 'Offline'].map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => setLearningMode(mode)}
                        disabled={isSubmitting}
                        className={`flex items-center justify-center rounded-lg border py-2 text-xs font-semibold transition-all cursor-pointer ${
                          learningMode === mode
                            ? 'border-[#07405C] bg-[#07405C] text-white shadow-xs'
                            : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <span>{mode}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Request-level failures that aren't tied to a field. */}
                {error && Object.keys(fieldErrors).length === 0 ? (
                  <p
                    role="alert"
                    className="rounded-md bg-danger-soft px-3 py-2 text-[0.75rem] text-danger"
                  >
                    {error.message}
                  </p>
                ) : null}

                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  className="mt-2 w-full h-11 text-sm font-bold shadow-md hover:shadow-lg transition-all"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Sending…' : 'Enroll Now'}
                </Button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
})

export default EnrollCourseForm
