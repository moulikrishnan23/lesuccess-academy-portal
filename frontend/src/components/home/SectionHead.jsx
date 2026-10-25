import { useRef } from "react";
import { Reveal, useInView, useReducedMotion } from "../motion/index.js";

/**
 * The lower-home section header (spec: docs/mockup/lower-home.html, .sec-head):
 * a tinted badge with a gradient dot, a headline whose words rise out of a mask
 * one after another, and a lead paragraph. Styles: lower-home.css.
 *
 * `highlight` is appended to `title` in the brand gradient. `children` renders
 * under the lead (a rating pill, a photo count).
 */
export default function SectionHead({
  badge,
  title,
  highlight,
  lead,
  center = false,
  as: Heading = "h2",
  className = "",
  children,
}) {
  const headingRef = useRef(null);
  const reduced = useReducedMotion();
  const inView = useInView(headingRef, { threshold: 0.3 });

  const words = [
    ...title.split(" ").map((word) => ({ word, accent: false })),
    ...(highlight ? highlight.split(" ").map((word) => ({ word, accent: true })) : []),
  ];

  return (
    <Reveal className={`lh-head${center ? " lh-head--center" : ""}${className ? ` ${className}` : ""}`}>
      {badge && <span className="lh-badge">{badge}</span>}
      <Heading
        ref={headingRef}
        aria-label={highlight ? `${title} ${highlight}` : title}
        className={`lh-h2 lh-split${reduced || inView ? " is-in" : ""}`}
      >
        {words.map(({ word, accent }, i) => (
          <span key={i} aria-hidden="true">
            <span className="lh-wd" style={{ "--w": i }}>
              <span className={accent ? "lh-grad-text" : undefined}>{word}</span>
            </span>
            {i < words.length - 1 ? " " : null}
          </span>
        ))}
      </Heading>
      {lead && <p className="lh-lead">{lead}</p>}
      {children}
    </Reveal>
  );
}
