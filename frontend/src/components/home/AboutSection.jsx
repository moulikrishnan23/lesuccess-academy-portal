import { motion } from "framer-motion";
import aboutImage from "../../assets/home/about.png";
import {
  Award,
  UserCheck,
  Briefcase,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";
import ScrollReveal from "../../animations/ScrollReveal.jsx";
import { FloatingOrbs, FloatingTechBadge } from "../ui/BackgroundMotion.jsx";
import SpotlightCard from "../ui/SpotlightCard.jsx";
import Magnetic from "../ui/Magnetic.jsx";
import BorderBeam from "../ui/BorderBeam.jsx";
import ParallaxImage from "../ui/ParallaxImage.jsx";
import ParallaxLayer from "../ui/ParallaxLayer.jsx";

const AboutSection = () => {
  return (
    <section
      id="about-section"
      className="relative w-full bg-[#F5F8FC] px-6 py-12 sm:py-16 lg:py-20 overflow-hidden transition-colors duration-200"
    >
      {/* Subtle Background Motion */}
      <FloatingOrbs variant="default" />

      <div className="relative z-10 mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-2 lg:gap-14">
        {/* Image Frame with Stanford-style Hover Depth and Floating Experience Shield */}
        <ScrollReveal
          preset="perspective"
          direction="left"
          className="relative group"
        >
          {/* Animated Ambient Light Aura */}
          <div className="absolute -inset-4 rounded-3xl bg-gradient-to-tr from-[#DF1E26]/25 via-[#07405C]/20 to-cyan-500/15 opacity-70 blur-xl transition-all duration-700 group-hover:opacity-100 group-hover:scale-105" />

          <div className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-2xl max-h-[380px] sm:max-h-[420px] lg:max-h-[440px]">
            <ParallaxImage
              src={aboutImage}
              alt="LeSuccess Team"
              speed={0.22}
              scale={1.2}
              containerClassName="h-full w-full max-h-[380px] sm:max-h-[420px] lg:max-h-[440px]"
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              overlay={
                <div className="absolute inset-0 bg-gradient-to-t from-[#07405C]/40 via-transparent to-transparent opacity-60" />
              }
            />
          </div>

          {/* Floating Experience Shield with Parallax Depth */}
          <ParallaxLayer
            speed={-0.35}
            range={40}
            className="absolute -bottom-5 -right-3 sm:-bottom-6 sm:-right-6 z-20"
          >
            <FloatingTechBadge
              icon={Sparkles}
              title="10+ Years Excellence"
              subtitle="Premier Tech Training"
              accentColor="brand"
              className="shadow-2xl"
              duration={4.8}
              yOffset={10}
            />
          </ParallaxLayer>
        </ScrollReveal>

        {/* Content */}
        <ScrollReveal preset="hop" direction="right">
          {/* Eyebrow Label */}
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#07405C]/30 bg-[#07405C]/5 px-3.5 py-1 transition hover:bg-[#07405C]/10">
            <span className="h-2 w-2 rounded-full bg-[#DF1E26] animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#07405C]">
              About LeSuccess
            </span>
          </div>

          {/* Heading */}
          <h2 className="text-3xl font-extrabold leading-tight sm:text-4xl lg:text-[2.65rem] text-[#101010] tracking-tight">
            <span className="text-[#DF1E26]">No.1 IT Training</span> Institute
            <br />
            in <span className="text-[#07405C]">Coimbatore</span>
          </h2>

          {/* Description */}
          <p className="mt-3.5 text-sm sm:text-base leading-relaxed text-slate-600">
            LeSuccess is a premier talent development and placement firm
            connecting ambitious learners with top industry opportunities
            through hands-on project training, dedicated mentorship, and direct
            recruitment pathways.
          </p>

          {/* Feature Highlights Bento with 3D Hover & Glowing Accents */}
          <ScrollReveal
            preset="hop"
            staggerChildren={true}
            className="mt-6 sm:mt-7 grid grid-cols-1 gap-3.5 sm:grid-cols-3"
          >
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 25, scale: 0.95 },
                visible: { opacity: 1, y: 0, scale: 1 },
              }}
              className="h-full"
            >
              <SpotlightCard
                tilt={true}
                maxTilt={9}
                spotlightColor="rgba(223, 30, 38, 0.14)"
                className="card-lift-3d group relative h-full overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-4 shadow-[0_4px_16px_rgba(7,64,92,0.06)] cursor-default"
              >
                <BorderBeam
                  size={130}
                  duration={7}
                  delay={0}
                  colorFrom="#DF1E26"
                  colorTo="#38bdf8"
                />
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#DF1E26] to-[#07405C] opacity-30 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#DF1E26]/10 to-[#CA164B]/5 border border-[#DF1E26]/15 text-[#DF1E26] mb-3 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 group-hover:bg-gradient-to-r group-hover:from-[#DF1E26] group-hover:to-[#CA164B] group-hover:text-white group-hover:border-transparent group-hover:shadow-md">
                  <Award size={19} />
                </div>
                <h4 className="text-xs sm:text-sm font-bold text-[#101010] transition-colors group-hover:text-[#07405C]">
                  Industry Aligned
                </h4>
                <p className="text-[11px] sm:text-xs text-slate-500 mt-1 leading-relaxed">
                  Production-ready syllabus
                </p>
              </SpotlightCard>
            </motion.div>

            <motion.div
              variants={{
                hidden: { opacity: 0, y: 25, scale: 0.95 },
                visible: { opacity: 1, y: 0, scale: 1 },
              }}
              className="h-full"
            >
              <SpotlightCard
                tilt={true}
                maxTilt={9}
                spotlightColor="rgba(7, 64, 92, 0.14)"
                className="card-lift-3d group relative h-full overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-4 shadow-[0_4px_16px_rgba(7,64,92,0.06)] cursor-default"
              >
                <BorderBeam
                  size={130}
                  duration={7}
                  delay={2}
                  colorFrom="#07405C"
                  colorTo="#DF1E26"
                />
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#DF1E26] to-[#07405C] opacity-30 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#DF1E26]/10 to-[#CA164B]/5 border border-[#DF1E26]/15 text-[#DF1E26] mb-3 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 group-hover:bg-gradient-to-r group-hover:from-[#DF1E26] group-hover:to-[#CA164B] group-hover:text-white group-hover:border-transparent group-hover:shadow-md">
                  <UserCheck size={19} />
                </div>
                <h4 className="text-xs sm:text-sm font-bold text-[#101010] transition-colors group-hover:text-[#07405C]">
                  Expert Mentors
                </h4>
                <p className="text-[11px] sm:text-xs text-slate-500 mt-1 leading-relaxed">
                  1-on-1 code reviews
                </p>
              </SpotlightCard>
            </motion.div>

            <motion.div
              variants={{
                hidden: { opacity: 0, y: 25, scale: 0.95 },
                visible: { opacity: 1, y: 0, scale: 1 },
              }}
              className="h-full"
            >
              <SpotlightCard
                tilt={true}
                maxTilt={9}
                spotlightColor="rgba(223, 30, 38, 0.14)"
                className="card-lift-3d group relative h-full overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-4 shadow-[0_4px_16px_rgba(7,64,92,0.06)] cursor-default"
              >
                <BorderBeam
                  size={130}
                  duration={7}
                  delay={4}
                  colorFrom="#DF1E26"
                  colorTo="#10b981"
                />
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#DF1E26] to-[#07405C] opacity-30 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#DF1E26]/10 to-[#CA164B]/5 border border-[#DF1E26]/15 text-[#DF1E26] mb-3 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 group-hover:bg-gradient-to-r group-hover:from-[#DF1E26] group-hover:to-[#CA164B] group-hover:text-white group-hover:border-transparent group-hover:shadow-md">
                  <Briefcase size={19} />
                </div>
                <h4 className="text-xs sm:text-sm font-bold text-[#101010] transition-colors group-hover:text-[#07405C]">
                  Placement Cell
                </h4>
                <p className="text-[11px] sm:text-xs text-slate-500 mt-1 leading-relaxed">
                  Interview drives support
                </p>
              </SpotlightCard>
            </motion.div>
          </ScrollReveal>

          {/* CTA Buttons with Shimmer & Glow */}
          <div className="mt-7 sm:mt-8 flex flex-wrap gap-3.5 items-center">
            <Magnetic strength={0.25}>
              <Link
                to="/about"
                data-cursor-text="About"
                className="animate-shimmer-sweep btn-glow-brand group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#F44246] to-[#CA164B] px-6 py-2.5 text-sm font-bold text-white shadow-md transition hover:brightness-105 active:scale-98 cursor-pointer"
              >
                <span>Know More</span>
                <ArrowRight
                  size={15}
                  className="transition-transform duration-200 group-hover:translate-x-1"
                />
              </Link>
            </Magnetic>

            <Magnetic strength={0.25}>
              <Link
                to="/gallery"
                data-cursor-text="Gallery"
                className="btn-glow-navy inline-flex items-center gap-2 rounded-xl border border-[#07405C] bg-white px-6 py-2.5 text-sm font-bold text-[#07405C] shadow-xs transition hover:bg-[#07405C] hover:text-white active:scale-98 cursor-pointer"
              >
                <span>See Campus Gallery</span>
              </Link>
            </Magnetic>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default AboutSection;
