import { useEffect, useRef } from "react";
import useReducedMotion from "../../hooks/useReducedMotion.js";

/**
 * High-performance Interactive Particle Constellation Canvas.
 * Inspired by Cloudious & premium enterprise tech portals.
 * Renders an ambient network of drifting glowing nodes with dynamic connecting lines
 * and organic cursor proximity interaction.
 *
 * Automatically throttles and pauses when off-screen or under prefers-reduced-motion.
 */
export default function ParticleConstellation({
  className = "",
  particleCount = 45,
  connectDistance = 110,
  interactive = true,
  theme = "hero", // 'hero' | 'dark' | 'light'
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId;
    let isVisible = true;
    let width = 0;
    let height = 0;

    const mouse = {
      x: null,
      y: null,
      radius: 130,
    };

    // Color palettes based on theme
    const colors =
      theme === "light"
        ? [
            "rgba(7, 64, 92, 0.6)",
            "rgba(223, 30, 38, 0.6)",
            "rgba(14, 165, 233, 0.5)",
          ]
        : [
            "rgba(56, 189, 248, 0.75)", // cyan
            "rgba(244, 66, 70, 0.7)", // brand red
            "rgba(255, 255, 255, 0.65)", // bright white
          ];

    const lineColor =
      theme === "light" ? { r: 7, g: 64, b: 92 } : { r: 56, g: 189, b: 248 };

    // Resize handler
    const handleResize = () => {
      const container = containerRef.current;
      if (!container) return;
      width = container.clientWidth;
      height = container.clientHeight;

      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    // Mouse movement inside container
    const handleMouseMove = (e) => {
      if (!interactive) return;
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      mouse.x = null;
      mouse.y = null;
    };

    const container = containerRef.current;
    if (container && interactive) {
      container.addEventListener("mousemove", handleMouseMove, {
        passive: true,
      });
      container.addEventListener("mouseleave", handleMouseLeave);
    }

    // Observer to pause when scrolled out of view
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
      },
      { threshold: 0.05 },
    );
    if (container) observer.observe(container);

    // Initialize particles
    const count = Math.min(
      particleCount,
      Math.floor((width * height) / 14000) || 30,
    );
    const particles = [];

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.65,
        vy: (Math.random() - 0.5) * 0.65,
        radius: Math.random() * 1.8 + 1.2,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    // Main animation loop
    const animate = () => {
      if (!isVisible) {
        animationFrameId = requestAnimationFrame(animate);
        return;
      }

      ctx.clearRect(0, 0, width, height);

      // Update and draw particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        p.x += p.vx;
        p.y += p.vy;

        // Bounce from boundaries
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        // Mouse interaction push/pull
        if (mouse.x !== null && mouse.y !== null) {
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < mouse.radius) {
            const force = (mouse.radius - dist) / mouse.radius;
            p.x -= (dx / dist) * force * 1.2;
            p.y -= (dy / dist) * force * 1.2;

            // Connect to mouse
            const alpha = (1 - dist / mouse.radius) * 0.45;
            ctx.beginPath();
            ctx.strokeStyle = `rgba(223, 30, 38, ${alpha})`;
            ctx.lineWidth = 1;
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.stroke();
          }
        }

        // Draw particle dot
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Draw connecting lines between nearby particles
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < connectDistance) {
            const alpha = (1 - dist / connectDistance) * 0.22;
            ctx.beginPath();
            ctx.strokeStyle = `rgba(${lineColor.r}, ${lineColor.g}, ${lineColor.b}, ${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      if (container) {
        observer.unobserve(container);
        if (interactive) {
          container.removeEventListener("mousemove", handleMouseMove);
          container.removeEventListener("mouseleave", handleMouseLeave);
        }
      }
    };
  }, [particleCount, connectDistance, interactive, theme, reduced]);

  if (reduced) return null;

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
    >
      <canvas ref={canvasRef} className="h-full w-full block" />
    </div>
  );
}
