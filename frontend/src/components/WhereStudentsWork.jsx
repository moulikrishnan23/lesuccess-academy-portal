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
  <div className="inline-flex h-21 w-48.5 mx-2 items-center justify-center rounded-lg border border-[#d5dfe8] bg-white px-4">
    <img
      src={company.logo}
      alt={company.name}
      className="max-h-14.5 max-w-41.25 object-contain"
    />
  </div>
);

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
          Where do our{" "}
          <span className="text-[#d62552]">Students Work?</span>
        </h2>
      </div>

      {/* Row 1 */}
      <marquee
        direction="left"
        scrollamount="6"
        behavior="scroll"
        className="mb-10"
      >
        {companiesRow1.map((company, index) => (
          <CompanyCard key={`one-${index}`} company={company} />
        ))}

        {/* Duplicate for loop */}
        {companiesRow1.map((company, index) => (
          <CompanyCard key={`one-copy-${index}`} company={company} />
        ))}
      </marquee>

      {/* Row 2 */}
      <marquee
        direction="right"
        scrollamount="6"
        behavior="scroll"
      >
        {companiesRow2.map((company, index) => (
          <CompanyCard key={`two-${index}`} company={company} />
        ))}

        {/* Duplicate for loop */}
        {companiesRow2.map((company, index) => (
          <CompanyCard key={`two-copy-${index}`} company={company} />
        ))}
      </marquee>

    </section>
  );
};

export default WhereStudentsWork;