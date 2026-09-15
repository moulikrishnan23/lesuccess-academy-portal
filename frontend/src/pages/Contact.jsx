import { useEffect, useRef, useState } from "react";
import { Mail, Phone, MapPin, MessageCircle, Send } from "lucide-react";

import {FaInstagram, FaFacebook, FaLinkedin, FaYoutube} from "react-icons/fa"

import useContactSubmit from "../hooks/useContactSubmit.js";
import { validateContactForm } from "../utils/validation.js";

const SOCIALS = [
  { icon: FaInstagram, href: "#", label: "Instagram" },
  { icon: FaFacebook, href: "#", label: "Facebook" },
  { icon: FaLinkedin, href: "#", label: "LinkedIn" },
  { icon: MessageCircle, href: "#", label: "WhatsApp" },
  { icon: FaYoutube, href: "#", label: "YouTube" },
];

const initialForm = {
  name: "",
  mobile: "",
  email: "",
  whoYouAre: "",
  lookingFor: "",
  location: "",
  message: "",
  // Honeypot. Never shown to a person, so anything in it came from a bot.
  website: "",
};

export default function Contact() {
  const [form, setForm] = useState(initialForm);
  const [clientErrors, setClientErrors] = useState({});
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const { submit, isSubmitting, isSuccess, error, fieldErrors, reset } =
    useContactSubmit();

  const successRef = useRef(null);

  // Server-side field errors sit alongside client ones; the server wins.
  const errors = { ...clientErrors, ...fieldErrors };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const next = { ...prev, [name]: value };
      // Only re-validate live once the visitor has tried to send — otherwise a
      // half-typed email is flagged as wrong while they are still typing it.
      if (hasSubmitted) setClientErrors(validateContactForm(next));
      return next;
    });
  };

  // Move focus to the confirmation so screen reader users are told it worked.
  useEffect(() => {
    if (isSuccess) successRef.current?.focus();
  }, [isSuccess]);

  const handleSend = async (e) => {
    e.preventDefault();
    setHasSubmitted(true);

    const validationErrors = validateContactForm(form);
    setClientErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      // Send focus to the first problem rather than leaving it on the button.
      const firstField = ["name", "mobile", "email"].find(
        (f) => validationErrors[f]
      );
      document.getElementById(firstField)?.focus();
      return;
    }

    const accepted = await submit(form);
    if (accepted) setForm(initialForm);
  };

  const handleSendAnother = () => {
    reset();
    setClientErrors({});
    setHasSubmitted(false);
  };

  return (
    <section className="w-full bg-slate-50 py-12 px-4 md:px-10 lg:px-16">
      <div className="w-full max-w-none">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 flex items-center justify-center gap-2">
            Get in Touch <span aria-hidden="true">👋</span>
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            We're here to help would love to hear from you.
          </p>
        </div>

        {/* Form card */}
        {isSuccess ? (
          <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8 mb-6 w-full">
            <div
              ref={successRef}
              tabIndex={-1}
              role="status"
              className="text-center py-6 focus:outline-none"
            >
              <p className="text-lg font-semibold text-slate-900">
                Thank you for reaching out! 🎉
              </p>
              <p className="text-slate-500 text-sm mt-2">
                We have received your message and will get back to you soon.
              </p>
              <button
                type="button"
                onClick={handleSendAnother}
                className="mt-5 inline-flex items-center justify-center gap-2 border border-slate-300 text-slate-700 font-semibold py-2.5 px-6 rounded-md hover:border-rose-400 hover:text-rose-600 transition-colors"
              >
                Send another message
              </button>
            </div>
          </div>
        ) : (
        <form
          noValidate
          onSubmit={handleSend}
          className="bg-white rounded-2xl shadow-sm p-6 md:p-8 mb-6 w-full"
        >
          {/*
            Honeypot: off-screen rather than display:none, and tabbable only by
            something that ignores the label. A real visitor never sees it.
          */}
          <div aria-hidden="true" className="absolute left-[-9999px] top-auto h-px w-px overflow-hidden">
            <label htmlFor="website">Leave this field empty</label>
            <input
              id="website"
              name="website"
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={form.website}
              onChange={handleChange}
            />
          </div>

          {/*
            A failure the fields cannot explain — network down, 429 from the rate
            limiter, 500. Field-level 400s render under their own input instead.
          */}
          {error && !error.isValidation && (
            <div
              role="alert"
              className="mb-4 rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
            >
              {error.message}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Field
              label="Name"
              name="name"
              value={form.name}
              onChange={handleChange}
              error={errors.name}
              disabled={isSubmitting}
              autoComplete="name"
            />
            <Field
              label="Mobile Number"
              name="mobile"
              type="tel"
              value={form.mobile}
              onChange={handleChange}
              error={errors.mobile}
              disabled={isSubmitting}
              autoComplete="tel"
            />
            <Field
              label="Email ID"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              error={errors.email}
              disabled={isSubmitting}
              autoComplete="email"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <Field
              label="Who you are?"
              name="whoYouAre"
              value={form.whoYouAre}
              onChange={handleChange}
              error={errors.whoYouAre}
              disabled={isSubmitting}
            />

            <div>
              <label className="sr-only" htmlFor="lookingFor">
                You looking for?
              </label>
              <select
                id="lookingFor"
                name="lookingFor"
                value={form.lookingFor}
                onChange={handleChange}
                disabled={isSubmitting}
                className="w-full bg-slate-100 rounded-md px-4 py-3 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-rose-400 disabled:opacity-60"
              >
                <option value="">You looking for?</option>
                <option value="course">A course</option>
                <option value="training">Corporate training</option>
                <option value="internship">Internship</option>
                <option value="other">Other</option>
              </select>
            </div>

            <Field
              label="Location"
              name="location"
              value={form.location}
              onChange={handleChange}
              error={errors.location}
              disabled={isSubmitting}
            />
          </div>

          <div className="mt-4">
            <label className="sr-only" htmlFor="message">
              What help you want?
            </label>
            <textarea
              id="message"
              name="message"
              rows={4}
              value={form.message}
              onChange={handleChange}
              disabled={isSubmitting}
              placeholder="What help you want?"
              aria-invalid={errors.message ? "true" : undefined}
              aria-describedby={errors.message ? "message-error" : undefined}
              className="w-full bg-slate-100 rounded-md px-4 py-3 text-sm text-slate-600 placeholder-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-rose-400 disabled:opacity-60"
            />
            {errors.message && (
              <p id="message-error" className="mt-1.5 text-xs text-rose-600">
                {errors.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-5 w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-rose-500 to-rose-700 text-white font-semibold py-3 px-8 rounded-md hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Sending…" : "Send"} <Send size={16} />
          </button>
        </form>
        )}

        {/* Info + Map */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
          <div className="bg-[#0f3f4f] rounded-2xl p-6 text-white flex flex-col gap-5">
            <div className="flex gap-3">
              <Mail size={18} className="mt-0.5 shrink-0 text-rose-300" />
              <div className="text-sm leading-relaxed">
                <p>training@lesuccess.in</p>
                <p>training@lesuccess.in</p>
              </div>
            </div>

            <div className="flex gap-3">
              <Phone size={18} className="mt-0.5 shrink-0 text-rose-300" />
              <div className="text-sm leading-relaxed">
                <p>+91 80120 60000</p>
                <p>+91 81898 22000</p>
              </div>
            </div>

            <div className="flex gap-3">
              <MapPin size={18} className="mt-0.5 shrink-0 text-rose-300" />
              <p className="text-sm leading-relaxed">
                4th Floor, Tristar Tower, Avinashi road, Lakshmi Mills,
                Coimbatore, Tamil Nadu - 641037
              </p>
            </div>

            <div>
              <p className="text-sm font-semibold mb-2">Follow Us</p>
              <div className="flex gap-2">
                {SOCIALS.map(({ icon: Icon, href, label }) => (
                  <a
                    key={label}
                    href={href}
                    aria-label={label}
                    className="w-8 h-8 rounded-md bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                  >
                    <Icon size={16} />
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-2xl overflow-hidden shadow-sm min-h-[260px]">
            <iframe
              title="LeSuccess location map"
              className="w-full h-full min-h-[260px]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3916.355940175046!2d76.98265240945942!3d11.011898454763381!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ba837c0178b0805%3A0x27b8de4c436b2d9d!2sLeSuccess!5e0!3m2!1sen!2sin!4v1787855865609!5m2!1sen!2sin"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function Field({
  label,
  name,
  value,
  onChange,
  type = "text",
  error,
  disabled = false,
  autoComplete,
}) {
  const errorId = `${name}-error`;

  return (
    <div>
      <label className="sr-only" htmlFor={name}>
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        disabled={disabled}
        autoComplete={autoComplete}
        placeholder={label}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={error ? errorId : undefined}
        className={`w-full rounded-md px-4 py-3 text-sm text-slate-600 placeholder-slate-400 focus:outline-none focus:ring-2 disabled:opacity-60 ${
          error
            ? "bg-rose-50 ring-1 ring-rose-300 focus:ring-rose-500"
            : "bg-slate-100 focus:ring-rose-400"
        }`}
      />
      {error && (
        <p id={errorId} className="mt-1.5 text-xs text-rose-600">
          {error}
        </p>
      )}
    </div>
  );
}
