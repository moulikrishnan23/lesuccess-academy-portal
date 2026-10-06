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
import useSiteSettings from "../../hooks/useSiteSettings.js";
import {
  fadeUp,
  staggerContainer,
  motionSafe,
} from "../../animations/variants.js";

const DEFAULT_VIDEO_URL =
  "https://res.cloudinary.com/mknetwyg/video/upload/v1791267704/lesuccess/video/CompanyIntroNew.mp4";

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
    if (reduced || !isInView) return;

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
  const videoRef = useRef(null);

  // Dynamic hero video settings from database
  const { settings } = useSiteSettings();
  const [videoUrl, setVideoUrl] = useState(DEFAULT_VIDEO_URL);
  const [videoEnabled, setVideoEnabled] = useState(true);

  // Update video settings from site settings
  useEffect(() => {
    if (settings) {
      if (settings.hero_video_url) {
        setVideoUrl(settings.hero_video_url);
      }
      if (settings.hero_video_enabled !== undefined) {
        setVideoEnabled(settings.hero_video_enabled !== "false");
      }
    }
  }, [settings]);

  const START_TIME = 22.0;

  // Handle video starting at 22s and looping from 22s
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoEnabled || !videoUrl) return undefined;

    let isCancelled = false;
    let initialSeekDone = false;

    const applyStartAndPlay = () => {
      if (isCancelled || !video || initialSeekDone) return;

      if (video.duration && !isNaN(video.duration)) {
        initialSeekDone = true;
        if (video.duration > START_TIME) {
          try {
            video.currentTime = START_TIME;
          } catch {
            // Seek error ignored
          }
        } else {
          console.warn(
            `Hero video duration (${video.duration}s) is shorter than ${START_TIME}s, falling back to 0s.`
          );
          try {
            video.currentTime = 0;
          } catch {
            // Seek error ignored
          }
        }
      }

      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Autoplay policy or abort ignored
        });
      }
    };

    const handleLoadedMetadata = () => {
      applyStartAndPlay();
    };

    const handleEnded = () => {
      if (isCancelled || !video) return;
      if (video.duration && video.duration > START_TIME) {
        try {
          video.currentTime = START_TIME;
        } catch {
          // Loop seek error ignored
        }
      } else {
        try {
          video.currentTime = 0;
        } catch {
          // Loop seek error ignored
        }
      }
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Autoplay policy or abort ignored
        });
      }
    };

    if (video.readyState >= 1) {
      applyStartAndPlay();
    } else {
      video.addEventListener("loadedmetadata", handleLoadedMetadata);
      video.addEventListener("loadeddata", handleLoadedMetadata);
    }

    video.addEventListener("ended", handleEnded);

    return () => {
      isCancelled = true;
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("loadeddata", handleLoadedMetadata);
      video.removeEventListener("ended", handleEnded);
    };
  }, [videoUrl, videoEnabled]);

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
      {/* Integrated Full-Width Hero Section with Background Video */}
      <section className="relative w-full min-h-[520px] lg:min-h-[calc(100dvh-var(--app-header-max,116px))] lg:h-[calc(100dvh-var(--app-header-max,116px))] lg:max-h-[820px] flex flex-col justify-between overflow-hidden bg-gradient-to-br from-[#024D72] via-[#07405C] to-[#013550] text-white pt-6 pb-4 sm:pt-8 sm:pb-5 lg:pt-8 lg:pb-4">
        
        {/* 1. BACKGROUND VIDEO LAYER */}
        {videoEnabled && videoUrl && (
          <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
            <video
              ref={videoRef}
              className="absolute inset-0 h-full w-full object-cover object-center"
              autoPlay
              muted
              playsInline
              src={videoUrl}
              preload="auto"
              aria-hidden="true"
            />
          </div>
        )}

        {/* 2. BRAND BLUE GRADIENT & VIGNETTE OVERLAYS */}
        {/* Semi-transparent Brand Blue Gradient (#024D72 to #07405C) providing optimal contrast while video stays visible */}
        <div
          aria-hidden="true"
          className="absolute inset-0 z-[1] bg-gradient-to-b from-[#024D72]/85 via-[#07405C]/80 to-[#013550]/90 pointer-events-none"
        />

        {/* Subtle radial tech gradient vignette for depth */}
        <div
          aria-hidden="true"
          className="absolute inset-0 z-[2] bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(7,64,92,0.7)_100%)] pointer-events-none"
        />

        {/* Ambient decorative glow orbs */}
        <div
          aria-hidden="true"
          className="absolute -top-32 -left-32 z-[3] h-96 w-96 rounded-full bg-cyan-500/20 blur-3xl pointer-events-none"
        />
        <div
          aria-hidden="true"
          className="absolute top-1/2 -right-32 z-[3] h-96 w-96 rounded-full bg-[#DF1E26]/20 blur-3xl pointer-events-none"
        />

        {/* Subtle tech dot grid pattern */}
        <div
          aria-hidden="true"
          className="absolute inset-0 z-[3] opacity-[0.06] bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:28px_28px] pointer-events-none"
        />

        {/* 3. HERO CONTENT - Positioned on Top of Background Video & Overlay */}
        <div className="relative z-10 mx-auto max-w-6xl px-6 sm:px-10 lg:px-8 my-auto w-full">
          <motion.div
            variants={motionSafe(staggerContainer, reduced)}
            initial="hidden"
            animate="visible"
            className="text-center max-w-3xl mx-auto"
          >
            {/* Top Pill Badge */}
            <motion.div
              variants={motionSafe(fadeUp, reduced)}
              className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider backdrop-blur-md shadow-xs mb-3.5 sm:mb-4 lg:mb-3"
            >
              <Sparkles size={13} className="text-[#F44246]" />
              <span>Accelerate Your Tech Career</span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={motionSafe(fadeUp, reduced)}
              className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-[2.65rem] xl:text-[3.15rem] font-extrabold tracking-tight leading-[1.14] text-white"
            >
              Master Enterprise Tech Skills With{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-200 via-[#F44246] to-red-400">
                Live Industry Projects
              </span>
            </motion.h1>

            {/* Subheading */}
            <motion.p
              variants={motionSafe(fadeUp, reduced)}
              className="mt-3 sm:mt-4 lg:mt-3 text-sm sm:text-base lg:text-base xl:text-lg text-slate-200 leading-relaxed max-w-2xl mx-auto font-normal drop-shadow-xs"
            >
              Coimbatore’s tech accelerator for industry-ready developers.
              Master full-stack skills with expert mentorship and 150+ hiring
              partners.
            </motion.p>

            {/* Action Buttons */}
            <motion.div
              variants={motionSafe(fadeUp, reduced)}
              className="mt-5 sm:mt-6 lg:mt-5 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4"
            >
              <Link
                to="/courses"
                className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#F44246] to-[#CA164B] px-6 sm:px-7 py-3 text-sm sm:text-base font-bold text-white shadow-[0_4px_25px_rgba(244,66,70,0.45)] transition-all duration-200 hover:brightness-110 hover:shadow-[0_6px_30px_rgba(244,66,70,0.6)] active:scale-98"
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
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 backdrop-blur-md px-6 sm:px-7 py-3 text-sm sm:text-base font-semibold text-white transition-all duration-200 hover:bg-white/20 hover:border-white/60 active:scale-98 cursor-pointer shadow-sm"
              >
                <span>Book Free Demo</span>
              </a>
            </motion.div>

            {/* Trust Highlights Strip */}
            <motion.div
              variants={motionSafe(fadeUp, reduced)}
              className="mt-6 sm:mt-7 lg:mt-5 flex flex-wrap items-center justify-center gap-2.5 sm:gap-4 lg:gap-5 text-xs sm:text-sm font-semibold text-slate-200"
            >
              <div className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full bg-white/10 border border-white/15 px-3 py-1 sm:px-3.5 sm:py-1.5 backdrop-blur-md">
                <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                <span>100% Placement Assurance</span>
              </div>
              <div className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full bg-white/10 border border-white/15 px-3 py-1 sm:px-3.5 sm:py-1.5 backdrop-blur-md">
                <GraduationCap size={14} className="text-[#F44246] shrink-0" />
                <span>Live Project Mentorship</span>
              </div>
              <div className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full bg-white/10 border border-white/15 px-3 py-1 sm:px-3.5 sm:py-1.5 backdrop-blur-md">
                <Building2 size={14} className="text-cyan-400 shrink-0" />
                <span>150+ Hiring Partners</span>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll Down Indicator */}
        <div className="relative z-10 mt-4 sm:mt-5 lg:mt-4 mb-1 flex justify-center">
          <button
            type="button"
            onClick={scrollToNext}
            aria-label="Scroll to discover more"
            className="group flex flex-col items-center gap-1 text-xs font-medium text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <span className="text-[10px] sm:text-[11px] tracking-wider uppercase opacity-80 group-hover:opacity-100">
              Explore More
            </span>
            <motion.div
              animate={reduced ? {} : { y: [0, 3, 0] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <ChevronDown
                size={16}
                className="text-slate-300 group-hover:text-white"
              />
            </motion.div>
          </button>
        </div>
      </section>

      {/* Crisp Trust & Stats Strip */}
      <div className="border-b border-slate-200/80 bg-white py-6 px-6 sm:px-10 lg:px-20 shadow-xs relative z-20 transition-colors duration-200">
        <div className="mx-auto max-w-6xl grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {STATS.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div
                key={i}
                className="flex items-center gap-3.5 sm:gap-4 p-2 transition-transform duration-200 hover:-translate-y-0.5"
              >
                <div className="flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl bg-[#07405C]/10 border border-[#07405C]/20 text-[#07405C]">
                  <Icon
                    size={22}
                    className="text-[#DF1E26]"
                  />
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
