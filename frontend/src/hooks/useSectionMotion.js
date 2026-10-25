import { useEffect } from "react";

// One observer pauses CSS loops in eligible Home sections; protected sections
// and the custom connection illustration are explicitly excluded.
export default function useSectionMotion(ref) {
  useEffect(() => {
    const sections = [...(ref.current?.querySelectorAll("section") || [])]
      .filter(el => !el.closest("[data-preserve-ui], .ls-connection") && !el.parentElement.closest("section"));
    const visible = new Set();
    const update = () => sections.forEach(el => el.classList.toggle("ls-motion-paused", document.hidden || !visible.has(el)));
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => entry.isIntersecting ? visible.add(entry.target) : visible.delete(entry.target));
      update();
    }, { rootMargin: "100px" });
    sections.forEach(el => observer.observe(el));
    document.addEventListener("visibilitychange", update);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", update);
      sections.forEach(el => el.classList.remove("ls-motion-paused"));
    };
  }, [ref]);
}
