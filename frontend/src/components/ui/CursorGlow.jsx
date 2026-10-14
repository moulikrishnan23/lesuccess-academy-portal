import { useEffect, useState } from "react";
import { motion, useSpring } from "framer-motion";
import useReducedMotion from "../../hooks/useReducedMotion.js";

/**
 * Ambient Cursor Glow Follower & Interactive Click Ripple.
 * Inspired by Cloudious & award-winning interactive agency experiences.
 * Smoothly traces cursor position with physics-based springs,
 * and emits a subtle energetic ripple pulse whenever the user clicks.
 * Automatically disabled on touch screens and when reduced motion is preferred.
 */
export default function CursorGlow() {
  const reduced = useReducedMotion();
  const [isPointer, setIsPointer] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(pointer: fine)").matches;
  });
  const [isVisible, setIsVisible] = useState(false);
  const [ripples, setRipples] = useState([]);

  // Smooth springs for cursor coordinates
  const springX = useSpring(-500, { stiffness: 220, damping: 22, mass: 0.5 });
  const springY = useSpring(-500, { stiffness: 220, damping: 22, mass: 0.5 });

  useEffect(() => {
    // Only enable on precise pointing devices (mouse/trackpad), not touchphones
    const mediaQuery = window.matchMedia("(pointer: fine)");
    const handlePointerChange = (e) => setIsPointer(e.matches);
    mediaQuery.addEventListener("change", handlePointerChange);

    return () => mediaQuery.removeEventListener("change", handlePointerChange);
  }, []);

  useEffect(() => {
    if (!isPointer || reduced) return;

    const handleMouseMove = (e) => {
      springX.set(e.clientX);
      springY.set(e.clientY);
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    const handleClick = (e) => {
      const id = Date.now() + Math.random();
      const newRipple = { id, x: e.clientX, y: e.clientY };
      setRipples((prev) => [...prev.slice(-6), newRipple]);

      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== id));
      }, 700);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("click", handleClick, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("click", handleClick);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [isPointer, reduced, isVisible, springX, springY]);

  if (!isPointer || reduced) return null;

  return (
    <>
      {/* 1. Atmospheric Ambient Cursor Glow */}
      {isVisible && (
        <motion.div
          aria-hidden="true"
          style={{
            x: springX,
            y: springY,
            translateX: "-50%",
            translateY: "-50%",
          }}
          className="pointer-events-none fixed top-0 left-0 z-30 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(223,30,38,0.12)_0%,rgba(56,189,248,0.08)_40%,transparent_70%)] blur-2xl transition-opacity duration-300"
        />
      )}

      {/* 2. Tactile Click Ripples */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-40 overflow-hidden"
      >
        {ripples.map((r) => (
          <span
            key={r.id}
            style={{
              left: r.x - 18,
              top: r.y - 18,
            }}
            className="pointer-events-none fixed h-9 w-9 rounded-full border border-[#DF1E26]/60 bg-[#DF1E26]/20 [animation:clickRipple_0.65s_cubic-bezier(0,0,0.2,1)_forwards]"
          />
        ))}
      </div>
    </>
  );
}
