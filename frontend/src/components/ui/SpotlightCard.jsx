import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import useReducedMotion from "../../hooks/useReducedMotion.js";

/**
 * Interactive Spotlight Card: a subtle 3D tilt toward the cursor plus the
 * site's card glow, the same brand-red `.motion-spot` light the Home cards use
 * (motion.css; App moves it to the pointer for every card on the site).
 *
 * `spotlightColor` is kept for existing callers but only picks the glow
 * strength: callers pass white for cards on navy or brand-gradient surfaces,
 * where the red glow needs more strength to read, as on the Home navy card.
 */
export default function SpotlightCard({
  children,
  className = "",
  spotlightColor = "",
  tilt = true,
  maxTilt = 7,
  style,
  ...props
}) {
  const reduced = useReducedMotion();
  const cardRef = useRef(null);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const onColour = /255,\s*255,\s*255/.test(spotlightColor);

  const handleMouseMove = useCallback(
    (e) => {
      if (!cardRef.current || reduced || !tilt) return;
      const rect = cardRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      setRotate({
        x: ((y - centerY) / centerY) * -maxTilt,
        y: ((x - centerX) / centerX) * maxTilt,
      });
    },
    [reduced, tilt, maxTilt],
  );

  const handleMouseLeave = useCallback(() => setRotate({ x: 0, y: 0 }), []);

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={reduced || !tilt ? {} : { rotateX: rotate.x, rotateY: rotate.y }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      style={{ transformStyle: "preserve-3d", ...(onColour ? { "--spot-strength": "45%" } : null), ...style }}
      className={`motion-spot relative overflow-hidden ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
}
