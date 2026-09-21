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
    <section className="w-full bg-[#F8FAFC] px-6 py-20 sm:px-10 lg:px-20 border-y border-slate-100/80">
      <div className="mx-auto max-w-6xl text-center">
        <motion.div
          variants={motionSafe(fadeUp, reduced)}
          initial="hidden"
          whileInView="visible"
          viewport={ONCE_IN_VIEW}
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-[#07405C]/30 bg-[#07405C]/5 px-4 py-1.5 text-xs font-bold text-[#07405C]">
            <BadgeCheck size={14} className="text-[#07405C]" />
            WHY CHOOSE LESUCCESS
          </span>

          <h2 className="mt-4 text-3xl font-bold sm:text-4xl text-[#101010]">
            Best Features of <span className="text-[#DF1E26]">LeSuccess</span>
          </h2>

          <p className="mx-auto mt-4 max-w-3xl text-base leading-relaxed text-slate-600 sm:text-lg">
            We empower students and professionals with job-ready technical skills, dedicated
            mentor support, and guaranteed interview opportunities.
          </p>
        </motion.div>

        <motion.div
          variants={motionSafe(staggerContainer, reduced)}
          initial="hidden"
          whileInView="visible"
          viewport={ONCE_IN_VIEW}
          className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <motion.div
                key={feature.title}
                variants={motionSafe(fadeUp, reduced)}
                className="group relative flex flex-col items-start rounded-2xl border border-slate-200/90 bg-white p-7 sm:p-8 text-left transition-all duration-300 ease-out hover:-translate-y-2 hover:border-[#DF1E26]/40 hover:shadow-[0_20px_40px_rgba(7,64,92,0.09)] cursor-default"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 border border-slate-200 text-[#07405C] shadow-xs transition-all duration-300 group-hover:bg-gradient-to-r group-hover:from-[#F44246] group-hover:to-[#CA164B] group-hover:text-white group-hover:border-transparent group-hover:shadow-md">
                  <Icon size={22} className="transition-transform duration-300 group-hover:scale-110" />
                </div>

                <h3 className="mt-5 text-lg font-bold text-[#101010] transition-colors duration-200 group-hover:text-[#07405C]">
                  {feature.title}
                </h3>

                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
