import { useEffect, useRef } from "react";
import { ArrowRight } from "lucide-react";
import { Reveal, useInView, burstConfetti } from "../motion/index.js";

const DOUBTS = [
  "I have no coding background…",
  "Isn’t it too late to start?",
  "Everyone else is already ahead.",
];

/**
 * "Starting from zero?" (spec: docs/mockup/lower-home.html, #zero). Three common
 * worries arrive as chat bubbles, get struck through and dim, then the answer
 * lands with a confetti burst. Bubble timing is CSS (lower-home.css); this only
 * flags the chat as in view and fires the confetti once the answer is up.
 */
export default function StartingFromZero() {
  const chatRef = useRef(null);
  const answerRef = useRef(null);
  const inView = useInView(chatRef, { threshold: 0.35 });

  useEffect(() => {
    if (!inView) return undefined;
    let stop = () => {};
    // The answer bubble starts at 3 x 0.9s and takes 0.7s to land.
    const timer = setTimeout(() => {
      stop = burstConfetti(answerRef.current);
    }, 3800);
    return () => {
      clearTimeout(timer);
      stop();
    };
  }, [inView]);

  return (
    <section id="zero" className="lh-sec lh-soft">
      <div className="lh-wrap lh-zero">
        <Reveal>
          <span className="lh-badge">Starting from zero?</span>
          <h2 className="lh-h2" style={{ margin: "1rem 0" }}>
            That Is Where Most Batches Begin
          </h2>
          <p className="lh-lead">
            You do not need a coding background. Every course starts from the
            basics, with a mentor beside you and live labs from the first week.
          </p>
          <div style={{ marginTop: "1.75rem" }}>
            <a href="#demo-class" className="lh-btn lh-btn-a btn-flow">
              Book Free Demo
              <ArrowRight size={18} className="lh-arr" aria-hidden="true" />
            </a>
          </div>
        </Reveal>

        <div
          ref={chatRef}
          className={`lh-dchat${inView ? " is-in" : ""}`}
          role="list"
          aria-label="Common worries, answered"
        >
          {DOUBTS.map((doubt, i) => (
            <div key={doubt} role="listitem" className="lh-db lh-db--doubt" style={{ "--i": i }}>
              <span>{doubt}</span>
            </div>
          ))}
          <div
            ref={answerRef}
            role="listitem"
            className="lh-db lh-db--answer"
            style={{ "--i": DOUBTS.length }}
          >
            Every batch starts at the basics. You will not be lost.
          </div>
        </div>
      </div>
    </section>
  );
}
