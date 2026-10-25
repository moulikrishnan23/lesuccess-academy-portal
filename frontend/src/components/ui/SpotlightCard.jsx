import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import useReducedMotion from "../../hooks/useReducedMotion.js";

/**
 * Interactive Spotlight Card (inspired by Stripe, Linear & Cloudious).
 * Tracks the cursor dynamically across the card surface to render a luminous
 * radial glow and subtle 3D tilt that brings interactive cards alive.
 */
export default function SpotlightCard({
  children,
  className = "",
  spotlightColor = "rgba(223, 30, 38, 0.12)",
  tilt = true,
  maxTilt = 7,
  ...props
}) {
  const reduced = useReducedMotion();
  const cardRef = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });

  const handleMouseMove = useCallback(
    (e) => {
      if (!cardRef.current || reduced) return;
      const rect = cardRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      setPosition({ x, y });
      setOpacity(1);

      if (tilt) {
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * -maxTilt;
        const rotateY = ((x - centerX) / centerX) * maxTilt;
        setRotate({ x: rotateX, y: rotateY });
      }
    },
    [reduced, tilt, maxTilt],
  );

  const handleMouseLeave = useCallback(() => {
    setOpacity(0);
    setRotate({ x: 0, y: 0 });
  }, []);

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={
        reduced || !tilt
          ? {}
          : {
              rotateX: rotate.x,
              rotateY: rotate.y,
            }
      }
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      style={{ transformStyle: "preserve-3d" }}
      className={`relative overflow-hidden ${className}`}
      {...props}
    >
      {/* Radial Spotlight Overlay following mouse */}
      {!reduced && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -inset-px transition-opacity duration-300 z-10"
          style={{
            opacity,
            background: `radial-gradient(450px circle at ${position.x}px ${position.y}px, ${spotlightColor}, transparent 80%)`,
          }}
        />
      )}
      {children}
    </motion.div>
  );
}
