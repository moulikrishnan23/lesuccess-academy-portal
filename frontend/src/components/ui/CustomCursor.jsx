import { useEffect, useState, useRef } from "react";
import {
  motion,
  useSpring,
  useMotionValue,
  AnimatePresence,
} from "framer-motion";
import useReducedMotion from "../../hooks/useReducedMotion.js";

// Source-branch cursor labels apply to real controls on public pages. Cards
// still need an explicit data-cursor-text so decorative hover targets do not
// unexpectedly acquire a label.
const CONTROL =
  'a[href], button, [role="button"], [role="tab"], [role="option"], summary, input[type="button"], input[type="submit"]';
// `contents` wrappers can contain whole page sections that are only excluded
// from scroll-motion observation. They must not disable the global cursor.
const NATIVE_CURSOR_SCOPE = '[data-preserve-ui]:not(.contents), .ls-connection, [href="#employee-login"]';
const LABEL_MAX = 8;
const WEAK_WORDS = new Set(["a", "an", "the", "to", "for", "of", "and", "in", "on", "our", "your", "my", "get", "see", "go", "&"]);

function autoLabel(el) {
  if (el.getAttribute("aria-haspopup") === "listbox") return "Choose";
  if (el.getAttribute("role") === "option") return "Pick";
  if (el.hasAttribute("aria-expanded") && !el.hasAttribute("aria-haspopup") && !el.hasAttribute("aria-label")) {
    return el.getAttribute("aria-expanded") === "true" ? "Close" : "Expand";
  }
  const text = el.getAttribute("aria-label") || el.textContent || "";
  const word = text
    .split(/\s+/)
    .map((value) => value.replace(/[^\p{L}\p{N}+#]/gu, ""))
    .find((value) => /\p{L}/u.test(value) && !WEAK_WORDS.has(value.toLowerCase()) && value.length <= LABEL_MAX);
  if (word) return word;
  return el.tagName === "A" ? "Open" : "Click";
}

function setIfChanged(ref, setState, nextValue) {
  if (ref.current === nextValue) return;
  ref.current = nextValue;
  setState(nextValue);
}

const isPublicPage = () => !/^\/(admin|trainer|login)(\/|$)/.test(window.location.pathname);

/**
 * Creative Agency Custom Mouse Cursor & Follower System.
 * Inspired by Cloudious & award-winning interactive experiences.
 * Features:
 * - Precision tracking center dot
 * - Physics-spring outer magnetic aura ring
 * - Interactive scale expansion on links, cards, and buttons
 * - Morphing micro-label support via `data-cursor-text="..."`
 * - Tactile click shrink & expanding ripple wave
 * - Purely non-interfering (pointer-events: none, z-index: 999999)
 * - Safely auto-disabled on touch devices & under prefers-reduced-motion
 */
export default function CustomCursor() {
  const reduced = useReducedMotion();
  const [isPointer, setIsPointer] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(pointer: fine)").matches;
  });

  const [isProtected, setIsProtected] = useState(false);
  const isProtectedRef = useRef(false);
  const rippleTimers = useRef(new Set());
  const [isVisible, setIsVisible] = useState(false);
  // Ref mirrors isVisible to avoid including it in the mousemove effect
  // dependency array — which would re-register all listeners on every move.
  const isVisibleRef = useRef(false);
  const [isHovered, setIsHovered] = useState(false);
  const isHoveredRef = useRef(false);
  const [isClicking, setIsClicking] = useState(false);
  const isClickingRef = useRef(false);
  const [cursorText, setCursorText] = useState("");
  const cursorTextRef = useRef("");
  const [isTextInput, setIsTextInput] = useState(false);
  const isTextInputRef = useRef(false);
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

  // Track pointer media query
  useEffect(() => {
    const media = window.matchMedia("(pointer: fine)");
    const handler = (e) => setIsPointer(e.matches);
    media.addEventListener("change", handler);
    return () => media.removeEventListener("change", handler);
  }, []);

  // Manage body cursor: none class
  useEffect(() => {
    if (!isPointer || reduced) {
      document.body.classList.remove("has-custom-cursor");
      return undefined;
    }

    document.body.classList.add("has-custom-cursor");
    return () => {
      document.body.classList.remove("has-custom-cursor");
    };
  }, [isPointer, reduced]);

  useEffect(() => {
    document.body.classList.toggle("has-native-cursor", isProtected);
    return () => document.body.classList.remove("has-native-cursor");
  }, [isProtected]);

  // Mouse event listeners
  useEffect(() => {
    if (!isPointer || reduced) return undefined;

    const handleMouseMove = (e) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      // Only call setIsVisible once (on first movement); avoids re-registering
      // this entire effect after every mousemove that changes isVisible state.
      if (!isVisibleRef.current) {
        isVisibleRef.current = true;
        setIsVisible(true);
      }
    };

    const handleMouseDown = () => setIfChanged(isClickingRef, setIsClicking, true);
    const handleMouseUp = () => setIfChanged(isClickingRef, setIsClicking, false);

    const handleMouseLeave = () => {
      isVisibleRef.current = false;
      setIsVisible(false);
      setIfChanged(isHoveredRef, setIsHovered, false);
      setIfChanged(cursorTextRef, setCursorText, "");
      setIfChanged(isTextInputRef, setIsTextInput, false);
    };

    const handleMouseEnter = () => {
      isVisibleRef.current = true;
      setIsVisible(true);
    };

    const handleMouseOver = (e) => {
      const target = e.target;
      if (!target || !(target instanceof Element)) return;

      const protectedTarget = Boolean(target.closest(NATIVE_CURSOR_SCOPE));
      setIfChanged(isProtectedRef, setIsProtected, protectedTarget);
      if (protectedTarget) return;

      // Check for custom cursor text
      const textElem = target.closest("[data-cursor-text]");
      const control = target.closest(CONTROL);
      const controlIsNearer =
        control && textElem && control !== textElem && textElem.contains(control);
      if (textElem && !controlIsNearer) {
        setIfChanged(cursorTextRef, setCursorText, textElem.getAttribute("data-cursor-text") || "");
        setIfChanged(isHoveredRef, setIsHovered, true);
        setIfChanged(isTextInputRef, setIsTextInput, false);
        return;
      }
      if (control && isPublicPage()) {
        setIfChanged(cursorTextRef, setCursorText, autoLabel(control));
        setIfChanged(isHoveredRef, setIsHovered, true);
        setIfChanged(isTextInputRef, setIsTextInput, false);
        return;
      }
      setIfChanged(cursorTextRef, setCursorText, "");

      // Check for text inputs
      const isInput = target.closest(
        "input:not([type='button']):not([type='submit']), textarea",
      );
      if (isInput) {
        setIfChanged(isTextInputRef, setIsTextInput, true);
        setIfChanged(isHoveredRef, setIsHovered, false);
        return;
      }
      setIfChanged(isTextInputRef, setIsTextInput, false);

      // Check for clickable/interactive items
      const interactive = target.closest(
        'a, button, [role="button"], select, .card-lift-3d, .cursor-pointer, [data-cursor-hover], input[type="button"], input[type="submit"]',
      );

      if (interactive) {
        setIfChanged(isHoveredRef, setIsHovered, true);
      } else {
        setIfChanged(isHoveredRef, setIsHovered, false);
      }
    };

    const handleClick = (e) => {
      if (e.target instanceof Element && e.target.closest(NATIVE_CURSOR_SCOPE)) return;
      const id = Date.now() + Math.random();
      const ripple = { id, x: e.clientX, y: e.clientY };
      setRipples((prev) => [...prev.slice(-4), ripple]);

      const timer = setTimeout(() => {
        rippleTimers.current.delete(timer);
        setRipples((prev) => prev.filter((r) => r.id !== id));
      }, 650);
      rippleTimers.current.add(timer);
    };

    const timers = rippleTimers.current;
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("click", handleClick, { passive: true });
    document.addEventListener("mouseover", handleMouseOver, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);

    return () => {
      timers.forEach(clearTimeout);
      timers.clear();
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("click", handleClick);
      document.removeEventListener("mouseover", handleMouseOver);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
    };
  // isVisible intentionally excluded: the ref tracks it without triggering
  // effect re-registration on every mouse-enter/leave cycle.
  }, [isPointer, reduced, mouseX, mouseY]);

  if (!isPointer || reduced || isProtected) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[999999] overflow-hidden select-none"
    >
      {/* 1. Outer Fluid Aura Ring */}
      {isVisible && (
        <motion.div
          style={{
            x: ringX,
            y: ringY,
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
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 25,
            mass: 0.2,
          }}
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
            x: dotX,
            y: dotY,
            translateX: "-50%",
            translateY: "-50%",
          }}
          animate={{
            scale: isClicking ? 1.4 : isHovered ? 0.5 : 1,
            opacity: isHovered ? 0.7 : 1,
          }}
          transition={{ type: "spring", stiffness: 600, damping: 30 }}
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
