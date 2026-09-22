import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Scrolls the window to the top whenever the pathname changes.
 *
 * React Router v6 does not reset scroll position on navigation by default.
 * This component fixes that globally: every link, button, navbar item, footer
 * link, or programmatic navigate() call that changes the path will cause the
 * new page to open at the very top.
 *
 * It ignores hash changes intentionally — a link to /courses/java#enroll should
 * still be able to land at the enroll section, not the top of the page.
 */
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);

  return null;
}
