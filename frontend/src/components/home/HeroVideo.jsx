import { useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
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
import AnimatedCounter from "../ui/AnimatedCounter.jsx";
import Magnetic from "../ui/Magnetic.jsx";
import SpotlightCard from "../ui/SpotlightCard.jsx";
import ParticleConstellation from "../ui/ParticleConstellation.jsx";
import TypewriterText from "../ui/TypewriterText.jsx";
import WaveDivider from "../ui/WaveDivider.jsx";

const DEFAULT_VIDEO_URL =
  "https://res.cloudinary.com/mknetwyg/video/upload/v1791267704/lesuccess/video/CompanyIntroNew.mp4";

const STATS = [
  { value: "37K+", label: "Students Trained", icon: Users },
  { value: "150+", label: "Hiring Partners", icon: Building2 },
  { value: "95%", label: "Placement Success", icon: Award },
  { value: "20+", label: "Specialized Courses", icon: BookOpen },
];

const HeroVideo = () => {
  const reduced = useReducedMotion();
  const videoRef = useRef(null);
  const sectionRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "28%"]);
  const bgOpacity = useTransform(scrollYProgress, [0, 0.85], [1, 0.35]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "-10%"]);

  // Dynamic hero video settings from database
  const { settings } = useSiteSettings();
  const videoUrl =
    settings?.hero_video_url !== undefined
      ? settings.hero_video_url || ""
      : DEFAULT_VIDEO_URL;
  const videoEnabled =
    settings?.hero_video_enabled !== undefined
      ? settings.hero_video_enabled !== "false" &&
        Boolean(settings?.hero_video_url)
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
          console.warn(
            `Hero video duration (${video.duration}s) is shorter than ${START_TIME}s, falling back to 0s.`,
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
      <section
        ref={sectionRef}
        className="relative w-full min-h-[540px] lg:min-h-[calc(100dvh-var(--app-header-max,116px))] lg:h-[calc(100dvh-var(--app-header-max,116px))] lg:max-h-[840px] flex flex-col justify-between overflow-hidden bg-gradient-to-br from-[#024D72] via-[#07405C] to-[#013550] text-white pt-6 pb-4 sm:pt-8 sm:pb-5 lg:pt-8 lg:pb-4"
      >
        {/* PARALLAX SCROLL CONTAINER FOR BACKGROUND VIDEO & OVERLAYS */}
        <motion.div
          style={{ y: reduced ? 0 : bgY, opacity: reduced ? 1 : bgOpacity }}
          className="absolute inset-0 z-0 pointer-events-none will-change-transform"
        >
          {/* 1. BACKGROUND VIDEO LAYER */}
          {videoEnabled && videoUrl && (
            <div className="absolute inset-0 overflow-hidden">
              <video
                ref={videoRef}
                className="absolute inset-0 h-full w-full object-cover object-center scale-105"
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
          <div
            aria-hidden="true"
            className="absolute inset-0 z-[1] bg-gradient-to-b from-[#024D72]/85 via-[#07405C]/80 to-[#013550]/90"
          />

          {/* Subtle radial tech gradient vignette for depth */}
          <div
            aria-hidden="true"
            className="absolute inset-0 z-[2] bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(7,64,92,0.7)_100%)]"
          />

          {/* Ambient decorative pulsing glow halos (inspired by Xplore IT Corp haloColor) */}
          <div
            aria-hidden="true"
            className="absolute -top-32 -left-32 z-[3] h-96 w-96 rounded-full bg-cyan-500/25 blur-3xl animate-halo-pulse"
          />
          <div
            aria-hidden="true"
            className="absolute top-1/2 -right-32 z-[3] h-96 w-96 rounded-full bg-[#DF1E26]/25 blur-3xl animate-halo-pulse"
            style={{ animationDelay: "2s" }}
          />

          {/* Subtle tech dot grid pattern */}
          <div
            aria-hidden="true"
            className="absolute inset-0 z-[3] opacity-[0.06] bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:28px_28px]"
          />

          {/* Dynamic Interactive Particle Constellation Canvas (Cloudious style) */}
          <ParticleConstellation
            particleCount={48}
            connectDistance={115}
            interactive={true}
            className="z-[4]"
          />
        </motion.div>

        {/* 3. HERO CONTENT - Positioned on Top of Background Video & Overlay */}
        <div className="relative z-10 mx-auto max-w-6xl px-6 sm:px-10 lg:px-8 my-auto w-full">
          <motion.div
            variants={motionSafe(staggerContainer, reduced)}
            initial="hidden"
            animate="visible"
            style={{ y: reduced ? 0 : contentY }}
            className="text-center max-w-3xl mx-auto will-change-transform"
          >
            {/* Top Pill Badge */}
            <motion.div
              variants={motionSafe(fadeUp, reduced)}
              className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider backdrop-blur-md shadow-xs mb-3.5 sm:mb-4 lg:mb-3 transition-transform hover:scale-105"
            >
              <Sparkles
                size={13}
                className="text-[#F44246] animate-spin"
                style={{ animationDuration: "6s" }}
              />
              <span>Accelerate Your Tech Career</span>
            </motion.div>

            {/* Headline with Dynamic Typewriter Effect */}
            <motion.h1
              variants={motionSafe(fadeUp, reduced)}
              className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-[2.65rem] xl:text-[3.15rem] font-extrabold tracking-tight leading-[1.16] text-white"
            >
              Master Enterprise Tech Skills In{" "}
              <span className="block sm:inline-block min-h-[1.25em]">
                <TypewriterText
                  phrases={[
                    "Full Stack & AI Development 🚀",
                    "Enterprise Cloud & DevOps ☁️",
                    "Data Science & Analytics 📊",
                    "100% Placement Assurance 💼",
                    "Live Production Projects 💻",
                  ]}
                  typingSpeed={65}
                  deletingSpeed={35}
                  pauseDuration={2400}
                  className="text-transparent bg-clip-text bg-gradient-to-r from-rose-200 via-[#F44246] to-amber-200 drop-shadow-md"
                />
              </span>
            </motion.h1>

            {/* Subheading */}
            <motion.p
              variants={motionSafe(fadeUp, reduced)}
              className="mt-3 sm:mt-4 lg:mt-3 text-sm sm:text-base lg:text-base xl:text-lg text-slate-200 leading-relaxed max-w-2xl mx-auto font-normal drop-shadow-xs"
            >
              Coimbatore’s premier tech accelerator for industry-ready
              developers. Master full-stack skills with expert mentorship and
              150+ hiring partners.
            </motion.p>

            {/* Action Buttons with Dynamic Sheen Sweep & Magnetic Physics */}
            <motion.div
              variants={motionSafe(fadeUp, reduced)}
              className="mt-5 sm:mt-6 lg:mt-5 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4"
            >
              <Magnetic strength={0.25} className="w-full sm:w-auto">
                <Link
                  to="/courses"
                  data-cursor-text="Courses"
                  className="animate-shimmer-sweep btn-glow-brand group w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#F44246] via-[#DF1E26] to-[#CA164B] px-7 py-3 text-sm sm:text-base font-bold text-white shadow-[0_6px_25px_rgba(244,66,70,0.5)] transition-all duration-300 hover:brightness-110 active:scale-98"
                >
                  <span>Explore Courses</span>
                  <ArrowRight
                    size={16}
                    className="transition-transform duration-200 group-hover:translate-x-1"
                  />
                </Link>
              </Magnetic>

              <Magnetic strength={0.25} className="w-full sm:w-auto">
                <a
                  href="#demo-class"
                  onClick={handleBookDemo}
                  data-cursor-text="Demo"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-white/35 bg-white/10 backdrop-blur-md px-7 py-3 text-sm sm:text-base font-semibold text-white transition-all duration-300 hover:bg-white/20 hover:border-white/80 hover:shadow-[0_0_25px_rgba(255,255,255,0.25)] active:scale-98 cursor-pointer shadow-sm"
                >
                  <span>Book Free Demo</span>
                </a>
              </Magnetic>
            </motion.div>

            {/* Trust Highlights Strip with Spring Micro-Interactions */}
            <motion.div
              variants={motionSafe(fadeUp, reduced)}
              className="mt-6 sm:mt-7 lg:mt-5 flex flex-wrap items-center justify-center gap-2.5 sm:gap-4 lg:gap-5 text-xs sm:text-sm font-semibold text-slate-200"
            >
              <div className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full bg-white/10 border border-white/15 px-3 py-1 sm:px-3.5 sm:py-1.5 backdrop-blur-md hover:bg-white/20 transition-all hover:scale-105 cursor-default">
                <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                <span>100% Placement Assurance</span>
              </div>
              <div className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full bg-white/10 border border-white/15 px-3 py-1 sm:px-3.5 sm:py-1.5 backdrop-blur-md hover:bg-white/20 transition-all hover:scale-105 cursor-default">
                <GraduationCap size={14} className="text-[#F44246] shrink-0" />
                <span>Live Project Mentorship</span>
              </div>
              <div className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full bg-white/10 border border-white/15 px-3 py-1 sm:px-3.5 sm:py-1.5 backdrop-blur-md hover:bg-white/20 transition-all hover:scale-105 cursor-default">
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
            data-cursor-text="Scroll"
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

        {/* Dynamic Curved Wave Transition to Stats Strip */}
        <WaveDivider
          type="wave"
          fill="#ffffff"
          glow={true}
          className="z-20 relative -mb-1"
        />
      </section>

      {/* Crisp Trust & Stats Strip with Interactive Spotlight & 3D Tilt */}
      <div className="border-b border-slate-200/80 bg-white py-6 px-6 sm:px-10 lg:px-20 shadow-xs relative z-20 transition-colors duration-200">
        <div className="mx-auto max-w-6xl grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {STATS.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <SpotlightCard
                key={i}
                tilt={true}
                maxTilt={6}
                spotlightColor="rgba(223, 30, 38, 0.12)"
                data-cursor-text="Metric"
                className="card-lift-3d group flex items-center gap-3.5 sm:gap-4 p-3.5 rounded-2xl bg-white hover:bg-slate-50/70 border border-slate-100 hover:border-slate-200/90 cursor-default"
              >
                <div className="flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl bg-[#07405C]/10 border border-[#07405C]/20 text-[#07405C] transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 group-hover:bg-[#DF1E26] group-hover:text-white group-hover:border-transparent group-hover:shadow-md">
                  <Icon
                    size={22}
                    className="transition-colors duration-300 text-[#DF1E26] group-hover:text-white"
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
              </SpotlightCard>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default HeroVideo;
