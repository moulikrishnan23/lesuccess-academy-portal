import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import { useRef } from 'react';

export default function ParallaxElement({ 
  children, 
  className = '', 
  offset = 50,
  as: Component = 'div'
}) {
  const shouldReduceMotion = useReducedMotion();
  const ref = useRef(null);
  
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });
  
  const y = useTransform(scrollYProgress, [0, 1], [-offset, offset]);

  if (shouldReduceMotion) {
    return <Component className={className}>{children}</Component>;
  }

  const MotionComponent = motion[Component] || motion.div;

  return (
    <MotionComponent
      ref={ref}
      className={className}
      style={{ y }}
    >
      {children}
    </MotionComponent>
  );
}
