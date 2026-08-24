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
      <label htmlFor={id} className="mb-1.5 block text-[0.75rem] text-ink-muted">
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
        className={`h-10 w-full rounded-md border bg-white px-3 text-[0.875rem] text-navy-800 transition-colors focus:outline-none disabled:opacity-60 ${
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
            className="mt-1.5 text-[0.75rem] text-danger"
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
  { courseId, discountLabel, className = '' },
  ref,
) {
  const baseId = useId()
  const reduced = useReducedMotion()
  const { submit, isSubmitting, isSuccess, error, fieldErrors, reset } = useLeadSubmit()

  const [values, setValues] = useState(EMPTY_FORM)
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
      className={`scroll-mt-28 overflow-hidden rounded-card border border-line bg-white shadow-[0_10px_30px_-18px_rgba(18,58,92,0.45)] ${className}`}
    >
      {/* Navy cap, per the reference card. */}
      <div aria-hidden="true" className="h-1.5 bg-navy-800" />

      <div className="p-6">
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
              <div className="mb-5 flex items-center justify-between gap-3">
                <h3 className="font-display text-lg font-semibold text-navy-800">
                  Enroll This Course
                </h3>

                {/* Per-course data — absent when there is no offer. */}
                {discountLabel ? (
                  <span className="shrink-0 rounded-md bg-green-soft px-2.5 py-1 text-[0.6875rem] font-semibold text-green">
                    {discountLabel}
                  </span>
                ) : null}
              </div>

              <form onSubmit={handleSubmit} noValidate className="space-y-3.5">
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

                {/* Request-level failures that aren't tied to a field. */}
                {error && Object.keys(fieldErrors).length === 0 ? (
                  <p
                    role="alert"
                    className="rounded-md bg-danger-soft px-3 py-2.5 text-[0.75rem] text-danger"
                  >
                    {error.message}
                  </p>
                ) : null}

                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  className="w-full"
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
