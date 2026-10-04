import { motion, useReducedMotion } from 'framer-motion';

export default function ScrollReveal({ 
  children, 
  className = '', 
  delay = 0, 
  duration = 0.5,
  direction = 'up',
  staggerChildren = false,
  staggerDelay = 0.1,
  as: Component = 'div'
}) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <Component className={className}>{children}</Component>;
  }

  const variants = {
    hidden: { 
      opacity: 0, 
      y: direction === 'up' ? 30 : direction === 'down' ? -30 : 0,
      x: direction === 'left' ? 30 : direction === 'right' ? -30 : 0,
    },
    visible: { 
      opacity: 1, 
      y: 0, 
      x: 0,
      transition: {
        duration,
        delay,
        ease: 'easeOut',
        ...(staggerChildren && {
          staggerChildren: staggerDelay
        })
      }
    }
  };

  const MotionComponent = motion[Component] || motion.div;

  return (
    <MotionComponent
      className={className}
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
    >
      {children}
    </MotionComponent>
  );
}
