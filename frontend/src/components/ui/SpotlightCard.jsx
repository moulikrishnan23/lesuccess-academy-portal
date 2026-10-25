import { useEffect, useRef } from "react";
import { motion, useMotionValue, useMotionTemplate, useSpring } from "framer-motion";
import useReducedMotion from "../../hooks/useReducedMotion.js";

// Preserve the source glow, tilt limits and spring without rerendering children
// on every pointer event. Geometry is measured once per animation frame.
export default function SpotlightCard({ children, className = "", spotlightColor = "rgba(223, 30, 38, 0.12)", tilt = true, maxTilt = 7, ...props }) {
  const reduced = useReducedMotion();
  const cardRef = useRef(null);
  const frame = useRef(0);
  const pointer = useRef({ x: 0, y: 0 });
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const opacity = useMotionValue(0);
  const targetX = useMotionValue(0);
  const targetY = useMotionValue(0);
  const rotateX = useSpring(targetX, { stiffness: 260, damping: 20 });
  const rotateY = useSpring(targetY, { stiffness: 260, damping: 20 });
  const background = useMotionTemplate`radial-gradient(450px circle at ${x}px ${y}px, ${spotlightColor}, transparent 80%)`;
  useEffect(() => () => cancelAnimationFrame(frame.current), []);
  const move = (event) => {
    if (reduced) return;
    pointer.current = { x: event.clientX, y: event.clientY };
    if (frame.current) return;
    frame.current = requestAnimationFrame(() => {
      frame.current = 0;
      const rect = cardRef.current?.getBoundingClientRect();
      if (!rect?.width || !rect.height) return;
      const localX = pointer.current.x - rect.left;
      const localY = pointer.current.y - rect.top;
      x.set(localX); y.set(localY); opacity.set(1);
      if (tilt) {
        targetX.set(((localY - rect.height / 2) / (rect.height / 2)) * -maxTilt);
        targetY.set(((localX - rect.width / 2) / (rect.width / 2)) * maxTilt);
      }
    });
  };
  const leave = () => {
    cancelAnimationFrame(frame.current); frame.current = 0;
    opacity.set(0); targetX.set(0); targetY.set(0);
  };
  return (
    <motion.div ref={cardRef} onMouseMove={move} onMouseLeave={leave}
      style={{ transformStyle: "preserve-3d", ...(reduced || !tilt ? {} : { rotateX, rotateY }) }}
      className={`relative overflow-hidden ${className}`} {...props}>
      {!reduced && <motion.div aria-hidden="true"
        className="pointer-events-none absolute -inset-px transition-opacity duration-300 z-10"
        style={{ opacity, background }} />}
      {children}
    </motion.div>
  );
}
