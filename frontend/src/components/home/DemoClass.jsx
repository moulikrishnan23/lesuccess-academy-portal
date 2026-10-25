import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
  ArrowRight,
  ChevronDown,
  GraduationCap,
  Phone,
  User,
  Mail,
  Sparkles,
  CheckCircle2,
  X,
} from "lucide-react";
import apiClient from "../../services/apiClient.js";
import useCourses from "../../hooks/useCourses.js";
import Magnetic from "../ui/Magnetic.jsx";
import { Reveal, ConicBorder, burstConfetti } from "../motion/index.js";
import FloatField from "./FloatField.jsx";
import useClipReveal from "./useClipReveal.js";

// Shown in the dropdown while the API response is loading or empty
const FALLBACK_COURSES = [
  { id: null, title: "Python: Full Stack Development" },
  { id: null, title: "JAVA: Full Stack Development" },
  { id: null, title: "Data Analytics" },
  { id: null, title: "AWS with DevOps" },
];

const DemoClass = ({
  initialCourseName = "",
  isOpen = true,
  onClose,
  isModal = false,
}) => {
  const { courses } = useCourses();
  const dropdownCourses = courses.length > 0 ? courses : FALLBACK_COURSES;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [selectedCourseName, setSelectedCourseName] = useState(
    initialCourseName || "",
  );
  const [prevInitialCourseName, setPrevInitialCourseName] =
    useState(initialCourseName);
  // Honeypot. Never shown to a person, so anything in it came from a bot.
  const [website, setWebsite] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // "success" | "error"
  const [errorMessage, setErrorMessage] = useState("");

  const sectionRef = useRef(null);
  const okRef = useRef(null);
  useClipReveal(sectionRef);

  // Celebrate an inline booking once its success panel is on screen.
  useEffect(() => {
    if (isModal || submitStatus !== "success") return undefined;
    return burstConfetti(okRef.current);
  }, [isModal, submitStatus]);

  if (initialCourseName !== prevInitialCourseName) {
    setPrevInitialCourseName(initialCourseName);
    if (!selectedCourseName && initialCourseName) {
      setSelectedCourseName(initialCourseName);
    }
  }

  // Handle ESC key and scroll locking when used as a modal
  useEffect(() => {
    if (!isModal || !isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };

    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isModal, isOpen, onClose]);

  async function handleSubmit() {
    if (!name.trim()) {
      setSubmitStatus("error");
      setErrorMessage("Please enter your name.");
      return;
    }

    const cleanMobile = mobileNumber.replace(/\s+/g, "");
    if (!cleanMobile) {
      setSubmitStatus("error");
      setErrorMessage("Please enter your mobile number.");
      return;
    }

    const mobileRegex = /^(\+91[6-9]\d{9}|[6-9]\d{9})$/;
    if (!mobileRegex.test(cleanMobile)) {
      setSubmitStatus("error");
      setErrorMessage(
        "Please enter a valid 10-digit mobile number (+91 or starting with 6-9).",
      );
      return;
    }

    if (!email.trim()) {
      setSubmitStatus("error");
      setErrorMessage("Please enter your email address.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setSubmitStatus("error");
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    if (!selectedCourseName) {
      setSubmitStatus("error");
      setErrorMessage("Please select a course for the demo class.");
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);
    setErrorMessage("");

    try {
      await apiClient.post("/api/demo-bookings", {
        name: name.trim(),
        email: email.trim(),
        mobileNumber: cleanMobile,
        courseName: selectedCourseName,
        website,
      });

      setSubmitStatus("success");
    } catch (err) {
      /*
       * apiClient rejects with the normalised ApiError from utils/apiError.js,
       * not with the raw axios error — there is no err.response to read. Reading
       * it meant every 400 showed the generic fallback and the server's actual
       * field message ("Mobile number is required") never reached the visitor.
       */
      const fieldErrors = err?.fieldErrors ?? {};
      const firstFieldMsg = Object.values(fieldErrors)[0];
      setSubmitStatus("error");
      setErrorMessage(
        firstFieldMsg ||
          err?.message ||
          "Booking failed. Please try again or reach out directly.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isModal && !isOpen) {
    return null;
  }

  const successContent = (
    <div className="mx-auto max-w-xl text-center py-6 sm:py-10">
      <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 mb-4 border border-emerald-500/30">
        <CheckCircle2 size={30} />
      </div>
      <h2 className="text-3xl text-white font-bold sm:text-4xl">
        Demo Class <span className="text-[#F44246]">Booked!</span>
      </h2>
      <p className="mt-4 text-base sm:text-lg text-slate-200">
        Thank you! Your demo session reservation has been received. Our academic
        coordinator will contact you shortly to confirm timings.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
        <button
          onClick={() => {
            setSubmitStatus(null);
            setName("");
            setEmail("");
            setMobileNumber("");
            setSelectedCourseName(initialCourseName || "");
          }}
          className="rounded-xl border border-white/40 bg-white/10 px-8 py-3 text-sm font-semibold transition hover:bg-white/20 active:scale-98 cursor-pointer"
        >
          Book Another Demo
        </button>

        {isModal && (
          <button
            onClick={onClose}
            className="rounded-xl bg-white px-8 py-3 text-sm font-bold text-[#07405C] transition hover:bg-slate-100 active:scale-98 cursor-pointer"
          >
            Close
          </button>
        )}
      </div>
    </div>
  );

  // Modal-optimized form content to fit laptop viewports without scrolling
  const modalFormContent = (
    <div className="mx-auto max-w-2xl text-center relative z-10">
      <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider backdrop-blur-md">
        <Sparkles size={12} className="text-[#F44246]" />
        <span>Experience Before You Enroll</span>
      </div>

      <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
        Book Your{" "}
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-200 via-[#F44246] to-red-400">
          Free Live Demo
        </span>{" "}
        Today!
      </h2>

      <p className="mt-1 text-xs sm:text-sm text-slate-200 max-w-lg mx-auto">
        Experience our live hands-on teaching methodology, interactive coding
        labs, and mentor guidance firsthand.
      </p>

      {/* Honeypot */}
      <div
        aria-hidden="true"
        className="absolute left-[-9999px] top-auto h-px w-px overflow-hidden"
      >
        <label htmlFor="modal-demo-website">Leave this field empty</label>
        <input
          id="modal-demo-website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
        />
      </div>

      <div className="mx-auto mt-4 sm:mt-5 grid gap-2.5 sm:gap-3 sm:grid-cols-2 text-left">
        {/* Name */}
        <div className="relative">
          <User
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/70 z-10 pointer-events-none"
          />
          <input
            type="text"
            placeholder="Your Full Name *"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border border-white/25 bg-white/10 py-2.5 pl-10 pr-3 text-white text-xs sm:text-sm outline-none placeholder:text-slate-300/80 focus:bg-white/20 focus:border-white/60 focus:ring-2 focus:ring-white/20 transition-all"
          />
        </div>

        {/* Email */}
        <div className="relative">
          <Mail
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/70 z-10 pointer-events-none"
          />
          <input
            type="email"
            placeholder="Email Address *"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-white/25 bg-white/10 py-2.5 pl-10 pr-3 text-white text-xs sm:text-sm outline-none placeholder:text-slate-300/80 focus:bg-white/20 focus:border-white/60 focus:ring-2 focus:ring-white/20 transition-all"
          />
        </div>

        {/* Mobile Number */}
        <div className="relative">
          <Phone
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/70 z-10 pointer-events-none"
          />
          <input
            type="tel"
            placeholder="Mobile Number *"
            value={mobileNumber}
            onChange={(e) => setMobileNumber(e.target.value)}
            className="w-full rounded-xl border border-white/25 bg-white/10 py-2.5 pl-10 pr-3 text-white text-xs sm:text-sm outline-none placeholder:text-slate-300/80 focus:bg-white/20 focus:border-white/60 focus:ring-2 focus:ring-white/20 transition-all"
          />
        </div>

        {/* Course Select */}
        <div className="relative">
          <GraduationCap
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/70 z-10 pointer-events-none"
          />

          <select
            value={selectedCourseName}
            onChange={(e) => setSelectedCourseName(e.target.value)}
            className="w-full appearance-none rounded-xl border border-white/25 bg-white/10 py-2.5 pl-10 pr-8 text-white text-xs sm:text-sm outline-none focus:bg-white/20 focus:border-white/60 focus:ring-2 focus:ring-white/20 transition-all cursor-pointer"
          >
            <option value="" className="text-gray-800 bg-white">
              Select Course *
            </option>

            {dropdownCourses.map((course, i) => (
              <option
                key={course.id ?? `fallback-${i}`}
                value={course.title}
                className="text-gray-800 bg-white"
              >
                {course.title}
              </option>
            ))}
          </select>

          <ChevronDown
            size={16}
            className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-white/70 z-10"
          />
        </div>
      </div>

      {/* Submit Button */}
      <div className="mt-4 sm:mt-5 flex justify-center">
        <Magnetic strength={0.25}>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="btn-flow btn-glow-brand w-full sm:w-auto min-w-[220px] rounded-xl bg-gradient-to-r from-[#F44246] to-[#CA164B] px-8 py-2.5 text-xs sm:text-sm font-bold text-white shadow-[0_4px_20px_rgba(244,66,70,0.4)] transition-all hover:brightness-110 active:scale-98 disabled:opacity-60 cursor-pointer"
          >
            {isSubmitting ? "Reserving Your Seat..." : "Reserve Free Demo Seat"}
          </button>
        </Magnetic>
      </div>

      {submitStatus === "error" && (
        <p className="mt-2 text-xs font-semibold text-rose-300">
          {errorMessage}
        </p>
      )}
    </div>
  );

  // If rendered as a modal popup (e.g. from Course Detail Page)
  if (isModal) {
    return createPortal(
      <div
        className="fixed inset-0 z-70 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      >
        <div
          className="relative w-full max-w-2xl max-h-[96vh] rounded-3xl bg-gradient-to-br from-[#024D72] via-[#07405C] to-[#013550] text-white shadow-2xl border border-white/10 p-5 sm:p-7 md:p-8"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top-Right Circular Close Button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close demo modal"
            className="absolute right-4 top-4 sm:right-6 sm:top-6 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/80 hover:bg-white/20 hover:text-white transition cursor-pointer z-20"
          >
            <X size={16} />
          </button>

          {/* Ambient background glows */}
          <div
            aria-hidden="true"
            className="absolute -top-24 -left-24 h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none"
          />
          <div
            aria-hidden="true"
            className="absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-[#DF1E26]/10 blur-3xl pointer-events-none"
          />

          {submitStatus === "success" ? successContent : modalFormContent}
        </div>
      </div>,
      document.body,
    );
  }

  // Inline section on the Home page (spec: docs/mockup/lower-home.html, #demo).
  const courseOptions = dropdownCourses.map((course) => ({
    value: course.title,
    label: course.title,
  }));

  return (
    <section
      ref={sectionRef}
      id="demo-class"
      data-competing-form="true"
      className="lh-sec lh-dark lh-rv"
    >
      <div className="lh-mesh" aria-hidden="true">
        <i />
        <i />
      </div>
      <span className="lh-glyph" style={{ left: "6%", top: "14%" }} aria-hidden="true">{"{ }"}</span>
      <span className="lh-glyph" style={{ right: "9%", top: "10%", fontSize: "2.75rem", animationDelay: "-3s" }} aria-hidden="true">{"</>"}</span>
      <span className="lh-glyph" style={{ left: "46%", bottom: "8%", animationDelay: "-5s" }} aria-hidden="true">SQL</span>
      <span className="lh-glyph" style={{ right: "4%", bottom: "14%", fontSize: "1.75rem", animationDelay: "-2s" }} aria-hidden="true">py</span>

      <div className="lh-wrap lh-demo-g">
        <Reveal>
          <span className="lh-badge">Experience before you enroll</span>
          <h2 className="lh-h2" style={{ margin: "1rem 0" }}>
            Book Your Free Live Demo Today!
          </h2>
          <p className="lh-lead">
            Experience our live hands-on teaching methodology, interactive coding
            labs, and mentor guidance firsthand.
          </p>
        </Reveal>

        <Reveal index={2}>
          <ConicBorder
            as="form"
            tone="dark"
            noValidate
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
            className="lh-glass lh-demo-form"
          >
            {submitStatus === "success" ? (
              <div ref={okRef} className="lh-ok" role="status">
                <svg viewBox="0 0 84 84" aria-hidden="true">
                  <circle cx="42" cy="42" r="36" />
                  <path d="M26 43l11 11 21-23" />
                </svg>
                <h3>Demo class booked</h3>
                <p>
                  Your demo session reservation has been received. Our academic
                  coordinator will contact you shortly to confirm timings.
                </p>
                <button
                  type="button"
                  className="lh-btn lh-btn-o lh-btn-sm"
                  onClick={() => {
                    setSubmitStatus(null);
                    setName("");
                    setEmail("");
                    setMobileNumber("");
                    setSelectedCourseName(initialCourseName || "");
                  }}
                >
                  Book another demo
                </button>
              </div>
            ) : (
              <>
                {/* Honeypot */}
                <div
                  aria-hidden="true"
                  className="absolute left-[-9999px] top-auto h-px w-px overflow-hidden"
                >
                  <label htmlFor="demo-website">Leave this field empty</label>
                  <input
                    id="demo-website"
                    name="website"
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                  />
                </div>

                <div className="lh-form-grid">
                  <FloatField
                    id="demo-name"
                    label="Your full name *"
                    autoComplete="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                  <FloatField
                    id="demo-mobile"
                    label="Mobile number *"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                  />
                  <FloatField
                    id="demo-email"
                    label="Email address *"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <FloatField
                    id="demo-course"
                    label="Select course *"
                    options={courseOptions}
                    value={selectedCourseName}
                    onChange={(e) => setSelectedCourseName(e.target.value)}
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="lh-btn lh-btn-a lh-full btn-flow"
                    style={{ minHeight: "3.5rem" }}
                  >
                    {isSubmitting ? "Reserving your seat…" : "Reserve Free Demo Seat"}
                    <ArrowRight size={18} className="lh-arr" aria-hidden="true" />
                  </button>
                </div>

                {submitStatus === "error" && (
                  <p className="lh-form-error" role="alert">
                    {errorMessage}
                  </p>
                )}
              </>
            )}
          </ConicBorder>
        </Reveal>
      </div>
    </section>
  );
};

export default DemoClass;
