import { useEffect, useState } from "react";

// Suspend time-based work off screen and in background tabs; resume in place.
export default function useAnimationActive(ref, enabled = true) {
  const [active, setActive] = useState(false);
  useEffect(() => {
    if (!enabled) return undefined;
    const element = ref.current;
    if (!element) return undefined;
    let visible = false;
    const update = () => setActive(visible && !document.hidden);
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      update();
    });
    observer.observe(element);
    document.addEventListener("visibilitychange", update);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", update);
    };
  }, [ref, enabled]);
  return enabled && active;
}
