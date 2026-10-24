import { motion, useScroll, useSpring } from "framer-motion";

/**
 * Global Top Scroll Progress Bar (inspired by Cloudious & premium design systems).
 * Renders an ultra-smooth, glowing laser beam across the top of the viewport
 * showing the user's reading/scroll depth with spring physics.
 */
export default function ScrollProgressBar() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 180,
    damping: 24,
    restDelta: 0.001,
  });

  return (
    <motion.div
      style={{ scaleX }}
      aria-hidden="true"
      className="fixed top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#DF1E26] via-[#CA164B] to-[#07405C] z-[9999] pointer-events-none origin-left shadow-[0_0_14px_rgba(223,30,38,0.75)]"
    />
  );
}
