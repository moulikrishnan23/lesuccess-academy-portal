import { useState, useEffect, useRef, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import useCourses from "../hooks/useCourses.js";
import {
  BADGE_THEMES,
  getBadgeTheme,
  getCourseBadgeType,
  getCourseOfferPercentage,
  selectBannerCourses,
  resolveTargetSlug,
  formatCourseOfferHeadline,
} from "../utils/courseOfferUtils.js";

/**
 * Shown only while GET /api/courses is still in flight, or if it fails outright.
 * Each entry carries its own slug for the same reason the live items do: Enroll
 * Now resolves its target from the item on screen and nothing else.
 */
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

  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const timerRef = useRef(null);

  /*
   * The banner rotates through Group 1 - Batch Courses, straight off
   * GET /api/courses via useCourses. selectBannerCourses applies the same test
   * the admin Courses tab uses to fill its Group 1 table, so what rotates up here
   * is exactly what an admin sees listed there.
   *
   * It used to prefer GET /api/announcements/active-all whenever that returned
   * anything, falling back to courses only when it was empty. That path is gone.
   * An announcement row is free text plus a link — it carries no course identity,
   * so when it was in use Enroll Now had nothing to navigate to and fell through
   * to guessing a course by substring-matching the headline. There is also no
   * admin screen anywhere in the app that can create an announcement, so the
   * override could only ever be populated by hand-written SQL.
   */
  const bannerItems = useMemo(() => {
    const bannerCourses = selectBannerCourses(courses);

    if (bannerCourses.length === 0) {
      // Still loading, or no course carries a badge yet.
      return FALLBACK_ITEMS;
    }

    return bannerCourses.map((course, idx) => {
      const offerPercentage = getCourseOfferPercentage(course);
      const badgeType = getCourseBadgeType(course, idx);
      const badgeTheme = getBadgeTheme(badgeType, idx);

      /*
       * Falling back to a hardcoded "data-analytics" here is what made a course
       * with no slug silently advertise a different course's page. The server
       * derives slug from the course name on every response, so an empty one
       * means something is wrong with the record — better to render the item
       * without a target and let Enroll Now fall back to the catalog.
       */
      const slug = course.slug || null;

      return {
        courseId: course.id ?? null,
        slug,
        title: course.title || course.name,
        badgeType,
        badgeTheme,
        offerPercentage,
        text: formatCourseOfferHeadline(course, offerPercentage, badgeType),
        linkUrl: slug ? `/courses/${slug}` : "/courses",
        course,
      };
    });
  }, [courses]);

  // 5-second rotation effect in lockstep
  useEffect(() => {
    if (bannerItems.length <= 1) return undefined;

    let fadeTimeout = null;
    timerRef.current = setInterval(() => {
      // fade out
      setVisible(false);
      fadeTimeout = setTimeout(() => {
        setIndex((prev) => (prev + 1) % bannerItems.length);
        // fade in
        setVisible(true);
      }, FADE_MS);
    }, INTERVAL_MS);

    return () => {
      clearInterval(timerRef.current);
      if (fadeTimeout) clearTimeout(fadeTimeout);
    };
  }, [bannerItems.length]);

  /*
   * Modulo, not a reset effect. The list swaps out from under the index when the
   * catalog arrives (4 fallback items -> however many batch courses there are),
   * and wrapping keeps the lookup in range without a setState-in-effect that
   * React now flags as a cascading render. The banner resumes a few positions
   * into the real list rather than at its start, which nobody can perceive on a
   * five-second rotation.
   */
  const current = bannerItems[index % bannerItems.length] ?? FALLBACK_ITEMS[0];
  const text = current.text ?? FALLBACK_ITEMS[0].text;
  const badgeTheme = current.badgeTheme ?? BADGE_THEMES["Special Offer"];

  /** The slug of the course detail page currently open, or null anywhere else. */
  const slugInUrl = useMemo(() => {
    const match = location.pathname.match(/^\/courses\/([^/#?]+)/);
    return match ? match[1] : null;
  }, [location.pathname]);

  /*
   * Enroll Now goes to the course the banner is showing right now — nothing else.
   *
   * Two things used to break that. The first was an early return: if the visitor
   * was on any /courses/* page it scrolled to THAT page's enroll form and never
   * looked at the banner, so anyone reading the Java course page got the Java
   * form back on every click no matter which course had rotated in. The second
   * was a substring ladder that guessed a course from the headline text, where
   * `includes("java")` also matches "JavaScript" and "DSA with Python / Java".
   *
   * A course carries its own slug from the API, so neither is needed: read it off
   * the item, and the only remaining question is whether we are already on that
   * course's page and can scroll instead of navigate.
   */
  const handleEnrollNow = () => {
    const targetSlug = resolveTargetSlug(current);

    // Nothing identifiable to enroll in — send them to the catalog rather than
    // to some arbitrary course's form.
    if (!targetSlug) {
      navigate("/courses");
      return;
    }

    // Already reading this exact course: scroll to the form in place, which keeps
    // the page from remounting under the visitor.
    if (slugInUrl === targetSlug) {
      const enrollEl = document.getElementById("enroll");
      if (enrollEl) {
        enrollEl.scrollIntoView({ behavior: "smooth", block: "center" });
        window.setTimeout(() => {
          enrollEl.querySelector("input")?.focus({ preventScroll: true });
        }, 350);
        window.history.replaceState(null, "", `/courses/${targetSlug}#enroll`);
        return;
      }
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
