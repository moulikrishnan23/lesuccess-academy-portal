import { Odometer, Reveal } from "../motion/index.js";
import { SITE_STATS } from "../../data/siteStats.js";
import SectionHead from "./SectionHead.jsx";

const STATS = [
  { value: SITE_STATS.hiringCompanies, suffix: "+", label: "actively hiring tech companies", cursor: "Hiring" },
  { value: SITE_STATS.courses, suffix: "+", label: "courses across full stack, data, cloud and AI", cursor: "Courses" },
  { value: SITE_STATS.googleReviews, suffix: "+", label: "Google reviews from learners", cursor: "Reviews" },
  { value: SITE_STATS.googleRating, suffix: "", label: "average Google rating out of 5", cursor: "Rating" },
];

/**
 * "LeSuccess in numbers" (spec: docs/mockup/lower-home.html, #numbers). Each
 * figure rolls into place digit by digit as it scrolls in. The figures come from
 * data/siteStats.js, which keeps them in step with the rest of the site.
 */
export default function SiteNumbers() {
  return (
    <section id="numbers" className="lh-sec">
      <div className="lh-wrap">
        <SectionHead
          center
          badge="LeSuccess in numbers"
          title="Results You Can"
          highlight="Check"
          lead="The partners, courses and reviews behind every batch, counted up as you scroll."
        />
        <div className="lh-stats">
          {STATS.map((stat, i) => (
            <Reveal key={stat.label} index={i} className="lh-stat" data-cursor-text={stat.cursor}>
              <Odometer value={stat.value} suffix={stat.suffix} className="lh-stat-n" />
              <p>{stat.label}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
