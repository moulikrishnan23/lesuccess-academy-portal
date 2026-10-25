import useReducedMotion from "../../hooks/useReducedMotion.js";

/**
 * Animated Glowing Border Beam.
 * Inspired by Cloudious & Linear design systems.
 * Renders an animated luminous light streak traveling around the perimeter of a card.
 */
export default function BorderBeam({
  className = "",
  size = 180,
  duration = 7,
  borderWidth = 1.5,
  colorFrom = "#DF1E26",
  colorTo = "#38bdf8",
  delay = 0,
}) {
  const reduced = useReducedMotion();

  if (reduced) return null;

  return (
    <div
      aria-hidden="true"
      style={{
        "--size": `${size}px`,
        "--duration": `${duration}s`,
        "--border-width": `${borderWidth}px`,
        borderWidth: `${borderWidth}px`,
        "--color-from": colorFrom,
        "--color-to": colorTo,
        "--delay": `-${delay}s`,
      }}
      className={`pointer-events-none absolute inset-0 rounded-[inherit] border border-transparent [mask-clip:padding-box,border-box] [mask-composite:exclude] [mask-image:linear-gradient(#000,#000),linear-gradient(#000,#000)] ${className}`}
    >
      <div
        className="absolute aspect-square w-[var(--size)] bg-gradient-to-l from-[var(--color-from)] via-[var(--color-to)] to-transparent opacity-90 [animation:borderBeamRotate_var(--duration)_linear_infinite_var(--delay)]"
        style={{
          offsetPath: `rect(0 auto auto 0 round 1.25rem)`,
          offsetDistance: "0%",
        }}
      />
    </div>
  );
}
