import {
  MessageCircleMore,
  BrainCircuit,
  Volume2,
  ArrowUpRight,
  Rocket,
  UsersRound,
  ArrowRight,
} from "lucide-react";
import { useRef } from "react";
import { Link } from "react-router-dom";
import { TechGrid } from "../ui/BackgroundMotion.jsx";
import SectionHead from "./SectionHead.jsx";
import { Reveal, ConicBorder, Odometer, useSpotlight } from "../motion/index.js";
import { SITE_STATS } from "../../data/siteStats.js";

/*
 * "Best Features of LeSuccess" as a bento grid (spec: docs/mockup/lower-home.html,
 * #why). Card 1 is the wide navy lead, card 5 carries the hiring-companies
 * counter, card 6 runs the full width. On hover each card gets the conic ring,
 * a lift, and its own icon micro-animation (`motion`, keyframes in
 * home-motion.css). `cursor` is the word the custom cursor shows over the
 * card; keep it to about seven letters so it fits inside the bubble.
 *
 * The mockup's "Current site / New design" toggle is a review aid only and is
 * deliberately not ported.
 */
const features = [
  {
    title: "Career Counseling",
    cursor: "1-on-1",
    icon: MessageCircleMore,
    motion: "pop",
    description:
      "Personalized 1-on-1 career mapping to discover your strengths and target high-growth technology sectors.",
    // TODO(content): highlight chips taken from the mockup; confirm wording.
    chips: ["1-on-1", "Strengths mapping", "High-growth sectors"],
  },
  {
    title: "Skill Development Programs",
    cursor: "Skills",
    icon: BrainCircuit,
    motion: "sway",
    description:
      "Deep-dive technical curriculums engineered around live coding projects, database modeling, and microservices.",
  },
  {
    title: "Communication Training",
    cursor: "Speak",
    icon: Volume2,
    motion: "pop",
    description:
      "Corporate communication and mock interview rehearsals to help you articulate your technical solutions with confidence.",
  },
  {
    title: "Corporate Transition",
    cursor: "Career",
    icon: ArrowUpRight,
    motion: "slide",
    description:
      "Enterprise training methodologies bridging academic foundations to modern agile production environments.",
  },
  {
    title: "Placement Opportunities",
    cursor: "Hired",
    icon: Rocket,
    motion: "launch",
    description:
      "Exclusive recruitment drives and resume shortlisting with over 150+ actively hiring tech companies.",
    counter: { value: SITE_STATS.hiringCompanies, suffix: "+", label: "actively hiring tech companies" },
  },
  {
    title: "Community Engagement",
    cursor: "Connect",
    icon: UsersRound,
    motion: "bounce",
    description:
      "Collaborative peer community with regular hackathons, tech talks, and alumni networking circles.",
  },
];

// Grid placement per card: 1 col on phones, 2 on tablets (lead and last span
// both), and the 4+2 / 2+2+2 / 6 bento on desktop.
const SPAN = [
  "md:col-span-2 lg:col-span-4",
  "lg:col-span-2",
  "lg:col-span-2",
  "lg:col-span-2",
  "lg:col-span-2",
  "md:col-span-2 lg:col-span-6",
];

function FeatureCard({ feature, index }) {
  const Icon = feature.icon;
  const lead = index === 0;
  const wide = index === features.length - 1;

  const surface = lead
    ? "bento-lead border-transparent text-[#CFDCE8]"
    : wide
      ? "border-transparent bg-brand-soft"
      : "border-slate-200/90 bg-white";

  return (
    <ConicBorder
      as="article"
      tone={lead ? "dark" : "light"}
      data-cursor-text={feature.cursor}
      className={`bento-card motion-spot group relative flex h-full overflow-hidden rounded-bento border p-6 text-left shadow-lift-sm sm:p-8 ${
        wide ? "flex-col gap-4 sm:flex-row sm:items-center sm:gap-8" : "flex-col gap-4"
      } ${lead ? "min-h-[17.5rem]" : ""} ${surface}`}
      // The red glow needs more strength to read on the navy lead and the
      // pink-tinted last card than on white.
      style={lead ? { "--spot-strength": "45%" } : wide ? { "--spot-strength": "24%" } : undefined}
    >
      {lead && <span className="bento-lead-glow" aria-hidden="true" />}

      <span
        className={`absolute right-6 top-5 text-xs font-bold tracking-wider ${
          lead ? "text-white/55" : "text-slate-400"
        }`}
        aria-hidden="true"
      >
        0{index + 1}
      </span>

      <div
        className={`bento-icon bento-icon--${feature.motion} flex h-14 w-14 flex-none items-center justify-center rounded-[1.25rem] transition-[transform,color] duration-500 ease-brand group-hover:-rotate-[8deg] group-hover:scale-110 ${
          lead
            ? "bg-white/12 text-white"
            : `${wide ? "bg-white" : "bg-brand-soft"} text-brand-deep group-hover:bg-[image:var(--gradient-brand)] group-hover:text-white`
        }`}
      >
        <Icon size={26} aria-hidden="true" />
      </div>

      <div className="relative z-[1]">
        <h3 className={`font-bold ${lead ? "text-2xl text-white sm:text-[1.75rem]" : "text-xl"}`}>
          {feature.title}
        </h3>
        <p className={`mt-2 text-[0.9375rem] leading-relaxed ${lead ? "" : "text-slate-600"}`}>
          {feature.description}
        </p>
      </div>

      {feature.chips && (
        <ul className="relative z-[1] mt-auto flex flex-wrap gap-2" aria-label="Highlights">
          {feature.chips.map((chip) => (
            <li
              key={chip}
              className="rounded-full border border-white/20 bg-white/12 px-3.5 py-1.5 text-[0.8125rem] font-semibold text-white"
            >
              {chip}
            </li>
          ))}
        </ul>
      )}

      {feature.counter && (
        <p className="mt-auto flex items-baseline gap-2.5">
          <Odometer
            value={feature.counter.value}
            suffix={feature.counter.suffix}
            className="text-[2.75rem] font-extrabold tracking-tight text-brand"
          />
          <span className="text-[0.8125rem] leading-snug text-ink-muted">{feature.counter.label}</span>
        </p>
      )}
    </ConicBorder>
  );
}

const WhyChooseUs = () => {
  const sectionRef = useRef(null);
  useSpotlight(sectionRef);

  return (
    <section
      ref={sectionRef}
      id="why"
      className="why-bento relative w-full overflow-hidden border-y border-slate-100/80 bg-[#F8FAFC] px-6 py-16 sm:py-20"
    >
      {/* Two slow blurred blobs (brand and navy tints) drifting behind the grid. */}
      <div className="why-blob why-blob--brand" aria-hidden="true" />
      <div className="why-blob why-blob--navy" aria-hidden="true" />
      <TechGrid opacity="opacity-[0.03]" />

      <div className="relative z-10 mx-auto max-w-6xl">
        <SectionHead
          center
          badge="Why Choose LeSuccess"
          title="Best Features of"
          highlight="LeSuccess"
          lead="We empower students and professionals with job-ready technical skills, dedicated mentor support, and guaranteed interview opportunities."
        />

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-6">
          {features.map((feature, idx) => (
            <Reveal key={feature.title} index={idx} className={SPAN[idx]}>
              <FeatureCard feature={feature} index={idx} />
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-10 flex flex-wrap justify-center gap-4">
          <Link
            to="/about"
            data-cursor-text="About"
            className="group inline-flex min-h-12 items-center gap-2.5 rounded-full bg-navy-800 px-6 py-3 text-[0.9375rem] font-bold text-white transition-[transform,background-color] duration-300 ease-brand hover:bg-navy-700"
          >
            Know More
            <ArrowRight size={18} className="transition-transform duration-300 ease-brand group-hover:translate-x-1" aria-hidden="true" />
          </Link>
          <Link
            to="/gallery"
            data-cursor-text="Gallery"
            className="inline-flex min-h-12 items-center rounded-full px-6 py-3 text-[0.9375rem] font-bold text-navy-800 shadow-[inset_0_0_0_2px_var(--color-navy-800)] transition-colors duration-300 hover:bg-navy-800 hover:text-white"
          >
            See Campus Gallery
          </Link>
        </Reveal>
      </div>
    </section>
  );
};

export default WhyChooseUs;
