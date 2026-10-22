import { useState, useEffect, useMemo } from "react";
import useReducedMotion from "../../hooks/useReducedMotion.js";

/**
 * High-energy Dynamic Typewriter with glowing cursor.
 * Types and deletes dynamic skill phrases with organic cadence while preserving
 * native polychromatic emoji/icon colors and applying animated gradients to text.
 */
export default function TypewriterText({
  phrases = [],
  typingSpeed = 65,
  deletingSpeed = 35,
  pauseDuration = 2200,
  className = "",
  cursorClassName = "",
}) {
  const reduced = useReducedMotion();
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [step, setStep] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  // Normalize phrases into { text, icon }
  const normalizedPhrases = useMemo(() => {
    return phrases.map((item) => {
      if (typeof item === "object" && item !== null) {
        return { text: item.text || "", icon: item.icon || null };
      }
      const str = String(item || "").trim();
      // Match trailing emoji / extended pictographic symbol
      const match = str.match(
        /^(.*?)(?:\s*([\p{Extended_Pictographic}\uFE0F\u200D]+))$/u,
      );
      if (match) {
        return { text: match[1].trim(), icon: match[2] };
      }
      return { text: str, icon: null };
    });
  }, [phrases]);

  const currentPhrase = normalizedPhrases[currentPhraseIndex] || {
    text: "",
    icon: null,
  };
  const fullText = currentPhrase.text;
  const hasIcon = Boolean(currentPhrase.icon);
  const maxSteps = fullText.length + (hasIcon ? 1 : 0);

  useEffect(() => {
    if (reduced || normalizedPhrases.length === 0) return undefined;

    let timeout;
    if (!isDeleting) {
      if (step < maxSteps) {
        timeout = setTimeout(() => {
          setStep((prev) => prev + 1);
        }, typingSpeed);
      } else {
        // Reached end of phrase, pause before deleting
        timeout = setTimeout(() => {
          setIsDeleting(true);
        }, pauseDuration);
      }
    } else {
      if (step > 0) {
        timeout = setTimeout(() => {
          setStep((prev) => prev - 1);
        }, deletingSpeed);
      } else {
        // Finished deleting, move to next phrase
        timeout = setTimeout(() => {
          setIsDeleting(false);
          setCurrentPhraseIndex(
            (prev) => (prev + 1) % normalizedPhrases.length,
          );
        }, 150);
      }
    }

    return () => clearTimeout(timeout);
  }, [
    step,
    isDeleting,
    maxSteps,
    normalizedPhrases.length,
    typingSpeed,
    deletingSpeed,
    pauseDuration,
    reduced,
  ]);

  const renderIcon = (icon) => {
    if (!icon) return null;
    if (typeof icon === "string") {
      return (
        <span
          className="inline-block ml-1.5 align-baseline select-none transition-transform duration-200 transform scale-100 hover:scale-125 filter-none"
          style={{
            color: "initial",
            WebkitTextFillColor: "initial",
            background: "none",
            WebkitBackgroundClip: "initial",
          }}
          role="img"
          aria-label="emoji"
        >
          {icon}
        </span>
      );
    }
    const IconComponent = icon;
    return (
      <span
        className="inline-flex items-center ml-1.5 text-white select-none align-middle"
        style={{
          color: "initial",
          WebkitTextFillColor: "initial",
        }}
      >
        <IconComponent size={24} className="shrink-0" />
      </span>
    );
  };

  if (reduced) {
    const first = normalizedPhrases[0] || { text: "", icon: null };
    return (
      <span className="inline align-baseline">
        <span className={className}>{first.text}</span>
        {first.icon && renderIcon(first.icon)}
      </span>
    );
  }

  const currentTypedText = fullText.slice(0, Math.min(step, fullText.length));
  const showIcon = hasIcon && step > fullText.length;

  return (
    <span className="inline align-baseline">
      {/* Animated gradient text */}
      <span className={className}>{currentTypedText}</span>

      {/* Icon displayed in authentic original color */}
      {showIcon && renderIcon(currentPhrase.icon)}

      {/* Glowing cursor */}
      <span
        aria-hidden="true"
        className={`inline-block w-[3px] h-[0.88em] ml-1.5 align-baseline -translate-y-0.5 rounded-full bg-gradient-to-b from-[#F44246] to-[#DF1E26] animate-pulse shadow-[0_0_8px_#DF1E26] ${cursorClassName}`}
      />
    </span>
  );
}
