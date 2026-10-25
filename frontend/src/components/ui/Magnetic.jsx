import { useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import useReducedMotion from "../../hooks/useReducedMotion.js";

// Source spring/timing, updated outside React and at most once per paint.
export default function Magnetic({ children, strength = 0.25, className = "" }) {
  const reduced = useReducedMotion();
  const ref = useRef(null);
  const frame = useRef(0);
  const pointer = useRef({ x: 0, y: 0 });
  const targetX = useMotionValue(0);
  const targetY = useMotionValue(0);
  const spring = { stiffness: 350, damping: 20, mass: 0.5 };
  const x = useSpring(targetX, spring);
  const y = useSpring(targetY, spring);

  useEffect(() => () => cancelAnimationFrame(frame.current), []);
  const move = (event) => {
    if (reduced) return;
    pointer.current = { x: event.clientX, y: event.clientY };
    if (frame.current) return;
    frame.current = requestAnimationFrame(() => {
      frame.current = 0;
      const rect = ref.current?.getBoundingClientRect();
      if (!rect) return;
      targetX.set((pointer.current.x - rect.left - rect.width / 2) * strength);
      targetY.set((pointer.current.y - rect.top - rect.height / 2) * strength);
    });
  };
  const leave = () => {
    cancelAnimationFrame(frame.current);
    frame.current = 0;
    targetX.set(0);
    targetY.set(0);
  };
  if (reduced) return <div className={className}>{children}</div>;
  return (
    <motion.div ref={ref} onMouseMove={move} onMouseLeave={leave}
      style={{ x, y }} className={`inline-block ${className}`}>
      {children}
    </motion.div>
  );
}
