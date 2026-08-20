import { Link } from "react-router-dom";
import {
  Clock3,
  Monitor,
  BriefcaseBusiness,
  Download,
  Layers3,
} from "lucide-react";
import Skeleton, { SkeletonText } from "../ui/Skeleton.jsx";
import useCourses from "../../hooks/useCourses.js";
import { formatDuration } from "../../utils/formatters.js";

/*
 * The four courses this section leads with, in the order they appear. Titles,
 * durations and badges are no longer written here — they come off the same
 * course records the detail pages render, so the home page cannot advertise a
 * duration the page it links to disagrees with. Curate this row by editing the
 * slugs.
 */
const FEATURED_SLUGS = [
  "python-full-stack-development",
  "full-stack-java",
  "data-analytics",
  "aws-and-devops",
];

/*
 * Course logos. These stay here rather than coming from the API because the
 * seeded courses carry no iconUrl yet — in production these are uploaded per
 * course from the admin dashboard, and this map goes away.
 */
const LOGO_BY_SLUG = {
  "python-full-stack-development":
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRvygkXP-NDi1MJ-wTvQVnJokpXQgwPFmZ4yJsz3tq_sA&s=10",
  "full-stack-java":
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQClSrSy94fg7Y6VBv-HfVvCjzl17kfQTea2fOVE5oDAuSUA4wrpvxTEMY&s=10",
  "data-analytics":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cf/New_Power_BI_Logo.svg/960px-New_Power_BI_Logo.svg.png?utm_source=commons.wikimedia.org&utm_campaign=index&utm_content=thumbnail&_=20210102182532",
  "aws-and-devops":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/Amazon_Web_Services_Logo.svg/3840px-Amazon_Web_Services_Logo.svg.png?utm_source=commons.wikimedia.org&utm_campaign=index&utm_content=thumbnail",
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

  // Featured order is this file's, not the catalog's.
  const featured = FEATURED_SLUGS.map((slug) =>
    courses.find((course) => course.slug === slug),
  ).filter(Boolean);

  /*
   * A failed catalog fetch hides the section rather than putting an error box
   * on the marketing home page — the rest of the page still sells the academy,
   * and the navbar still reaches /courses.
   */
  if (error || (!isLoading && featured.length === 0)) return null;

  return (
    <section className="w-full bg-[#eef4fa] px-6 py-16 sm:px-10 lg:px-20">
      <div className="mx-auto max-w-300 text-center">

        <span className="inline-flex items-center gap-2 rounded-full border border-[#074a68] px-4 py-1 text-xs font-medium text-[#074a68] transition animate-pulse">
          <Layers3 size={14} />
          CHOOSE YOUR PATH
        </span>

        <h2 className="mt-5 text-3xl font-bold text-gray-900 sm:text-4xl">
          Build Your{" "}
          <span className="text-[#ed334d]">High-Paying</span> Tech Career
        </h2>

        <p className="mx-auto mt-5 max-w-4xl text-base leading-7 text-gray-600 sm:text-lg">
          Build a strong foundation that empowers you to face real-world
          challenges and step into your career with clarity and self-assurance.
        </p>

        {isLoading ? (
          <div
            aria-busy="true"
            aria-label="Loading featured courses"
            className="mt-12 grid gap-7 md:grid-cols-2"
          >
            {Array.from({ length: FEATURED_SLUGS.length }, (_, index) => (
              <CourseCardSkeleton key={index} />
            ))}
          </div>
        ) : (
          <div className="mt-12 grid gap-7 md:grid-cols-2">

            {featured.map((course) => (
              <div
                key={course.slug}
                className="relative rounded-2xl bg-white p-7 shadow-sm"
              >

                {course.badgeLabel && (
                  <span className="absolute right-7 top-0 -translate-y-1/2 rounded-md border border-green-300 bg-green-100 px-3 py-2 text-xs font-medium text-green-700">
                    {course.badgeLabel}
                  </span>
                )}

                <div className="flex flex-col items-center">

                  <div className="courselogo flex h-16 w-16 items-center justify-center rounded-xl border border-[#36a8dc] text-[#074a68]">
                    <img src={LOGO_BY_SLUG[course.slug]} alt="" width={50} />
                  </div>

                  <h3 className="mt-4 text-xl font-bold text-[#353b4f] sm:text-2xl">
                    <Link
                      to={`/courses/${course.slug}`}
                      className="transition hover:text-[#ed334d]"
                    >
                      {course.title}
                    </Link>
                  </h3>

                  <p className="mt-5 max-w-xl text-base leading-7 text-gray-500">
                    {course.shortDescription}
                  </p>

                  <div className="mt-7 flex flex-wrap justify-center gap-5 text-sm text-gray-800">

                    <span className="flex items-center gap-2">
                      <Clock3 size={18} className="text-[#074a68]" />
                      {formatDuration(course.durationValue, course.durationUnit)}
                    </span>

                    <span className="flex items-center gap-2">
                      <Monitor size={18} className="text-[#074a68]" />
                      Offline/Online
                    </span>

                    <span className="flex items-center gap-2">
                      <BriefcaseBusiness
                        size={18}
                        className="text-[#074a68]"
                      />
                      Placement Assistance
                    </span>

                  </div>

                  <div className="mt-8 grid w-full max-w-lg grid-cols-2 gap-5">

                    {/* Syllabus download is not wired up yet — unchanged. */}
                    <button className="flex items-center justify-center gap-2 rounded-md border border-[#074a68] py-3 text-[#27627d]">
                      <Download size={18} />
                      Syllabus
                    </button>

                    <Link
                      to={`/courses/${course.slug}`}
                      className="flex items-center justify-center rounded-md bg-[#074a68] py-3 text-white transition hover:bg-[#063c55]"
                    >
                      Enroll Now
                    </Link>

                  </div>

                </div>
              </div>
            ))}

          </div>
        )}

        <Link
          to="/courses"
          className="mt-10 inline-flex items-center gap-2 text-base font-medium text-[#074a68] transition hover:text-[#ed334d]"
        >
          View all courses
          <span aria-hidden="true">→</span>
        </Link>

      </div>
    </section>
  );
};

export default ChooseYourPath;
