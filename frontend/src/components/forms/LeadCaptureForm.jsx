import { useEffect, useId, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import Button from '../ui/Button.jsx'
import useLeadSubmit from '../../hooks/useLeadSubmit.js'
import useReducedMotion from '../../hooks/useReducedMotion.js'
import { crossFade, errorShake, motionSafe } from '../../animations/variants.js'
import { validateServiceEnquiryForm } from '../../utils/validation.js'
import { LEAD_SOURCE } from '../../services/leadApi.js'

const EMPTY_FORM = { name: '', email: '', lookingFor: '' }

/** Field label above a bordered control, matching the enroll card's fields. */
function FieldShell({ id, label, error, children, reduced, onDark }) {
  const errorId = `${id}-error`

  return (
    <div>
      <label
        htmlFor={id}
        className={`mb-1.5 block text-[0.75rem] ${onDark ? 'text-white/75' : 'text-ink-muted'}`}
      >
        {label}
      </label>

      {children(errorId)}

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
            className={`mt-1.5 text-[0.75rem] ${onDark ? 'text-white' : 'text-danger'}`}
          >
            {error}
          </motion.p>
        ) : null}
      </AnimatePresence>
    </div>
  )
}

/*
 * Two surfaces: a white card, and a dark band where the fields sit directly on
 * the background. `onDark` is not a colour swap of the same control — the fill
 * goes translucent and the text and placeholder go white, which is the only way
 * a bordered input reads on a photograph.
 */
const controlClass = (error, onDark) => {
  const base =
    'h-12 w-full rounded-lg border px-4 text-sm transition-colors focus:outline-none disabled:opacity-60'

  if (onDark) {
    return `${base} bg-white/10 text-white placeholder:text-white/60 ${
      error ? 'border-danger' : 'border-white/35 focus:border-white'
    }`
  }

  return `${base} bg-white text-navy-800 ${
    error ? 'border-danger' : 'border-line-strong focus:border-brand'
  }`
}

/**
 * Name / email / what-you-are-looking-for enquiry form.
 *
 * Separate from EnrollCourseForm because it asks different questions — no
 * mobile, no course, and a required subject — but it shares everything below
 * the surface: useLeadSubmit owns the request, leadApi owns the body, and the
 * `source` tells the backend which form a lead arrived from.
 *
 * @param {string} [source] LEAD_SOURCE value recorded against the lead.
 * @param {{value: string, label: string}[]} options Choices for "You looking for?".
 */
export default function LeadCaptureForm({
  options = [],
  source = LEAD_SOURCE.SERVICE_CTA_FORM,
  layout = 'card',
  className = '',
}) {
  // 'row' drops the white card and lays the fields out across the container,
  // for a full-width band where the section background is the surface.
  const isRow = layout === 'row'
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
      if (hasSubmitted) setClientErrors(validateServiceEnquiryForm(next))
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

    const validationErrors = validateServiceEnquiryForm(values)
    setClientErrors(validationErrors)

    if (Object.keys(validationErrors).length > 0) {
      // Send focus to the first problem rather than leaving it on the button.
      const firstField = ['name', 'email', 'lookingFor'].find((f) => validationErrors[f])
      document.getElementById(`${baseId}-${firstField}`)?.focus()
      return
    }

    await submit({
      name: values.name,
      email: values.email,
      lookingFor: values.lookingFor,
      source,
    })
  }

  const handleReset = () => {
    setValues(EMPTY_FORM)
    setClientErrors({})
    setHasSubmitted(false)
    reset()
    nameInputRef.current?.focus()
  }

  const fields = (
    <>
      <FieldShell
        id={`${baseId}-name`}
        label="Enter Your Name"
        error={errors.name}
        reduced={reduced}
        onDark={isRow}
      >
        {(errorId) => (
          <input
            id={`${baseId}-name`}
            ref={nameInputRef}
            type="text"
            value={values.name}
            onChange={(event) => setField('name')(event.target.value)}
            disabled={isSubmitting}
            autoComplete="name"
            aria-invalid={errors.name ? 'true' : undefined}
            aria-describedby={errors.name ? errorId : undefined}
            className={controlClass(errors.name, isRow)}
          />
        )}
      </FieldShell>

      <FieldShell
        id={`${baseId}-email`}
        label="Enter Email id"
        error={errors.email}
        reduced={reduced}
        onDark={isRow}
      >
        {(errorId) => (
          <input
            id={`${baseId}-email`}
            type="email"
            inputMode="email"
            value={values.email}
            onChange={(event) => setField('email')(event.target.value)}
            disabled={isSubmitting}
            autoComplete="email"
            aria-invalid={errors.email ? 'true' : undefined}
            aria-describedby={errors.email ? errorId : undefined}
            className={controlClass(errors.email, isRow)}
          />
        )}
      </FieldShell>

      <FieldShell
        id={`${baseId}-lookingFor`}
        label="You looking for?"
        error={errors.lookingFor}
        reduced={reduced}
        onDark={isRow}
      >
        {(errorId) => (
          /*
            The native control is suppressed with appearance-none and a caret is
            drawn over it, so the select matches the text inputs beside it
            instead of rendering the OS widget. Same approach the home page's
            demo-class select already uses.
          */
          <div className="relative">
            <select
              id={`${baseId}-lookingFor`}
              value={values.lookingFor}
              onChange={(event) => setField('lookingFor')(event.target.value)}
              disabled={isSubmitting}
              aria-invalid={errors.lookingFor ? 'true' : undefined}
              aria-describedby={errors.lookingFor ? errorId : undefined}
              className={`${controlClass(errors.lookingFor, isRow)} appearance-none pr-11 ${
                // Unchosen reads as placeholder text, chosen as input text.
                values.lookingFor ? '' : isRow ? 'text-white/60' : 'text-ink-muted'
              }`}
            >
              {/* Option text inherits the OS menu surface, not the control, so
                  it is set explicitly rather than left white on white. */}
              <option value="" className="text-navy-800">
                Select an option
              </option>
              {options.map((option) => (
                <option key={option.value} value={option.value} className="text-navy-800">
                  {option.label}
                </option>
              ))}
            </select>

            <ChevronDown
              size={18}
              aria-hidden="true"
              className={`pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 ${
                isRow ? 'text-white/70' : 'text-ink-muted'
              }`}
            />
          </div>
        )}
      </FieldShell>
    </>
  )

  const requestError =
    error && Object.keys(fieldErrors).length === 0 ? (
      <p
        role="alert"
        className={`rounded-md px-3 py-2.5 text-[0.75rem] ${
          isRow ? 'bg-white/15 text-white' : 'bg-danger-soft text-danger'
        }`}
      >
        {error.message}
      </p>
    ) : null

  const confirmation = (
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
        className={`rounded-lg px-4 py-5 text-center outline-none ${
          isRow ? 'bg-white/15' : 'bg-green-soft'
        }`}
      >
        <p
          className={`font-display text-base font-semibold ${
            isRow ? 'text-white' : 'text-navy-800'
          }`}
        >
          Thanks &mdash; we have your details
        </p>
        <p
          className={`mt-2 text-[0.8125rem] leading-relaxed ${
            isRow ? 'text-white/85' : 'text-ink-soft'
          }`}
        >
          Our team will get back to you within one working day.
        </p>
      </div>

      <button
        type="button"
        onClick={handleReset}
        className={`mt-4 w-full text-[0.8125rem] font-medium underline underline-offset-4 ${
          isRow ? 'text-white' : 'text-brand'
        }`}
      >
        Send another enquiry
      </button>
    </motion.div>
  )

  /*
   * Full-width band layout: three fields across the container, the button
   * beneath them, and no card between the form and the section background.
   */
  if (isRow) {
    return (
      <div className={className}>
        <AnimatePresence mode="wait" initial={false}>
          {isSuccess ? (
            confirmation
          ) : (
            <motion.form
              key="form"
              onSubmit={handleSubmit}
              noValidate
              variants={motionSafe(crossFade, reduced)}
              initial="hidden"
              animate="visible"
              exit={reduced ? undefined : 'exit'}
            >
              <div className="grid gap-5 md:grid-cols-3">{fields}</div>

              {requestError ? <div className="mt-5">{requestError}</div> : null}

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="mt-6 w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Sending…' : 'Submit'}
              </Button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    )
  }

  return (
    <div
      className={`overflow-hidden rounded-card border border-line bg-white shadow-[0_10px_30px_-18px_rgba(18,58,92,0.45)] ${className}`}
    >
      <div aria-hidden="true" className="h-1.5 bg-navy-800" />

      <div className="p-7">
        <AnimatePresence mode="wait" initial={false}>
          {isSuccess ? (
            confirmation
          ) : (
            <motion.form
              key="form"
              onSubmit={handleSubmit}
              noValidate
              variants={motionSafe(crossFade, reduced)}
              initial="hidden"
              animate="visible"
              exit={reduced ? undefined : 'exit'}
              className="space-y-4"
            >
              {fields}
              {requestError}

              <Button
                type="submit"
                variant="primary"
                size="md"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Sending…' : 'Submit'}
              </Button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
