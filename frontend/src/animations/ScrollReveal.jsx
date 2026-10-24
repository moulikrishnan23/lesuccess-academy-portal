import { motion, useReducedMotion } from "framer-motion";

export default function ScrollReveal({
  children,
  className = "",
  delay = 0,
  duration = 0.5,
  direction = "up",
  preset,
  staggerChildren = false,
  staggerDelay = 0.1,
  as: Component = "div",
  viewport = { once: true, amount: 0.15 },
}) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <Component className={className}>{children}</Component>;
  }

  const effectivePreset = preset || direction;

  let hiddenProps;
  let visibleProps;
  let transitionConfig = {
    duration,
    delay,
    ease: [0.22, 1, 0.36, 1],
    ...(staggerChildren && {
      staggerChildren: staggerDelay,
      delayChildren: delay,
    }),
  };

  if (effectivePreset === "hop") {
    // Spring bounce entrance (from Fund AACPS neue-hop)
    hiddenProps = { opacity: 0, y: 35, scale: 0.94 };
    visibleProps = { opacity: 1, y: 0, scale: 1 };
    transitionConfig = {
      type: "spring",
      damping: 16,
      stiffness: 200,
      mass: 0.8,
      delay,
      ...(staggerChildren && {
        staggerChildren: staggerDelay,
        delayChildren: delay,
      }),
    };
  } else if (effectivePreset === "scale") {
    // Zoom reveal (from Cloudious motion-expandIn)
    hiddenProps = { opacity: 0, scale: 0.9 };
    visibleProps = { opacity: 1, scale: 1 };
  } else if (effectivePreset === "left") {
    hiddenProps = { opacity: 0, x: -35 };
    visibleProps = { opacity: 1, x: 0 };
  } else if (effectivePreset === "right") {
    hiddenProps = { opacity: 0, x: 35 };
    visibleProps = { opacity: 1, x: 0 };
  } else if (effectivePreset === "down") {
    hiddenProps = { opacity: 0, y: -30 };
    visibleProps = { opacity: 1, y: 0 };
  } else if (effectivePreset === "fade") {
    hiddenProps = { opacity: 0 };
    visibleProps = { opacity: 1 };
  } else if (effectivePreset === "3d" || effectivePreset === "perspective") {
    hiddenProps = { opacity: 0, y: 50, rotateX: 14, scale: 0.94 };
    visibleProps = { opacity: 1, y: 0, rotateX: 0, scale: 1 };
    transitionConfig = {
      duration: 0.75,
      ease: [0.16, 1, 0.3, 1],
      delay,
      ...(staggerChildren && {
        staggerChildren: staggerDelay,
        delayChildren: delay,
      }),
    };
  } else if (effectivePreset === "parallax-rise") {
    hiddenProps = { opacity: 0, y: 65, scale: 0.93 };
    visibleProps = { opacity: 1, y: 0, scale: 1 };
    transitionConfig = {
      duration: 0.85,
      ease: [0.22, 1, 0.36, 1],
      delay,
      ...(staggerChildren && {
        staggerChildren: staggerDelay,
        delayChildren: delay,
      }),
    };
  } else {
    // Default 'up'
    hiddenProps = { opacity: 0, y: 30 };
    visibleProps = { opacity: 1, y: 0 };
  }

  const variants = {
    hidden: hiddenProps,
    visible: {
      ...visibleProps,
      transition: transitionConfig,
    },
  };

  const is3D = effectivePreset === "3d" || effectivePreset === "perspective";
  const MotionComponent = motion[Component] || motion.div;

  return (
    <MotionComponent
      className={className}
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={viewport}
      style={
        is3D ? { perspective: 1200, transformStyle: "preserve-3d" } : undefined
      }
    >
      {children}
    </MotionComponent>
  );
}
