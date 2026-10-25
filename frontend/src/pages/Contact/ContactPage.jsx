import { useEffect, useRef, useState } from "react";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { SOCIAL_LINKS } from "../../data/socialLinks.js";
import useContactSubmit from "../../hooks/useContactSubmit.js";
import { validateContactForm } from "../../utils/validation.js";
import SpotlightCard from "../../components/ui/SpotlightCard.jsx";
import Magnetic from "../../components/ui/Magnetic.jsx";
import BorderBeam from "../../components/ui/BorderBeam.jsx";
import Select from "../../components/ui/Select.jsx";

const WHO_YOU_ARE_OPTIONS = [
  { value: "College Student", label: "College Student / Fresher" },
  { value: "Working Professional", label: "Working Professional" },
  { value: "Career Switcher", label: "Career Switcher" },
  { value: "Corporate Representative", label: "Corporate / HR" },
  { value: "Other", label: "Other" },
];

const LOOKING_FOR_OPTIONS = [
  { value: "Full Stack Java Development", label: "Full Stack Java Development" },
  { value: "Python Full Stack Development", label: "Python Full Stack Development" },
  { value: "Data Analytics & AI", label: "Data Analytics & AI" },
  { value: "AWS Cloud & DevOps", label: "AWS Cloud & DevOps" },
  { value: "Internship Program", label: "Internship Program" },
  { value: "Corporate Training", label: "Corporate Training" },
  { value: "Other", label: "Other Query" },
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
        (f) => validationErrors[f],
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
          <div className="card-lift-3d lg:col-span-7 bg-white rounded-3xl shadow-sm border border-slate-200/80 p-6 sm:p-8 lg:p-10 transition-all duration-300 hover:shadow-xl">
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
                  We have received your message and our career advisory team
                  will get back to you shortly.
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
                <div
                  aria-hidden="true"
                  className="absolute left-[-9999px] top-auto h-px w-px overflow-hidden"
                >
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
                      <Select
                        id="whoYouAre"
                        name="whoYouAre"
                        value={form.whoYouAre}
                        onChange={handleChange}
                        options={WHO_YOU_ARE_OPTIONS}
                        placeholder="Who you are?"
                        disabled={isSubmitting}
                        aria-invalid={errors.whoYouAre ? "true" : undefined}
                        aria-describedby={
                          errors.whoYouAre ? "whoYouAre-error" : undefined
                        }
                        placeholderClassName="!text-slate-400"
                        className={`w-full h-12 rounded-full px-6 text-sm text-slate-700 focus:outline-none focus:ring-2 disabled:opacity-60 transition-all ${
                          errors.whoYouAre
                            ? "bg-red-50 ring-1 ring-red-300 focus:ring-red-500"
                            : "bg-[#F5F8FC] focus:bg-white focus:ring-[#07405C] border border-slate-200"
                        }`}
                        chevronClassName="text-slate-400"
                      />
                    </div>
                    {errors.whoYouAre && (
                      <p
                        id="whoYouAre-error"
                        className="mt-1 text-xs text-red-600 font-medium pl-4"
                      >
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
                      <Select
                        id="lookingFor"
                        name="lookingFor"
                        value={form.lookingFor}
                        onChange={handleChange}
                        options={LOOKING_FOR_OPTIONS}
                        placeholder="You looking for?"
                        disabled={isSubmitting}
                        aria-invalid={errors.lookingFor ? "true" : undefined}
                        aria-describedby={
                          errors.lookingFor ? "lookingFor-error" : undefined
                        }
                        placeholderClassName="!text-slate-400"
                        className={`w-full h-12 rounded-full px-6 text-sm text-slate-700 focus:outline-none focus:ring-2 disabled:opacity-60 transition-all ${
                          errors.lookingFor
                            ? "bg-red-50 ring-1 ring-red-300 focus:ring-red-500"
                            : "bg-[#F5F8FC] focus:bg-white focus:ring-[#07405C] border border-slate-200"
                        }`}
                        chevronClassName="text-slate-400"
                      />
                    </div>
                    {errors.lookingFor && (
                      <p
                        id="lookingFor-error"
                        className="mt-1 text-xs text-red-600 font-medium pl-4"
                      >
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
                      aria-describedby={
                        errors.message ? "message-error" : undefined
                      }
                      className="w-full rounded-2xl bg-[#F5F8FC] px-6 py-4 text-sm text-slate-700 placeholder-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-[#07405C] focus:bg-white border border-slate-200 transition-all disabled:opacity-60"
                    />
                    {errors.message && (
                      <p
                        id="message-error"
                        className="mt-1 text-xs text-red-600 font-medium pl-4"
                      >
                        {errors.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Submit button: Pill shaped, centered in middle with laser shimmer sheen */}
                <div className="pt-3 flex justify-center">
                  <Magnetic
                    strength={0.25}
                    className="w-full sm:w-auto flex justify-center"
                  >
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#F44246] to-[#CA164B] text-white font-bold py-3.5 px-10 rounded-full hover:brightness-105 active:scale-95 transition-all shadow-md hover:shadow-xl disabled:opacity-60 cursor-pointer animate-shimmer-sweep btn-glow-brand"
                    >
                      {isSubmitting ? "Sending..." : "Send Message"}{" "}
                      <Send size={16} />
                    </button>
                  </Magnetic>
                </div>
              </form>
            )}
          </div>

          {/* ================= RIGHT COLUMN: Info Card + Map ================= */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            {/* Deep Navy Gradient Contact Info Card with 3D Spotlight Tilt */}
            <SpotlightCard
              tilt={true}
              maxTilt={6}
              spotlightColor="rgba(255, 255, 255, 0.16)"
              className="card-lift-3d bg-gradient-to-br from-[#024D72] via-[#07405C] to-[#013550] rounded-3xl p-6 sm:p-8 text-white flex flex-col gap-5 shadow-xl relative overflow-hidden transition-all duration-300 hover:shadow-2xl border-0"
            >
              <BorderBeam
                size={220}
                duration={8}
                colorFrom="#00bcd4"
                colorTo="#DF1E26"
              />
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
                  <a
                    href="mailto:training@lesuccess.in"
                    className="hover:text-[#F44246] transition-colors block"
                  >
                    training@lesuccess.in
                  </a>
                  <a
                    href="mailto:contact@lesuccess.in"
                    className="hover:text-[#F44246] transition-colors block text-slate-300"
                  >
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
                  <a
                    href="tel:+918012060000"
                    className="hover:text-[#F44246] transition-colors block"
                  >
                    +91 80120 60000
                  </a>
                  <a
                    href="tel:+918189822000"
                    className="hover:text-[#F44246] transition-colors block text-slate-300"
                  >
                    +91 81898 22000
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3.5 relative z-10">
                <div className="p-2.5 rounded-xl bg-white/10 text-[#F44246] shrink-0 relative">
                  <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                  </span>
                  <MapPin size={18} />
                </div>
                <div className="text-sm leading-relaxed">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-slate-200">Our Center</p>
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.2 rounded-full uppercase tracking-wider">
                      Live Campus
                    </span>
                  </div>
                  <p className="text-slate-300 mt-0.5">
                    4th Floor, Tristar Tower, Avinashi road, Lakshmi Mills,
                    Coimbatore, Tamil Nadu - 641037
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-white/10 relative z-10">
                <p className="text-sm font-semibold mb-3 text-slate-200">
                  Follow Us
                </p>
                <div className="flex items-center gap-2.5">
                  {SOCIAL_LINKS.map(({ icon: Icon, href, name }) => (
                    <a
                      key={name}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={name}
                      className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-white hover:bg-gradient-to-r hover:from-[#F44246] hover:to-[#CA164B] hover:scale-115 hover:-translate-y-1 active:scale-95 transition-all duration-300 shadow-xs hover:shadow-[0_6px_16px_rgba(223,30,38,0.45)]"
                    >
                      <Icon size={16} />
                    </a>
                  ))}
                </div>
              </div>
            </SpotlightCard>

            {/* Google Map Embed directly below dark teal card with hover depth */}
            <div className="rounded-3xl overflow-hidden shadow-sm border border-slate-200 h-[260px] sm:h-[300px] w-full transition-all duration-300 hover:shadow-xl hover:border-slate-300">
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
