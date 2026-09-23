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
  <div className="inline-flex h-[88px] w-[200px] mx-2.5 shrink-0 items-center justify-center rounded-2xl border border-slate-200/80 bg-white px-5 shadow-xs hover:shadow-md hover:border-[#DF1E26]/30 transition-all duration-300">
    <img
      src={getImageUrl(company.logo || company.logoUrl, '/assets/companies/lavendel.png')}
      alt={company.name}
      className="max-h-[52px] max-w-[160px] object-contain transition-transform duration-300 hover:scale-105"
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
    <section className="overflow-hidden bg-white py-14">
      {/* Heading */}
      <div className="mb-12 flex flex-col items-center">
        <div className="mb-4 flex items-center gap-2 rounded-full border border-[#07405C]/30 bg-[#07405C]/5 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-[#07405C]">
          <span className="h-2 w-2 rounded-full bg-[#07405C]" />
          Our Alumni & Hiring Partners
        </div>

        <h2 className="text-center text-3xl font-extrabold text-[#101010] md:text-4xl tracking-tight">
          Where Do Our <span className="text-[#DF1E26]">Students Work?</span>
        </h2>
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
