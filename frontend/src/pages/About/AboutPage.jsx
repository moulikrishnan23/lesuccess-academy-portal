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
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import aboutImage from "../../assets/home/about.png";
import useReducedMotion from "../../hooks/useReducedMotion.js";
import {
  fadeUp,
  fadeLeft,
  fadeRight,
  staggerContainer,
  motionSafe,
  ONCE_IN_VIEW,
} from "../../animations/variants.js";

const STATS = [
  { target: 10000, suffix: "+", label: "Students Trained", sub: "Across multiple batches" },
  { target: 150, suffix: "+", label: "Hiring Partners", sub: "Leading tech enterprises" },
  { target: 95, suffix: "%", label: "Placement Success", sub: "Career transitions verified" },
  { target: 20, suffix: "+", label: "Specialized Courses", sub: "Industry-aligned programs" },
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
  { step: "01", title: "Learn Fundamentals", desc: "Master core concepts and language depths from expert instructors." },
  { step: "02", title: "Build Real Projects", desc: "Develop end-to-end full stack and data applications following clean architecture." },
  { step: "03", title: "Code Review & Polish", desc: "Refactor with mentors, optimize queries, write tests, and document your code." },
  { step: "04", title: "Get Placed", desc: "Interview preparation, resume optimization, and placement drives until you succeed." },
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
      { threshold: 0.25 }
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
      <section className="relative overflow-hidden bg-gradient-to-b from-[#F5F8FC] to-white py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">
            <Link to="/" className="hover:text-[#07405C] transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-[#DF1E26]">About Us</span>
          </div>

          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <motion.div
              variants={motionSafe(fadeLeft, reduced)}
              initial="hidden"
              whileInView="visible"
              viewport={ONCE_IN_VIEW}
            >
              <span className="inline-flex items-center gap-2 rounded-full border border-[#07405C]/20 bg-[#07405C]/10 px-4 py-1.5 text-xs font-bold text-[#07405C] shadow-xs mb-6">
                <Sparkles size={14} className="text-[#DF1E26]" />
                ABOUT LESUCCESS ACADEMY
              </span>

              <h1 className="text-4xl font-extrabold tracking-tight text-[#101010] sm:text-5xl lg:text-5xl leading-tight">
                Empowering Next-Gen{" "}
                <span className="text-[#DF1E26]">Tech Talent</span> in Coimbatore
              </h1>

              <p className="mt-6 text-lg leading-relaxed text-slate-600">
                LeSuccess is a premier technical learning accelerator and talent development firm.
                We bridge the critical gap between academic education and modern industry standards,
                preparing students and working professionals for high-impact tech careers.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  to="/courses"
                  className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#F44246] to-[#CA164B] px-7 py-3.5 text-sm font-bold text-white shadow-md transition hover:brightness-105 active:scale-98 cursor-pointer"
                >
                  <span>Explore Courses</span>
                  <ArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-1" />
                </Link>
                <Link
                  to="/our-team"
                  className="inline-flex items-center gap-2 rounded-xl border border-[#07405C] px-7 py-3.5 text-sm font-bold text-[#07405C] transition hover:bg-[#07405C] hover:text-white active:scale-98 cursor-pointer"
                >
                  Meet Our Team
                </Link>
              </div>
            </motion.div>

            <motion.div
              variants={motionSafe(fadeRight, reduced)}
              initial="hidden"
              whileInView="visible"
              viewport={ONCE_IN_VIEW}
              className="relative"
            >
              <div className="relative overflow-hidden rounded-3xl border-4 border-white shadow-2xl">
                <img
                  src={aboutImage}
                  alt="LeSuccess Learning Center"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 hidden sm:flex items-center gap-3 rounded-2xl bg-[#07405C] p-5 text-white shadow-xl">
                <ShieldCheck size={36} className="text-[#DF1E26] shrink-0" />
                <div>
                  <p className="text-xl font-extrabold leading-none">100% Verified</p>
                  <p className="text-xs text-slate-200 mt-1">Hands-on Practical Training</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* =====================================================
          MISSION & VISION
      ===================================================== */}
      <section className="py-16 lg:py-24 bg-[#F5F8FC]">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#07405C]/20 bg-[#07405C]/10 px-4 py-1.5 text-xs font-bold text-[#07405C]">
              OUR PURPOSE
            </span>
            <h2 className="text-3xl font-extrabold text-[#101010] sm:text-4xl mt-4">
              Guiding Every Student Toward{" "}
              <span className="text-[#DF1E26]">Career Excellence</span>
            </h2>
            <p className="text-slate-600 mt-4 text-base sm:text-lg">
              We believe quality tech education should be accessible, practical, and directly aligned
              with what top companies look for in engineering candidates.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            {/* Mission */}
            <div className="relative rounded-3xl border border-slate-200 bg-white p-8 sm:p-10 shadow-sm transition hover:shadow-md hover:border-[#07405C]">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#07405C]/10 text-[#07405C] mb-6">
                <Target size={28} />
              </div>
              <h3 className="text-2xl font-bold text-[#101010] mb-4">Our Mission</h3>
              <p className="text-base leading-relaxed text-slate-600">
                To provide accessible, high-impact technology training through experiential learning,
                expert mentorship, and real-world project portfolios that empower students to enter the
                industry with high confidence and immediate job-readiness.
              </p>
              <ul className="mt-6 space-y-2.5 text-sm text-slate-600">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-[#DF1E26] shrink-0" />
                  Hands-on project work from day one
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-[#DF1E26] shrink-0" />
                  Continuous mentoring and milestone evaluations
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-[#DF1E26] shrink-0" />
                  Ethical and transparent placement guidance
                </li>
              </ul>
            </div>

            {/* Vision */}
            <div className="relative rounded-3xl border border-slate-200 bg-white p-8 sm:p-10 shadow-sm transition hover:shadow-md hover:border-[#DF1E26]">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#DF1E26]/10 text-[#DF1E26] mb-6">
                <Eye size={28} />
              </div>
              <h3 className="text-2xl font-bold text-[#101010] mb-4">Our Vision</h3>
              <p className="text-base leading-relaxed text-slate-600">
                To emerge as South India's most trusted technology career accelerator and academic
                partner, creating an ecosystem where motivated learners transform into world-class software
                engineers, analysts, and tech innovators.
              </p>
              <ul className="mt-6 space-y-2.5 text-sm text-slate-600">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-[#07405C] shrink-0" />
                  Transform non-tech & fresh graduates into skilled developers
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-[#07405C] shrink-0" />
                  Bridge corporate workforce upskilling needs
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-[#07405C] shrink-0" />
                  Foster a vibrant learning and alumni community
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          KEY STATS
      ===================================================== */}
      <section ref={statsRef} className="py-16 bg-[#07405C] text-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4 text-center">
            {STATS.map((stat) => (
              <div key={stat.label} className="p-4">
                <p className="text-4xl sm:text-5xl font-black text-[#DF1E26] tracking-tight">
                  <StatCounter
                    target={stat.target}
                    suffix={stat.suffix}
                    duration={1800}
                    isVisible={statsVisible}
                  />
                </p>
                <p className="mt-2 text-lg font-bold text-white">{stat.label}</p>
                <p className="mt-1 text-xs text-slate-200">{stat.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================
          VALUE PILLARS / WHY LESUCCESS
      ===================================================== */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#07405C]/20 bg-[#07405C]/10 px-4 py-1.5 text-xs font-bold text-[#07405C]">
              WHY CHOOSE LESUCCESS
            </span>
            <h2 className="text-3xl font-extrabold text-[#101010] sm:text-4xl mt-4">
              The Core Pillars of Our <span className="text-[#DF1E26]">Training Model</span>
            </h2>
            <p className="text-slate-600 mt-4 text-base sm:text-lg">
              Everything we do is focused on one objective: ensuring our students acquire high-value
              practical capabilities that recruiters actively seek.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {PILLARS.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={pillar.title}
                  className="group relative rounded-2xl border border-slate-200 bg-[#F5F8FC]/60 p-8 text-center transition-all duration-300 hover:-translate-y-2 hover:bg-white hover:border-[#DF1E26] hover:shadow-xl"
                >
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-white border border-slate-200 text-[#07405C] transition-all duration-300 group-hover:bg-[#DF1E26] group-hover:text-white group-hover:scale-110 shadow-xs">
                    <Icon size={26} />
                  </div>
                  <h3 className="mt-6 text-lg font-bold text-[#101010]">
                    {pillar.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600">
                    {pillar.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =====================================================
          LEARNING PATHWAY (4 STEPS)
      ===================================================== */}
      <section className="py-20 bg-[#F5F8FC]">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#07405C]/20 bg-[#07405C]/10 px-4 py-1.5 text-xs font-bold text-[#07405C]">
              HOW IT WORKS
            </span>
            <h2 className="text-3xl font-extrabold text-[#101010] sm:text-4xl mt-4">
              From Classroom to <span className="text-[#DF1E26]">Tech Career</span>
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step) => (
              <div
                key={step.step}
                className="relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:border-[#07405C]/40 transition hover:shadow-md"
              >
                <span className="text-3xl font-black text-[#07405C]/20">
                  {step.step}
                </span>
                <h3 className="mt-3 text-lg font-bold text-[#101010]">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================
          CTA BANNER (High contrast blue gradient & polished buttons)
      ===================================================== */}
      <section className="relative overflow-hidden py-20 bg-gradient-to-br from-[#024D72] via-[#07405C] to-[#013550] text-white text-center">
        {/* Decorative ambient subtle glow */}
        <div
          aria-hidden="true"
          className="absolute -top-24 -left-24 h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none"
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-[#DF1E26]/10 blur-3xl pointer-events-none"
        />

        <div className="relative z-10 mx-auto max-w-4xl px-6">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight drop-shadow-sm">
            Ready to Accelerate Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-200 via-[#F44246] to-red-400">Career</span>?
          </h2>
          <p className="mt-5 text-base sm:text-lg text-slate-200 max-w-2xl mx-auto leading-relaxed">
            Join thousands of successful alumni who launched their tech journey with LeSuccess.
            Book a free trial demo session or speak to our career counselors today.
          </p>
          <div className="mt-8 flex flex-wrap justify-center items-center gap-4">
            <Link
              to="/courses"
              className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#F44246] to-[#CA164B] px-8 py-4 text-base font-bold text-white shadow-lg shadow-red-900/30 transition-all hover:brightness-110 active:scale-98 cursor-pointer"
            >
              <span>Explore Courses</span>
              <ArrowRight size={18} className="transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 rounded-xl border-2 border-white/80 bg-white/10 backdrop-blur-sm px-8 py-4 text-base font-bold text-white transition-all hover:bg-white hover:text-[#07405C] active:scale-98 cursor-pointer"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
