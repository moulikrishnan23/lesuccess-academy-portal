import { motion } from "framer-motion";
import { fadeUp, motionSafe, ONCE_IN_VIEW } from "../animations/variants.js";
import useReducedMotion from "../hooks/useReducedMotion.js";

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

/* Duplicate each row once for a seamless infinite loop */
const row1Loop = [...companiesRow1, ...companiesRow1];
const row2Loop = [...companiesRow2, ...companiesRow2];

const CompanyCard = ({ company }) => (
  <div className="inline-flex h-21 w-48.5 mx-2 shrink-0 items-center justify-center rounded-lg border border-[#d5dfe8] bg-white px-4">
    <img
      src={company.logo}
      alt={company.name}
      className="max-h-14.5 max-w-41.25 object-contain"
    />
  </div>
);

const WhereStudentsWork = () => {
  const reduced = useReducedMotion();
  return (
    <section className="overflow-hidden bg-white py-14">

      {/* Heading */}
      <div className="mb-10 flex flex-col items-center">
        <motion.div
          variants={motionSafe(fadeUp, reduced)}
          initial="hidden"
          whileInView="visible"
          viewport={ONCE_IN_VIEW}
          className="flex flex-col items-center"
        >
          <div className="mb-5 flex items-center gap-2 rounded-full border border-[#07405C] px-3 py-1.5 text-xs font-medium uppercase text-[#07405C]">
            <span className="h-2 w-2 rounded-full bg-[#07405C]" />
            Our Alumni
          </div>

          <h2 className="text-center text-[32px] font-bold text-[#111] md:text-[40px]">
            Where do our{" "}
            <span className="text-[#DF1E26]">Students Work?</span>
          </h2>
        </motion.div>
      </div>

      {/* Row 1 — scrolls left */}
      <div className="relative mb-6 flex overflow-hidden">
        <div
          className="flex w-max"
          style={{
            animation: reduced
              ? "none"
              : "wsScrollLeft 28s linear infinite",
          }}
        >
          {row1Loop.map((company, index) => (
            <CompanyCard key={`one-${index}`} company={company} />
          ))}
        </div>
      </div>

      {/* Row 2 — scrolls right */}
      <div className="relative flex overflow-hidden">
        <div
          className="flex w-max"
          style={{
            animation: reduced
              ? "none"
              : "wsScrollRight 32s linear infinite",
          }}
        >
          {row2Loop.map((company, index) => (
            <CompanyCard key={`two-${index}`} company={company} />
          ))}
        </div>
      </div>

      {/* CSS keyframes for the two scroll directions */}
      <style>{`
        @keyframes wsScrollLeft {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes wsScrollRight {
          0%   { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
      `}</style>

    </section>
  );
};

export default WhereStudentsWork;