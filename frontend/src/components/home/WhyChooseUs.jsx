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
  FloatingOrbs,
  TechGrid,
  SectionHeading,
} from "../ui/BackgroundMotion.jsx";
import ScrollReveal from "../../animations/ScrollReveal.jsx";
import SpotlightCard from "../ui/SpotlightCard.jsx";
import BorderBeam from "../ui/BorderBeam.jsx";
import WaveDivider from "../ui/WaveDivider.jsx";

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
  return (
    <section className="relative w-full bg-[#F8FAFC] px-6 py-14 sm:py-20 border-y border-slate-100/80 overflow-hidden transition-colors duration-200">
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

        {/* Features Bento Grid with 3D Perspective Reveal */}
        <ScrollReveal
          preset="perspective"
          staggerChildren={true}
          staggerDelay={0.08}
          className="mt-10 sm:mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          {features.map((feature, idx) => {
            const Icon = feature.icon;

            return (
              <motion.div
                key={feature.title}
                variants={{
                  hidden: { opacity: 0, y: 35, scale: 0.94 },
                  visible: { opacity: 1, y: 0, scale: 1 },
                }}
                className="h-full"
              >
                <SpotlightCard
                  tilt={true}
                  maxTilt={8}
                  spotlightColor={
                    idx % 2 === 0
                      ? "rgba(223, 30, 38, 0.12)"
                      : "rgba(7, 64, 92, 0.12)"
                  }
                  data-cursor-text="Feature"
                  className="card-lift-3d group relative flex h-full flex-col justify-between overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-6 lg:p-7 text-left shadow-[0_4px_20px_rgba(7,64,92,0.05)] cursor-default"
                >
                  <BorderBeam
                    size={140}
                    duration={8}
                    delay={idx * 1.2}
                    colorFrom={idx % 2 === 0 ? "#DF1E26" : "#07405C"}
                    colorTo={idx % 2 === 0 ? "#38bdf8" : "#DF1E26"}
                  />
                  {/* Subtle top brand accent line with glowing aura on hover */}
                  <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#DF1E26] via-[#CA164B] to-[#07405C] opacity-25 group-hover:opacity-100 transition-opacity duration-300" />

                  <div>
                    <div className="flex items-center justify-between">
                      {/* Icon Container with subtle brand accent transitioning to gradient on hover */}
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#07405C]/8 to-[#024D72]/4 border border-[#07405C]/12 text-[#07405C] shadow-2xs transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 group-hover:bg-gradient-to-r group-hover:from-[#F44246] group-hover:to-[#CA164B] group-hover:text-white group-hover:border-transparent group-hover:shadow-md">
                        <Icon
                          size={22}
                          className="transition-transform duration-300 group-hover:scale-110"
                        />
                      </div>

                      <span className="text-xs font-bold text-slate-300 group-hover:text-[#07405C]/60 group-hover:scale-110 transition-all">
                        0{idx + 1}
                      </span>
                    </div>

                    <h3 className="mt-4 text-base sm:text-lg font-bold text-[#101010] transition-colors duration-200 group-hover:text-[#07405C]">
                      {feature.title}
                    </h3>

                    <p className="mt-2 text-xs sm:text-sm leading-relaxed text-slate-600">
                      {feature.description}
                    </p>
                  </div>
                </SpotlightCard>
              </motion.div>
            );
          })}
        </ScrollReveal>
      </div>

      {/* Curved SVG Wave Divider to Where Students Work */}
      <WaveDivider
        type="wave"
        fill="#024D72"
        glow={true}
        className="-mb-14 sm:-mb-20 mt-12 sm:mt-16 z-20 relative"
      />
    </section>
  );
};

export default WhyChooseUs;
