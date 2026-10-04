import { useEffect, useRef, useState, useId } from "react";
import { User, Phone, Mail, MessageSquare, Send, CheckCircle, X } from "lucide-react";
import useConnectWithUsSubmit from "../../hooks/useConnectWithUsSubmit.js";

export default function ConnectWithUs({ isModal = false, isChatOpen = false, onClose, onSuccess }) {
  const uid = useId();
  const [form, setForm] = useState({ name: "", mobile: "", email: "", message: "" });
  // Honeypot. Never shown to a person, so anything in it came from a bot.
  const [website, setWebsite] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [clientError, setClientError] = useState("");

  const { submit, isSubmitting, error, fieldErrors, reset } =
    useConnectWithUsSubmit();

  const hideTimerRef = useRef(null);

  // Close on Escape key when in modal mode
  useEffect(() => {
    if (!isModal) return undefined;
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && onClose) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isModal, onClose]);


  useEffect(
    () => () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    },
    [],
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (clientError) setClientError("");
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (isSubmitting) return;

    const trimmedName = form.name.trim();
    const trimmedMobile = form.mobile.trim();
    const trimmedEmail = form.email.trim();

    if (!trimmedName) {
      setClientError("Name is required");
      return;
    }

    if (!trimmedEmail) {
      setClientError("Email is required");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailRegex.test(trimmedEmail)) {
      setClientError("Please provide a valid email address");
      return;
    }

    if (!trimmedMobile) {
      setClientError("Mobile number is required");
      return;
    }

    setClientError("");

    const accepted = await submit({
      name: trimmedName,
      mobile: trimmedMobile,
      email: trimmedEmail,
      message: form.message ? form.message.trim() : undefined,
      website,
    });

    if (!accepted) return;

    setSubmitted(true);
    setForm({ name: "", mobile: "", email: "", message: "" });
    setWebsite("");

    if (onSuccess) onSuccess();

    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => {
      setSubmitted(false);
      reset();
      if (isModal && onClose) {
        onClose();
      }
    }, isModal ? 2200 : 6000);
  };

  const errorMessage = clientError || (error
    ? fieldErrors.email ||
      fieldErrors.mobile ||
      fieldErrors.name ||
      error.message ||
      "Something went wrong. Please try again."
    : "");

  const formElement = (
    <>
      {/* Honeypot field */}
      <div aria-hidden="true" className="absolute left-[-9999px] top-auto h-px w-px overflow-hidden">
        <label htmlFor={`${uid}-website`}>Leave this field empty</label>
        <input
          id={`${uid}-website`}
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
        />
      </div>

      <form onSubmit={handleSubmit} className={isModal ? "" : "mt-10 max-w-3xl mx-auto bg-white rounded-3xl p-6 sm:p-8 md:p-10 shadow-2xl border border-white/20 text-slate-800 transition-colors duration-200"}>
        <div className={isModal ? "flex flex-col gap-2 mb-2 text-left" : "grid grid-cols-1 gap-4 sm:grid-cols-3 mb-4 text-left"}>
          {/* Name */}
          <div>
            <label className={`block font-semibold text-slate-700 ${isModal ? "text-[11px] mb-0.5" : "text-xs mb-1"}`} htmlFor={`${uid}-name`}>
              Name *
            </label>
            <div className="relative">
              <User size={isModal ? 13 : 15} className={`absolute top-1/2 -translate-y-1/2 text-[#07405C] ${isModal ? "left-2.5" : "left-3.5"}`} />
              <input
                id={`${uid}-name`}
                type="text"
                name="name"
                required
                value={form.name}
                onChange={handleChange}
                placeholder="Enter Your Name"
                className={`w-full bg-[#F5F8FC] border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#07405C] focus:bg-white transition-all ${
                  isModal ? "py-1.5 pl-8 pr-2.5 text-xs rounded-lg" : "py-3 pl-10 pr-4 text-sm rounded-xl"
                }`}
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className={`block font-semibold text-slate-700 ${isModal ? "text-[11px] mb-0.5" : "text-xs mb-1"}`} htmlFor={`${uid}-email`}>
              Email *
            </label>
            <div className="relative">
              <Mail size={isModal ? 13 : 15} className={`absolute top-1/2 -translate-y-1/2 text-[#07405C] ${isModal ? "left-2.5" : "left-3.5"}`} />
              <input
                id={`${uid}-email`}
                type="email"
                name="email"
                required
                value={form.email}
                onChange={handleChange}
                placeholder="Enter Email ID"
                className={`w-full bg-[#F5F8FC] border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#07405C] focus:bg-white transition-all ${
                  isModal ? "py-1.5 pl-8 pr-2.5 text-xs rounded-lg" : "py-3 pl-10 pr-4 text-sm rounded-xl"
                }`}
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className={`block font-semibold text-slate-700 ${isModal ? "text-[11px] mb-0.5" : "text-xs mb-1"}`} htmlFor={`${uid}-mobile`}>
              Phone Number *
            </label>
            <div className="relative">
              <Phone size={isModal ? 13 : 15} className={`absolute top-1/2 -translate-y-1/2 text-[#07405C] ${isModal ? "left-2.5" : "left-3.5"}`} />
              <input
                id={`${uid}-mobile`}
                type="tel"
                name="mobile"
                required
                value={form.mobile}
                onChange={handleChange}
                placeholder="Enter Mobile Number"
                className={`w-full bg-[#F5F8FC] border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#07405C] focus:bg-white transition-all ${
                  isModal ? "py-1.5 pl-8 pr-2.5 text-xs rounded-lg" : "py-3 pl-10 pr-4 text-sm rounded-xl"
                }`}
              />
            </div>
          </div>
        </div>

        {/* Message Textarea */}
        <div className={`text-left ${isModal ? "mb-2" : "mb-6"}`}>
          <label className={`block font-semibold text-slate-700 ${isModal ? "text-[11px] mb-0.5" : "text-xs mb-1"}`} htmlFor={`${uid}-msg`}>
            Message (Optional)
          </label>
          <div className="relative">
            <MessageSquare size={isModal ? 13 : 15} className={`absolute text-[#07405C] ${isModal ? "left-2.5 top-2.5" : "left-3.5 top-3"}`} />
            <textarea
              id={`${uid}-msg`}
              name="message"
              rows={isModal ? 2 : 3}
              value={form.message}
              onChange={handleChange}
              placeholder="How can we help you?"
              className={`w-full bg-[#F5F8FC] border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#07405C] focus:bg-white transition-all resize-none ${
                isModal ? "py-1.5 pl-8 pr-2.5 text-xs rounded-lg" : "py-3 pl-10 pr-4 text-sm rounded-xl"
              }`}
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full inline-flex items-center justify-center gap-1.5 bg-gradient-to-r from-[#F44246] to-[#CA164B] text-white font-bold hover:brightness-105 active:scale-98 transition shadow-md disabled:opacity-50 cursor-pointer ${
              isModal ? "py-2 px-5 text-xs rounded-lg" : "sm:w-auto min-w-[240px] py-3.5 px-8 text-sm rounded-xl shadow-lg"
            }`}
          >
            {isSubmitting ? "Submitting..." : "Submit Inquiry"} <Send size={isModal ? 13 : 15} />
          </button>
        </div>

        {submitted && (
          <div className="mt-2.5 flex items-center justify-center gap-1.5 text-emerald-600 text-xs sm:text-sm font-semibold">
            <CheckCircle size={15} />
            <span>Thank you! Your inquiry has been received.</span>
          </div>
        )}

        {errorMessage && (
          <p className="mt-2.5 text-xs sm:text-sm font-semibold text-red-600">
            {errorMessage}
          </p>
        )}
      </form>
    </>
  );

  if (isModal) {
    return (
      <div
        className={`connect-popup w-[calc(100vw-2rem)] sm:w-[310px] max-w-[310px] overflow-y-auto rounded-2xl bg-white p-3.5 sm:p-4 shadow-2xl text-slate-800 border border-slate-200/90 animate-in fade-in slide-in-from-bottom-3 duration-300 ${
          isChatOpen
            ? "sm:!right-[calc(380px+2.5rem)] lg:!right-[calc(380px+3rem)]"
            : ""
        }`}
        role="dialog"
        aria-modal="false"
        aria-labelledby={`${uid}-modal-title`}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-3 right-3 p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
        >
          <X size={16} />
        </button>

        <div className="text-left mb-2 pr-6">
          <span className="inline-flex items-center gap-1 rounded-full border border-[#07405C]/20 bg-[#07405C]/10 px-2 py-0.5 text-[9px] font-bold text-[#07405C] mb-1 tracking-wider uppercase">
            GET IN TOUCH
          </span>
          <h3 id={`${uid}-modal-title`} className="text-base sm:text-lg font-black text-[#101010] tracking-tight">
            Connect with <span className="text-[#DF1E26]">Us</span>
          </h3>
          <p className="mt-0.5 text-slate-600 text-[11px] leading-snug">
            Have questions about courses or careers? Reach out to us.
          </p>
        </div>

        {formElement}
      </div>
    );
  }

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

        {formElement}
      </div>
    </section>
  );
}
