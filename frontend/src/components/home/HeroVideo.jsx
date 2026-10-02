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
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  RotateCcw,
} from "lucide-react";
import useReducedMotion from "../../hooks/useReducedMotion.js";
import apiClient from "../../services/apiClient.js";
import {
  fadeUp,
  staggerContainer,
  motionSafe,
  ONCE_IN_VIEW,
  floatLoop,
} from "../../animations/variants.js";

const DEFAULT_VIDEO_URL =
  "https://res.cloudinary.com/mknetwyg/video/upload/v1790162815/lesuccess/video/CompanyIntro.mp4";

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

function formatTime(seconds) {
  if (isNaN(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s < 10 ? "0" : ""}${s}`;
}

const HeroVideo = () => {
  const reduced = useReducedMotion();

  // Dynamic hero video settings from database
  const [videoUrl, setVideoUrl] = useState(DEFAULT_VIDEO_URL);
  const [videoEnabled, setVideoEnabled] = useState(true);

  // Player controls state
  const videoRef = useRef(null);
  const playerContainerRef = useRef(null);
  const controlsTimeoutRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);

  // Fetch settings from API
  useEffect(() => {
    let isMounted = true;
    const loadSettings = async () => {
      try {
        const res = await apiClient.get("/api/settings");
        const settings = res?.data?.data || res?.data;
        if (isMounted && settings) {
          if (settings.hero_video_url) {
            setVideoUrl(settings.hero_video_url);
          }
          if (settings.hero_video_enabled !== undefined) {
            setVideoEnabled(settings.hero_video_enabled !== "false");
          }
        }
      } catch (err) {
        // Fallback to default
        if (isMounted) {
          setVideoUrl(DEFAULT_VIDEO_URL);
          setVideoEnabled(true);
        }
      }
    };
    loadSettings();
    return () => {
      isMounted = false;
    };
  }, []);

  // Listen for fullscreen change
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  // Auto-hide controls
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 2800);
  };

  const handleMouseLeave = () => {
    if (isPlaying) {
      setShowControls(false);
    }
  };

  // Video playback control handlers
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused || videoRef.current.ended) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    if (isMuted) {
      videoRef.current.muted = false;
      const targetVol = volume === 0 ? 1 : volume;
      videoRef.current.volume = targetVol;
      setIsMuted(false);
      setVolume(targetVol);
    } else {
      videoRef.current.muted = true;
      setIsMuted(true);
    }
  };

  const handleVolumeChange = (e) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    if (videoRef.current) {
      videoRef.current.volume = newVol;
      if (newVol === 0) {
        videoRef.current.muted = true;
        setIsMuted(true);
      } else {
        videoRef.current.muted = false;
        setIsMuted(false);
      }
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration || 0);
    }
  };

  const handleSeek = (e) => {
    const target = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = target;
      setCurrentTime(target);
    }
  };

  const toggleFullscreen = async () => {
    if (!playerContainerRef.current) return;
    try {
      if (!document.fullscreenElement) {
        await playerContainerRef.current.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (err) {
      // Ignored
    }
  };

  const handleRestart = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
      setIsPlaying(true);
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
      <section className="relative w-full overflow-hidden bg-gradient-to-br from-[#024D72] via-[#07405C] to-[#013550] pt-8 pb-16 md:pt-8 md:pb-20 text-white">
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
              className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-[3.00rem] font-extrabold tracking-tight leading-[1.15] text-white"
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
              Coimbatore’s tech accelerator for industry-ready developers.
              Master full-stack skills with expert mentorship and 150+ hiring
              partners.
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
          {videoEnabled ? (
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
              <div
                ref={playerContainerRef}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                className="group relative rounded-3xl border border-white/20 bg-[#07405C]/60 backdrop-blur-md p-2 sm:p-3.5 shadow-2xl overflow-hidden"
              >
                <div className="relative overflow-hidden rounded-2xl bg-black aspect-video sm:aspect-[21/9] md:aspect-[16/8] max-h-[500px]">
                  <video
                    ref={videoRef}
                    className="h-full w-full object-contain cursor-pointer"
                    autoPlay
                    muted
                    playsInline
                    loop
                    src={videoUrl}
                    onClick={togglePlay}
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={handleLoadedMetadata}
                  >
                    Your browser does not support the video tag.
                  </video>

                  {/* Gradient vignette overlay */}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

                  {/* Prominent Floating "Click to Unmute / Sound On" Badge when muted */}
                  {isMuted && (
                    <button
                      type="button"
                      onClick={toggleMute}
                      className="absolute top-4 right-4 z-30 inline-flex items-center gap-2 rounded-full bg-black/75 hover:bg-black/90 backdrop-blur-md px-3.5 py-2 text-xs font-bold text-white shadow-xl border border-white/20 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                    >
                      <VolumeX
                        size={15}
                        className="text-[#F44246] animate-pulse"
                      />
                      <span>Click to Unmute</span>
                    </button>
                  )}

                  {/* Centered Play overlay button when paused */}
                  {!isPlaying && (
                    <button
                      type="button"
                      onClick={togglePlay}
                      className="absolute inset-0 m-auto z-20 flex h-16 w-16 items-center justify-center rounded-full bg-[#DF1E26]/90 text-white shadow-2xl transition-transform hover:scale-110 active:scale-95 cursor-pointer"
                      aria-label="Play video"
                    >
                      <Play size={28} className="translate-x-0.5 fill-white" />
                    </button>
                  )}

                  {/* Custom Controls Bar */}
                  <div
                    className={`absolute bottom-0 inset-x-0 z-20 p-3 sm:p-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent transition-opacity duration-300 ${
                      showControls || !isPlaying
                        ? "opacity-100"
                        : "opacity-0 pointer-events-none"
                    }`}
                  >
                    {/* Progress Scrubber */}
                    <div className="relative mb-2.5 flex items-center group/scrubber">
                      <input
                        type="range"
                        min={0}
                        max={duration || 100}
                        step={0.1}
                        value={currentTime}
                        onChange={handleSeek}
                        aria-label="Video seek scrubber"
                        className="w-full h-1.5 bg-white/30 rounded-lg appearance-none cursor-pointer accent-[#DF1E26] hover:h-2.5 transition-all"
                      />
                    </div>

                    <div className="flex items-center justify-between gap-3 text-white">
                      {/* Left Controls: Play/Pause, Replay, Time */}
                      <div className="flex items-center gap-2 sm:gap-3">
                        <button
                          type="button"
                          onClick={togglePlay}
                          aria-label={isPlaying ? "Pause" : "Play"}
                          className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 transition cursor-pointer"
                        >
                          {isPlaying ? (
                            <Pause size={16} />
                          ) : (
                            <Play size={16} className="translate-x-0.5" />
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={handleRestart}
                          aria-label="Restart Video"
                          className="hidden sm:flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 transition cursor-pointer"
                        >
                          <RotateCcw size={14} />
                        </button>

                        <span className="text-[11px] sm:text-xs font-medium text-slate-300 font-mono">
                          {formatTime(currentTime)} / {formatTime(duration)}
                        </span>
                      </div>

                      {/* Right Controls: Volume Slider, Fullscreen */}
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="flex items-center gap-1.5 group/vol">
                          <button
                            type="button"
                            onClick={toggleMute}
                            aria-label={isMuted ? "Unmute" : "Mute"}
                            className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 transition cursor-pointer"
                          >
                            {isMuted || volume === 0 ? (
                              <VolumeX size={16} className="text-[#F44246]" />
                            ) : (
                              <Volume2 size={16} />
                            )}
                          </button>
                          <input
                            type="range"
                            min={0}
                            max={1}
                            step={0.05}
                            value={isMuted ? 0 : volume}
                            onChange={handleVolumeChange}
                            aria-label="Volume slider"
                            className="w-14 sm:w-20 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer accent-[#DF1E26]"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={toggleFullscreen}
                          aria-label={
                            isFullscreen
                              ? "Exit Fullscreen"
                              : "Enter Fullscreen"
                          }
                          className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 transition cursor-pointer"
                        >
                          {isFullscreen ? (
                            <Minimize size={16} />
                          ) : (
                            <Maximize size={16} />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating Highlight Badge 1 (Top Left) */}
                <motion.div
                  animate={reduced ? {} : floatLoop(0)}
                  className="hidden sm:flex absolute top-6 left-6 items-center gap-2.5 rounded-full border border-white/25 bg-[#07405C]/85 backdrop-blur-md px-4 py-1.5 shadow-lg pointer-events-none"
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
                  className="hidden sm:flex absolute bottom-6 right-6 items-center gap-2.5 rounded-full border border-white/25 bg-[#07405C]/85 backdrop-blur-md px-4 py-1.5 shadow-lg pointer-events-none"
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
          ) : (
            /* Clean Alternative Display When Hero Video is Toggled Off */
            <motion.div
              variants={motionSafe(fadeUp, reduced)}
              initial="hidden"
              whileInView="visible"
              viewport={ONCE_IN_VIEW}
              className="relative mx-auto max-w-4xl rounded-3xl border border-white/20 bg-white/5 backdrop-blur-md p-8 md:p-12 text-center shadow-2xl"
            >
              <div className="inline-flex items-center gap-2 rounded-full bg-rose-500/20 border border-rose-400/30 px-4 py-1.5 text-xs font-bold text-rose-300 mb-4">
                <Sparkles size={14} />
                <span>Empowering Future Engineers</span>
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-white mb-3">
                Accelerate with Industry-Aligned Mentorship
              </h2>
              <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto mb-8 font-normal">
                From fundamentals to production-grade engineering. Build real
                enterprise applications, master modern tech stacks, and get
                recruited by top firms.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4.5 backdrop-blur-sm">
                  <CheckCircle2 className="text-emerald-400 mb-2" size={20} />
                  <h4 className="text-white font-semibold text-sm">
                    1-on-1 Code Reviews
                  </h4>
                  <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                    Personalized feedback from senior engineers on every pull
                    request.
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4.5 backdrop-blur-sm">
                  <CheckCircle2 className="text-[#F44246] mb-2" size={20} />
                  <h4 className="text-white font-semibold text-sm">
                    Real-World Projects
                  </h4>
                  <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                    Build production-ready web apps, microservices, and
                    databases.
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4.5 backdrop-blur-sm">
                  <CheckCircle2 className="text-cyan-400 mb-2" size={20} />
                  <h4 className="text-white font-semibold text-sm">
                    Direct Placements
                  </h4>
                  <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                    Exclusive recruitment drives, mock interviews, and resume
                    polish.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

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
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <ChevronDown
                  size={18}
                  className="text-slate-300 group-hover:text-white"
                />
              </motion.div>
            </button>
          </div>
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
