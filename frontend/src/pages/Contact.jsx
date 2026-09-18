import { useEffect, useRef, useState } from "react";
import { Mail, Phone, MapPin, MessageCircle, Send } from "lucide-react";
import { FaInstagram, FaFacebookF, FaLinkedinIn, FaYoutube } from "react-icons/fa";

import useContactSubmit from "../hooks/useContactSubmit.js";
import { validateContactForm } from "../utils/validation.js";

const SOCIALS = [
  { icon: FaInstagram, href: "https://www.instagram.com/lesuccess_academy/", label: "Instagram" },
  { icon: FaFacebookF, href: "https://www.facebook.com/lesuccessacademy/", label: "Facebook" },
  { icon: FaLinkedinIn, href: "https://www.linkedin.com/company/lesuccess-academy/", label: "LinkedIn" },
  { icon: MessageCircle, href: "https://wa.me/918012060000", label: "WhatsApp" },
  { icon: FaYoutube, href: "https://www.youtube.com/@lesuccessacademy", label: "YouTube" },
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
      // Only re-validate live once the visitor has tried to send
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
    <div className="w-full bg-slate-50 min-h-screen py-10 sm:py-16 px-4 sm:px-6 lg:px-12">
      <div className="max-w-7xl mx-auto">
        {/* 2-Column Side-by-Side Layout for Desktop, Stacks vertically on Mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ================= LEFT COLUMN: Contact Form ================= */}
          <div className="lg:col-span-7 bg-white rounded-3xl shadow-sm border border-slate-100 p-6 sm:p-8 lg:p-10">
            <div className="mb-6">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 flex items-center gap-2 tracking-tight">
                Get in Touch <span aria-hidden="true">👋</span>
              </h1>
              <p className="text-slate-500 text-sm sm:text-base mt-2">
                We&apos;re here to help would love to hear from you.
              </p>
            </div>

            {isSuccess ? (
              <div
                ref={successRef}
                tabIndex={-1}
                role="status"
                className="py-12 text-center focus:outline-none"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mb-4">
                  <span className="text-2xl">🎉</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900">
                  Thank you for reaching out!
                </h3>
                <p className="text-slate-500 text-sm mt-2 max-w-md mx-auto">
                  We have received your message and our career advisory team will get back to you shortly.
                </p>
                <button
                  type="button"
                  onClick={handleSendAnother}
                  className="mt-6 inline-flex items-center justify-center gap-2 border border-slate-300 text-slate-700 font-semibold py-2.5 px-6 rounded-xl hover:border-rose-500 hover:text-rose-600 transition-colors"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form noValidate onSubmit={handleSend} className="space-y-4">
                {/* Honeypot: Hidden from real users */}
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

                {/* Server-level error */}
                {error && !error.isValidation && (
                  <div
                    role="alert"
                    className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 font-medium"
                  >
                    {error.message}
                  </div>
                )}

                {/* Row 1: Name, Mobile, Email */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
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

                {/* Row 2: Who you are, Looking for, Location */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
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
                      className="w-full bg-slate-100 rounded-xl px-4 py-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-rose-500 disabled:opacity-60"
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

                {/* Row 3: What help you want? (Textarea) */}
                <div>
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
                    className="w-full bg-slate-100 rounded-xl px-4 py-3 text-sm text-slate-700 placeholder-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-rose-500 disabled:opacity-60"
                  />
                  {errors.message && (
                    <p id="message-error" className="mt-1 text-xs text-rose-600 font-medium">
                      {errors.message}
                    </p>
                  )}
                </div>

                {/* Row 4: Submit button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#ef334c] to-[#c71d34] text-white font-bold py-3.5 px-9 rounded-xl hover:opacity-95 transition-all shadow-md hover:shadow-lg disabled:opacity-60 cursor-pointer"
                  >
                    {isSubmitting ? "Sending..." : "Send"} <Send size={16} />
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* ================= RIGHT COLUMN: Info Card + Map ================= */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            {/* Dark Teal Contact Info Card */}
            <div className="bg-[#0f3f4f] rounded-3xl p-6 sm:p-8 text-white flex flex-col gap-5 shadow-sm">
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-xl bg-white/10 text-[#ef334c] shrink-0">
                  <Mail size={18} />
                </div>
                <div className="text-sm leading-relaxed">
                  <p className="font-semibold text-slate-200">Email Us</p>
                  <a href="mailto:training@lesuccess.in" className="hover:text-rose-300 transition-colors block">
                    training@lesuccess.in
                  </a>
                  <a href="mailto:contact@lesuccess.in" className="hover:text-rose-300 transition-colors block text-slate-300">
                    contact@lesuccess.in
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-xl bg-white/10 text-[#ef334c] shrink-0">
                  <Phone size={18} />
                </div>
                <div className="text-sm leading-relaxed">
                  <p className="font-semibold text-slate-200">Call Us</p>
                  <a href="tel:+918012060000" className="hover:text-rose-300 transition-colors block">
                    +91 80120 60000
                  </a>
                  <a href="tel:+918189822000" className="hover:text-rose-300 transition-colors block text-slate-300">
                    +91 81898 22000
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-xl bg-white/10 text-[#ef334c] shrink-0">
                  <MapPin size={18} />
                </div>
                <div className="text-sm leading-relaxed">
                  <p className="font-semibold text-slate-200">Our Center</p>
                  <p className="text-slate-300">
                    4th Floor, Tristar Tower, Avinashi road, Lakshmi Mills, Coimbatore, Tamil Nadu - 641037
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-white/10">
                <p className="text-sm font-semibold mb-3 text-slate-200">Follow Us</p>
                <div className="flex items-center gap-2.5">
                  {SOCIALS.map(({ icon: Icon, href, label }) => (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-white hover:bg-[#ef334c] transition-all"
                    >
                      <Icon size={16} />
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Google Map Embed directly below dark teal card */}
            <div className="rounded-3xl overflow-hidden shadow-sm border border-slate-200 h-[260px] sm:h-[300px] w-full">
              <iframe
                title="LeSuccess location map"
                className="w-full h-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3916.355940175046!2d76.98265240945942!3d11.011898454763381!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ba837c0178b0805%3A0x27b8de4c436b2d9d!2sLeSuccess!5e0!3m2!1sen!2sin!4v1787855865609!5m2!1sen!2sin"
              />
            </div>
          </div>

        </div>
      </div>
    </div>
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
        className={`w-full rounded-xl px-4 py-3 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 disabled:opacity-60 transition-all ${
          error
            ? "bg-rose-50 ring-1 ring-rose-300 focus:ring-rose-500"
            : "bg-slate-100 focus:ring-rose-500"
        }`}
      />
      {error && (
        <p id={errorId} className="mt-1 text-xs text-rose-600 font-medium">
          {error}
        </p>
      )}
    </div>
  );
}
