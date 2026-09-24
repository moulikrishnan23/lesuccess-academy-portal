import { useEffect, useRef, useState } from "react";
import { Mail, Phone, MapPin, MessageCircle, Send, ChevronDown } from "lucide-react";
import { SOCIAL_LINKS } from "../data/socialLinks.js";
import useContactSubmit from "../hooks/useContactSubmit.js";
import { validateContactForm } from "../utils/validation.js";

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
    <div className="w-full bg-[#F5F8FC]/50 min-h-screen py-10 sm:py-16 px-4 sm:px-6 lg:px-12">
      <div className="max-w-7xl mx-auto">
        {/* 2-Column Side-by-Side Layout for Desktop, Stacks vertically on Mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ================= LEFT COLUMN: Contact Form ================= */}
          <div className="lg:col-span-7 bg-white rounded-3xl shadow-sm border border-slate-200/80 p-6 sm:p-8 lg:p-10">
            <div className="mb-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#07405C]/20 bg-[#07405C]/10 px-3.5 py-1 text-xs font-bold text-[#07405C] mb-3">
                LET&apos;S CONNECT
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#101010] flex items-center gap-2 tracking-tight">
                Get in Touch <span aria-hidden="true">👋</span>
              </h1>
              <p className="text-slate-600 text-sm sm:text-base mt-2 font-normal">
                We&apos;re here to help and would love to hear from you.
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
                <h3 className="text-xl font-bold text-[#101010]">
                  Thank you for reaching out!
                </h3>
                <p className="text-slate-600 text-sm mt-2 max-w-md mx-auto">
                  We have received your message and our career advisory team will get back to you shortly.
                </p>
                <button
                  type="button"
                  onClick={handleSendAnother}
                  className="mt-6 inline-flex items-center justify-center gap-2 border border-slate-300 text-slate-700 font-bold py-2.5 px-6 rounded-xl hover:border-[#DF1E26] hover:text-[#DF1E26] transition-colors cursor-pointer"
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
                    className="rounded-2xl border border-red-200 bg-red-50 px-5 py-3 text-sm text-red-700 font-medium"
                  >
                    {error.message}
                  </div>
                )}

                {/* Form Fields - Aligned grid with pill-shaped inputs matching Reference Image 2 */}
                <div className="space-y-4">
                  {/* Line 1: Name field */}
                  <Field
                    label="Name"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    error={errors.name}
                    disabled={isSubmitting}
                    autoComplete="name"
                  />

                  {/* Line 2: Email ID */}
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

                  {/* Line 3: Mobile Number */}
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

                  {/* Line 4: Who You Are? */}
                  <div>
                    <label className="sr-only" htmlFor="whoYouAre">
                      Who you are?
                    </label>
                    <div className="relative">
                      <select
                        id="whoYouAre"
                        name="whoYouAre"
                        value={form.whoYouAre}
                        onChange={handleChange}
                        disabled={isSubmitting}
                        aria-invalid={errors.whoYouAre ? "true" : undefined}
                        aria-describedby={errors.whoYouAre ? "whoYouAre-error" : undefined}
                        className={`w-full h-12 appearance-none rounded-full px-6 pr-12 text-sm focus:outline-none focus:ring-2 disabled:opacity-60 transition-all cursor-pointer ${
                          !form.whoYouAre ? "text-slate-400" : "text-slate-700"
                        } ${
                          errors.whoYouAre
                            ? "bg-red-50 ring-1 ring-red-300 focus:ring-red-500"
                            : "bg-[#F5F8FC] focus:bg-white focus:ring-[#07405C] border border-slate-200"
                        }`}
                      >
                        <option value="" className="text-slate-400">Who you are?</option>
                        <option value="College Student" className="text-slate-700 bg-white">College Student / Fresher</option>
                        <option value="Working Professional" className="text-slate-700 bg-white">Working Professional</option>
                        <option value="Career Switcher" className="text-slate-700 bg-white">Career Switcher</option>
                        <option value="Corporate Representative" className="text-slate-700 bg-white">Corporate / HR</option>
                        <option value="Other" className="text-slate-700 bg-white">Other</option>
                      </select>
                      <ChevronDown
                        size={18}
                        className="pointer-events-none absolute right-6 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                    </div>
                    {errors.whoYouAre && (
                      <p id="whoYouAre-error" className="mt-1 text-xs text-red-600 font-medium pl-4">
                        {errors.whoYouAre}
                      </p>
                    )}
                  </div>

                  {/* Line 5: Subject / You Looking For? */}
                  <div>
                    <label className="sr-only" htmlFor="lookingFor">
                      You looking for?
                    </label>
                    <div className="relative">
                      <select
                        id="lookingFor"
                        name="lookingFor"
                        value={form.lookingFor}
                        onChange={handleChange}
                        disabled={isSubmitting}
                        aria-invalid={errors.lookingFor ? "true" : undefined}
                        aria-describedby={errors.lookingFor ? "lookingFor-error" : undefined}
                        className={`w-full h-12 appearance-none rounded-full px-6 pr-12 text-sm focus:outline-none focus:ring-2 disabled:opacity-60 transition-all cursor-pointer ${
                          !form.lookingFor ? "text-slate-400" : "text-slate-700"
                        } ${
                          errors.lookingFor
                            ? "bg-red-50 ring-1 ring-red-300 focus:ring-red-500"
                            : "bg-[#F5F8FC] focus:bg-white focus:ring-[#07405C] border border-slate-200"
                        }`}
                      >
                        <option value="" className="text-slate-400">You looking for?</option>
                        <option value="Full Stack Java Development" className="text-slate-700 bg-white">Full Stack Java Development</option>
                        <option value="Python Full Stack Development" className="text-slate-700 bg-white">Python Full Stack Development</option>
                        <option value="Data Analytics & AI" className="text-slate-700 bg-white">Data Analytics & AI</option>
                        <option value="AWS Cloud & DevOps" className="text-slate-700 bg-white">AWS Cloud & DevOps</option>
                        <option value="Internship Program" className="text-slate-700 bg-white">Internship Program</option>
                        <option value="Corporate Training" className="text-slate-700 bg-white">Corporate Training</option>
                        <option value="Other" className="text-slate-700 bg-white">Other Query</option>
                      </select>
                      <ChevronDown
                        size={18}
                        className="pointer-events-none absolute right-6 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                    </div>
                    {errors.lookingFor && (
                      <p id="lookingFor-error" className="mt-1 text-xs text-red-600 font-medium pl-4">
                        {errors.lookingFor}
                      </p>
                    )}
                  </div>

                  {/* Location field */}
                  <Field
                    label="Location (e.g. Coimbatore, Tamil Nadu)"
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    error={errors.location}
                    disabled={isSubmitting}
                  />

                  {/* Message Textarea */}
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
                      placeholder="What help you want? (Optional message)"
                      aria-invalid={errors.message ? "true" : undefined}
                      aria-describedby={errors.message ? "message-error" : undefined}
                      className="w-full rounded-2xl bg-[#F5F8FC] px-6 py-4 text-sm text-slate-700 placeholder-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-[#07405C] focus:bg-white border border-slate-200 transition-all disabled:opacity-60"
                    />
                    {errors.message && (
                      <p id="message-error" className="mt-1 text-xs text-red-600 font-medium pl-4">
                        {errors.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Submit button: Pill shaped, prominent */}
                <div className="pt-3">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#F44246] to-[#CA164B] text-white font-bold py-3.5 px-10 rounded-full hover:brightness-105 active:scale-98 transition-all shadow-md hover:shadow-lg disabled:opacity-60 cursor-pointer"
                  >
                    {isSubmitting ? "Sending..." : "Send Message"} <Send size={16} />
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* ================= RIGHT COLUMN: Info Card + Map ================= */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            {/* Deep Navy Gradient Contact Info Card */}
            <div className="bg-gradient-to-br from-[#024D72] via-[#07405C] to-[#013550] rounded-3xl p-6 sm:p-8 text-white flex flex-col gap-5 shadow-xl relative overflow-hidden">
              {/* Subtle ambient decorative blur */}
              <div
                aria-hidden="true"
                className="absolute -top-16 -right-16 h-40 w-40 rounded-full bg-cyan-400/10 blur-2xl pointer-events-none"
              />

              <div className="flex items-start gap-3.5 relative z-10">
                <div className="p-2.5 rounded-xl bg-white/10 text-[#F44246] shrink-0">
                  <Mail size={18} />
                </div>
                <div className="text-sm leading-relaxed">
                  <p className="font-semibold text-slate-200">Email Us</p>
                  <a href="mailto:training@lesuccess.in" className="hover:text-[#F44246] transition-colors block">
                    training@lesuccess.in
                  </a>
                  <a href="mailto:contact@lesuccess.in" className="hover:text-[#F44246] transition-colors block text-slate-300">
                    contact@lesuccess.in
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3.5 relative z-10">
                <div className="p-2.5 rounded-xl bg-white/10 text-[#F44246] shrink-0">
                  <Phone size={18} />
                </div>
                <div className="text-sm leading-relaxed">
                  <p className="font-semibold text-slate-200">Call Us</p>
                  <a href="tel:+918012060000" className="hover:text-[#F44246] transition-colors block">
                    +91 80120 60000
                  </a>
                  <a href="tel:+918189822000" className="hover:text-[#F44246] transition-colors block text-slate-300">
                    +91 81898 22000
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3.5 relative z-10">
                <div className="p-2.5 rounded-xl bg-white/10 text-[#F44246] shrink-0">
                  <MapPin size={18} />
                </div>
                <div className="text-sm leading-relaxed">
                  <p className="font-semibold text-slate-200">Our Center</p>
                  <p className="text-slate-300">
                    4th Floor, Tristar Tower, Avinashi road, Lakshmi Mills, Coimbatore, Tamil Nadu - 641037
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-white/10 relative z-10">
                <p className="text-sm font-semibold mb-3 text-slate-200">Follow Us</p>
                <div className="flex items-center gap-2.5">
                  {SOCIAL_LINKS.map(({ icon: Icon, href, name }) => (
                    <a
                      key={name}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={name}
                      className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-white hover:bg-gradient-to-r hover:from-[#F44246] hover:to-[#CA164B] hover:scale-110 active:scale-95 transition-all shadow-xs"
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
        className={`w-full h-12 rounded-full px-6 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 disabled:opacity-60 transition-all ${
          error
            ? "bg-red-50 ring-1 ring-red-300 focus:ring-red-500"
            : "bg-[#F5F8FC] focus:bg-white focus:ring-[#07405C] border border-slate-200"
        }`}
      />
      {error && (
        <p id={errorId} className="mt-1 text-xs text-red-600 font-medium pl-4">
          {error}
        </p>
      )}
    </div>
  );
}
