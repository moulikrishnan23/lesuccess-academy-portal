import { useEffect, useRef, useState } from "react";
import { User, Phone, Mail, MessageSquare, Send, CheckCircle } from "lucide-react";
import useConnectWithUsSubmit from "../../hooks/useConnectWithUsSubmit.js";

export default function ConnectWithUs() {
  const [form, setForm] = useState({ name: "", mobile: "", email: "", message: "" });
  // Honeypot. Never shown to a person, so anything in it came from a bot.
  const [website, setWebsite] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const { submit, isSubmitting, error, fieldErrors, reset } =
    useConnectWithUsSubmit();

  const hideTimerRef = useRef(null);

  useEffect(
    () => () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    },
    [],
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!form.name.trim() || !form.mobile.trim() || isSubmitting) return;

    const accepted = await submit({
      name: form.name.trim(),
      mobile: form.mobile.trim(),
      email: form.email.trim(),
      message: form.message ? form.message.trim() : undefined,
      website,
    });

    if (!accepted) return;

    setSubmitted(true);
    setForm({ name: "", mobile: "", email: "", message: "" });
    setWebsite("");

    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => {
      setSubmitted(false);
      reset();
    }, 6000);
  };

  const errorMessage = error
    ? fieldErrors.mobile ||
      fieldErrors.email ||
      fieldErrors.name ||
      error.message ||
      "Something went wrong. Please try again."
    : "";

  return (
    <section className="w-full bg-gradient-to-br from-[#024D72] via-[#07405C] to-[#024D72] py-20 px-6 sm:px-10 lg:px-16 text-white relative overflow-hidden">
      {/* Decorative ambient glow */}
      <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-white/5 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-white/5 blur-3xl pointer-events-none" />

      <div className="mx-auto max-w-4xl text-center relative z-10">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-bold text-white mb-3 tracking-wider uppercase">
          GET IN TOUCH
        </span>
        <h2 className="text-3xl font-black sm:text-4xl lg:text-5xl text-white tracking-tight">
          Connect with <span className="text-[#DF1E26]">Us</span>
        </h2>
        <p className="mt-3 text-slate-200 max-w-2xl mx-auto text-base sm:text-lg font-normal">
          Have questions about courses, batches, or career paths? Reach out to our advisors
          and we will connect with you promptly.
        </p>

        {/* Honeypot field */}
        <div aria-hidden="true" className="absolute left-[-9999px] top-auto h-px w-px overflow-hidden">
          <label htmlFor="connect-website">Leave this field empty</label>
          <input
            id="connect-website"
            name="website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
          />
        </div>

        {/* Form container: Elevated crisp white card */}
        <form onSubmit={handleSubmit} className="mt-10 max-w-3xl mx-auto bg-white rounded-3xl p-6 sm:p-8 md:p-10 shadow-2xl border border-white/20 text-slate-800">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-4 text-left">
            {/* Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5" htmlFor="c-name">
                Name *
              </label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#07405C]" />
                <input
                  id="c-name"
                  type="text"
                  name="name"
                  required
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Enter Your Name"
                  className="w-full bg-[#F5F8FC] border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#07405C] focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5" htmlFor="c-email">
                Email
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#07405C]" />
                <input
                  id="c-email"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Enter Email ID"
                  className="w-full bg-[#F5F8FC] border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#07405C] focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5" htmlFor="c-mobile">
                Phone Number *
              </label>
              <div className="relative">
                <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#07405C]" />
                <input
                  id="c-mobile"
                  type="tel"
                  name="mobile"
                  required
                  value={form.mobile}
                  onChange={handleChange}
                  placeholder="Enter Mobile Number"
                  className="w-full bg-[#F5F8FC] border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#07405C] focus:bg-white transition-all"
                />
              </div>
            </div>
          </div>

          {/* Message Textarea */}
          <div className="text-left mb-6">
            <label className="block text-xs font-semibold text-slate-700 mb-1.5" htmlFor="c-msg">
              Message (Optional)
            </label>
            <div className="relative">
              <MessageSquare size={16} className="absolute left-3.5 top-3.5 text-[#07405C]" />
              <textarea
                id="c-msg"
                name="message"
                rows={3}
                value={form.message}
                onChange={handleChange}
                placeholder="How can we help you?"
                className="w-full bg-[#F5F8FC] border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#07405C] focus:bg-white transition-all resize-none"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto min-w-[240px] inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#F44246] to-[#CA164B] text-white font-bold py-3.5 px-8 rounded-xl hover:brightness-105 active:scale-98 transition shadow-lg disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? "Submitting..." : "Submit Inquiry"} <Send size={16} />
            </button>
          </div>

          {submitted && (
            <div className="mt-5 flex items-center justify-center gap-2 text-emerald-600 text-sm font-semibold">
              <CheckCircle size={18} />
              <span>Thank you! Your inquiry has been received. We will contact you soon.</span>
            </div>
          )}

          {errorMessage && (
            <p className="mt-4 text-sm font-semibold text-red-600">
              {errorMessage}
            </p>
          )}
        </form>
      </div>
    </section>
  );
}
