import {
  MessageCircleMore,
  BrainCircuit,
  Volume2,
  ArrowUpRight,
  Rocket,
  UsersRound,
  BadgeCheck,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  fadeUp,
  staggerContainer,
  motionSafe,
  ONCE_IN_VIEW,
} from "../../animations/variants.js";
import useReducedMotion from "../../hooks/useReducedMotion.js";
import { FloatingOrbs, TechGrid, SectionHeading } from "../ui/BackgroundMotion.jsx";

const features = [
  {
    title: "Career Counseling",
    icon: MessageCircleMore,
    description:
      "Personalized 1-on-1 career mapping to discover your strengths and target high-growth technology sectors.",
  },
  {
    title: "Skill Development Programs",
    icon: BrainCircuit,
    description:
      "Deep-dive technical curriculums engineered around live coding projects, database modeling, and microservices.",
  },
  {
    title: "Communication Training",
    icon: Volume2,
    description:
      "Corporate communication and mock interview rehearsals to help you articulate your technical solutions with confidence.",
  },
  {
    title: "Corporate Transition",
    icon: ArrowUpRight,
    description:
      "Enterprise training methodologies bridging academic foundations to modern agile production environments.",
  },
  {
    title: "Placement Opportunities",
    icon: Rocket,
    description:
      "Exclusive recruitment drives and resume shortlisting with over 150+ actively hiring tech companies.",
  },
  {
    title: "Community Engagement",
    icon: UsersRound,
    description:
      "Collaborative peer community with regular hackathons, tech talks, and alumni networking circles.",
  },
];

const WhyChooseUs = () => {
  const reduced = useReducedMotion();

  return (
    <section className="relative w-full bg-[#F8FAFC] px-6 py-20 sm:px-10 lg:px-20 border-y border-slate-100/80 overflow-hidden">
      {/* Purposeful Background Motion: Floating Orbs & Tech Grid */}
      <FloatingOrbs variant="full" />
      <TechGrid opacity="opacity-[0.03]" />

      <div className="relative z-10 mx-auto max-w-6xl text-center">
        {/* Section Header with Eyebrow, Animated Line and Typography Hierarchy */}
        <SectionHeading
          badge="WHY CHOOSE LESUCCESS"
          badgeIcon={BadgeCheck}
          titlePrefix="Best Features of"
          titleHighlight="LeSuccess"
          description="We empower students and professionals with job-ready technical skills, dedicated mentor support, and guaranteed interview opportunities."
        />

        {/* Features Bento Grid */}
        <motion.div
          variants={motionSafe(staggerContainer, reduced)}
          initial="hidden"
          whileInView="visible"
          viewport={ONCE_IN_VIEW}
          className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {features.map((feature, idx) => {
            const Icon = feature.icon;

            return (
              <motion.div
                key={feature.title}
                variants={motionSafe(fadeUp, reduced)}
                className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-7 sm:p-8 text-left shadow-[0_4px_20px_rgba(7,64,92,0.05)] transition-all duration-300 ease-out hover:-translate-y-2 hover:border-[#07405C]/35 hover:shadow-[0_20px_40px_rgba(7,64,92,0.1)] cursor-default"
              >
                {/* Subtle top brand accent line with faint resting presence */}
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#DF1E26] via-[#CA164B] to-[#07405C] opacity-25 group-hover:opacity-100 transition-opacity duration-300" />

                <div>
                  <div className="flex items-center justify-between">
                    {/* Icon Container with subtle brand accent transitioning to gradient on hover */}
                    <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-gradient-to-br from-[#07405C]/8 to-[#024D72]/4 border border-[#07405C]/12 text-[#07405C] shadow-2xs transition-all duration-300 group-hover:scale-105 group-hover:bg-gradient-to-r group-hover:from-[#F44246] group-hover:to-[#CA164B] group-hover:text-white group-hover:border-transparent group-hover:shadow-md">
                      <Icon size={23} className="transition-transform duration-300 group-hover:scale-110" />
                    </div>

                    <span className="text-xs font-bold text-slate-300 group-hover:text-[#07405C]/40 transition-colors">
                      0{idx + 1}
                    </span>
                  </div>

                  <h3 className="mt-5 text-lg sm:text-xl font-bold text-[#101010] transition-colors duration-200 group-hover:text-[#07405C]">
                    {feature.title}
                  </h3>

                  <p className="mt-2.5 text-sm leading-relaxed text-slate-600">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
