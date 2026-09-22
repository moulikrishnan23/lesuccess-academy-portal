import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import apiClient from "../services/apiClient.js";
import useCourses from "../hooks/useCourses.js";

/**
 * BADGE_THEMES defines the unified configuration for each course badge.
 * This guarantees the badge text, background color, text color, and border
 * are always tied together as one rotating state and cannot drift out of sync.
 *
 * Color palette is derived directly from the project's brand design system:
 * - Special Offer: Translucent frosted white pill matching existing OfferHeader
 * - Trending Course: Purple brand pill matching Admin Courses palette ("Trending (Purple)")
 * - Most Enrolled: Blue brand pill matching Admin Courses palette ("Most Enrolled (Blue)")
 * - High Demand: Emerald/Green brand pill matching Admin Courses palette ("High Demand (Green)")
 */
const BADGE_THEMES = {
  "Special Offer": {
    type: "Special Offer",
    badgeClasses: "bg-white/20 text-white border-white/30 shadow-xs",
    background: "bg-white/20",
    textColor: "text-white",
    borderColor: "border-white/30",
  },
  "Trending Course": {
    type: "Trending Course",
    badgeClasses: "bg-purple-500/30 text-white border-purple-300/40 shadow-xs",
    background: "bg-purple-500/30",
    textColor: "text-white",
    borderColor: "border-purple-300/40",
  },
  "Most Enrolled": {
    type: "Most Enrolled",
    badgeClasses: "bg-blue-500/30 text-white border-blue-300/40 shadow-xs",
    background: "bg-blue-500/30",
    textColor: "text-white",
    borderColor: "border-blue-300/40",
  },
  "High Demand": {
    type: "High Demand",
    badgeClasses: "bg-emerald-500/30 text-white border-emerald-300/40 shadow-xs",
    background: "bg-emerald-500/30",
    textColor: "text-white",
    borderColor: "border-emerald-300/40",
  },
};

const ORDERED_BADGE_TYPES = [
  "Special Offer",
  "Trending Course",
  "Most Enrolled",
  "High Demand",
];

function getBadgeTheme(item, index = 0) {
  if (!item) return BADGE_THEMES["Special Offer"];

  const rawType = item.badgeType || item.type || item.badge;
  if (rawType) {
    const rawLower = String(rawType).toLowerCase().trim();
    if (rawLower.includes("offer")) return BADGE_THEMES["Special Offer"];
    if (rawLower.includes("trend")) return BADGE_THEMES["Trending Course"];
    if (rawLower.includes("enroll")) return BADGE_THEMES["Most Enrolled"];
    if (rawLower.includes("demand")) return BADGE_THEMES["High Demand"];
  }

  if (item.text) {
    const textLower = item.text.toLowerCase();
    if (textLower.includes("trend")) return BADGE_THEMES["Trending Course"];
    if (textLower.includes("most enrolled") || textLower.includes("enrolled")) return BADGE_THEMES["Most Enrolled"];
    if (textLower.includes("high demand") || textLower.includes("demand")) return BADGE_THEMES["High Demand"];
    if (textLower.includes("offer") || textLower.includes("special offer")) return BADGE_THEMES["Special Offer"];
  }

  const fallbackKey = ORDERED_BADGE_TYPES[index % ORDERED_BADGE_TYPES.length];
  return BADGE_THEMES[fallbackKey] || BADGE_THEMES["Special Offer"];
}

const FALLBACK = [
  {
    badgeType: "Special Offer",
    text: "Data Analytics Course - 30% Offer 10 Days Only - Limited Seats!",
    linkLabel: "Enroll Now",
    linkUrl: "/courses/data-analytics",
  },
  {
    badgeType: "Trending Course",
    text: "Python Full Stack Development - Industry-Ready Curriculum with 100% Placement Support!",
    linkLabel: "Enroll Now",
    linkUrl: "/courses/python-full-stack-development",
  },
  {
    badgeType: "Most Enrolled",
    text: "Java Full Stack Development - Enterprise Spring Boot & Microservices Masterclass!",
    linkLabel: "Enroll Now",
    linkUrl: "/courses/full-stack-java",
  },
  {
    badgeType: "High Demand",
    text: "AWS with DevOps Certification - Hands-on Cloud, Docker & Kubernetes Training!",
    linkLabel: "Enroll Now",
    linkUrl: "/courses/aws-and-devops",
  },
];

const INTERVAL_MS = 5000;
const FADE_MS = 400;

const OfferHeader = () => {
  const [announcements, setAnnouncements] = useState(FALLBACK);
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const timerRef = useRef(null);

  useEffect(() => {
    const controller = new AbortController();
    apiClient
      .get("/api/announcements/active-all", { signal: controller.signal })
      .then(({ data }) => {
        const list = data?.data;
        if (Array.isArray(list) && list.length > 0) {
          setAnnouncements(list);
        }
      })
      .catch(() => {/* keep fallback */});
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (announcements.length <= 1) return undefined;

    let fadeTimeout = null;
    timerRef.current = setInterval(() => {
      // fade out
      setVisible(false);
      fadeTimeout = setTimeout(() => {
        setIndex((prev) => (prev + 1) % announcements.length);
        // fade in
        setVisible(true);
      }, FADE_MS);
    }, INTERVAL_MS);

    return () => {
      clearInterval(timerRef.current);
      if (fadeTimeout) clearTimeout(fadeTimeout);
    };
  }, [announcements]);

  const location = useLocation();
  const navigate = useNavigate();
  const { courses } = useCourses();

  const current = announcements[index] ?? FALLBACK[0];
  const text = current.text ?? FALLBACK[0].text;
  const badgeTheme = getBadgeTheme(current, index);

  const handleEnrollNow = () => {
    // 1. If user is already on a course detail page, identify that course and scroll to enroll form
    if (location.pathname.startsWith("/courses/")) {
      const currentSlug = location.pathname.replace(/^\/courses\//, "").split("/")[0].split("#")[0];
      if (currentSlug) {
        const enrollEl = document.getElementById("enroll");
        if (enrollEl) {
          enrollEl.scrollIntoView({ behavior: "smooth", block: "center" });
          window.setTimeout(() => {
            enrollEl.querySelector("input")?.focus({ preventScroll: true });
          }, 350);
          window.history.replaceState(null, "", `/courses/${currentSlug}#enroll`);
        } else {
          navigate(`/courses/${currentSlug}#enroll`);
        }
        return;
      }
    }

    // 2. If on another page, identify the course from current announcement or fallback
    let targetSlug = null;

    if (current?.linkUrl && current.linkUrl.includes("/courses/")) {
      targetSlug = current.linkUrl.replace(/.*\/courses\//, "").split("#")[0].split("/")[0];
    }

    if (!targetSlug && current?.text) {
      const lower = current.text.toLowerCase();
      const matched = courses.find((c) => {
        const titleMatch = c.title && lower.includes(c.title.toLowerCase());
        const slugMatch = c.slug && lower.includes(c.slug.replace(/-/g, " "));
        return titleMatch || slugMatch;
      });

      if (matched) {
        targetSlug = matched.slug;
      } else if (lower.includes("data analytic")) {
        targetSlug = "data-analytics";
      } else if (lower.includes("python")) {
        targetSlug = "python-full-stack-development";
      } else if (lower.includes("java")) {
        targetSlug = "java-full-stack-development";
      } else if (lower.includes("aws") || lower.includes("devops")) {
        targetSlug = "aws-with-devops";
      } else if (lower.includes("mern")) {
        targetSlug = "mern-full-stack";
      }
    }

    if (!targetSlug) {
      targetSlug = courses[0]?.slug || "data-analytics";
    }

    navigate(`/courses/${targetSlug}#enroll`);
  };

  return (
    <div className="w-full bg-gradient-to-r from-[#F44246] to-[#CA164B] text-white shadow-xs">
      <div className="mx-auto flex min-h-11 flex-wrap items-center justify-center gap-2 sm:gap-3 px-4 py-1.5 sm:py-2 text-center">
        {/* Synchronized rotating badge with dynamic theme and smooth color transitions */}
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] sm:text-[11px] font-bold tracking-wide uppercase border select-none shrink-0 transition-colors duration-300 ease-in-out ${badgeTheme.badgeClasses}`}
          style={{
            opacity: visible ? 1 : 0,
            transition: `opacity ${FADE_MS}ms ease-in-out, background-color 300ms ease-in-out, border-color 300ms ease-in-out, color 300ms ease-in-out`,
          }}
        >
          {badgeTheme.type}
        </span>

        <p
          className="text-xs font-semibold sm:text-sm md:text-base tracking-wide"
          style={{
            opacity: visible ? 1 : 0,
            transition: `opacity ${FADE_MS}ms ease-in-out`,
          }}
        >
          {text}
        </p>

        <button
          type="button"
          onClick={handleEnrollNow}
          className="
            animate-[pulse_1.2s_ease-in-out_infinite]
            rounded-lg
            bg-white
            px-4
            py-1.5
            text-xs
            sm:text-sm
            font-bold
            text-[#DF1E26]
            shadow-sm
            transition
            duration-200
            hover:bg-slate-100
            active:scale-95
            cursor-pointer
            shrink-0
          "
        >
          Enroll Now
        </button>
      </div>
    </div>
  );
};

export default OfferHeader;
