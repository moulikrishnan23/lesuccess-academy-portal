import { useEffect, useState } from "react";
import {
  motion,
  useSpring,
  useMotionValue,
  AnimatePresence,
} from "framer-motion";
import useReducedMotion from "../../hooks/useReducedMotion.js";

/**
 * Creative Agency Custom Mouse Cursor & Follower System.
 * Inspired by Cloudious & award-winning interactive experiences.
 * Features:
 * - Precision tracking center dot
 * - Physics-spring outer magnetic aura ring
 * - Interactive scale expansion on links, cards, and buttons
 * - Morphing micro-label support via `data-cursor-text="..."`; on public pages
 *   any other link or button gets a label derived from its own text
 * - Tactile click shrink & expanding ripple wave
 * - Purely non-interfering (pointer-events: none, z-index: 999999)
 * - Auto-disabled on touch-only devices; under prefers-reduced-motion it stays
 *   visible but snaps to the pointer with no spring lag, scaling or ripples
 */
// `any-pointer` rather than `pointer`: touchscreen laptops often report the
// touchscreen as the primary pointer even while a mouse/trackpad is in use.
const FINE_POINTER = "(any-pointer: fine)";

// Real controls that earn an automatic label. Broader hover targets (cards
// with .card-lift-3d / .cursor-pointer) only grow the ring.
const CONTROL =
  'a[href], button, [role="button"], [role="tab"], [role="option"], summary, input[type="button"], input[type="submit"]';
const LABEL_MAX = 8; // longer words overflow the bubble
const WEAK_WORDS = new Set(["a", "an", "the", "to", "for", "of", "and", "in", "on", "our", "your", "my", "get", "see", "go", "&"]);

/** The admin and trainer dashboards and the login page keep the plain ring. */
const isPublicPage = () => !/^\/(admin|trainer|login)(\/|$)/.test(window.location.pathname);

/**
 * A one-word label for a control without data-cursor-text: the first strong
 * word of its aria-label or text ("Explore Courses" -> Explore, "Get notified"
 * -> notified), else Open for links and Click for anything else.
 */
function autoLabel(el) {
  if (el.getAttribute("aria-haspopup") === "listbox") return "Choose";
  if (el.getAttribute("role") === "option") return "Pick";
  const text = el.getAttribute("aria-label") || el.textContent || "";
  const word = text
    .split(/\s+/)
    .map((w) => w.replace(/[^\p{L}\p{N}+#]/gu, ""))
    .find((w) => /\p{L}/u.test(w) && !WEAK_WORDS.has(w.toLowerCase()) && w.length <= LABEL_MAX);
  if (word) return word;
  return el.tagName === "A" ? "Open" : "Click";
}

export default function CustomCursor() {
  const reduced = useReducedMotion();
  const [isPointer, setIsPointer] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia(FINE_POINTER).matches;
  });

  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [cursorText, setCursorText] = useState("");
  const [isTextInput, setIsTextInput] = useState(false);
  const [ripples, setRipples] = useState([]);

  // Raw mouse coordinates
  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  // Precision center dot: very fast, tight spring
  const dotX = useSpring(mouseX, { stiffness: 1200, damping: 50, mass: 0.08 });
  const dotY = useSpring(mouseY, { stiffness: 1200, damping: 50, mass: 0.08 });

  // Outer aura ring: fluid physics lag
  const ringX = useSpring(mouseX, { stiffness: 280, damping: 24, mass: 0.28 });
  const ringY = useSpring(mouseY, { stiffness: 280, damping: 24, mass: 0.28 });

  // Reduced motion: follow the raw pointer and change state instantly
  const dotPos = reduced ? { x: mouseX, y: mouseY } : { x: dotX, y: dotY };
  const ringPos = reduced ? { x: mouseX, y: mouseY } : { x: ringX, y: ringY };
  const instant = { duration: 0 };

  // Track pointer media query
  useEffect(() => {
    const media = window.matchMedia(FINE_POINTER);
    const handler = (e) => setIsPointer(e.matches);
    media.addEventListener("change", handler);
    return () => media.removeEventListener("change", handler);
  }, []);

  // Manage body cursor: none class
  useEffect(() => {
    if (!isPointer) {
      document.body.classList.remove("has-custom-cursor");
      return undefined;
    }

    document.body.classList.add("has-custom-cursor");
    return () => {
      document.body.classList.remove("has-custom-cursor");
    };
  }, [isPointer]);

  // Mouse event listeners
  useEffect(() => {
    if (!isPointer) return undefined;

    const handleMouseMove = (e) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);

    const handleMouseLeave = () => {
      setIsVisible(false);
      setIsHovered(false);
      setCursorText("");
      setIsTextInput(false);
    };

    const handleMouseEnter = () => {
      setIsVisible(true);
    };

    const handleMouseOver = (e) => {
      const target = e.target;
      if (!target || !(target instanceof Element)) return;

      // A label set by hand wins, unless an unlabelled control sits inside the
      // labelled element (a button in a labelled card): the nearer one wins.
      const textElem = target.closest("[data-cursor-text]");
      const control = target.closest(CONTROL);
      const controlIsNearer =
        control && textElem && control !== textElem && textElem.contains(control);
      if (textElem && !controlIsNearer) {
        setCursorText(textElem.getAttribute("data-cursor-text") || "");
        setIsHovered(true);
        setIsTextInput(false);
        return;
      }
      if (control && isPublicPage()) {
        setCursorText(autoLabel(control));
        setIsHovered(true);
        setIsTextInput(false);
        return;
      }
      setCursorText("");

      // Check for text inputs
      const isInput = target.closest(
        "input:not([type='button']):not([type='submit']), textarea",
      );
      if (isInput) {
        setIsTextInput(true);
        setIsHovered(false);
        return;
      }
      setIsTextInput(false);

      // Check for clickable/interactive items
      const interactive = target.closest(
        'a, button, [role="button"], select, .card-lift-3d, .cursor-pointer, [data-cursor-hover], input[type="button"], input[type="submit"]',
      );

      if (interactive) {
        setIsHovered(true);
      } else {
        setIsHovered(false);
      }
    };

    const handleClick = (e) => {
      if (reduced) return;
      const id = Date.now() + Math.random();
      const ripple = { id, x: e.clientX, y: e.clientY };
      setRipples((prev) => [...prev.slice(-4), ripple]);

      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== id));
      }, 650);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("click", handleClick, { passive: true });
    document.addEventListener("mouseover", handleMouseOver, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("click", handleClick);
      document.removeEventListener("mouseover", handleMouseOver);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
    };
  }, [isPointer, reduced, isVisible, mouseX, mouseY]);

  if (!isPointer) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[999999] overflow-hidden select-none"
    >
      {/* 1. Outer Fluid Aura Ring */}
      {isVisible && (
        <motion.div
          style={{
            ...ringPos,
            translateX: "-50%",
            translateY: "-50%",
          }}
          animate={{
            scale: isClicking
              ? 0.75
              : cursorText
                ? 1.25
                : isHovered
                  ? 1.65
                  : isTextInput
                    ? 0.6
                    : 1,
            opacity: isTextInput ? 0.25 : 1,
          }}
          transition={
            reduced
              ? instant
              : { type: "spring", stiffness: 400, damping: 25, mass: 0.2 }
          }
          className={`absolute flex items-center justify-center rounded-full transition-colors duration-200 ${
            cursorText
              ? "h-14 w-14 border-2 border-white/90 bg-[#DF1E26] shadow-[0_0_24px_rgba(223,30,38,0.7)] text-white"
              : isHovered
                ? "h-11 w-11 border-2 border-[#DF1E26] bg-[#DF1E26]/15 shadow-[0_0_20px_rgba(223,30,38,0.45)] backdrop-blur-[1px]"
                : isTextInput
                  ? "h-6 w-1 rounded-full bg-[#07405C] border-none"
                  : "h-9 w-9 border border-[#DF1E26]/60 bg-[#DF1E26]/10 shadow-[0_0_12px_rgba(223,30,38,0.25)]"
          }`}
        >
          {cursorText && (
            <motion.span
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
              className="text-[9px] font-black uppercase tracking-widest text-white leading-none text-center px-1"
            >
              {cursorText}
            </motion.span>
          )}
        </motion.div>
      )}

      {/* 2. Precision Center Dot */}
      {isVisible && !cursorText && !isTextInput && (
        <motion.div
          style={{
            ...dotPos,
            translateX: "-50%",
            translateY: "-50%",
          }}
          animate={{
            scale: isClicking ? 1.4 : isHovered ? 0.5 : 1,
            opacity: isHovered ? 0.7 : 1,
          }}
          transition={
            reduced ? instant : { type: "spring", stiffness: 600, damping: 30 }
          }
          className="absolute h-2 w-2 rounded-full bg-[#DF1E26] shadow-[0_0_8px_#DF1E26] ring-1 ring-white/90"
        />
      )}

      {/* 3. Tactile Expanding Click Ripples */}
      <AnimatePresence>
        {ripples.map((r) => (
          <motion.span
            key={r.id}
            initial={{ scale: 0.2, opacity: 0.85 }}
            animate={{ scale: 3.2, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            style={{
              left: r.x,
              top: r.y,
              translateX: "-50%",
              translateY: "-50%",
            }}
            className="absolute h-10 w-10 rounded-full border border-[#DF1E26] bg-[#DF1E26]/20 shadow-[0_0_16px_rgba(223,30,38,0.6)]"
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
