import { useState, useEffect, useRef, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import useCourses from "../../hooks/useCourses.js";
import useReducedMotion from "../../hooks/useReducedMotion.js";
import { SOCIAL_LINKS } from "../../data/socialLinks.js";
import { ArrowRight, Sparkles } from "lucide-react";
import {
  BADGE_THEMES,
  getBadgeTheme,
  getCourseBadgeType,
  getCourseOfferPercentage,
  selectBannerCourses,
  resolveTargetSlug,
  formatCourseOfferHeadline,
} from "../../utils/courseOfferUtils.js";

/**
 * Fallback offer items if /api/courses is still loading or unavailable.
 */
const FALLBACK_ITEMS = [
  {
    badgeType: "Most Enrolled",
    badgeTheme: BADGE_THEMES["Most Enrolled"],
    title: "Full Stack Java",
    text: "MOST ENROLLED • FULL STACK JAVA",
    linkLabel: "Enroll Now",
    linkUrl: "/courses/full-stack-java",
    slug: "full-stack-java",
  },
];

const INTERVAL_MS = 5000;

const OfferHeader = ({ offerHeaderRef }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const reduced = useReducedMotion();
  const { courses } = useCourses();

  const [index, setIndex] = useState(0);
  const timerRef = useRef(null);

  const bannerItems = useMemo(() => {
    const bannerCourses = selectBannerCourses(courses);

    if (bannerCourses.length === 0) {
      return FALLBACK_ITEMS;
    }

    return bannerCourses.map((course, idx) => {
      const offerPercentage = getCourseOfferPercentage(course);
      const badgeType = getCourseBadgeType(course, idx);
      const badgeTheme = getBadgeTheme(badgeType, idx);
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

  // 5-second rotation effect through available courses
  useEffect(() => {
    if (bannerItems.length <= 1 || reduced) return undefined;

    timerRef.current = setInterval(() => {
      setIndex((prev) => (prev + 1) % bannerItems.length);
    }, INTERVAL_MS);

    return () => {
      clearInterval(timerRef.current);
    };
  }, [bannerItems.length, reduced]);

  const current = bannerItems[index % bannerItems.length] ?? FALLBACK_ITEMS[0];
  const badgeType = current.badgeType || "Special Offer";
  const badgeTheme = current.badgeTheme ?? BADGE_THEMES[badgeType] ?? BADGE_THEMES["Special Offer"];

  /** The slug of the course detail page currently open, or null anywhere else. */
  const slugInUrl = useMemo(() => {
    const match = location.pathname.match(/^\/courses\/([^/#?]+)/);
    return match ? match[1] : null;
  }, [location.pathname]);

  const handleEnrollNow = (e) => {
    e?.preventDefault?.();
    const targetSlug = resolveTargetSlug(current);

    if (!targetSlug) {
      navigate("/courses");
      return;
    }

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
    <div className="pointer-events-none fixed inset-x-0 top-2 z-[60] px-4 sm:top-2.5 sm:px-6 lg:px-8">
      <div
        ref={offerHeaderRef}
        className="mx-auto flex w-full max-w-[76rem] flex-col items-start gap-2 lg:flex-row lg:items-center lg:justify-between lg:gap-4"
      >
        <div
          role="region"
          aria-label="Featured course offer"
          className="lesuccess-offer pointer-events-auto flex h-auto min-h-10 w-fit max-w-full min-w-0 items-center gap-2 rounded-2xl border border-white/25 bg-[#DF1E26] px-2.5 py-1 text-white shadow-[0_8px_28px_rgba(2,31,48,0.18)] sm:min-h-10 sm:py-1 sm:rounded-full sm:px-3.5 lg:max-w-[calc(100%-14rem)]"
        >
          <Sparkles aria-hidden="true" size={15} className="shrink-0 text-white" />
          <span className={`hidden shrink-0 items-center rounded-full border px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-[0.1em] transition-colors duration-300 md:inline-flex ${badgeTheme.badgeClasses}`}>
            {badgeType}
          </span>
          <p
            className="min-w-0 max-w-[calc(100vw-8rem)] flex-1 text-[10px] font-semibold leading-tight tracking-wide sm:text-xs lg:max-w-[min(48vw,620px)]"
            title={current.text || current.title}
          >
            {current.text || current.title}
          </p>
          <button
            type="button"
            onClick={handleEnrollNow}
            aria-label={`Enroll Now in ${current.title || current.badgeType}`}
            className="inline-flex shrink-0 motion-safe:animate-[pulse_1.2s_ease-in-out_infinite] items-center gap-1 rounded-md bg-white px-2 py-0.5 text-[9.5px] font-bold text-[#DF1E26] shadow-xs transition duration-200 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#DF1E26] active:scale-95 sm:rounded-lg sm:px-3 sm:py-1 sm:text-xs"
          >
            <span>Enroll Now</span>
            <ArrowRight aria-hidden="true" size={13} className="transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>

        <div
          role="group"
          aria-label="LeSuccess social media"
          className="pointer-events-auto flex shrink-0 items-center justify-end gap-1 self-end sm:gap-1.5 lg:self-auto"
        >
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
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/80 bg-white text-[#07405C] shadow-[0_4px_18px_rgba(7,64,92,0.16)] transition-all hover:-translate-y-0.5 hover:text-[#DF1E26] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DF1E26] focus-visible:ring-offset-2 sm:h-8 sm:w-8 lg:h-9 lg:w-9"
              >
                <Icon aria-hidden="true" className="h-4 w-4" />
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default OfferHeader;
