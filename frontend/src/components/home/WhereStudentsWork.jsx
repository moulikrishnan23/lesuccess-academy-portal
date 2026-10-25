import { useState, useEffect } from "react";
import apiClient from "../../services/apiClient.js";
import { getImageUrl } from "../../utils/imageUtils.js";
import SectionHead from "./SectionHead.jsx";
import { Marquee } from "../motion/index.js";

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

const logoCards = (companies, row) =>
  companies.map((company, i) => (
    <div key={`${row}-${company.id ?? company.name}-${i}`} className="lh-logo" data-cursor-text="Partner">
      <img
        src={getImageUrl(company.logo || company.logoUrl, "/assets/companies/lavendel.png", { width: 400 })}
        alt={company.name}
        loading="lazy"
      />
    </div>
  ));

/**
 * "Where Do Our Students Work?" (spec: docs/mockup/lower-home.html, #partners):
 * two logo rows drifting in opposite directions. Companies come from
 * /api/companies (row 1 / row 2 as set in the admin panel), with the built-in
 * list as the fallback while it loads or when it is empty.
 */
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
    <section id="partners" className="lh-sec lh-soft" style={{ paddingBottom: "4rem" }}>
      <div className="lh-wrap">
        <SectionHead
          center
          badge="Our Alumni & Hiring Partners"
          title="Where Do Our Students"
          highlight="Work?"
          lead="Leading tech enterprises and top hiring partners trust LeSuccess Academy alumni for critical industry roles."
        />
      </div>
      <Marquee alwaysMove label="Hiring partners" speed={38} items={logoCards(row1, "a")} />
      <div style={{ marginTop: "1rem" }}>
        <Marquee alwaysMove reverse label="More hiring partners" speed={44} items={logoCards(row2, "b")} />
      </div>
    </section>
  );
};

export default WhereStudentsWork;
