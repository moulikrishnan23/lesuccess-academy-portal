import { useEffect } from "react";
import { motion } from "framer-motion";
import useReducedMotion from "../../hooks/useReducedMotion.js";

const PAGE_VARIANTS = {
  initial: {
    opacity: 0,
    y: 8,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.22,
      ease: [0.22, 1, 0.36, 1],
    },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: {
      duration: 0.15,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const REDUCED_VARIANTS = {
  initial: { opacity: 1 },
  animate: { opacity: 1, transition: { duration: 0 } },
  exit: { opacity: 1, transition: { duration: 0 } },
};

/**
 * Reusable page transition wrapper for seamless route navigation.
 * Provides subtle opacity + small translateY transition across all public pages.
 * Instantly scrolls to top when a new page mounts, without layout jumps or flashes.
 */
export default function PageTransition({ children }) {
  const reduced = useReducedMotion();

  useEffect(() => {
    // Start at top of page on route change unless navigating to a specific hash anchor
    if (!window.location.hash) {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }
  }, []);

  return (
    <motion.div
      variants={reduced ? REDUCED_VARIANTS : PAGE_VARIANTS}
      initial="initial"
      animate="animate"
      exit="exit"
      className="w-full"
    >
      {children}
    </motion.div>
  );
}
