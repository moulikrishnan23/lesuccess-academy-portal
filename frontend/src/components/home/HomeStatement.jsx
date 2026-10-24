import { useRef } from "react";
import { useReducedMotion, useScrollProgress } from "../motion/index.js";

const WORDS = ["Learn.", "Educate.", "Succeed."];

/**
 * "Learn. Educate. Succeed." pinned while the visitor scrolls through a tall
 * section (spec: docs/mockup/lower-home.html, #statement). useScrollProgress
 * writes the scroll position to --p on the section and CSS does the rest: each
 * word fills from --p and its own --i (lower-home.css, .lh-sw), so no state
 * changes per frame. Reduced motion shows the finished statement unpinned.
 */
export default function HomeStatement() {
  const ref = useRef(null);
  const reduced = useReducedMotion();
  useScrollProgress(ref, { disabled: reduced });

  return (
    <section ref={ref} id="statement" className="lh-stm">
      <div className="lh-stm-in">
        <h2 aria-label="Learn. Educate. Succeed.">
          {WORDS.map((word, i) => (
            <span key={word} aria-hidden="true">
              <span className="lh-sw" style={{ "--i": i }}>
                {word}
              </span>
              {i < WORDS.length - 1 ? " " : null}
            </span>
          ))}
        </h2>
        <div className="lh-stm-bar" aria-hidden="true">
          <i />
        </div>
        <p>Premier technology learning in Coimbatore, from first line of code to first offer letter.</p>
      </div>
    </section>
  );
}
