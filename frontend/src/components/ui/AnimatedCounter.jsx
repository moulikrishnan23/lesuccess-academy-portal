import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";
import useReducedMotion from "../../hooks/useReducedMotion.js";

/**
 * High-performance smooth rollup counter with ease-out cubic physics.
 * Automatically triggers once the metric scrolls into view.
 * Supports strings like "100%", "150+", "4.9★", "12 LPA", "10+".
 */
export default function AnimatedCounter({
  value,
  duration = 1.8,
  className = "",
}) {
  const reduced = useReducedMotion();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-10% 0px" });

  // Extract numeric and suffix parts: e.g. "150+" -> numeric: 150, suffix: "+"
  const stringVal = String(value ?? "");
  const numericMatch = stringVal.match(/[\d.]+/);
  const target = numericMatch ? parseFloat(numericMatch[0]) : 0;
  const isDecimal = stringVal.includes(".") && target % 1 !== 0;
  const decimalPlaces = isDecimal
    ? stringVal.split(".")[1]?.match(/\d+/)?.[0]?.length || 1
    : 0;

  const prefix = stringVal.slice(0, stringVal.indexOf(numericMatch?.[0] || ""));
  const suffix = stringVal.slice(
    stringVal.indexOf(numericMatch?.[0] || "") +
      (numericMatch?.[0]?.length || 0),
  );

  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (reduced || !isInView) return;

    let startTime = null;
    let animationFrame;

    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      // Ease out cubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const current = easeProgress * target;

      setDisplayValue(
        isDecimal
          ? parseFloat(current.toFixed(decimalPlaces))
          : Math.floor(current),
      );

      if (progress < 1) {
        animationFrame = requestAnimationFrame(step);
      } else {
        setDisplayValue(target);
      }
    };

    animationFrame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationFrame);
  }, [isInView, target, duration, reduced, isDecimal, decimalPlaces]);

  const activeValue = reduced ? target : displayValue;

  return (
    <span ref={ref} className={`inline-block tabular-nums ${className}`}>
      {prefix}
      {isDecimal
        ? activeValue.toFixed(decimalPlaces)
        : activeValue.toLocaleString()}
      {suffix}
    </span>
  );
}
