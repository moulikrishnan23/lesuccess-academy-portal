import { motion, useReducedMotion } from 'framer-motion';

export default function FloatingElement({ 
  children, 
  className = '', 
  delay = 0,
  duration = 3,
  yOffset = 4,
  as: Component = 'div'
}) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <Component className={className}>{children}</Component>;
  }

  const MotionComponent = motion[Component] || motion.div;

  return (
    <MotionComponent
      className={className}
      animate={{ y: [-yOffset, yOffset, -yOffset] }}
      transition={{
        duration,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut",
        delay
      }}
    >
      {children}
    </MotionComponent>
  );
}
