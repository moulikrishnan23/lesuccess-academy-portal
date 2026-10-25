import { useEffect } from "react";
import { useReducedMotion } from "../motion/index.js";

/**
 * Dark bands open from an inset, rounded clip as they scroll in (spec:
 * docs/mockup/lower-home.html, .rv). Only a band that starts below the fold is
 * clipped, so nothing already on screen jumps.
 *
 * Toggles `is-clipped` straight on the element: the clip is purely visual, and
 * keeping it out of React state means no re-render and no setState in an effect.
 */
export default function useClipReveal(ref) {
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced || typeof IntersectionObserver === "undefined") return undefined;
    if (el.getBoundingClientRect().top <= window.innerHeight) return undefined;

    el.classList.add("is-clipped");
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.remove("is-clipped");
          io.disconnect();
        }
      },
      { threshold: 0.08, rootMargin: "0px 0px -12% 0px" },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      el.classList.remove("is-clipped");
    };
  }, [ref, reduced]);
}
