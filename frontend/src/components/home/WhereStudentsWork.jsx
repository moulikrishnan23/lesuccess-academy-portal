import { useState, useEffect } from "react";
import apiClient from "../../services/apiClient.js";
import { getImageUrl } from "../../utils/imageUtils.js";
import ScrollReveal from "../../animations/ScrollReveal.jsx";
import { GlowHalo } from "../ui/BackgroundMotion.jsx";
import AnimatedCounter from "../ui/AnimatedCounter.jsx";
import SpotlightCard from "../ui/SpotlightCard.jsx";
import BorderBeam from "../ui/BorderBeam.jsx";
import WaveDivider from "../ui/WaveDivider.jsx";
import { Building2, Award, TrendingUp, Star } from "lucide-react";

const DEFAULT_COMPANIES_ROW1 = [
  { name: "Lavendel Consulting", logo: "/assets/companies/lavendel.png" },
  { name: "Kovan Labs", logo: "/assets/companies/kovan.png" },
  { name: "Memstech", logo: "/assets/companies/memstech.png" },
  { name: "Thoughtlogik", logo: "/assets/companies/thoughtlogik.png" },
  { name: "intrnForte", logo: "/assets/companies/intrnforte.png" },
  { name: "Aximsoft", logo: "/assets/companies/aximsoft.png" },
];

const DEFAULT_COMPANIES_ROW2 = [
  { name: "Walvoil", logo: "/assets/companies/walvoil.png" },
  { name: "Techkay", logo: "/assets/companies/techkay.png" },
  { name: "Innoboon", logo: "/assets/companies/innoboon.png" },
  { name: "Mindenious", logo: "/assets/companies/mindenious.png" },
  { name: "IVA", logo: "/assets/companies/iva.png" },
  { name: "EV", logo: "/assets/companies/ev.png" },
];

const CompanyCard = ({ company }) => (
  <div
    data-cursor-text="Partner"
    className="group/card inline-flex h-[92px] w-[210px] mx-3.5 shrink-0 items-center justify-center rounded-2xl border border-white/30 bg-white/95 px-6 shadow-xl hover:shadow-[0_14px_32px_rgba(223,30,38,0.25)] hover:border-[#DF1E26] hover:-translate-y-2 hover:scale-105 transition-all duration-300 backdrop-blur-md cursor-pointer"
  >
    <img
      src={getImageUrl(
        company.logo || company.logoUrl,
        "/assets/companies/lavendel.png",
      )}
      alt={company.name}
      className="max-h-[52px] max-w-[160px] object-contain transition-transform duration-300 group-hover/card:scale-108"
    />
  </div>
);

/**
 * A single seamless marquee row with mask-faded edges.
 */
const MarqueeRow = ({ companies, direction = "left", duration = 30 }) => {
  return (
    <div className="group relative w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
      <div
        className="flex w-max animate-marquee group-hover:[animation-play-state:paused]"
        style={{
          animationDirection: direction === "right" ? "reverse" : "normal",
          animationDuration: `${duration}s`,
        }}
      >
        {companies.map((company, index) => (
          <CompanyCard key={`a-${index}`} company={company} />
        ))}
        {companies.map((company, index) => (
          <CompanyCard key={`b-${index}`} company={company} />
        ))}
      </div>
    </div>
  );
};

const PLACEMENT_STATS = [
  {
    value: "100%",
    label: "Placement Assistance",
    icon: Award,
    sub: "Dedicated placement cell",
  },
  {
    value: "150+",
    label: "Hiring Partners",
    icon: Building2,
    sub: "Actively hiring tech firms",
  },
  {
    value: "12 LPA",
    label: "Highest Package",
    icon: TrendingUp,
    sub: "Top engineering offers",
  },
  {
    value: "4.9★",
    label: "Student Rating",
    icon: Star,
    sub: "Over 5,000+ graduates",
  },
];

const WhereStudentsWork = () => {
  const [row1, setRow1] = useState(DEFAULT_COMPANIES_ROW1);
  const [row2, setRow2] = useState(DEFAULT_COMPANIES_ROW2);

  useEffect(() => {
    let active = true;
    apiClient
      .get("/api/companies")
      .then((res) => {
        const items = res?.data?.data;
        if (active && Array.isArray(items) && items.length > 0) {
          const r1 = items.filter((c) => c.rowNumber === 1);
          const r2 = items.filter((c) => c.rowNumber === 2);
          if (r1.length > 0) setRow1(r1);
          if (r2.length > 0) setRow2(r2);
        }
      })
      .catch((err) => {
        console.warn("Could not load dynamic companies, using fallback:", err);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#024D72] via-[#07405C] to-[#022a3d] py-18 sm:py-24 transition-colors duration-200">
      {/* Dynamic ambient pulsing halo light sources */}
      <GlowHalo
        color="#DF1E26"
        size="380px"
        opacity={0.22}
        className="-top-20 -left-20"
      />
      <GlowHalo
        color="#00bcd4"
        size="420px"
        opacity={0.2}
        className="-bottom-20 -right-20"
      />

      {/* Heading with Spring Reveal */}
      <ScrollReveal
        preset="hop"
        className="relative z-10 mb-10 flex flex-col items-center px-4"
      >
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white backdrop-blur-md shadow-sm">
          <span className="h-2 w-2 rounded-full bg-[#DF1E26] animate-pulse-beacon" />
          Our Alumni & Hiring Partners
        </div>

        <h2 className="text-center font-display text-3xl font-extrabold text-white md:text-4xl lg:text-5xl tracking-tight">
          Where Do Our{" "}
          <span className="bg-gradient-to-r from-[#F44246] to-[#CA164B] bg-clip-text text-transparent">
            Students Work?
          </span>
        </h2>
        <p className="mt-3 text-center text-sm sm:text-base text-slate-200 max-w-2xl leading-relaxed">
          Leading tech enterprises and top hiring partners trust LeSuccess
          Academy alumni for critical industry roles.
        </p>
      </ScrollReveal>

      {/* Placement Performance Metrics with 3D Tilt & Rollup Counters */}
      <ScrollReveal
        preset="perspective"
        staggerChildren={true}
        staggerDelay={0.08}
        className="relative z-10 mx-auto mb-14 max-w-6xl px-4 grid grid-cols-2 gap-4 sm:grid-cols-4"
      >
        {PLACEMENT_STATS.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="h-full">
              <SpotlightCard
                tilt={true}
                maxTilt={8}
                spotlightColor="rgba(255, 255, 255, 0.16)"
                data-cursor-text="Result"
                className="relative h-full overflow-hidden rounded-2xl border border-white/15 bg-white/10 p-4 sm:p-5 text-center backdrop-blur-md shadow-xl transition-all duration-300 hover:border-white/35 hover:bg-white/15 hover:shadow-2xl cursor-default"
              >
                <BorderBeam
                  size={120}
                  duration={6}
                  delay={idx * 1.5}
                  colorFrom="#DF1E26"
                  colorTo="#38bdf8"
                />
                <div className="mx-auto mb-2.5 flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 text-white shadow-sm transition-transform duration-300 group-hover:scale-110">
                  <Icon size={19} className="text-white" />
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  <AnimatedCounter value={stat.value} duration={2} />
                </div>
                <div className="text-xs sm:text-sm font-semibold text-slate-100 mt-1">
                  {stat.label}
                </div>
                <div className="text-[11px] text-slate-300/80 mt-0.5">
                  {stat.sub}
                </div>
              </SpotlightCard>
            </div>
          );
        })}
      </ScrollReveal>

      {/* Row 1 - scrolls left continuously */}
      <div className="mb-6">
        <MarqueeRow companies={row1} direction="left" duration={28} />
      </div>

      {/* Row 2 - scrolls right continuously */}
      <MarqueeRow companies={row2} direction="right" duration={28} />

      {/* Fluid Wave Divider Transition to Course Catalog */}
      <WaveDivider
        type="wave"
        fill="#F5F8FC"
        glow={true}
        className="-mb-18 sm:-mb-24 mt-12 sm:mt-16 z-20 relative"
      />

      {/* Keyframes for the seamless loop */}
      <style>{`
        @keyframes marquee {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }
        .animate-marquee {
          animation-name: marquee;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-marquee {
            animation: none;
          }
        }
      `}</style>
    </section>
  );
};

export default WhereStudentsWork;
