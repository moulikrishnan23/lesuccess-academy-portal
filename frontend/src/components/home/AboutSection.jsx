import { motion } from "framer-motion";
import aboutImage from "../../assets/home/about.png";
import { Award, UserCheck, Briefcase, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import useReducedMotion from "../../hooks/useReducedMotion.js";
import {
  fadeUp,
  fadeLeft,
  fadeRight,
  staggerContainer,
  motionSafe,
  ONCE_IN_VIEW,
} from "../../animations/variants.js";

const AboutSection = () => {
  const reduced = useReducedMotion();

  return (
    <section id="about-section" className="w-full bg-[#F5F8FC] px-6 py-18 sm:px-10 lg:px-20 overflow-hidden">
      <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-2 lg:gap-16">
        {/* Image Frame */}
        <motion.div
          variants={motionSafe(fadeLeft, reduced)}
          initial="hidden"
          whileInView="visible"
          viewport={ONCE_IN_VIEW}
          className="relative group"
        >
          <div className="absolute -inset-2 rounded-3xl bg-gradient-to-r from-[#DF1E26]/20 to-[#07405C]/20 opacity-70 blur-lg transition duration-500 group-hover:opacity-100" />
          <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xl">
            <img
              src={aboutImage}
              alt="LeSuccess Team"
              className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
            />
          </div>
        </motion.div>

        {/* Content */}
        <motion.div
          variants={motionSafe(fadeRight, reduced)}
          initial="hidden"
          whileInView="visible"
          viewport={ONCE_IN_VIEW}
        >
          {/* Eyebrow Label */}
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#07405C]/30 bg-[#07405C]/5 px-3.5 py-1 transition">
            <span className="h-2 w-2 rounded-full bg-[#07405C]" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#07405C]">
              About LeSuccess
            </span>
          </div>

          {/* Heading */}
          <h2 className="text-3xl font-bold leading-tight sm:text-4xl text-[#101010]">
            <span className="text-[#DF1E26]">No.1 IT Training</span> Institute
            <br />
            in <span className="text-[#101010]">Coimbatore</span>
          </h2>

          {/* Description */}
          <p className="mt-5 text-base sm:text-lg leading-relaxed text-slate-600">
            LeSuccess is a premier talent development and placement firm connecting ambitious
            learners with top industry opportunities through hands-on project training,
            dedicated mentorship, and direct recruitment pathways.
          </p>

          {/* Feature Highlights Bento */}
          <motion.div
            variants={motionSafe(staggerContainer, reduced)}
            initial="hidden"
            whileInView="visible"
            viewport={ONCE_IN_VIEW}
            className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3"
          >
            <motion.div
              variants={motionSafe(fadeUp, reduced)}
              className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-xs hover:border-[#DF1E26]/40 hover:-translate-y-1 transition-all duration-200"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#DF1E26]/10 text-[#DF1E26] mb-3">
                <Award size={20} />
              </div>
              <h4 className="text-sm font-bold text-[#101010]">Industry Aligned</h4>
              <p className="text-xs text-slate-500 mt-1">Production-ready course syllabus</p>
            </motion.div>

            <motion.div
              variants={motionSafe(fadeUp, reduced)}
              className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-xs hover:border-[#DF1E26]/40 hover:-translate-y-1 transition-all duration-200"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#DF1E26]/10 text-[#DF1E26] mb-3">
                <UserCheck size={20} />
              </div>
              <h4 className="text-sm font-bold text-[#101010]">Expert Mentors</h4>
              <p className="text-xs text-slate-500 mt-1">1-on-1 code reviews & guidance</p>
            </motion.div>

            <motion.div
              variants={motionSafe(fadeUp, reduced)}
              className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-xs hover:border-[#DF1E26]/40 hover:-translate-y-1 transition-all duration-200"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#DF1E26]/10 text-[#DF1E26] mb-3">
                <Briefcase size={20} />
              </div>
              <h4 className="text-sm font-bold text-[#101010]">Placement Cell</h4>
              <p className="text-xs text-slate-500 mt-1">Interview drives & resume polish</p>
            </motion.div>
          </motion.div>

          {/* CTA Buttons */}
          <div className="mt-9 flex flex-wrap gap-4 items-center">
            <Link
              to="/about"
              className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#F44246] to-[#CA164B] px-7 py-3 text-sm font-bold text-white shadow-md transition hover:brightness-105 active:scale-98 cursor-pointer"
            >
              <span>Know More</span>
              <ArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-1" />
            </Link>

            <Link
              to="/gallery"
              className="inline-flex items-center gap-2 rounded-xl border border-[#07405C] bg-white px-7 py-3 text-sm font-bold text-[#07405C] shadow-xs transition hover:bg-[#07405C] hover:text-white active:scale-98 cursor-pointer"
            >
              <span>See Campus Gallery</span>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default AboutSection;