import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  Monitor,
  BriefcaseBusiness,
  Download,
  ArrowUpRight,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
} from "lucide-react";
import Skeleton, { SkeletonText } from "../ui/Skeleton.jsx";
import useCourses from "../../hooks/useCourses.js";
import useReducedMotion from "../../hooks/useReducedMotion.js";
import CourseBadge from "../ui/CourseBadge.jsx";
import { formatDuration } from "../../utils/formatters.js";
import { downloadSyllabus, hasSyllabus } from "../../utils/syllabusUtils.js";
import { getCourseLogo } from "../../utils/imageUtils.js";
import { TechGrid } from "../ui/BackgroundMotion.jsx";
import SectionHead from "./SectionHead.jsx";
import ErrorState from "../ui/ErrorState.jsx";
import { useInView } from "../motion/index.js";
import {
  isEligibleCourse,
  sortCoursesByOffer,
} from "../../utils/courseOfferUtils.js";

/*
 * LOGO_BY_SLUG and DEFAULT_BADGES used to sit here: two hand-maintained maps
 * keyed by the slugs of the originally seeded courses, supplying a logo and a
 * badge to courses that did not carry their own.
 *
 * Both are gone. `iconUrl`, `badge` and `badgeText` are columns an admin fills
 * in the Courses tab and the API serves on every course, so a map here could
 * only ever do one of two things: override what the admin set, or invent a
 * value for a course that deliberately has none. Neither is what the dashboard
 * being the source of truth means. A course added today has no entry in a map
 * written months ago anyway, which is the whole problem.
 */

/*
 * Card style and carousel follow docs/mockup/lower-home.html (#path): a navy
 * header carrying the admin-set logo and badge (courses have no photo field, so
 * the mockup's placeholder photo is replaced by the logo), a duration bar, and
 * a scroll-snap carousel with dots and arrows. Cards enter with a staggered 3D
 * tilt, bars fill to their value, badges get a shimmer sweep, and a red glow
 * follows the pointer across each card (keyframes in home-motion.css).
 */

const GAP_PX = 24; // gap-6 between slides, used to compute the slide step.

// Duration bars are drawn relative to the longest featured course, so they need
// a common unit. Units with no clean month equivalent (hours) get no bar.
const MONTHS_PER_UNIT = {
  DAY: 1 / 30,
  DAYS: 1 / 30,
  WEEK: 1 / 4.345,
  WEEKS: 1 / 4.345,
  MONTH: 1,
  MONTHS: 1,
  YEAR: 12,
  YEARS: 12,
};

function durationInMonths(course) {
  const value = Number(course.durationValue);
  const factor = MONTHS_PER_UNIT[String(course.durationUnit || "").toUpperCase()];
  return Number.isFinite(value) && value > 0 && factor ? value * factor : null;
}

function CourseCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-bento border border-slate-200/90 bg-white" aria-hidden="true">
      <Skeleton className="h-40 w-full" rounded="rounded-none" />
      <div className="space-y-4 p-6">
        <Skeleton className="h-6 w-4/5" />
        <SkeletonText lines={3} />
        <Skeleton className="h-2 w-full" rounded="rounded-full" />
        <Skeleton className="h-11 w-full" rounded="rounded-full" />
      </div>
    </div>
  );
}

function CourseCard({ course, barScale }) {
  const duration = formatDuration(course.durationValue, course.durationUnit);
  const badgeText = course.badgeLabel || course.badgeText;
  const syllabus = hasSyllabus(course);

  return (
    <article className="course-card motion-spot group relative flex h-full flex-col overflow-hidden rounded-bento border border-slate-200/90 bg-white text-left shadow-lift-sm">
      {/* Header: navy band with a dot grid and a brand glow, logo in a tile. */}
      <div className="course-card-top relative grid h-40 place-items-center overflow-hidden">
        {(course.badge || badgeText) && (
          <span className="course-badge-shine absolute left-3 top-3 z-[1] inline-flex overflow-hidden rounded-full">
            <CourseBadge badge={course.badge} badgeText={badgeText} />
          </span>
        )}
        <div className="course-card-logo relative z-[1] grid h-16 w-16 place-items-center rounded-2xl bg-white p-2.5 shadow-lift-md">
          <img
            src={getCourseLogo(course)}
            alt=""
            width={44}
            height={44}
            className="h-full w-full object-contain"
          />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 px-6 pt-5">
        <div className="min-w-0">
          <h3 className="text-[1.1875rem] font-bold leading-snug text-[#101010]">
            <Link
              to={`/courses/${course.slug}`}
              // Stretched link: its ::after covers the whole card, so a click
              // anywhere opens the course; the footer buttons sit above it.
              className="course-card-title inline-flex items-start gap-1.5 transition-colors duration-200 hover:text-brand after:absolute after:inset-0 after:z-[1] after:rounded-[inherit] after:content-['']"
              data-cursor-text="View"
            >
              <span className="min-w-0 break-words">{course.title}</span>
              <ArrowUpRight
                size={18}
                aria-hidden="true"
                className="mt-1 shrink-0 text-brand opacity-0 transition-[opacity,transform] duration-300 ease-brand -translate-x-1 group-hover:translate-x-0 group-hover:opacity-100"
              />
            </Link>
          </h3>
          {course.category && (
            <span className="mt-1 block truncate text-xs font-semibold text-slate-400">{course.category}</span>
          )}
        </div>

        {course.shortDescription && (
          <p className="line-clamp-3 text-sm leading-relaxed text-slate-600">{course.shortDescription}</p>
        )}

        {duration && (
          <div>
            <div className="mb-1.5 flex justify-between text-[0.8125rem] font-semibold text-ink-muted">
              <span>Duration</span>
              <span>{duration}</span>
            </div>
            {barScale != null && (
              <div className="h-1.5 overflow-hidden rounded-full bg-line" aria-hidden="true">
                <i className="course-bar block h-full rounded-full" style={{ "--w": barScale }} />
              </div>
            )}
          </div>
        )}

        <ul className="grid gap-1.5 text-sm text-slate-700">
          <li className="flex items-center gap-2.5">
            <Monitor size={16} className="shrink-0 text-brand" aria-hidden="true" />
            Offline / Online
          </li>
          <li className="flex items-center gap-2.5">
            <BriefcaseBusiness size={16} className="shrink-0 text-brand" aria-hidden="true" />
            Placement Cell
          </li>
        </ul>
      </div>

      {/* One column when there is no syllabus, so Enroll Now does not sit
          beside a gap. */}
      <div className={`relative z-[2] mt-auto grid gap-2 px-6 pb-6 pt-5 ${syllabus ? "grid-cols-2" : "grid-cols-1"}`}>
        {syllabus && (
          <button
            type="button"
            onClick={() => downloadSyllabus(course)}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-3 text-sm font-bold text-navy-800 shadow-[inset_0_0_0_2px_var(--color-navy-800)] transition-colors duration-300 hover:bg-navy-800 hover:text-white active:scale-95"
            title={`Download ${course.title} Syllabus (PDF)`}
            data-cursor-text="PDF"
          >
            <Download size={15} className="shrink-0" aria-hidden="true" />
            <span className="truncate">Syllabus</span>
          </button>
        )}
        <Link
          to={`/courses/${course.slug}`}
          className="inline-flex min-h-11 items-center justify-center rounded-full bg-[image:var(--gradient-brand)] px-3 text-sm font-bold text-white shadow-[0_6px_20px_color-mix(in_srgb,var(--color-brand-deep)_25%,transparent)] transition-shadow duration-300 hover:shadow-glow-brand active:scale-95"
          data-cursor-text="Enroll"
        >
          <span className="truncate">Enroll Now</span>
        </Link>
      </div>
    </article>
  );
}

function CourseCarousel({ courses }) {
  const wrapRef = useRef(null);
  const trackRef = useRef(null);
  const reduced = useReducedMotion();
  const inView = useInView(wrapRef, { threshold: 0.2 });

  const [page, setPage] = useState(0);
  const [pageCount, setPageCount] = useState(1);

  const longest = useMemo(
    () => Math.max(0, ...courses.map((c) => durationInMonths(c) ?? 0)),
    [courses],
  );

  // Slide step = one card plus the gap; pages = positions the track can rest
  // at. Measured from the DOM because the visible count changes per breakpoint.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return undefined;

    const step = () => (track.firstElementChild?.offsetWidth ?? 1) + GAP_PX;
    const sync = () => {
      const perView = Math.max(1, Math.round((track.clientWidth + GAP_PX) / step()));
      setPageCount(Math.max(1, courses.length - perView + 1));
      setPage(Math.round(track.scrollLeft / step()));
    };

    let frame = 0;
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(() => {
        frame = 0;
        sync();
      });
    };

    // ResizeObserver fires once on observe, which doubles as the first measure.
    const ro = new ResizeObserver(sync);
    ro.observe(track);
    track.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      ro.disconnect();
      track.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, [courses.length]);

  const goTo = (index) => {
    const track = trackRef.current;
    if (!track) return;
    const step = (track.firstElementChild?.offsetWidth ?? 0) + GAP_PX;
    const last = pageCount - 1;
    // Arrows wrap around at either end, as in the mockup.
    const target = index > last ? 0 : index < 0 ? last : index;
    track.scrollTo({ left: target * step, behavior: reduced ? "auto" : "smooth" });
  };

  const onKeyDown = (event) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      goTo(page + 1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      goTo(page - 1);
    }
  };

  return (
    <div
      ref={wrapRef}
      className={`course-carousel mt-14 ${inView || reduced ? "is-in" : ""}`}
      role="region"
      aria-roledescription="carousel"
      aria-label="Featured courses"
    >
      <ul
        ref={trackRef}
        tabIndex={0}
        onKeyDown={onKeyDown}
        className="course-track -mx-1 flex snap-x snap-mandatory gap-6 overflow-x-auto px-1 pb-8 pt-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {courses.map((course, index) => {
          const months = durationInMonths(course);
          return (
            <li
              key={course.slug || course.id}
              className="course-slide shrink-0 basis-[85%] snap-start sm:basis-[calc((100%-1.5rem)/2)] lg:basis-[calc((100%-3rem)/3)]"
              style={{ "--k": index }}
              aria-roledescription="slide"
              aria-label={`${index + 1} of ${courses.length}`}
            >
              <CourseCard
                course={course}
                barScale={months && longest ? Math.max(0.12, months / longest) : null}
              />
            </li>
          );
        })}
      </ul>

      {pageCount > 1 && (
        <div className="mt-2 flex items-center justify-between gap-4">
          {/* A dot per position stops fitting a phone row (13 courses = 13 dots
              would push the arrows off screen), so phones get a counter instead
              once there are more than six positions. */}
          {pageCount > 6 && (
            <span className="text-sm font-bold tabular-nums text-navy-800 sm:hidden" aria-live="polite">
              {page + 1} / {pageCount}
            </span>
          )}
          <div className={`items-center ${pageCount > 6 ? "hidden sm:flex" : "flex"}`}>
            {Array.from({ length: pageCount }, (_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Go to slide ${i + 1}`}
                data-cursor-text="Go"
                aria-current={i === page ? "true" : undefined}
                className="grid h-11 min-w-7 place-items-center"
              >
                <span
                  className={`block h-2.5 rounded-full transition-[width,background-color] duration-400 ease-brand ${
                    i === page ? "w-8 bg-[image:var(--gradient-brand)]" : "w-2.5 bg-line-strong"
                  }`}
                />
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => goTo(page - 1)}
              aria-label="Previous course"
              data-cursor-text="Prev"
              className="grid h-12 w-12 place-items-center rounded-full border-[1.5px] border-line bg-white text-navy-800 transition-[background-color,color,transform] duration-300 hover:scale-105 hover:bg-navy-800 hover:text-white"
            >
              <ChevronLeft size={20} aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => goTo(page + 1)}
              aria-label="Next course"
              data-cursor-text="Next"
              className="grid h-12 w-12 place-items-center rounded-full border-[1.5px] border-line bg-white text-navy-800 transition-[background-color,color,transform] duration-300 hover:scale-105 hover:bg-navy-800 hover:text-white"
            >
              <ChevronRight size={20} aria-hidden="true" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const ChooseYourPath = () => {
  const { courses, isLoading, error, refetch } = useCourses();

  // Dynamically filter and sort courses:
  // 1. Highest offer percentage first (e.g. 50% -> 30% -> 20%)
  // 2. Then by displayOrder for remaining badged / featured courses
  const featured = useMemo(() => {
    if (!Array.isArray(courses) || courses.length === 0) return [];

    const eligible = courses.filter(isEligibleCourse);
    const sourceList = eligible.length > 0 ? eligible : courses.filter((c) => c.isActive !== false);

    // Returned as-is. The badge each card shows is the badge on the course row;
    // nothing is substituted in for a course that has none.
    return sortCoursesByOffer(sourceList);
  }, [courses]);

  let body;
  if (error && courses.length === 0) {
    body = (
      <div className="mx-auto mt-14 max-w-xl">
        <ErrorState
          title="Unable to load courses"
          message="We're unable to load course information right now. Please try again."
          onRetry={refetch}
          retryLabel="Retry"
        />
      </div>
    );
  } else if (isLoading && courses.length === 0) {
    body = (
      <div
        aria-busy="true"
        aria-label="Loading featured courses"
        className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
      >
        {Array.from({ length: 3 }, (_, index) => (
          <CourseCardSkeleton key={index} />
        ))}
      </div>
    );
  } else if (featured.length === 0) {
    body = (
      <div
        role="status"
        className="mt-14 grid justify-items-center gap-3 rounded-bento border-2 border-dashed border-line bg-section px-6 py-12 text-center"
      >
        <GraduationCap size={48} className="text-ink-muted" aria-hidden="true" />
        {/* TODO(content): empty-state wording for when no course is published. */}
        <b className="text-lg text-navy-800">New courses are on the way</b>
        <p className="max-w-[44ch] text-[0.9375rem]">
          Our next batches are being scheduled. Browse the full catalogue or get in touch for upcoming dates.
        </p>
      </div>
    );
  } else {
    body = <CourseCarousel courses={featured} />;
  }

  return (
    <section
      id="path"
      className="relative w-full overflow-hidden bg-[#F5F8FC] px-4 py-20 sm:px-6 lg:px-20"
    >
      <TechGrid opacity="opacity-[0.025]" />

      <div className="relative z-10 mx-auto max-w-6xl text-center">
        <SectionHead
          className="text-left"
          badge="Choose Your Path"
          title="Build Your High-Paying Tech Career"
          lead="Master production-grade engineering practices through rigorous project-based learning, real-world codebase development, and dedicated placement support."
        />

        {body}

        <div className="mt-10">
          <Link
            to="/courses"
            data-cursor-text="Courses"
            className="group inline-flex min-h-12 items-center gap-2 rounded-full px-8 py-3 text-sm font-bold text-navy-800 shadow-[inset_0_0_0_2px_var(--color-navy-800)] transition-colors duration-300 hover:bg-navy-800 hover:text-white"
          >
            <span>View All Courses</span>
            <ArrowRight size={16} aria-hidden="true" className="transition-transform duration-300 ease-brand group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ChooseYourPath;
