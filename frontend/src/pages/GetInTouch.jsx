import { useState } from "react";
import { Mail, Phone, MapPin, Instagram, Facebook, Linkedin, Youtube, MessageCircle, Send, CheckCircle2 } from "lucide-react";
import useContactSubmit from "../hooks/useContactSubmit.js";
import { normalizeMobile } from "../utils/validation.js";

const SOCIALS = [
  { icon: Instagram, href: "#", label: "Instagram" },
  { icon: Facebook, href: "#", label: "Facebook" },
  { icon: Linkedin, href: "#", label: "LinkedIn" },
  { icon: MessageCircle, href: "#", label: "WhatsApp" },
  { icon: Youtube, href: "#", label: "YouTube" },
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

const MOBILE_PATTERN = /^(\+91[6-9]\d{9}|[6-9]\d{9})$/;

export default function GetInTouch() {
  const [form, setForm] = useState(initialForm);
  const [clientErrors, setClientErrors] = useState({});

  /*
   * Posts to POST /api/contact-messages, the same endpoint as pages/Contact.jsx.
   * This form asks for exactly the fields ContactMessageRequest carries — name,
   * mobile, email, whoYouAre, lookingFor, location, message — so it is the same
   * submission, not a second kind of enquiry needing its own table and sheet tab.
   * useContactSubmit already remaps the server's `phone` field error back onto the
   * `mobile` input this form renders.
   */
  const { submit, isSubmitting, isSuccess, error, fieldErrors, reset } = useContactSubmit();
  const errors = { ...fieldErrors, ...clientErrors };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (clientErrors[name]) {
      setClientErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  /** Mirrors the backend's required set: name, a valid Indian mobile, and an email. */
  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Name is required";

    if (!form.mobile.trim()) {
      errs.mobile = "Mobile number is required";
    } else if (!MOBILE_PATTERN.test(normalizeMobile(form.mobile))) {
      errs.mobile = "Enter a valid 10-digit Indian mobile number";
    }

    if (!form.email.trim()) {
      errs.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      errs.email = "Enter a valid email address";
    }

    return errs;
  };

  const handleSend = async () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setClientErrors(validationErrors);
      document.getElementById(Object.keys(validationErrors)[0])?.focus();
      return;
    }

    setClientErrors({});
    const accepted = await submit(form);
    if (accepted) setForm(initialForm);
  };

  if (isSuccess) {
    return (
      <section className="w-full bg-slate-50 py-12 px-4 md:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-sm p-10 text-center">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 mb-4">
              <CheckCircle2 size={30} />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900">Message sent</h2>
            <p className="mt-3 text-sm text-slate-500">
              We have received your message and our career advisory team will get back to you shortly.
            </p>
            <button
              type="button"
              onClick={reset}
              className="mt-7 inline-flex items-center justify-center rounded-md border border-slate-200 px-8 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Send another message
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full bg-slate-50 py-12 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-6">
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 flex items-center justify-center gap-2">
            Get in Touch <span aria-hidden="true">👋</span>
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            We're here to help would love to hear from you.
          </p>
        </div>

        {/* Form card */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          {/* Honeypot. The backend returns the same 201 for a hit, so a bot sees success. */}
          <div aria-hidden="true" className="absolute left-[-9999px] top-auto h-px w-px overflow-hidden">
            <label htmlFor="git-website">Leave this field empty</label>
            <input
              id="git-website"
              name="website"
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={form.website}
              onChange={handleChange}
            />
          </div>

          {error && !error.isValidation && (
            <p className="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error.message}
            </p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Field
              label="Name"
              name="name"
              value={form.name}
              onChange={handleChange}
              error={errors.name}
            />
            <Field
              label="Mobile Number"
              name="mobile"
              value={form.mobile}
              onChange={handleChange}
              error={errors.mobile}
            />
            <Field
              label="Email ID"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              error={errors.email}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <Field
              label="Who you are?"
              name="whoYouAre"
              value={form.whoYouAre}
              onChange={handleChange}
              error={errors.whoYouAre}
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
                className="w-full bg-slate-100 rounded-md px-4 py-3 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-rose-400"
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
              placeholder="What help you want?"
              className="w-full bg-slate-100 rounded-md px-4 py-3 text-sm text-slate-600 placeholder-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-rose-400"
            />
          </div>

          <button
            type="button"
            onClick={handleSend}
            disabled={isSubmitting}
            className="mt-5 w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-rose-500 to-rose-700 text-white font-semibold py-3 px-8 rounded-md hover:opacity-90 transition-opacity disabled:opacity-60"
          >
            {isSubmitting ? "Sending..." : "Send"} <Send size={16} />
          </button>
        </div>

        {/* Info + Map */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              src="https://maps.google.com/maps?q=Tristar%20Tower%20Avinashi%20Road%20Coimbatore&output=embed"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function Field({ label, name, value, onChange, type = "text", error }) {
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
        placeholder={label}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={error ? `${name}-error` : undefined}
        className={`w-full bg-slate-100 rounded-md px-4 py-3 text-sm text-slate-600 placeholder-slate-400 focus:outline-none focus:ring-2 ${
          error ? "ring-1 ring-red-400 focus:ring-red-400" : "focus:ring-rose-400"
        }`}
      />
      {error && (
        <p id={`${name}-error`} className="mt-1 pl-1 text-xs font-medium text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
