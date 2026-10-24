import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Target,
  Eye,
  Award,
  Users,
  Briefcase,
  GraduationCap,
  Sparkles,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import aboutImage from "../../assets/home/about.png";
import useReducedMotion from "../../hooks/useReducedMotion.js";
import {
  fadeLeft,
  fadeRight,
  motionSafe,
  ONCE_IN_VIEW,
} from "../../animations/variants.js";
import {
  FloatingOrbs,
  TechGrid,
  SectionHeading,
  FloatingTechBadge,
  GlowHalo,
} from "../../components/ui/BackgroundMotion.jsx";
import ScrollReveal from "../../animations/ScrollReveal.jsx";
import ParallaxElement from "../../animations/ParallaxElement.jsx";
import FloatingElement from "../../animations/FloatingElement.jsx";
import SpotlightCard from "../../components/ui/SpotlightCard.jsx";
import Magnetic from "../../components/ui/Magnetic.jsx";
import BorderBeam from "../../components/ui/BorderBeam.jsx";
import WaveDivider from "../../components/ui/WaveDivider.jsx";
import ParallaxImage from "../../components/ui/ParallaxImage.jsx";
import ParallaxLayer from "../../components/ui/ParallaxLayer.jsx";

const STATS = [
  {
    target: 37,
    suffix: "K+",
    label: "Students Trained",
    sub: "Across multiple batches",
  },
  {
    target: 150,
    suffix: "+",
    label: "Hiring Partners",
    sub: "Leading tech enterprises",
  },
  {
    target: 95,
    suffix: "%",
    label: "Placement Success",
    sub: "Career transitions verified",
  },
  {
    target: 20,
    suffix: "+",
    label: "Specialized Courses",
    sub: "Industry-aligned programs",
  },
];

function StatCounter({ target, suffix = "", duration = 1800, isVisible }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isVisible) return;
    let startTimestamp = null;
    let animationFrameId;

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // ease-out cubic
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(easeOut * target));

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step);
      } else {
        setCount(target);
      }
    };

    animationFrameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isVisible, target, duration]);

  return (
    <span>
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

const PILLARS = [
  {
    icon: Award,
    title: "Industry-Driven Curriculum",
    description:
      "Designed with insights from seasoned tech architects to align with current hiring demands and production practices.",
  },
  {
    icon: Briefcase,
    title: "Practical Project-Based Learning",
    description:
      "Over 70% of learning happens through live application development, code reviews, and containerized deployments.",
  },
  {
    icon: Users,
    title: "1-on-1 Mentorship",
    description:
      "Individual attention from experienced senior software developers who guide you through every concept and code challenge.",
  },
  {
    icon: GraduationCap,
    title: "Dedicated Placement Cell",
    description:
      "Comprehensive career support including resume audits, mock technical interviews, and direct interviews with top employers.",
  },
];

const STEPS = [
  {
    step: "01",
    title: "Learn Fundamentals",
    desc: "Master core concepts and language depths from expert instructors.",
  },
  {
    step: "02",
    title: "Build Real Projects",
    desc: "Develop end-to-end full stack and data applications following clean architecture.",
  },
  {
    step: "03",
    title: "Code Review & Polish",
    desc: "Refactor with mentors, optimize queries, write tests, and document your code.",
  },
  {
    step: "04",
    title: "Get Placed",
    desc: "Interview preparation, resume optimization, and placement drives until you succeed.",
  },
];

export default function AboutPage() {
  const reduced = useReducedMotion();
  const statsRef = useRef(null);
  const [statsVisible, setStatsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStatsVisible(true);
          observer.disconnect(); // Animate once only
        }
      },
      { threshold: 0.25 },
    );

    if (statsRef.current) {
      observer.observe(statsRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div className="w-full bg-white">
      {/* =====================================================
          HERO & BREADCRUMB
      ===================================================== */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#F5F8FC] to-white py-10 sm:py-12 lg:py-14">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
            <Link to="/" className="hover:text-[#07405C] transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-[#DF1E26]">About Us</span>
          </div>

          <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
            <motion.div
              variants={motionSafe(fadeLeft, reduced)}
              initial="hidden"
              whileInView="visible"
              viewport={ONCE_IN_VIEW}
            >
              <span className="inline-flex items-center gap-2 rounded-full border border-[#07405C]/20 bg-[#07405C]/10 px-3.5 py-1 text-xs font-bold text-[#07405C] shadow-xs mb-3.5">
                <Sparkles size={13} className="text-[#DF1E26]" />
                ABOUT LESUCCESS ACADEMY
              </span>

              <h1 className="text-3xl font-extrabold tracking-tight text-[#101010] sm:text-4xl lg:text-4xl leading-tight">
                Empowering Next-Gen{" "}
                <span className="text-[#DF1E26]">Tech Talent</span> in
                Coimbatore
              </h1>

              <p className="mt-4 text-base sm:text-lg leading-relaxed text-slate-600">
                LeSuccess is a premier technical learning accelerator and talent
                development firm. We bridge the critical gap between academic
                education and modern industry standards, preparing students and
                working professionals for high-impact tech careers.
              </p>

              <div className="mt-7 flex flex-wrap gap-4">
                <Link
                  to="/courses"
                  data-cursor-text="Courses"
                  className="animate-shimmer-sweep btn-glow-brand group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#F44246] via-[#DF1E26] to-[#CA164B] px-7 py-3.5 text-sm font-bold text-white shadow-lg transition-all hover:brightness-110 active:scale-98 cursor-pointer"
                >
                  <span>Explore Courses</span>
                  <ArrowRight
                    size={16}
                    className="transition-transform duration-200 group-hover:translate-x-1"
                  />
                </Link>
                <Link
                  to="/our-team"
                  data-cursor-text="Team"
                  className="btn-glow-navy inline-flex items-center gap-2 rounded-xl border border-[#07405C] bg-white px-7 py-3.5 text-sm font-bold text-[#07405C] transition hover:bg-[#07405C] hover:text-white active:scale-98 cursor-pointer shadow-xs"
                >
                  <span>Meet Our Team</span>
                </Link>
              </div>
            </motion.div>

            <motion.div
              variants={motionSafe(fadeRight, reduced)}
              initial="hidden"
              whileInView="visible"
              viewport={ONCE_IN_VIEW}
              className="relative group"
            >
              {/* Stanford Image Frame with Parallax Glide */}
              <div className="relative overflow-hidden rounded-3xl border-4 border-white shadow-2xl max-h-[380px] lg:max-h-[420px]">
                <ParallaxImage
                  src={aboutImage}
                  alt="LeSuccess Learning Center"
                  speed={0.22}
                  scale={1.2}
                  containerClassName="h-full w-full max-h-[380px] lg:max-h-[420px]"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-108"
                />
              </div>

              {/* Floating Shield Badge with Multi-Plane Depth */}
              <ParallaxLayer
                speed={-0.35}
                range={40}
                className="absolute -bottom-5 -right-3 z-20"
              >
                <FloatingTechBadge
                  icon={Award}
                  title="10+ Years Excellence"
                  subtitle="Leading Tech Academy"
                  accentColor="brand"
                  className="shadow-2xl"
                  duration={4.8}
                  yOffset={10}
                />
              </ParallaxLayer>
            </motion.div>
          </div>
        </div>
      </section>

      {/* =====================================================
          MISSION & VISION
      ===================================================== */}
      <section className="py-12 lg:py-16 bg-[#F5F8FC]">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#07405C]/20 bg-[#07405C]/10 px-3.5 py-1 text-xs font-bold text-[#07405C]">
              OUR PURPOSE
            </span>
            <h2 className="text-2xl font-extrabold text-[#101010] sm:text-3xl lg:text-4xl mt-3">
              Guiding Every Student Toward{" "}
              <span className="text-[#DF1E26]">Career Excellence</span>
            </h2>
            <p className="text-slate-600 mt-3 text-sm sm:text-base">
              We believe quality tech education should be accessible, practical,
              and directly aligned with what top companies look for in
              engineering candidates.
            </p>
          </div>

          <ScrollReveal
            preset="hop"
            staggerChildren={true}
            className="grid gap-6 md:grid-cols-2"
          >
            {/* Mission */}
            <div className="h-full">
              <SpotlightCard
                tilt={true}
                maxTilt={7}
                spotlightColor="rgba(7, 64, 92, 0.12)"
                className="card-lift-3d group relative h-full overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-7 sm:p-8 shadow-[0_4px_20px_rgba(7,64,92,0.06)] cursor-default"
              >
                <BorderBeam
                  size={220}
                  duration={8}
                  colorFrom="#07405C"
                  colorTo="#00bcd4"
                />
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#07405C] to-cyan-500 opacity-30 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#07405C]/10 text-[#07405C] mb-4 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 group-hover:bg-[#07405C] group-hover:text-white">
                  <Target size={24} />
                </div>
                <h3 className="text-xl font-bold text-[#101010] mb-2.5 transition-colors group-hover:text-[#07405C]">
                  Our Mission
                </h3>
                <p className="text-sm sm:text-base leading-relaxed text-slate-600">
                  To provide accessible, high-impact technology training through
                  experiential learning, expert mentorship, and real-world
                  project portfolios that empower students to enter the industry
                  with high confidence and immediate job-readiness.
                </p>
                <ul className="mt-5 space-y-2.5 text-xs sm:text-sm text-slate-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle2
                      size={16}
                      className="text-[#DF1E26] shrink-0"
                    />
                    <span>Hands-on project work from day one</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2
                      size={16}
                      className="text-[#DF1E26] shrink-0"
                    />
                    <span>Continuous mentoring and milestone evaluations</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2
                      size={16}
                      className="text-[#DF1E26] shrink-0"
                    />
                    <span>Ethical and transparent placement guidance</span>
                  </li>
                </ul>
              </SpotlightCard>
            </div>

            {/* Vision */}
            <div className="h-full">
              <SpotlightCard
                tilt={true}
                maxTilt={7}
                spotlightColor="rgba(223, 30, 38, 0.12)"
                className="card-lift-3d group relative h-full overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-7 sm:p-8 shadow-[0_4px_20px_rgba(7,64,92,0.06)] cursor-default"
              >
                <BorderBeam
                  size={220}
                  duration={8}
                  colorFrom="#DF1E26"
                  colorTo="#CA164B"
                />
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#DF1E26] via-[#CA164B] to-rose-400 opacity-30 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#DF1E26]/10 text-[#DF1E26] mb-4 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 group-hover:bg-[#DF1E26] group-hover:text-white">
                  <Eye size={24} />
                </div>
                <h3 className="text-xl font-bold text-[#101010] mb-2.5 transition-colors group-hover:text-[#DF1E26]">
                  Our Vision
                </h3>
                <p className="text-sm sm:text-base leading-relaxed text-slate-600">
                  To emerge as South India's most trusted technology career
                  accelerator and academic partner, creating an ecosystem where
                  motivated learners transform into world-class software
                  engineers, analysts, and tech innovators.
                </p>
                <ul className="mt-5 space-y-2.5 text-xs sm:text-sm text-slate-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle2
                      size={16}
                      className="text-[#07405C] shrink-0"
                    />
                    <span>
                      Transform non-tech & fresh graduates into skilled
                      developers
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2
                      size={16}
                      className="text-[#07405C] shrink-0"
                    />
                    <span>Bridge corporate workforce upskilling needs</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2
                      size={16}
                      className="text-[#07405C] shrink-0"
                    />
                    <span>Foster a vibrant learning and alumni community</span>
                  </li>
                </ul>
              </SpotlightCard>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <WaveDivider
        type="curve"
        fill="#07405C"
        direction="down"
        glow={true}
        className="-mb-px"
      />

      {/* =====================================================
          KEY STATS
      ===================================================== */}
      <section
        ref={statsRef}
        className="py-16 bg-[#07405C] text-white relative overflow-hidden"
      >
        <GlowHalo
          color="#00bcd4"
          size="380px"
          opacity={0.15}
          className="-top-24 -left-24"
        />
        <GlowHalo
          color="#DF1E26"
          size="380px"
          opacity={0.15}
          className="-bottom-24 -right-24"
        />

        <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-4 text-center">
            {STATS.map((stat) => (
              <div key={stat.label} className="h-full">
                <SpotlightCard
                  tilt={true}
                  maxTilt={8}
                  spotlightColor="rgba(255, 255, 255, 0.16)"
                  className="card-lift-3d h-full p-5 sm:p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-white/30 hover:bg-white/10 transition-all cursor-default"
                >
                  <p className="text-4xl sm:text-5xl font-black text-[#e52f35] tracking-tight">
                    <StatCounter
                      target={stat.target}
                      suffix={stat.suffix}
                      duration={1800}
                      isVisible={statsVisible}
                    />
                  </p>
                  <p className="mt-2 text-base sm:text-lg font-bold text-white">
                    {stat.label}
                  </p>
                  <p className="mt-1 text-xs text-slate-300">{stat.sub}</p>
                </SpotlightCard>
              </div>
            ))}
          </div>
        </div>
      </section>

      <WaveDivider
        type="wave"
        fill="#ffffff"
        direction="down"
        glow={true}
        className="-mb-px"
      />

      {/* =====================================================
          VALUE PILLARS / WHY LESUCCESS
      ===================================================== */}
      <section className="relative py-20 bg-white overflow-hidden">
        {/* Ambient background motion */}
        <FloatingOrbs variant="default" />
        <TechGrid opacity="opacity-[0.02]" />

        <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
          <SectionHeading
            badge="WHY CHOOSE LESUCCESS"
            badgeIcon={Award}
            titlePrefix="The Core Pillars of Our"
            titleHighlight="Training Model"
            description="Everything we do is focused on one objective: ensuring our students acquire high-value practical capabilities that recruiters actively seek."
            className="mb-16"
          />

          <ScrollReveal
            preset="hop"
            staggerChildren={true}
            staggerDelay={0.08}
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
          >
            {PILLARS.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <motion.div
                  key={pillar.title}
                  variants={{
                    hidden: { opacity: 0, y: 30, scale: 0.95 },
                    visible: { opacity: 1, y: 0, scale: 1 },
                  }}
                  className="h-full"
                >
                  <SpotlightCard
                    tilt={true}
                    maxTilt={8}
                    spotlightColor="rgba(7, 64, 92, 0.12)"
                    className="card-lift-3d group relative h-full overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-7 sm:p-8 text-center shadow-[0_4px_20px_rgba(7,64,92,0.05)] cursor-default"
                  >
                    <BorderBeam
                      size={180}
                      duration={9}
                      colorFrom="#DF1E26"
                      colorTo="#07405C"
                    />
                    <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#DF1E26] via-[#CA164B] to-[#07405C] opacity-25 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#07405C]/8 to-[#024D72]/4 border border-[#07405C]/12 text-[#07405C] transition-all duration-300 group-hover:bg-gradient-to-r group-hover:from-[#F44246] group-hover:to-[#CA164B] group-hover:text-white group-hover:border-transparent group-hover:scale-110 group-hover:rotate-6 shadow-2xs">
                      <Icon
                        size={26}
                        className="transition-transform duration-300 group-hover:scale-110"
                      />
                    </div>
                    <h3 className="mt-6 text-lg font-bold text-[#101010] transition-colors group-hover:text-[#07405C]">
                      {pillar.title}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-slate-600">
                      {pillar.description}
                    </p>
                  </SpotlightCard>
                </motion.div>
              );
            })}
          </ScrollReveal>
        </div>
      </section>

      {/* =====================================================
          LEARNING PATHWAY (4 STEPS)
      ===================================================== */}
      <section className="py-20 bg-[#F5F8FC] relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#07405C]/20 bg-[#07405C]/10 px-4 py-1.5 text-xs font-bold text-[#07405C]">
              HOW IT WORKS
            </span>
            <h2 className="text-3xl font-extrabold text-[#101010] sm:text-4xl mt-4 tracking-tight">
              From Classroom to{" "}
              <span className="text-[#DF1E26]">Tech Career</span>
            </h2>
          </div>

          <ScrollReveal
            preset="hop"
            staggerChildren={true}
            staggerDelay={0.08}
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
          >
            {STEPS.map((step) => (
              <motion.div
                key={step.step}
                variants={{
                  hidden: { opacity: 0, y: 30, scale: 0.95 },
                  visible: { opacity: 1, y: 0, scale: 1 },
                }}
                className="h-full"
              >
                <SpotlightCard
                  tilt={true}
                  maxTilt={8}
                  spotlightColor="rgba(223, 30, 38, 0.12)"
                  className="card-lift-3d group relative h-full overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-7 shadow-[0_4px_16px_rgba(7,64,92,0.05)] cursor-default"
                >
                  <BorderBeam
                    size={160}
                    duration={8}
                    colorFrom="#DF1E26"
                    colorTo="#07405C"
                  />
                  <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#DF1E26] to-[#07405C] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <span className="text-3xl font-black text-[#07405C]/20 group-hover:text-[#DF1E26]/50 transition-colors">
                    {step.step}
                  </span>
                  <h3 className="mt-3 text-lg font-bold text-[#101010] transition-colors group-hover:text-[#07405C]">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    {step.desc}
                  </p>
                </SpotlightCard>
              </motion.div>
            ))}
          </ScrollReveal>
        </div>
      </section>

      <WaveDivider
        type="curve"
        fill="#024D72"
        direction="down"
        glow={true}
        className="-mb-px"
      />

      {/* =====================================================
          CTA BANNER (High contrast blue gradient & polished buttons)
      ===================================================== */}
      <section className="relative overflow-hidden py-20 bg-gradient-to-br from-[#024D72] via-[#07405C] to-[#013550] text-white text-center">
        {/* Decorative ambient subtle glow */}
        <ParallaxElement offset={30} className="absolute -top-24 -left-24">
          <FloatingElement duration={4} yOffset={10}>
            <div
              aria-hidden="true"
              className="h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none"
            />
          </FloatingElement>
        </ParallaxElement>
        <ParallaxElement offset={-30} className="absolute -bottom-24 -right-24">
          <FloatingElement duration={5} yOffset={15} delay={1}>
            <div
              aria-hidden="true"
              className="h-80 w-80 rounded-full bg-[#DF1E26]/10 blur-3xl pointer-events-none"
            />
          </FloatingElement>
        </ParallaxElement>

        <div className="relative z-10 mx-auto max-w-4xl px-6">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight drop-shadow-sm">
            Ready to Accelerate Your{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-200 via-[#F44246] to-red-400">
              Career
            </span>
            ?
          </h2>
          <p className="mt-5 text-base sm:text-lg text-slate-200 max-w-2xl mx-auto leading-relaxed">
            Join thousands of successful alumni who launched their tech journey
            with LeSuccess. Book a free trial demo session or speak to our
            career counselors today.
          </p>
          <div className="mt-8 flex flex-wrap justify-center items-center gap-4">
            <Magnetic strength={0.25}>
              <Link
                to="/courses"
                className="animate-shimmer-sweep btn-glow-brand group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#F44246] via-[#DF1E26] to-[#CA164B] px-8 py-4 text-base font-bold text-white shadow-xl transition-all hover:brightness-110 active:scale-98 cursor-pointer"
              >
                <span>Explore Courses</span>
                <ArrowRight
                  size={18}
                  className="transition-transform duration-200 group-hover:translate-x-1"
                />
              </Link>
            </Magnetic>
            <Magnetic strength={0.25}>
              <Link
                to="/contact"
                className="btn-glow-navy inline-flex items-center gap-2 rounded-xl border-2 border-white/80 bg-white/10 backdrop-blur-sm px-8 py-4 text-base font-bold text-white transition-all hover:bg-white hover:text-[#07405C] active:scale-98 cursor-pointer"
              >
                <span>Contact Us</span>
              </Link>
            </Magnetic>
          </div>
        </div>
      </section>
    </div>
  );
}
