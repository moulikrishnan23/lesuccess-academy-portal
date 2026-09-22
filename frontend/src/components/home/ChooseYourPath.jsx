import { Link } from "react-router-dom";
import {
  Clock3,
  Monitor,
  BriefcaseBusiness,
  Download,
  Layers3,
  ArrowUpRight,
} from "lucide-react";
import { motion } from "framer-motion";
import Skeleton, { SkeletonText } from "../ui/Skeleton.jsx";
import useCourses from "../../hooks/useCourses.js";
import useReducedMotion from "../../hooks/useReducedMotion.js";
import CourseBadge from "../ui/CourseBadge.jsx";
import { formatDuration } from "../../utils/formatters.js";
import { downloadSyllabus } from "../../utils/syllabusUtils.js";
import { getCourseLogo } from "../../utils/imageUtils.js";
import { fadeUp, motionSafe, ONCE_IN_VIEW } from "../../animations/variants.js";
import { FloatingOrbs, TechGrid, SectionHeading } from "../ui/BackgroundMotion.jsx";

/*
 * The four courses this section leads with, in the order they appear. Titles,
 * durations and badges are no longer written here — they come off the same
 * course records the detail pages render, so the home page cannot advertise a
 * duration the page it links to disagrees with. Curate this row by editing the
 * slugs.
 */
// Slugs are derived by CourseResponse.toSlug(name) on the backend.
const FEATURED_SLUGS = [
  "full-stack-java",
  "data-analytics",
  "python-full-stack-development",
  "aws-and-devops",
];

const LOGO_BY_SLUG = {
  "full-stack-java": "/tech/java.svg",
  "data-analytics": "/tech/powerbi.svg",
  "python-full-stack-development": "/tech/python.svg",
  "python-full-stack-development-course-in-coimbatore": "/tech/python.svg",
  "aws-and-devops": "/tech/aws.svg",
  "aws-devops": "/tech/aws.svg",
};

const DEFAULT_BADGES = {
  "full-stack-java": { badge: "MOST_ENROLLED", badgeText: "Most Enrolled" },
  "data-analytics": { badge: "OFFER", badgeText: "30% Offer" },
  "python-full-stack-development": { badge: "TRENDING", badgeText: "Trending" },
  "python-full-stack-development-course-in-coimbatore": { badge: "TRENDING", badgeText: "Trending" },
  "aws-and-devops": { badge: "HIGH_DEMAND", badgeText: "High Demand" },
  "aws-devops": { badge: "HIGH_DEMAND", badgeText: "High Demand" },
};

function CourseCardSkeleton() {
  return (
    <div className="rounded-2xl bg-white p-7">
      <div className="flex flex-col items-center">
        <Skeleton className="h-16 w-16" rounded="rounded-xl" />
        <Skeleton className="mt-4 h-6 w-64" />
        <SkeletonText lines={2} className="mt-5 w-full max-w-xl" />
        <Skeleton className="mt-7 h-4 w-72" />
        <div className="mt-8 grid w-full max-w-lg grid-cols-2 gap-5">
          <Skeleton className="h-12 w-full" rounded="rounded-md" />
          <Skeleton className="h-12 w-full" rounded="rounded-md" />
        </div>
      </div>
    </div>
  );
}

const ChooseYourPath = () => {
  const { courses, isLoading, error } = useCourses();
  const reduced = useReducedMotion();

  // Match featured courses flexibly across slugs
  const featured = FEATURED_SLUGS.map((slug) => {
    const found = courses.find(
      (c) =>
        c.slug === slug ||
        c.slug === slug.replace('-and-', '-') ||
        (slug.includes('java') && c.slug?.includes('java')) ||
        (slug.includes('data-analytics') && c.slug?.includes('data-analytics')) ||
        (slug.includes('python') && c.slug?.includes('python')) ||
        ((slug.includes('aws') || slug.includes('devops')) && (c.slug?.includes('aws') || c.slug?.includes('devops')))
    );
    if (!found) return null;
    const defaultBadge = DEFAULT_BADGES[slug] || DEFAULT_BADGES[found.slug] || {};
    return {
      ...found,
      badge: found.badge || defaultBadge.badge,
      badgeText: found.badgeText || found.badgeLabel || defaultBadge.badgeText,
    };
  }).filter(Boolean);

  /*
   * A failed catalog fetch hides the section rather than putting an error box
   * on the marketing home page — the rest of the page still sells the academy,
   * and the navbar still reaches /courses.
   */
  if (error || (!isLoading && featured.length === 0)) return null;

  return (
    <section className="relative w-full bg-[#F5F8FC] px-6 py-20 sm:px-10 lg:px-20 overflow-hidden">
      {/* Purposeful Background Motion */}
      <FloatingOrbs variant="default" />
      <TechGrid opacity="opacity-[0.025]" />

      <div className="relative z-10 mx-auto max-w-6xl text-center">
        <SectionHeading
          badge="CHOOSE YOUR PATH"
          badgeIcon={Layers3}
          titlePrefix="Build Your"
          titleHighlight="High-Paying"
          titleSuffix="Tech Career"
          description="Master production-grade engineering practices through rigorous project-based learning, real-world codebase development, and dedicated placement support."
        />

        {isLoading ? (
          <div
            aria-busy="true"
            aria-label="Loading featured courses"
            className="mt-14 grid gap-8 md:grid-cols-2"
          >
            {Array.from({ length: FEATURED_SLUGS.length }, (_, index) => (
              <CourseCardSkeleton key={index} />
            ))}
          </div>
        ) : (
          <div className="mt-14 grid gap-8 md:grid-cols-2">
            {featured.map((course) => (
              <div
                key={course.slug}
                className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-7 sm:p-8 shadow-[0_4px_20px_rgba(7,64,92,0.06)] hover:shadow-[0_22px_45px_rgba(7,64,92,0.12)] hover:-translate-y-2 hover:border-[#07405C]/35 transition-all duration-300 text-left"
              >
                {/* Subtle top brand accent line with faint resting presence */}
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#DF1E26] via-[#CA164B] to-[#07405C] opacity-25 group-hover:opacity-100 transition-opacity duration-300" />

                {(course.badge || course.badgeLabel || course.badgeText) && (
                  <div className="absolute right-6 top-6 z-10">
                    <CourseBadge badge={course.badge} badgeText={course.badgeLabel || course.badgeText} />
                  </div>
                )}

                <div>
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-slate-200/80 bg-slate-50 p-2.5 shadow-2xs transition-all duration-300 group-hover:scale-105 group-hover:border-[#07405C]/20 group-hover:bg-[#07405C]/5">
                      <img
                        src={getCourseLogo(course) || LOGO_BY_SLUG[course.slug]}
                        alt=""
                        width={40}
                        height={40}
                        className="h-full w-full object-contain"
                      />
                    </div>
                    <div className="pr-16">
                      <h3 className="text-xl font-bold text-[#101010] sm:text-2xl leading-tight">
                        <Link
                          to={`/courses/${course.slug}`}
                          className="inline-flex items-center gap-1.5 transition-colors duration-200 hover:text-[#DF1E26] group-hover:text-[#07405C]"
                        >
                          <span>{course.title}</span>
                          <ArrowUpRight
                            size={18}
                            className="opacity-0 -translate-x-1 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0 text-[#DF1E26] shrink-0"
                          />
                        </Link>
                      </h3>
                      {course.category && (
                        <span className="text-xs font-semibold text-slate-400 mt-1 block">
                          {course.category}
                        </span>
                      )}
                    </div>
                  </div>

                  {course.shortDescription && (
                    <p className="mt-4 text-sm leading-relaxed text-slate-600 line-clamp-2">
                      {course.shortDescription}
                    </p>
                  )}

                  <div className="mt-6 flex flex-wrap gap-3 border-t border-slate-100 pt-5 text-xs font-semibold text-slate-700">
                    <span className="flex items-center gap-1.5 rounded-lg bg-slate-50 px-2.5 py-1 border border-slate-200/60 transition-colors group-hover:border-[#07405C]/15">
                      <Clock3 size={14} className="text-[#07405C]" />
                      {formatDuration(course.durationValue, course.durationUnit)}
                    </span>

                    <span className="flex items-center gap-1.5 rounded-lg bg-slate-50 px-2.5 py-1 border border-slate-200/60 transition-colors group-hover:border-[#07405C]/15">
                      <Monitor size={14} className="text-[#07405C]" />
                      Offline / Online
                    </span>

                    <span className="flex items-center gap-1.5 rounded-lg bg-slate-50 px-2.5 py-1 border border-slate-200/60 transition-colors group-hover:border-[#DF1E26]/20">
                      <BriefcaseBusiness size={14} className="text-[#DF1E26]" />
                      Placement Cell
                    </span>
                  </div>
                </div>

                <div className="mt-8 grid grid-cols-2 gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => downloadSyllabus(course)}
                    className="flex items-center justify-center gap-2 rounded-xl border border-[#07405C] py-2.5 text-xs sm:text-sm font-bold text-[#07405C] transition-all hover:bg-[#07405C] hover:text-white active:scale-95 cursor-pointer shadow-xs"
                    title={`Download ${course.title} Syllabus (PDF)`}
                  >
                    <Download size={15} />
                    <span>Syllabus</span>
                  </button>

                  <Link
                    to={`/courses/${course.slug}`}
                    className="flex items-center justify-center rounded-xl bg-gradient-to-r from-[#F44246] to-[#CA164B] py-2.5 text-xs sm:text-sm font-bold text-white shadow-md transition-all hover:brightness-105 active:scale-95 cursor-pointer"
                  >
                    Enroll Now
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-12">
          <Link
            to="/courses"
            className="group inline-flex items-center gap-2 rounded-xl border-2 border-[#07405C] px-8 py-3 text-sm font-bold text-[#07405C] transition hover:bg-[#07405C] hover:text-white"
          >
            <span>View All Courses</span>
            <span aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-1">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ChooseYourPath;
