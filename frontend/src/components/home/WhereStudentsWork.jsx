import React from "react";

const companiesRow1 = [
  { name: "Lavendel Consulting", logo: "/assets/companies/lavendel.png" },
  { name: "Kovan Labs", logo: "/assets/companies/kovan.png" },
  { name: "Memstech", logo: "/assets/companies/memstech.png" },
  { name: "Thoughtlogik", logo: "/assets/companies/thoughtlogik.png" },
  { name: "intrnForte", logo: "/assets/companies/intrnforte.png" },
  { name: "Aximsoft", logo: "/assets/companies/aximsoft.png" },
];

const companiesRow2 = [
  { name: "Walvoil", logo: "/assets/companies/walvoil.png" },
  { name: "Techkay", logo: "/assets/companies/techkay.png" },
  { name: "Innoboon", logo: "/assets/companies/innoboon.png" },
  { name: "Mindenious", logo: "/assets/companies/mindenious.png" },
  { name: "IVA", logo: "/assets/companies/iva.png" },
  { name: "EV", logo: "/assets/companies/ev.png" },
];

const CompanyCard = ({ company }) => (
  <div className="inline-flex h-[84px] w-[194px] mx-2 shrink-0 items-center justify-center rounded-lg border border-[#d5dfe8] bg-white px-4">
    <img
      src={company.logo}
      alt={company.name}
      className="max-h-[58px] max-w-[165px] object-contain"
    />
  </div>
);

/**
 * A single seamless marquee row.
 * The track renders the list twice, back to back, and animates
 * from translateX(0) to translateX(-50%). Because the second half
 * is an exact copy of the first, the moment it finishes it looks
 * identical to the starting frame, so the loop never "resets" or jumps -
 * it just keeps flowing continuously in one direction.
 */
const MarqueeRow = ({ companies, direction = "left", duration = 30 }) => {
  return (
    <div className="group relative w-full overflow-hidden">
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
  return (
    <section className="overflow-hidden bg-white py-14">
      {/* Heading */}
      <div className="mb-10 flex flex-col items-center">
        <div className="mb-5 flex items-center gap-2 rounded-full border border-[#005080] px-3 py-1.5 text-xs font-medium uppercase text-[#005080]">
          <span className="h-2 w-2 rounded-full bg-[#005080]" />
          Choose Your Path
        </div>

        <h2 className="text-center text-[32px] font-bold text-[#111] md:text-[40px]">
          Where do our <span className="text-[#d62552]">Students Work?</span>
        </h2>
      </div>

      {/* Row 1 - scrolls left continuously */}
      <div className="mb-6">
        <MarqueeRow companies={companiesRow1} direction="left" duration={28} />
      </div>

      {/* Row 2 - scrolls right continuously */}
      <MarqueeRow companies={companiesRow2} direction="right" duration={28} />

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
