import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import useReducedMotion from "../../hooks/useReducedMotion.js";
import StatementWords from "../ui/StatementWords.jsx";
import "./brand-splash.css";

const TEXT_DISTANCE = 680;
const MAX_INPUT_STEP = 78;

export default function BrandSplash({ onComplete }) {
  const reduced = useReducedMotion();
  const splashRef = useRef(null);
  const progressBarRef = useRef(null);
  const progressFrameRef = useRef(0);
  const progressRef = useRef(0);
  const stageRef = useRef("text");
  const [stage, setStage] = useState("text");

  const moveForward = useCallback((distance) => {
    if (stageRef.current === "text") {
      const step = Math.min(Math.abs(distance), MAX_INPUT_STEP);
      const next = Math.min(1, progressRef.current + step / TEXT_DISTANCE * (reduced ? 2.25 : 1));
      progressRef.current = next;
      if (!progressFrameRef.current) {
        progressFrameRef.current = requestAnimationFrame(() => {
          progressFrameRef.current = 0;
          const progress = progressRef.current;
          splashRef.current?.style.setProperty("--intro-progress", String(progress));
          progressBarRef.current?.setAttribute("aria-valuenow", String(Math.round(progress * 100)));
        });
      }
      if (next >= 1) {
        stageRef.current = "logo";
        setStage("logo");
      }
      return;
    }
    if (stageRef.current === "logo") {
      stageRef.current = "enter";
      setStage("enter");
      if (reduced) onComplete();
    }
  }, [onComplete, reduced]);

  useEffect(() => {
    const root = document.getElementById("root");
    const previousInert = root?.inert;
    const previousOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement;
    if (root) root.inert = true;
    document.body.style.overflow = "hidden";
    splashRef.current?.focus({ preventScroll: true });

    const wheel = (event) => {
      event.preventDefault();
      if (event.deltaY > 0) moveForward(event.deltaY);
    };
    let touchY = null;
    const touchStart = (event) => { touchY = event.touches[0]?.clientY ?? null; };
    const touchMove = (event) => {
      event.preventDefault();
      const nextY = event.touches[0]?.clientY;
      if (touchY !== null && nextY !== undefined && touchY - nextY > 0) moveForward(touchY - nextY);
      touchY = nextY ?? null;
    };
    const keydown = (event) => {
      if (event.key === "Tab") {
        event.preventDefault();
        splashRef.current?.focus({ preventScroll: true });
        return;
      }
      if (["ArrowDown", "PageDown", " "].includes(event.key)) {
        event.preventDefault();
        moveForward(event.key === "PageDown" || event.key === " " ? 78 : 52);
      }
    };
    const splash = splashRef.current;
    splash?.addEventListener("wheel", wheel, { passive: false });
    splash?.addEventListener("touchstart", touchStart, { passive: true });
    splash?.addEventListener("touchmove", touchMove, { passive: false });
    document.addEventListener("keydown", keydown);
    return () => {
      cancelAnimationFrame(progressFrameRef.current);
      progressFrameRef.current = 0;
      splash?.removeEventListener("wheel", wheel);
      splash?.removeEventListener("touchstart", touchStart);
      splash?.removeEventListener("touchmove", touchMove);
      document.removeEventListener("keydown", keydown);
      if (root) root.inert = previousInert;
      document.body.style.overflow = previousOverflow;
      if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
    };
  }, [moveForward]);

  return createPortal(
    <div
      ref={splashRef}
      className="brand-splash"
      data-preserve-ui
      data-stage={stage}
      role="dialog"
      aria-modal="true"
      aria-label="Welcome to LeSuccess. Scroll to explore."
      tabIndex={0}
      onTransitionEnd={(event) => {
        if (event.target === event.currentTarget && event.propertyName === "opacity" && stageRef.current === "enter") onComplete();
      }}
    >
      <div className="brand-splash-content">
        <h1 className="brand-splash-words" aria-label="Learn. Educate. Succeed."><StatementWords /></h1>
        <div ref={progressBarRef} className="brand-splash-progress" role="progressbar" aria-label="Splash introduction" aria-valuemin={0} aria-valuemax={100} aria-valuenow={0}>
          <span />
        </div>
        <div className="brand-splash-support">
          <p>Premier Technology Learning in Coimbatore</p>
          <p>From First Line of Code to First Offer Letter</p>
        </div>
      </div>
      <img className="brand-splash-logo" src="/logo/logo.png" alt="LeSuccess Academy" fetchPriority="high" />
      <div className="brand-splash-prompt" aria-live="polite">
        <span className="brand-splash-scroll-mark" aria-hidden="true">↓</span>
        <span>{stage === "text" ? "Scroll to Explore" : stage === "logo" ? "Scroll to Enter" : "Entering LeSuccess"}</span>
      </div>
    </div>, document.body,
  );
}
