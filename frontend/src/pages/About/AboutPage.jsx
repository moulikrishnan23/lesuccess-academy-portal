import { Link } from "react-router-dom";
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

const STATS = [
  { value: "1000+", label: "Students Trained", sub: "Across multiple batches" },
  { value: "150+", label: "Hiring Partners", sub: "Leading tech enterprises" },
  { value: "95%", label: "Placement Success", sub: "Career transitions verified" },
  { value: "15+", label: "Specialized Courses", sub: "Industry-aligned programs" },
];

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
  return (
    <div className="w-full bg-white">
      {/* =====================================================
          HERO & BREADCRUMB
      ===================================================== */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#f0f6fa] to-white py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
            <Link to="/" className="hover:text-[#074a68] transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-[#ef334c]">About Us</span>
          </div>

          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-[#074a68] bg-white px-4 py-1.5 text-xs font-bold text-[#074a68] shadow-xs mb-6">
                <Sparkles size={14} className="text-[#ef334c]" />
                ABOUT LESUCCESS ACADEMY
              </span>

              <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-5xl leading-tight">
                Empowering Next-Gen{" "}
                <span className="text-[#ef334c]">Tech Talent</span> in Coimbatore
              </h1>

              <p className="mt-6 text-lg leading-relaxed text-gray-600">
                LeSuccess is a premier technical learning accelerator and talent development firm.
                We bridge the critical gap between academic education and modern industry standards,
                preparing students and working professionals for high-impact tech careers.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  to="/courses"
                  className="inline-flex items-center gap-2 rounded-lg bg-[#074a68] px-7 py-3.5 text-sm font-semibold text-white shadow-md transition hover:bg-[#05374e]"
                >
                  Explore Courses <ArrowRight size={16} />
                </Link>
                <Link
                  to="/our-team"
                  className="inline-flex items-center gap-2 rounded-lg border border-[#074a68] px-7 py-3.5 text-sm font-semibold text-[#074a68] transition hover:bg-[#074a68] hover:text-white"
                >
                  Meet Our Team
                </Link>
              </div>
            </div>

            <div className="relative">
              <div className="relative overflow-hidden rounded-3xl border-4 border-white shadow-2xl">
                <img
                  src={aboutImage}
                  alt="LeSuccess Learning Center"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 hidden sm:flex items-center gap-3 rounded-2xl bg-[#074a68] p-5 text-white shadow-xl">
                <ShieldCheck size={36} className="text-[#ef334c] shrink-0" />
                <div>
                  <p className="text-xl font-extrabold leading-none">100% Verified</p>
                  <p className="text-xs text-gray-300 mt-1">Hands-on Practical Training</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          MISSION & VISION
      ===================================================== */}
      <section className="py-16 lg:py-24 bg-[#f8fbfe]">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#074a68] px-4 py-1.5 text-xs font-bold text-[#074a68]">
              OUR PURPOSE
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 sm:text-4xl mt-4">
              Guiding Every Student Toward{" "}
              <span className="text-[#ef334c]">Career Excellence</span>
            </h2>
            <p className="text-gray-600 mt-4 text-base sm:text-lg">
              We believe quality tech education should be accessible, practical, and directly aligned
              with what top companies look for in engineering candidates.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            {/* Mission */}
            <div className="relative rounded-3xl border border-gray-200 bg-white p-8 sm:p-10 shadow-sm transition hover:shadow-md hover:border-[#074a68]">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#074a68]/10 text-[#074a68] mb-6">
                <Target size={28} />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Our Mission</h3>
              <p className="text-base leading-relaxed text-gray-600">
                To provide accessible, high-impact technology training through experiential learning,
                expert mentorship, and real-world project portfolios that empower students to enter the
                industry with high confidence and immediate job-readiness.
              </p>
              <ul className="mt-6 space-y-2.5 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-[#ef334c] shrink-0" />
                  Hands-on project work from day one
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-[#ef334c] shrink-0" />
                  Continuous mentoring and milestone evaluations
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-[#ef334c] shrink-0" />
                  Ethical and transparent placement guidance
                </li>
              </ul>
            </div>

            {/* Vision */}
            <div className="relative rounded-3xl border border-gray-200 bg-white p-8 sm:p-10 shadow-sm transition hover:shadow-md hover:border-[#ef334c]">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#ef334c]/10 text-[#ef334c] mb-6">
                <Eye size={28} />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Our Vision</h3>
              <p className="text-base leading-relaxed text-gray-600">
                To emerge as South India's most trusted technology career accelerator and academic
                partner, creating an ecosystem where motivated learners transform into world-class software
                engineers, analysts, and tech innovators.
              </p>
              <ul className="mt-6 space-y-2.5 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-[#074a68] shrink-0" />
                  Transform non-tech & fresh graduates into skilled developers
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-[#074a68] shrink-0" />
                  Bridge corporate workforce upskilling needs
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-[#074a68] shrink-0" />
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
      <section className="py-16 bg-[#074a68] text-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4 text-center">
            {STATS.map((stat) => (
              <div key={stat.label} className="p-4">
                <p className="text-4xl sm:text-5xl font-extrabold text-[#ef334c]">
                  {stat.value}
                </p>
                <p className="mt-2 text-lg font-bold text-white">{stat.label}</p>
                <p className="mt-1 text-xs text-gray-300">{stat.sub}</p>
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
            <span className="inline-flex items-center gap-2 rounded-full border border-[#074a68] px-4 py-1.5 text-xs font-bold text-[#074a68]">
              WHY CHOOSE LESUCCESS
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 sm:text-4xl mt-4">
              The Core Pillars of Our <span className="text-[#ef334c]">Training Model</span>
            </h2>
            <p className="text-gray-600 mt-4 text-base sm:text-lg">
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
                  className="group relative rounded-2xl border border-gray-200 bg-[#f8fbfe] p-8 text-center transition-all duration-300 hover:-translate-y-2 hover:bg-white hover:border-[#ef334c] hover:shadow-xl"
                >
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-white border border-gray-200 text-[#074a68] transition-all duration-300 group-hover:bg-[#ef334c] group-hover:text-white group-hover:scale-110 shadow-xs">
                    <Icon size={26} />
                  </div>
                  <h3 className="mt-6 text-lg font-bold text-slate-900">
                    {pillar.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-gray-600">
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
      <section className="py-20 bg-[#f8fbfe]">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#074a68] px-4 py-1.5 text-xs font-bold text-[#074a68]">
              HOW IT WORKS
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 sm:text-4xl mt-4">
              From Classroom to <span className="text-[#ef334c]">Tech Career</span>
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step) => (
              <div
                key={step.step}
                className="relative rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
              >
                <span className="text-3xl font-black text-[#074a68]/20">
                  {step.step}
                </span>
                <h3 className="mt-3 text-lg font-bold text-slate-900">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================
          CTA BANNER
      ===================================================== */}
      <section className="py-16 bg-gradient-to-r from-[#074a68] to-[#042838] text-white text-center">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="text-3xl font-extrabold sm:text-4xl leading-tight">
            Ready to Accelerate Your <span className="text-[#ef334c]">Career</span>?
          </h2>
          <p className="mt-4 text-base sm:text-lg text-gray-200">
            Join hundreds of successful alumni who launched their tech journey with LeSuccess.
            Book a free trial demo session or speak to our career counselors today.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              to="/courses"
              className="rounded-lg bg-[#ef334c] px-8 py-3.5 text-sm font-semibold text-white shadow-md transition hover:bg-[#d4273e]"
            >
              Browse Courses
            </Link>
            <Link
              to="/contact"
              className="rounded-lg border border-white/60 px-8 py-3.5 text-sm font-semibold text-white transition hover:bg-white hover:text-[#074a68]"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
