import { useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Building2,
  Sparkles,
  ArrowRight,
  ChevronDown,
  CheckCircle2,
  GraduationCap,
} from "lucide-react";
import HeroCodeGame from "./HeroCodeGame.jsx";
import "./HeroVideo.css";
import useReducedMotion from "../../hooks/useReducedMotion.js";
import useSiteSettings from "../../hooks/useSiteSettings.js";
import {
  fadeUp,
  staggerContainer,
  motionSafe,
} from "../../animations/variants.js";

const DEFAULT_VIDEO_URL =
  "https://res.cloudinary.com/mknetwyg/video/upload/v1791267704/lesuccess/video/CompanyIntroNew.mp4";

const HeroVideo = () => {
  const reduced = useReducedMotion();
  const videoRef = useRef(null);

  // Dynamic hero video settings from database
  const { settings } = useSiteSettings();
  const videoUrl =
    settings?.hero_video_url !== undefined
      ? settings.hero_video_url || ""
      : DEFAULT_VIDEO_URL;

  const videoEnabled =
    settings?.hero_video_enabled !== undefined
      ? settings.hero_video_enabled !== "false" && Boolean(settings.hero_video_url)
      : true;

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
          try {
            video.currentTime = 0;
          } catch {
            // Seek error ignored
          }
        }
      }

      if (reduced) {
        video.pause();
      } else {
        const playPromise = video.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            // Autoplay policy or abort ignored
          });
        }
      }
    };

    const handleLoadedMetadata = () => {
      applyStartAndPlay();
    };

    const handleEnded = () => {
      if (isCancelled || !video) return;
      if (reduced) {
        video.pause();
        return;
      }
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
  }, [videoUrl, videoEnabled, reduced]);

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
      {/* =====================================================
          INTEGRATED FULL-WIDTH HERO SECTION
          - Preserves original blue background & video
          - Reorganizes left-right structure matching Reference Image 2
      ===================================================== */}
      <section className="lesuccess-hero relative w-full min-h-[100svh] flex flex-col justify-between overflow-clip bg-gradient-to-br from-[#024D72] via-[#07405C] to-[#013550] text-white pt-[calc(var(--app-header-max,148px)+1.5rem)] pb-6 isolate">
        
        {/* 1. BACKGROUND VIDEO LAYER */}
        {videoEnabled && videoUrl && (
          <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
            <video
              ref={videoRef}
              className="absolute inset-0 h-full w-full object-cover object-center"
              autoPlay={!reduced}
              muted
              playsInline
              src={videoUrl}
              preload="auto"
              aria-hidden="true"
            />
          </div>
        )}

        {/* 2. BRAND BLUE GRADIENT & OVERLAYS */}
        <div
          aria-hidden="true"
          className="absolute inset-0 z-[1] bg-gradient-to-b from-[#024D72]/85 via-[#07405C]/80 to-[#013550]/90 pointer-events-none"
        />

        {/* Subtle radial tech vignette for depth */}
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

        {/* =====================================================
            3. MAIN HERO 2-COLUMN GRID (Matching Reference Image 2)
            Left: Content, Headline, Paragraph, CTAs
            Right: Education-Focused Card Visual
        ===================================================== */}
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 my-auto w-full">
          <div className="hero-columns grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 lg:gap-8 xl:gap-10 items-center">

            {/* -------------------------------------------------
                LEFT SIDE: HERO CONTENT (from Reference Image 1)
            ------------------------------------------------- */}
            <motion.div
              variants={motionSafe(staggerContainer, reduced)}
              initial="hidden"
              animate="visible"
              className="lg:col-span-6 min-w-0 text-left"
            >
              {/* Top Pill Badge */}
              <motion.div
                variants={motionSafe(fadeUp, reduced)}
                className="hero-eyebrow inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider backdrop-blur-md shadow-xs mb-5"
              >
                <Sparkles size={14} className="text-[#F44246]" />
                <span className="text-slate-100">The New Standard in Tech Education</span>
              </motion.div>

              {/* Headline */}
              <motion.h1
                variants={motionSafe(fadeUp, reduced)}
                className="hero-headline font-display text-3xl sm:text-4xl md:text-5xl lg:text-[2.75rem] xl:text-[3.25rem] font-black tracking-tight leading-[1.12] text-white mb-5"
              >
                Master Tech Skills. <br className="hidden sm:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-200 via-[#F44246] to-red-400">
                  Build Your Future.
                </span>
              </motion.h1>

              {/* Subheading / Paragraph */}
              <motion.p
                variants={motionSafe(fadeUp, reduced)}
                className="hero-description text-sm sm:text-base lg:text-lg text-slate-200 leading-relaxed max-w-xl mb-8 font-normal drop-shadow-xs"
              >
                Interactive, project-based learning for ambitious developers.
                Master Python, Java, Data Science, and Cloud Architecture
                through hands-on experience.
              </motion.p>

              {/* Action Buttons */}
              <motion.div
                variants={motionSafe(fadeUp, reduced)}
                className="hero-actions flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 sm:gap-4 mb-8"
              >
                <Link
                  to="/courses"
                  className="hero-action group inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#F44246] to-[#CA164B] px-7 py-3.5 text-sm sm:text-base font-bold text-white shadow-[0_4px_25px_rgba(244,66,70,0.45)] hover:brightness-110 hover:shadow-[0_6px_30px_rgba(244,66,70,0.6)] active:scale-98 transition-all"
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
                  className="hero-action inline-flex items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 backdrop-blur-md px-7 py-3.5 text-sm sm:text-base font-semibold text-white hover:bg-white/20 hover:border-white/60 active:scale-98 cursor-pointer transition-all shadow-sm"
                >
                  <span>Book Free Demo</span>
                </a>
              </motion.div>

              {/* Trust Highlights Strip */}
              <motion.div
                variants={motionSafe(fadeUp, reduced)}
                className="hero-trust flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm font-semibold text-slate-200"
              >
                <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 border border-white/15 px-3 py-1 backdrop-blur-md">
                  <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                  <span>100% Placement Assurance</span>
                </div>
                <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 border border-white/15 px-3 py-1 backdrop-blur-md">
                  <GraduationCap size={14} className="text-[#F44246] shrink-0" />
                  <span>1-on-1 Code Reviews</span>
                </div>
                <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 border border-white/15 px-3 py-1 backdrop-blur-md">
                  <Building2 size={14} className="text-cyan-400 shrink-0" />
                  <span>150+ Hiring Partners</span>
                </div>
              </motion.div>
            </motion.div>

            {/* Right-side interactive visual challenge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: reduced ? 0 : 0.8, delay: reduced ? 0 : 0.2 }}
              className="lg:col-span-6 min-w-0 w-full"
            >
              <HeroCodeGame />
            </motion.div>

          </div>
        </div>

        {/* 4. SCROLL DOWN DISCOVER INDICATOR */}
        <div className="hero-discover relative z-10 mt-5 mb-1 flex justify-center">
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

    </div>
  );
};

export default HeroVideo;
