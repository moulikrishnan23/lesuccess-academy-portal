import { useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Clock3,
  Monitor,
  BriefcaseBusiness,
  Download,
  Layers3,
  ArrowUpRight,
} from "lucide-react";
import Skeleton, { SkeletonText } from "../ui/Skeleton.jsx";
import useCourses from "../../hooks/useCourses.js";
import CourseBadge from "../ui/CourseBadge.jsx";
import { formatDuration } from "../../utils/formatters.js";
import { downloadSyllabus, hasSyllabus } from "../../utils/syllabusUtils.js";
import { getCourseLogo } from "../../utils/imageUtils.js";
import {
  FloatingOrbs,
  TechGrid,
  SectionHeading,
} from "../ui/BackgroundMotion.jsx";
import ScrollReveal from "../../animations/ScrollReveal.jsx";
import ErrorState from "../ui/ErrorState.jsx";
import SpotlightCard from "../ui/SpotlightCard.jsx";
import Magnetic from "../ui/Magnetic.jsx";
import BorderBeam from "../ui/BorderBeam.jsx";
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
  const { courses, isLoading, error, refetch } = useCourses();

  // Dynamically filter and sort courses:
  // 1. Highest offer percentage first (e.g. 50% -> 30% -> 20%)
  // 2. Then by displayOrder for remaining badged / featured courses
  const featured = useMemo(() => {
    if (!Array.isArray(courses) || courses.length === 0) return [];

    const eligible = courses.filter(isEligibleCourse);
    const sourceList =
      eligible.length > 0
        ? eligible
        : courses.filter((c) => c.isActive !== false);

    // Returned as-is. The badge each card shows is the badge on the course row;
    // nothing is substituted in for a course that has none.
    return sortCoursesByOffer(sourceList);
  }, [courses]);

  return (
    <section className="relative w-full bg-[#F5F8FC] px-4 py-20 sm:px-6 lg:px-20 overflow-hidden transition-colors duration-200">
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

        {error && courses.length === 0 ? (
          <div className="mt-14 max-w-xl mx-auto">
            <ErrorState
              title="Unable to load courses"
              message="We're unable to load course information right now. Please try again."
              onRetry={refetch}
              retryLabel="Retry"
            />
          </div>
        ) : isLoading && courses.length === 0 ? (
          <div
            aria-busy="true"
            aria-label="Loading featured courses"
            className="mt-14 grid gap-8 md:grid-cols-2"
          >
            {Array.from({ length: 4 }, (_, index) => (
              <CourseCardSkeleton key={index} />
            ))}
          </div>
        ) : (
          <ScrollReveal
            preset="perspective"
            staggerChildren={true}
            staggerDelay={0.08}
            className="mt-14 grid gap-8 md:grid-cols-2"
          >
            {featured.map((course, idx) => (
              <motion.div
                key={course.slug || course.id}
                variants={{
                  hidden: { opacity: 0, y: 35, scale: 0.95 },
                  visible: { opacity: 1, y: 0, scale: 1 },
                }}
                className="h-full"
              >
                <SpotlightCard
                  tilt={true}
                  maxTilt={6}
                  spotlightColor="rgba(7, 64, 92, 0.12)"
                  data-cursor-text="Explore"
                  className="card-lift-3d group relative flex h-full flex-col justify-between overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-6 md:p-8 shadow-[0_4px_20px_rgba(7,64,92,0.06)] text-left min-w-0 cursor-default"
                >
                  <BorderBeam
                    size={160}
                    duration={8}
                    delay={idx * 1.5}
                    colorFrom="#DF1E26"
                    colorTo="#07405C"
                  />
                  {/* Subtle top brand accent line with glow on hover */}
                  <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#DF1E26] via-[#CA164B] to-[#07405C] opacity-25 group-hover:opacity-100 transition-opacity duration-300" />

                  <div className="min-w-0">
                    {/* TOP ROW: Logo on left, Badge on right in natural flow - NEVER covering title! */}
                    <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                      <div className="flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-2xl border border-slate-200/80 bg-slate-50 p-2 sm:p-2.5 shadow-2xs transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 group-hover:border-[#07405C]/20 group-hover:bg-[#07405C]/5">
                        <img
                          src={getCourseLogo(course)}
                          alt=""
                          width={40}
                          height={40}
                          className="h-full w-full object-contain"
                        />
                      </div>

                      {(course.badge ||
                        course.badgeLabel ||
                        course.badgeText) && (
                        <div className="shrink-0 flex justify-end">
                          <CourseBadge
                            badge={course.badge}
                            badgeText={course.badgeLabel || course.badgeText}
                          />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0">
                      <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-[#101010] leading-snug break-words">
                        <Link
                          to={`/courses/${course.slug}`}
                          className="inline-flex items-center gap-1.5 transition-colors duration-200 hover:text-[#DF1E26] group-hover:text-[#07405C]"
                        >
                          <span className="min-w-0 break-words">
                            {course.title}
                          </span>
                          <ArrowUpRight
                            size={18}
                            className="opacity-0 -translate-x-1 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0 text-[#DF1E26] shrink-0"
                          />
                        </Link>
                      </h3>
                      {course.category && (
                        <span className="text-xs font-semibold text-slate-400 mt-1 block truncate">
                          {course.category}
                        </span>
                      )}
                    </div>

                    {course.shortDescription && (
                      <p className="mt-4 text-xs sm:text-sm leading-relaxed text-slate-600 line-clamp-2">
                        {course.shortDescription}
                      </p>
                    )}

                    <div className="mt-6 flex flex-wrap gap-3 border-t border-slate-100 pt-5 text-xs font-semibold text-slate-700 min-w-0">
                      <span className="flex items-center gap-1.5 rounded-lg bg-slate-50 px-2.5 py-1 border border-slate-200/60 transition-colors group-hover:border-[#07405C]/15 min-w-0">
                        <Clock3 size={14} className="text-[#07405C] shrink-0" />
                        <span className="truncate">
                          {formatDuration(
                            course.durationValue,
                            course.durationUnit,
                          )}
                        </span>
                      </span>

                      <span className="flex items-center gap-1.5 rounded-lg bg-slate-50 px-2.5 py-1 border border-slate-200/60 transition-colors group-hover:border-[#07405C]/15 min-w-0">
                        <Monitor
                          size={14}
                          className="text-[#07405C] shrink-0"
                        />
                        <span className="truncate">Offline / Online</span>
                      </span>

                      <span className="flex items-center gap-1.5 rounded-lg bg-slate-50 px-2.5 py-1 border border-slate-200/60 transition-colors group-hover:border-[#DF1E26]/20 min-w-0">
                        <BriefcaseBusiness
                          size={14}
                          className="text-[#DF1E26] shrink-0"
                        />
                        <span className="truncate">Placement Cell</span>
                      </span>
                    </div>
                  </div>

                  {/* One column when there is no syllabus, so Enroll Now does not sit beside a gap. */}
                  <div
                    className={`mt-8 grid gap-3 pt-2 ${
                      hasSyllabus(course)
                        ? "grid-cols-1 sm:grid-cols-2"
                        : "grid-cols-1"
                    }`}
                  >
                    {hasSyllabus(course) && (
                      <button
                        type="button"
                        onClick={() => downloadSyllabus(course)}
                        data-cursor-text="Syllabus"
                        className="btn-glow-navy flex items-center justify-center gap-2 rounded-xl border border-[#07405C] py-2.5 text-xs sm:text-sm font-bold text-[#07405C] transition-all hover:bg-[#07405C] hover:text-white active:scale-95 cursor-pointer shadow-xs min-w-0"
                        title={`Download ${course.title} Syllabus (PDF)`}
                      >
                        <Download size={15} className="shrink-0" />
                        <span className="truncate">Syllabus</span>
                      </button>
                    )}

                    <Link
                      to={`/courses/${course.slug}`}
                      data-cursor-text="Enroll"
                      className="animate-shimmer-sweep btn-glow-brand flex items-center justify-center rounded-xl bg-gradient-to-r from-[#F44246] to-[#CA164B] py-2.5 text-xs sm:text-sm font-bold text-white shadow-md transition-all hover:brightness-105 active:scale-95 cursor-pointer min-w-0"
                    >
                      <span className="truncate">Enroll Now</span>
                    </Link>
                  </div>
                </SpotlightCard>
              </motion.div>
            ))}
          </ScrollReveal>
        )}

        <div className="mt-14 flex justify-center">
          <Magnetic strength={0.25}>
            <Link
              to="/courses"
              data-cursor-text="Catalog"
              className="btn-glow-navy group inline-flex items-center gap-2 rounded-xl border-2 border-[#07405C] bg-white px-8 py-3 text-sm font-bold text-[#07405C] transition hover:bg-[#07405C] hover:text-white"
            >
              <span>View All Courses</span>
              <span
                aria-hidden="true"
                className="transition-transform duration-200 group-hover:translate-x-1"
              >
                →
              </span>
            </Link>
          </Magnetic>
        </div>
      </div>
    </section>
  );
};

export default ChooseYourPath;
