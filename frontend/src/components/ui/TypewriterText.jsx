import { useState, useEffect } from "react";
import useReducedMotion from "../../hooks/useReducedMotion.js";

/**
 * High-energy Dynamic Typewriter with glowing cursor.
 * Inspired by Xplore IT Corp & premier tech academy landing pages.
 * Types and deletes dynamic skill phrases with organic cadence.
 */
export default function TypewriterText({
  phrases = [],
  typingSpeed = 75,
  deletingSpeed = 40,
  pauseDuration = 2200,
  className = "",
  cursorClassName = "text-[#F44246]",
}) {
  const reduced = useReducedMotion();
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [currentText, setCurrentText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (reduced || phrases.length === 0) return;

    const currentFullPhrase = phrases[currentPhraseIndex] || "";

    let timeout;
    if (!isDeleting) {
      // Typing forward
      if (currentText.length < currentFullPhrase.length) {
        timeout = setTimeout(() => {
          setCurrentText(currentFullPhrase.slice(0, currentText.length + 1));
        }, typingSpeed);
      } else {
        // Finished typing phrase, pause before deleting
        timeout = setTimeout(() => {
          setIsDeleting(true);
        }, pauseDuration);
      }
    } else {
      // Deleting backwards
      if (currentText.length > 0) {
        timeout = setTimeout(() => {
          setCurrentText(currentFullPhrase.slice(0, currentText.length - 1));
        }, deletingSpeed);
      } else {
        // Finished deleting, switch to next phrase asynchronously
        timeout = setTimeout(() => {
          setIsDeleting(false);
          setCurrentPhraseIndex((prev) => (prev + 1) % phrases.length);
        }, deletingSpeed);
      }
    }

    return () => clearTimeout(timeout);
  }, [
    currentText,
    isDeleting,
    currentPhraseIndex,
    phrases,
    typingSpeed,
    deletingSpeed,
    pauseDuration,
    reduced,
  ]);

  if (reduced) {
    return <span className={className}>{phrases[0] || ""}</span>;
  }

  return (
    <span className={`inline-flex items-center ${className}`}>
      <span>{currentText}</span>
      <span
        aria-hidden="true"
        className={`inline-block w-[3px] h-[1em] ml-1 rounded-full bg-gradient-to-b from-[#F44246] to-[#DF1E26] animate-pulse shadow-[0_0_8px_#DF1E26] ${cursorClassName}`}
      />
    </span>
  );
}
