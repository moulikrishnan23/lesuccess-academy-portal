import { useEffect, useRef } from "react";
import { useReducedMotion } from "../motion/index.js";

const PHRASES = [
  "Live hands-on projects",
  "Mentor-led classes",
  "Placement support",
  "Mock interviews",
  "Offline & online",
  "Interview opportunities",
];

// One group is repeated so it is always wider than the screen; the track holds
// two identical groups and wraps by exactly one group width, so the loop is seamless.
const GROUP = [...PHRASES, ...PHRASES];

const BASE_SPEED = 70; // px per second while the page is still
const CALM_SPEED = 35; // px per second under reduced motion
const SCROLL_GAIN = 0.6; // extra px/s of ticker per px/s of page scroll
const MAX_SPEED = 900;

/**
 * A slanted navy band of course highlights between the demo band and the
 * course carousel (spec: docs/mockup/lower-home.html, .tick).
 *
 * Always scrolling (a deliberate exception to the site's reduced-motion rule,
 * requested for this band): it runs on its own, speeds up while the visitor
 * scrolls and runs backwards when they scroll back up. Under reduced motion it
 * keeps a slow, steady pace with no scroll boost. It never stops. The loop
 * writes the offset straight to the track (no React state) and only runs while
 * the band is on screen.
 *
 * Decorative: every phrase is said elsewhere on the page, so it is hidden from
 * screen readers.
 */
export default function HomeTicker() {
  const bandRef = useRef(null);
  const trackRef = useRef(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const band = bandRef.current;
    const track = trackRef.current;
    if (!band || !track || typeof IntersectionObserver === "undefined") return undefined;

    const base = reduced ? CALM_SPEED : BASE_SPEED;
    let frame = 0;
    let running = false;
    let offset = 0;
    let direction = 1;
    let speed = base;
    let lastTime = 0;
    let lastScroll = window.scrollY;

    const tick = (now) => {
      const dt = Math.min(0.05, (now - (lastTime || now)) / 1000);
      lastTime = now;

      const scrollY = window.scrollY;
      const scrolled = scrollY - lastScroll;
      lastScroll = scrollY;
      if (!reduced && scrolled !== 0) direction = scrolled > 0 ? 1 : -1;

      // Ease toward the base speed plus a share of the scroll velocity. It
      // never drops below the base speed, so the band is always moving.
      const scrollVelocity = reduced ? 0 : Math.abs(scrolled) / Math.max(dt, 0.001);
      const target = Math.min(MAX_SPEED, base + scrollVelocity * SCROLL_GAIN);
      speed += (target - speed) * 0.12;

      const group = track.scrollWidth / 2;
      if (group > 0) {
        offset = (offset + direction * speed * dt) % group;
        if (offset < 0) offset += group;
        track.style.transform = `translate3d(${-offset}px, 0, 0)`;
      }
      frame = requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !running) {
        running = true;
        lastTime = 0;
        lastScroll = window.scrollY;
        frame = requestAnimationFrame(tick);
      } else if (!entry.isIntersecting && running) {
        running = false;
        cancelAnimationFrame(frame);
      }
    });
    io.observe(band);

    return () => {
      io.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [reduced]);

  return (
    <div ref={bandRef} className="lh-tick" aria-hidden="true">
      <div ref={trackRef} className="lh-tick-track">
        {[0, 1].map((copy) => (
          <div key={copy} className="lh-tick-group">
            {GROUP.map((phrase, i) => (
              <span key={i}>{phrase}</span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
