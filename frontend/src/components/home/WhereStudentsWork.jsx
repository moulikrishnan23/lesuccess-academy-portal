import { useState, useEffect } from "react";
import apiClient from "../../services/apiClient.js";
import { getImageUrl } from "../../utils/imageUtils.js";

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
  <div className="inline-flex h-[88px] w-[200px] mx-3 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white px-5 shadow-lg hover:shadow-xl hover:border-[#DF1E26]/50 hover:scale-[1.02] transition-all duration-300">
    <img
      src={getImageUrl(company.logo || company.logoUrl, '/assets/companies/lavendel.png')}
      alt={company.name}
      className="max-h-[50px] max-w-[155px] object-contain transition-transform duration-300 hover:scale-105"
    />
  </div>
);

/**
 * A single seamless marquee row with mask-faded edges.
 */
const MarqueeRow = ({ companies, direction = "left", duration = 30 }) => {
  return (
    <div className="group relative w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
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
    <section className="relative overflow-hidden bg-gradient-to-b from-[#024D72] via-[#07405C] to-[#022a3d] py-16 sm:py-20 transition-colors duration-200">
      {/* Subtle brand glow decorations */}
      <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-[#DF1E26]/15 blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-[#024D72]/40 blur-[100px] pointer-events-none" />

      {/* Heading */}
      <div className="relative z-10 mb-12 flex flex-col items-center px-4">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white backdrop-blur-md shadow-sm">
          <span className="h-2 w-2 rounded-full bg-[#DF1E26] animate-pulse" />
          Our Alumni & Hiring Partners
        </div>

        <h2 className="text-center font-display text-3xl font-extrabold text-white md:text-4xl lg:text-5xl tracking-tight">
          Where Do Our <span className="bg-gradient-to-r from-[#F44246] to-[#CA164B] bg-clip-text text-transparent">Students Work?</span>
        </h2>
        <p className="mt-3 text-center text-sm sm:text-base text-slate-200 max-w-2xl">
          Leading tech enterprises and top hiring partners trust LeSuccess Academy alumni for critical industry roles.
        </p>
      </div>

      {/* Row 1 - scrolls left continuously */}
      <div className="mb-6">
        <MarqueeRow companies={row1} direction="left" duration={28} />
      </div>

      {/* Row 2 - scrolls right continuously */}
      <MarqueeRow companies={row2} direction="right" duration={28} />

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
