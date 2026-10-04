import { motion } from "framer-motion";
import aboutImage from "../../assets/home/about.png";
import { Award, UserCheck, Briefcase, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import useReducedMotion from "../../hooks/useReducedMotion.js";
import ScrollReveal from "../../animations/ScrollReveal.jsx";
import { FloatingOrbs } from "../ui/BackgroundMotion.jsx";

const AboutSection = () => {
  const reduced = useReducedMotion();

  return (
    <section id="about-section" className="relative w-full bg-[#F5F8FC] px-6 py-10 sm:py-12 lg:py-14 overflow-hidden transition-colors duration-200">
      {/* Subtle Background Motion */}
      <FloatingOrbs variant="default" />

      <div className="relative z-10 mx-auto grid max-w-6xl items-center gap-8 lg:grid-cols-2 lg:gap-12">
        {/* Image Frame */}
        <ScrollReveal direction="left" className="relative group">
          <div className="absolute -inset-2 rounded-3xl bg-gradient-to-r from-[#DF1E26]/20 to-[#07405C]/20 opacity-70 blur-lg transition duration-500 group-hover:opacity-100" />
          <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xl max-h-[360px] sm:max-h-[400px] lg:max-h-[420px]">
            <img
              src={aboutImage}
              alt="LeSuccess Team"
              className="h-full w-full max-h-[360px] sm:max-h-[400px] lg:max-h-[420px] object-cover transition-transform duration-700 hover:scale-105"
            />
          </div>
        </ScrollReveal>

        {/* Content */}
        <ScrollReveal direction="right">
          {/* Eyebrow Label */}
          <div className="mb-2.5 inline-flex items-center gap-2 rounded-full border border-[#07405C]/30 bg-[#07405C]/5 px-3 py-0.5 transition">
            <span className="h-1.5 w-1.5 rounded-full bg-[#07405C]" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#07405C]">
              About LeSuccess
            </span>
          </div>

          {/* Heading */}
          <h2 className="text-2xl font-bold leading-tight sm:text-3xl lg:text-4xl text-[#101010]">
            <span className="text-[#DF1E26]">No.1 IT Training</span> Institute
            <br />
            in <span className="text-[#101010]">Coimbatore</span>
          </h2>

          {/* Description */}
          <p className="mt-3 text-sm sm:text-base leading-relaxed text-slate-600">
            LeSuccess is a premier talent development and placement firm connecting ambitious
            learners with top industry opportunities through hands-on project training,
            dedicated mentorship, and direct recruitment pathways.
          </p>

          {/* Feature Highlights Bento with LeSuccess Card Design System */}
          <ScrollReveal
            staggerChildren={true}
            className="mt-5 sm:mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3"
          >
            <motion.div
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
              className="group relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-3.5 sm:p-4 shadow-[0_4px_16px_rgba(7,64,92,0.05)] hover:border-[#07405C]/35 hover:shadow-[0_12px_28px_rgba(7,64,92,0.1)] hover:-translate-y-1.5 transition-all duration-300 cursor-default"
            >
              <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-[#DF1E26] to-[#07405C] opacity-25 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#DF1E26]/10 to-[#CA164B]/5 border border-[#DF1E26]/15 text-[#DF1E26] mb-2.5 transition-all duration-300 group-hover:scale-105 group-hover:bg-gradient-to-r group-hover:from-[#DF1E26] group-hover:to-[#CA164B] group-hover:text-white group-hover:border-transparent group-hover:shadow-xs">
                <Award size={18} />
              </div>
              <h4 className="text-xs sm:text-sm font-bold text-[#101010] transition-colors group-hover:text-[#07405C]">Industry Aligned</h4>
              <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 leading-relaxed">Production-ready syllabus</p>
            </motion.div>

            <motion.div
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
              className="group relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-3.5 sm:p-4 shadow-[0_4px_16px_rgba(7,64,92,0.05)] hover:border-[#07405C]/35 hover:shadow-[0_12px_28px_rgba(7,64,92,0.1)] hover:-translate-y-1.5 transition-all duration-300 cursor-default"
            >
              <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-[#DF1E26] to-[#07405C] opacity-25 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#DF1E26]/10 to-[#CA164B]/5 border border-[#DF1E26]/15 text-[#DF1E26] mb-2.5 transition-all duration-300 group-hover:scale-105 group-hover:bg-gradient-to-r group-hover:from-[#DF1E26] group-hover:to-[#CA164B] group-hover:text-white group-hover:border-transparent group-hover:shadow-xs">
                <UserCheck size={18} />
              </div>
              <h4 className="text-xs sm:text-sm font-bold text-[#101010] transition-colors group-hover:text-[#07405C]">Expert Mentors</h4>
              <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 leading-relaxed">1-on-1 code reviews</p>
            </motion.div>

            <motion.div
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
              className="group relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-3.5 sm:p-4 shadow-[0_4px_16px_rgba(7,64,92,0.05)] hover:border-[#07405C]/35 hover:shadow-[0_12px_28px_rgba(7,64,92,0.1)] hover:-translate-y-1.5 transition-all duration-300 cursor-default"
            >
              <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-[#DF1E26] to-[#07405C] opacity-25 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#DF1E26]/10 to-[#CA164B]/5 border border-[#DF1E26]/15 text-[#DF1E26] mb-2.5 transition-all duration-300 group-hover:scale-105 group-hover:bg-gradient-to-r group-hover:from-[#DF1E26] group-hover:to-[#CA164B] group-hover:text-white group-hover:border-transparent group-hover:shadow-xs">
                <Briefcase size={18} />
              </div>
              <h4 className="text-xs sm:text-sm font-bold text-[#101010] transition-colors group-hover:text-[#07405C]">Placement Cell</h4>
              <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 leading-relaxed">Interview drives support</p>
            </motion.div>
          </ScrollReveal>

          {/* CTA Buttons */}
          <div className="mt-6 sm:mt-7 flex flex-wrap gap-3.5 items-center">
            <Link
              to="/about"
              className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#F44246] to-[#CA164B] px-6 py-2.5 text-sm font-bold text-white shadow-md transition hover:brightness-105 active:scale-98 cursor-pointer"
            >
              <span>Know More</span>
              <ArrowRight size={15} className="transition-transform duration-200 group-hover:translate-x-1" />
            </Link>

            <Link
              to="/gallery"
              className="inline-flex items-center gap-2 rounded-xl border border-[#07405C] bg-white px-6 py-2.5 text-sm font-bold text-[#07405C] shadow-xs transition hover:bg-[#07405C] hover:text-white active:scale-98 cursor-pointer"
            >
              <span>See Campus Gallery</span>
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default AboutSection;