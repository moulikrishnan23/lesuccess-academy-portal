import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import useReducedMotion from "../../hooks/useReducedMotion.js";

/**
 * High-performance Parallax Image Component.
 * Inspired by Cloudious & Stanford visual editorial experiences.
 * Smoothly shifts the image vertically inside an overflow-hidden viewport as the user scrolls,
 * creating multi-plane photographic depth.
 */
export default function ParallaxImage({
  src,
  alt = "",
  className = "",
  containerClassName = "",
  speed = 0.2, // Parallax depth factor (0.1 = subtle, 0.35 = deep)
  scale = 1.18, // Overscale to ensure no blank edges show during translation
  overlay = null,
  ...props
}) {
  const containerRef = useRef(null);
  const reduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  // Calculate percentage shift for smooth hardware-accelerated transform
  const shiftPct = speed * 100;
  const y = useTransform(
    scrollYProgress,
    [0, 1],
    [`-${shiftPct}%`, `${shiftPct}%`],
  );

  if (reduced) {
    return (
      <div className={`relative overflow-hidden ${containerClassName}`}>
        <img
          src={src}
          alt={alt}
          className={`h-full w-full object-cover ${className}`}
          {...props}
        />
        {overlay}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${containerClassName}`}
    >
      <motion.img
        src={src}
        alt={alt}
        style={{
          y,
          scale,
        }}
        className={`h-full w-full object-cover will-change-transform ${className}`}
        {...props}
      />
      {overlay}
    </div>
  );
}
