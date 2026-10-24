import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import useReducedMotion from "../../hooks/useReducedMotion.js";

/**
 * Multi-Plane Parallax Layer.
 * Allows foreground or background elements to travel at differential speeds
 * relative to page scroll, generating distinct depth perception.
 */
export default function ParallaxLayer({
  children,
  speed = 0.3, // -1 to 1: negative floats upward faster, positive floats downward
  range = 60, // Maximum pixel displacement
  direction = "vertical", // 'vertical' | 'horizontal'
  rotate = 0, // Optional slight rotation shift (-10 to 10 deg)
  className = "",
  style = {},
  ...props
}) {
  const ref = useRef(null);
  const reduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const delta = speed * range;
  const translation = useTransform(scrollYProgress, [0, 1], [-delta, delta]);
  const rotation = useTransform(scrollYProgress, [0, 1], [-rotate, rotate]);

  if (reduced) {
    return (
      <div className={className} style={style} {...props}>
        {children}
      </div>
    );
  }

  const motionStyle = {
    ...style,
    ...(direction === "vertical" ? { y: translation } : { x: translation }),
    ...(rotate !== 0 ? { rotate: rotation } : {}),
  };

  return (
    <motion.div
      ref={ref}
      style={motionStyle}
      className={`will-change-transform ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
}
