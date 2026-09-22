import { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import {
  Users,
  Building2,
  Award,
  BookOpen,
  Sparkles,
  ArrowRight,
  ChevronDown,
  CheckCircle2,
  GraduationCap,
} from "lucide-react";
import useReducedMotion from "../../hooks/useReducedMotion.js";
import {
  fadeUp,
  staggerContainer,
  motionSafe,
  ONCE_IN_VIEW,
  floatLoop,
} from "../../animations/variants.js";

const STATS = [
  { value: "37K+", label: "Students Trained", icon: Users },
  { value: "150+", label: "Hiring Partners", icon: Building2 },
  { value: "95%", label: "Placement Success", icon: Award },
  { value: "20+", label: "Specialized Courses", icon: BookOpen },
];

/**
 * Animated counter that smoothly runs once from 0 to target when scrolled into view.
 */
function AnimatedCounter({ value, duration = 1.8 }) {
  const reduced = useReducedMotion();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "0px 0px -40px 0px" });

  const numericMatch = value.replace(/,/g, "").match(/\d+/);
  const target = numericMatch ? parseInt(numericMatch[0], 10) : 0;
  const suffix = value.replace(/[\d,]/g, "");

  const [displayValue, setDisplayValue] = useState(reduced ? target : 0);

  useEffect(() => {
    if (reduced) {
      setDisplayValue(target);
      return;
    }
    if (!isInView) return;

    let startTime = null;
    let animationFrame;

    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      // Ease out cubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(easeProgress * target);
      setDisplayValue(current);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(step);
      } else {
        setDisplayValue(target);
      }
    };

    animationFrame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationFrame);
  }, [isInView, target, duration, reduced]);

  return (
    <span ref={ref}>
      {displayValue.toLocaleString()}
      {suffix}
    </span>
  );
}

const HeroVideo = () => {
  const reduced = useReducedMotion();

  const handleTimeUpdate = (e) => {
    if (e.currentTarget.currentTime >= 27) {
      e.currentTarget.currentTime = 0;
      e.currentTarget.play();
    }
  };

  const scrollToNext = () => {
    const nextSection = document.getElementById("about-section");
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: "smooth" });
    } else {
      window.scrollBy({ top: 600, behavior: "smooth" });
    }
  };

  const handleBookDemo = (e) => {
    e.preventDefault();
    const demoSection = document.getElementById("demo-class");
    if (demoSection) {
      demoSection.scrollIntoView({ behavior: "smooth" });
      window.history.replaceState(null, "", "#demo-class");
    } else {
      window.location.href = "/#demo-class";
    }
  };

  return (
    <div className="w-full bg-[#07405C]">
      {/* High-Impact Hero Presentation Band */}
      <section className="relative w-full overflow-hidden bg-gradient-to-br from-[#024D72] via-[#07405C] to-[#013550] pt-12 pb-16 md:pt-16 md:pb-20 text-white">
        
        {/* Ambient decorative glow orbs & subtle tech grid */}
        <div
          aria-hidden="true"
          className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-cyan-500/15 blur-3xl pointer-events-none"
        />
        <div
          aria-hidden="true"
          className="absolute top-1/3 -right-32 h-96 w-96 rounded-full bg-[#DF1E26]/15 blur-3xl pointer-events-none"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-[0.04] bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:28px_28px] pointer-events-none"
        />

        <div className="relative z-10 mx-auto max-w-6xl px-6 sm:px-10 lg:px-8">
          
          {/* Header & Copy Content */}
          <motion.div
            variants={motionSafe(staggerContainer, reduced)}
            initial="hidden"
            animate="visible"
            className="text-center max-w-3xl mx-auto mb-10 md:mb-12"
          >
            {/* Top Pill Badge */}
            <motion.div
              variants={motionSafe(fadeUp, reduced)}
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider backdrop-blur-md shadow-xs mb-5"
            >
              <Sparkles size={14} className="text-[#F44246]" />
              <span>Accelerate Your Tech Career</span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={motionSafe(fadeUp, reduced)}
              className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] font-extrabold tracking-tight leading-[1.15] text-white"
            >
              Master Enterprise Tech Skills With{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-200 via-[#F44246] to-red-400">
                Live Industry Projects
              </span>
            </motion.h1>

            {/* Subheading */}
            <motion.p
              variants={motionSafe(fadeUp, reduced)}
              className="mt-5 text-base sm:text-lg text-slate-200 leading-relaxed max-w-2xl mx-auto font-normal"
            >
              Coimbatore’s premier technology accelerator. Bridging academics to production-grade engineering with 1-on-1 mentorship, full-stack mastery, and 150+ verified hiring partners.
            </motion.p>

            {/* Action Buttons */}
            <motion.div
              variants={motionSafe(fadeUp, reduced)}
              className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link
                to="/courses"
                className="group w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-[#F44246] to-[#CA164B] px-8 py-3.5 text-sm sm:text-base font-bold text-white shadow-[0_4px_20px_rgba(244,66,70,0.4)] transition-all duration-200 hover:brightness-110 hover:shadow-[0_6px_25px_rgba(244,66,70,0.5)] active:scale-98"
              >
                <span>Explore Courses</span>
                <ArrowRight
                  size={16}
                  className="transition-transform duration-200 group-hover:translate-x-1"
                />
              </Link>

              <a
                href="#demo-class"
                onClick={handleBookDemo}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/5 backdrop-blur-md px-7 py-3.5 text-sm sm:text-base font-semibold text-white transition-all duration-200 hover:bg-white/15 hover:border-white/60 active:scale-98 cursor-pointer"
              >
                <span>Book Free Demo</span>
              </a>
            </motion.div>
          </motion.div>

          {/* Cinematic Video Presentation Showcase */}
          <motion.div
            variants={motionSafe(fadeUp, reduced)}
            initial="hidden"
            whileInView="visible"
            viewport={ONCE_IN_VIEW}
            className="relative mx-auto max-w-5xl"
          >
            {/* Ambient backlight glow */}
            <div className="absolute -inset-1.5 rounded-[2.5rem] bg-gradient-to-r from-cyan-500/20 via-rose-500/20 to-blue-500/20 blur-xl opacity-70" />

            {/* Video Container Card */}
            <div className="relative rounded-3xl border border-white/20 bg-[#07405C]/60 backdrop-blur-md p-2 sm:p-3.5 shadow-2xl overflow-hidden">
              <div className="relative overflow-hidden rounded-2xl bg-black aspect-video sm:aspect-[21/9] md:aspect-[16/8] max-h-[500px]">
                <video
                  className="h-full w-full object-cover"
                  autoPlay
                  muted
                  playsInline
                  loop
                  onLoadedMetadata={(e) => {
                    e.currentTarget.currentTime = 0;
                  }}
                  onTimeUpdate={handleTimeUpdate}
                >
                  <source src="/video/CompanyIntro.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>

                {/* Subtle gradient vignette overlay */}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#07405C]/40 via-transparent to-transparent" />
              </div>

              {/* Floating Highlight Badge 1 (Top Left) */}
              <motion.div
                animate={reduced ? {} : floatLoop(0)}
                className="hidden sm:flex absolute top-6 left-6 items-center gap-2.5 rounded-full border border-white/25 bg-[#07405C]/85 backdrop-blur-md px-4 py-1.5 shadow-lg"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                  <CheckCircle2 size={14} />
                </div>
                <span className="text-xs font-bold text-white tracking-wide">
                  100% Placement Assurance
                </span>
              </motion.div>

              {/* Floating Highlight Badge 2 (Bottom Right) */}
              <motion.div
                animate={reduced ? {} : floatLoop(1.8)}
                className="hidden sm:flex absolute bottom-6 right-6 items-center gap-2.5 rounded-full border border-white/25 bg-[#07405C]/85 backdrop-blur-md px-4 py-1.5 shadow-lg"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#DF1E26]/20 text-[#F44246]">
                  <GraduationCap size={14} />
                </div>
                <span className="text-xs font-bold text-white tracking-wide">
                  Live Project Mentorship
                </span>
              </motion.div>
            </div>
          </motion.div>

          {/* Scroll Down Indicator */}
          <div className="mt-8 flex justify-center">
            <button
              type="button"
              onClick={scrollToNext}
              aria-label="Scroll to discover more"
              className="group flex flex-col items-center gap-1.5 text-xs font-medium text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <span className="text-[11px] tracking-wider uppercase opacity-80 group-hover:opacity-100">
                Explore More
              </span>
              <motion.div
                animate={reduced ? {} : { y: [0, 4, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              >
                <ChevronDown size={18} className="text-slate-300 group-hover:text-white" />
              </motion.div>
            </button>
          </div>

        </div>
      </section>

      {/* Crisp Trust & Stats Strip (Clean white container with smooth animated counters) */}
      <div className="border-b border-slate-200/80 bg-white py-6 px-6 sm:px-10 lg:px-20 shadow-xs relative z-20">
        <div className="mx-auto max-w-6xl grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {STATS.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div
                key={i}
                className="flex items-center gap-3.5 sm:gap-4 p-2 transition-transform duration-200 hover:-translate-y-0.5"
              >
                <div className="flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl bg-[#07405C]/10 border border-[#07405C]/20 text-[#07405C]">
                  <Icon size={22} className="text-[#DF1E26]" />
                </div>
                <div>
                  <div className="font-display text-xl sm:text-2xl font-bold tracking-tight text-[#101010]">
                    <AnimatedCounter value={stat.value} />
                  </div>
                  <div className="text-xs sm:text-sm font-semibold text-[#07405C]">
                    {stat.label}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default HeroVideo;