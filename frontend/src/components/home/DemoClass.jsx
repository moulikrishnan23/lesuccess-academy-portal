import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  ChevronDown,
  GraduationCap,
  Phone,
  User,
  Mail,
  Sparkles,
  CheckCircle2,
  X,
} from "lucide-react";
import { motion } from "framer-motion";
import apiClient from "../../services/apiClient.js";
import useCourses from "../../hooks/useCourses.js";
import useReducedMotion from "../../hooks/useReducedMotion.js";
import { fadeUp, motionSafe, ONCE_IN_VIEW } from "../../animations/variants.js";

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
  const reduced = useReducedMotion();
  const { courses } = useCourses();
  const dropdownCourses = courses.length > 0 ? courses : FALLBACK_COURSES;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [selectedCourseName, setSelectedCourseName] = useState(initialCourseName || "");
  // Honeypot. Never shown to a person, so anything in it came from a bot.
  const [website, setWebsite] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // "success" | "error"
  const [errorMessage, setErrorMessage] = useState("");

  // Auto-associate the course name if provided and not yet manually chosen
  useEffect(() => {
    if (initialCourseName) {
      setSelectedCourseName((curr) => curr || initialCourseName);
    }
  }, [initialCourseName]);

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
      setErrorMessage("Please enter a valid 10-digit mobile number (+91 or starting with 6-9).");
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
        Thank you! Your demo session reservation has been received. Our academic coordinator will contact you shortly to confirm timings.
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

  const formContent = (
    <div className="mx-auto max-w-5xl text-center relative z-10">
      <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
        <Sparkles size={13} className="text-[#F44246]" />
        <span>Experience Before You Enroll</span>
      </div>

      <h2 className="text-3xl font-extrabold sm:text-4xl lg:text-5xl text-white tracking-tight">
        Book Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-200 via-[#F44246] to-red-400">Free Live Demo</span> Today!
      </h2>

      <p className="mt-4 text-base sm:text-lg text-slate-200 max-w-2xl mx-auto">
        Experience our live hands-on teaching methodology, interactive coding labs, and mentor guidance firsthand.
      </p>

      {/* Honeypot */}
      <div aria-hidden="true" className="absolute left-[-9999px] top-auto h-px w-px overflow-hidden">
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

      <div className="mx-auto mt-10 grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Name */}
        <div className="relative">
          <User
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white/80 z-10 pointer-events-none"
          />
          <input
            type="text"
            placeholder="Your Full Name *"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border border-white/25 bg-white/10 py-3.5 pl-11 pr-4 text-white text-sm outline-none placeholder:text-slate-300/80 focus:bg-white/20 focus:border-white/60 focus:ring-2 focus:ring-white/20 transition-all"
          />
        </div>

        {/* Email */}
        <div className="relative">
          <Mail
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white/80 z-10 pointer-events-none"
          />
          <input
            type="email"
            placeholder="Email Address *"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-white/25 bg-white/10 py-3.5 pl-11 pr-4 text-white text-sm outline-none placeholder:text-slate-300/80 focus:bg-white/20 focus:border-white/60 focus:ring-2 focus:ring-white/20 transition-all"
          />
        </div>

        {/* Mobile Number */}
        <div className="relative">
          <Phone
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white/80 z-10 pointer-events-none"
          />
          <input
            type="tel"
            placeholder="Mobile Number *"
            value={mobileNumber}
            onChange={(e) => setMobileNumber(e.target.value)}
            className="w-full rounded-xl border border-white/25 bg-white/10 py-3.5 pl-11 pr-4 text-white text-sm outline-none placeholder:text-slate-300/80 focus:bg-white/20 focus:border-white/60 focus:ring-2 focus:ring-white/20 transition-all"
          />
        </div>

        {/* Course Select */}
        <div className="relative">
          <GraduationCap
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white/80 z-10 pointer-events-none"
          />

          <select
            value={selectedCourseName}
            onChange={(e) => setSelectedCourseName(e.target.value)}
            className="w-full appearance-none rounded-xl border border-white/25 bg-white/10 py-3.5 pl-11 pr-10 text-white text-sm outline-none focus:bg-white/20 focus:border-white/60 focus:ring-2 focus:ring-white/20 transition-all cursor-pointer"
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
            size={18}
            className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-white/80 z-10"
          />
        </div>
      </div>

      {/* Submit Button */}
      <div className="mt-8 flex justify-center">
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full sm:w-auto min-w-[260px] rounded-xl bg-gradient-to-r from-[#F44246] to-[#CA164B] px-8 py-3.5 text-sm sm:text-base font-bold text-white shadow-[0_4px_20px_rgba(244,66,70,0.4)] transition-all hover:brightness-110 active:scale-98 disabled:opacity-60 cursor-pointer"
        >
          {isSubmitting ? "Reserving Your Seat..." : "Reserve Free Demo Seat"}
        </button>
      </div>

      {submitStatus === "error" && (
        <p className="mt-4 text-sm font-semibold text-rose-300">{errorMessage}</p>
      )}
    </div>
  );

  // If rendered as a modal popup (e.g. from Course Detail Page)
  if (isModal) {
    return createPortal(
      <div
        className="fixed inset-0 z-70 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      >
        <div
          className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-3xl bg-gradient-to-br from-[#024D72] via-[#07405C] to-[#013550] p-6 sm:p-10 text-white shadow-2xl border border-white/10"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top-Right Circular Close Button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close demo modal"
            className="absolute right-4 top-4 sm:right-6 sm:top-6 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white/80 hover:bg-white/20 hover:text-white transition cursor-pointer z-20"
          >
            <X size={20} />
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

          {submitStatus === "success" ? successContent : formContent}
        </div>
      </div>,
      document.body
    );
  }

  // Inline Section Mode (Default, e.g. on Home Page)
  if (submitStatus === "success") {
    return (
      <section className="w-full bg-gradient-to-br from-[#024D72] via-[#07405C] to-[#013550] px-6 py-16 text-white sm:px-10 lg:px-20 relative overflow-hidden">
        {successContent}
      </section>
    );
  }

  return (
    <section id="demo-class" className="w-full bg-gradient-to-br from-[#024D72] via-[#07405C] to-[#013550] px-6 py-18 text-white sm:px-10 lg:px-20 relative overflow-hidden">
      {/* Decorative ambient background */}
      <div
        aria-hidden="true"
        className="absolute -top-24 -left-24 h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none"
      />
      <div
        aria-hidden="true"
        className="absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-[#DF1E26]/10 blur-3xl pointer-events-none"
      />

      <motion.div
        variants={motionSafe(fadeUp, reduced)}
        initial="hidden"
        whileInView="visible"
        viewport={ONCE_IN_VIEW}
      >
        {formContent}
      </motion.div>
    </section>
  );
};

export default DemoClass;
