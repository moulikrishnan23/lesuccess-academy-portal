import { useState, useEffect, useRef, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import apiClient from "../services/apiClient.js";
import useCourses from "../hooks/useCourses.js";
import { SOCIAL_LINKS } from "../data/socialLinks.js";
import {
  BADGE_THEMES,
  getBadgeTheme,
  getCourseBadgeType,
  getCourseOfferPercentage,
  isEligibleCourse,
  sortCoursesByOffer,
  formatCourseOfferHeadline,
} from "../utils/courseOfferUtils.js";

const FALLBACK_ITEMS = [
  {
    badgeType: "Special Offer",
    badgeTheme: BADGE_THEMES["Special Offer"],
    text: "Data Analytics Course - 30% Offer 10 Days Only - Limited Seats!",
    linkLabel: "Enroll Now",
    linkUrl: "/courses/data-analytics",
    slug: "data-analytics",
  },
  {
    badgeType: "Trending Course",
    badgeTheme: BADGE_THEMES["Trending Course"],
    text: "Python Full Stack Development - Industry-Ready Curriculum with 100% Placement Support!",
    linkLabel: "Enroll Now",
    linkUrl: "/courses/python-full-stack-development",
    slug: "python-full-stack-development",
  },
  {
    badgeType: "Most Enrolled",
    badgeTheme: BADGE_THEMES["Most Enrolled"],
    text: "Java Full Stack Development - Enterprise Spring Boot & Microservices Masterclass!",
    linkLabel: "Enroll Now",
    linkUrl: "/courses/full-stack-java",
    slug: "full-stack-java",
  },
  {
    badgeType: "High Demand",
    badgeTheme: BADGE_THEMES["High Demand"],
    text: "AWS with DevOps Certification - Hands-on Cloud, Docker & Kubernetes Training!",
    linkLabel: "Enroll Now",
    linkUrl: "/courses/aws-and-devops",
    slug: "aws-and-devops",
  },
];

const INTERVAL_MS = 5000;
const FADE_MS = 400;

const OfferHeader = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { courses } = useCourses();

  const [announcementsFromApi, setAnnouncementsFromApi] = useState([]);
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const timerRef = useRef(null);

  // Attempt to fetch any custom announcements from backend
  useEffect(() => {
    const controller = new AbortController();
    apiClient
      .get("/api/announcements/active-all", { signal: controller.signal })
      .then(({ data }) => {
        const list = data?.data;
        if (Array.isArray(list) && list.length > 0) {
          setAnnouncementsFromApi(list);
        }
      })
      .catch(() => {
        /* Fall back gracefully to course data */
      });
    return () => controller.abort();
  }, []);

  // Dynamically build rotating items from courses (Single source of truth)
  const activeAnnouncements = useMemo(() => {
    // If backend has dedicated announcement records, use them
    if (announcementsFromApi.length > 0) {
      return announcementsFromApi.map((item, idx) => {
        const badgeTheme = getBadgeTheme(item, idx);
        let slug = item.slug;
        if (!slug && item.linkUrl && item.linkUrl.includes("/courses/")) {
          slug = item.linkUrl.replace(/.*\/courses\//, "").split("#")[0].split("/")[0];
        }
        if (!slug && item.courseId) {
          const match = courses.find((c) => String(c.id) === String(item.courseId));
          if (match?.slug) slug = match.slug;
        }
        return {
          ...item,
          slug,
          badgeTheme,
          badgeType: badgeTheme.type,
        };
      });
    }

    // Filter and sort all eligible courses dynamically by offer percentage
    const eligibleCourses = courses.filter(isEligibleCourse);
    const sortedCourses = sortCoursesByOffer(eligibleCourses);

    if (sortedCourses.length > 0) {
      return sortedCourses.map((course, idx) => {
        const offerPercentage = getCourseOfferPercentage(course);
        const badgeType = getCourseBadgeType(course, idx);
        const badgeTheme = getBadgeTheme(badgeType, idx);
        const text = formatCourseOfferHeadline(course, offerPercentage, badgeType);
        const targetSlug = course.slug || "data-analytics";

        return {
          courseId: course.id,
          slug: targetSlug,
          title: course.title,
          badgeType,
          badgeTheme,
          offerPercentage,
          text,
          linkUrl: `/courses/${targetSlug}`,
          course,
        };
      });
    }

    // Default fallback while courses are loading or if catalog is empty
    return FALLBACK_ITEMS;
  }, [courses, announcementsFromApi]);

  // 5-second rotation effect in lockstep
  useEffect(() => {
    if (activeAnnouncements.length <= 1) return undefined;

    let fadeTimeout = null;
    timerRef.current = setInterval(() => {
      // fade out
      setVisible(false);
      fadeTimeout = setTimeout(() => {
        setIndex((prev) => (prev + 1) % activeAnnouncements.length);
        // fade in
        setVisible(true);
      }, FADE_MS);
    }, INTERVAL_MS);

    return () => {
      clearInterval(timerRef.current);
      if (fadeTimeout) clearTimeout(fadeTimeout);
    };
  }, [activeAnnouncements.length]);

  const current = activeAnnouncements[index % activeAnnouncements.length] ?? FALLBACK_ITEMS[0];
  const text = current.text ?? FALLBACK_ITEMS[0].text;
  const badgeTheme = current.badgeTheme ?? BADGE_THEMES["Special Offer"];

  const handleEnrollNow = (e) => {
    e?.preventDefault?.();

    // 1. Determine target course slug from currently displayed offer
    let targetSlug = current?.slug;

    if (!targetSlug && current?.linkUrl && current.linkUrl.includes("/courses/")) {
      targetSlug = current.linkUrl.replace(/.*\/courses\//, "").split("#")[0].split("/")[0];
    }

    if (!targetSlug && current?.courseId) {
      const match = courses.find((c) => String(c.id) === String(current.courseId));
      if (match?.slug) targetSlug = match.slug;
    }

    if (!targetSlug && current?.text) {
      const lower = current.text.toLowerCase();
      const matched = courses.find((c) => {
        const titleMatch = c.title && lower.includes(c.title.toLowerCase());
        const slugMatch = c.slug && lower.includes(c.slug.replace(/-/g, " "));
        return titleMatch || slugMatch;
      });

      if (matched?.slug) {
        targetSlug = matched.slug;
      } else if (lower.includes("python")) {
        targetSlug = "python-full-stack-development";
      } else if (lower.includes("java")) {
        targetSlug = "full-stack-java";
      } else if (lower.includes("data analytic")) {
        targetSlug = "data-analytics";
      } else if (lower.includes("aws") || lower.includes("devops")) {
        targetSlug = "aws-and-devops";
      } else if (lower.includes("mern")) {
        targetSlug = "mern-full-stack";
      }
    }

    if (!targetSlug) {
      targetSlug = courses[0]?.slug || "data-analytics";
    }

    // 2. Check current page slug if on a course detail page
    const currentSlug = location.pathname.startsWith("/courses/")
      ? location.pathname.replace(/^\/courses\//, "").split("/")[0].split("#")[0]
      : null;

    // 3. If ALREADY on this exact course detail page, scroll to enroll form
    if (currentSlug && currentSlug === targetSlug) {
      const enrollEl = document.getElementById("enroll") || document.querySelector("form");
      if (enrollEl) {
        enrollEl.scrollIntoView({ behavior: "smooth", block: "center" });
        window.setTimeout(() => {
          enrollEl.querySelector("input")?.focus({ preventScroll: true });
        }, 350);
        window.history.replaceState(null, "", `/courses/${targetSlug}#enroll`);
      } else {
        navigate(`/courses/${targetSlug}#enroll`);
      }
      return;
    }

    // 4. Otherwise navigate to the selected course's page with #enroll
    navigate(`/courses/${targetSlug}#enroll`);
  };

  return (
    <div className="w-full bg-gradient-to-r from-[#F44246] to-[#CA164B] text-white shadow-xs select-none">
      <div className="mx-auto flex min-h-10 sm:min-h-11 max-w-7xl items-center justify-between gap-1.5 sm:gap-4 px-2.5 sm:px-6 py-1 sm:py-1.5">
        
        {/* Left balance spacer on larger screens so center content stays centered */}
        <div className="hidden lg:flex items-center shrink-0 w-32" aria-hidden="true" />

        {/* Center: Synchronized dynamic rotating offer badge, copy and CTA */}
        <div className="flex flex-1 items-center justify-center gap-1.5 sm:gap-2.5 flex-wrap text-center px-1">
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 sm:px-2.5 py-0.5 text-[9px] sm:text-[11px] font-bold tracking-wide uppercase border select-none shrink-0 transition-colors duration-300 ease-in-out ${badgeTheme.badgeClasses}`}
            style={{
              opacity: visible ? 1 : 0,
              transition: `opacity ${FADE_MS}ms ease-in-out, background-color 300ms ease-in-out, border-color 300ms ease-in-out, color 300ms ease-in-out`,
            }}
          >
            {badgeTheme.type}
          </span>

          <p
            className="text-[11px] font-semibold sm:text-xs md:text-sm tracking-wide max-w-[180px] sm:max-w-none truncate sm:whitespace-normal"
            style={{
              opacity: visible ? 1 : 0,
              transition: `opacity ${FADE_MS}ms ease-in-out`,
            }}
            title={text}
          >
            {text}
          </p>

          <button
            type="button"
            onClick={handleEnrollNow}
            className="
              animate-[pulse_1.2s_ease-in-out_infinite]
              rounded-md sm:rounded-lg
              bg-white
              px-2 sm:px-3.5
              py-0.5 sm:py-1
              text-[10px] sm:text-xs
              font-bold
              text-[#DF1E26]
              shadow-xs
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

        {/* Right: Official LeSuccess Social Media Links */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          {SOCIAL_LINKS.map((item) => {
            const Icon = item.icon;
            return (
              <a
                key={item.name}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`LeSuccess on ${item.name}`}
                title={`Follow LeSuccess on ${item.name}`}
                className={`inline-flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-xs transition hover:bg-white/25 hover:scale-110 active:scale-95 ${item.hoverClass}`}
              >
                <Icon className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              </a>
            );
          })}
        </div>

      </div>
    </div>
  );
};

export default OfferHeader;
