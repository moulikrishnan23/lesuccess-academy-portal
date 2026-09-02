import {
  MessageCircleMore,
  BrainCircuit,
  Ear,
  ArrowUpRight,
  Rocket,
  UsersRound,
  BadgeCheck,
} from "lucide-react";

const features = [
  {
    title: "Career Counseling",
    icon: MessageCircleMore,
    description:
      "Comprehensive guidance to help students choose the right career path and build confidence.",
  },
  {
    title: "Skill Development Programs",
    icon: BrainCircuit,
    description:
      "Industry-focused programs designed to develop practical and job-ready technical skills.",
  },
  {
    title: "Communication Training",
    icon: Ear,
    description:
      "Improve communication, presentation and interview skills to confidently enter the industry.",
  },
  {
    title: "Corporate Transition",
    icon: ArrowUpRight,
    description:
      "Tailored enterprise solutions to upskill your workforce with hands-on labs and workshops.",
  },
  {
    title: "Placement Opportunities",
    icon: Rocket,
    description:
      "Strategic guidance and resources to fast-track your career with industry opportunities.",
  },
  {
    title: "Community Engagement",
    icon: UsersRound,
    description:
      "Build meaningful connections through events, learning communities and professional activities.",
  },
];

const WhyChooseUs = () => {
  return (
    <section className="w-full bg-white px-6 py-16 sm:px-10 lg:px-20">
      <div className="mx-auto max-w-300 text-center">
        <span
          className="inline-flex items-center gap-2 rounded-full border-2 border-[#074a68] px-4 py-2 text-xs font-bold text-[#074a68] transition 
          animate-pulse"
        >
          <BadgeCheck size={14} />
          WHY CHOOSE LESUCCESS
        </span>

        <h2 className="mt-5 text-3xl font-bold sm:text-4xl">
          <span className="text-[#ef334c]">Best features</span>{" "}
          <span className="text-black">of LeSuccess</span>
        </h2>

        <p className="mx-auto mt-6 max-w-5xl text-base text-center leading-7 text-gray-500 sm:text-lg">
          We empower students and professionals with industry-ready skills,
          career guidance and placement support. From training to
          transformation, we help you succeed with confidence in today&apos;s
          competitive world.
        </p>

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <div
                key={feature.title}
                className="flex flex-col items-center rounded-2xl border border-[#074a68] bg-[#f5f8fc] p-8 text-center"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-xl border border-gray-200 bg-white text-[#ef334c]">
                  <Icon size={30} />
                </div>

                <h3 className="mt-6 text-xl font-bold text-[#121a30]">
                  {feature.title}
                </h3>

                <p className="mt-4 text-base leading-7 text-[#53627a]">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
