import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import useCourses from "../hooks/useCourses.js";

/*
 * The courses the "Course" dropdown leads with, in order. Labels are not
 * written here — each course's short name comes off the same record its detail
 * page renders, so the menu cannot drift from the catalog. Curate this menu by
 * editing the slugs.
 */
const MENU_SLUGS = [
  "python-full-stack-development",
  "full-stack-java",
  "mern-full-stack",
  "data-analytics",
  "data-science",
  "aws-and-devops",
  "digital-marketing",
  "cybersecurity",
];

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [courseMenuOpen, setCourseMenuOpen] = useState(false);

  // Navbar sits outside <Routes>, so it mounts once and this fetch runs once
  // for the whole session rather than on every navigation.
  const { courses } = useCourses();

  const menuCourses = MENU_SLUGS.map((slug) =>
    courses.find((course) => course.slug === slug),
  ).filter(Boolean);

  const navLinkClass = ({ isActive }) =>
  `relative text-sm font-medium transition ${
    isActive
      ? "text-[#ff3348] active-link"
      : "text-gray-800 hover:text-[#ff3348]"
  }`;

  const mobileNavLinkClass = ({ isActive }) =>
    `w-full border-b border-gray-100 pb-3 text-sm font-medium transition ${
      isActive
        ? "text-[#ff3348]"
        : "text-gray-800 hover:text-[#ff3348]"
    }`;

  return (
    <nav className="w-full border-b border-gray-200 bg-white">
      <div className="mx-auto flex min-h-19.5 max-w-360 items-center justify-between px-6 lg:px-8">

        {/* Logo */}
        <div className="flex items-center">
          <img
            src="/logo/logo.png"
            alt="LeSuccess"
            className="h-9 w-auto object-contain"
          />
        </div>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-9 lg:flex">

          <NavLink to="/" className={navLinkClass}>
            Home
          </NavLink>

          {/*
            Opens on hover and on keyboard focus; Escape closes it. The link
            itself still navigates to the full catalog, so the menu is a
            shortcut rather than the only way in.
          */}
          <div
            className="relative"
            onMouseEnter={() => setCourseMenuOpen(true)}
            onMouseLeave={() => setCourseMenuOpen(false)}
            onFocus={() => setCourseMenuOpen(true)}
            onBlur={(event) => {
              // Only close when focus leaves the menu entirely, not when it
              // moves between the trigger and the links inside it.
              if (!event.currentTarget.contains(event.relatedTarget)) {
                setCourseMenuOpen(false);
              }
            }}
            onKeyDown={(event) => {
              if (event.key === "Escape") setCourseMenuOpen(false);
            }}
          >
            <NavLink
              to="/courses"
              className={(state) => `${navLinkClass(state)} inline-flex items-center gap-1`}
              aria-haspopup="true"
              aria-expanded={courseMenuOpen}
            >
              Course
              <span aria-hidden="true" className="text-[0.625rem] leading-none">
                &#9662;
              </span>
            </NavLink>

            {courseMenuOpen && menuCourses.length > 0 && (
              // pt-4 bridges the gap below the navbar so the menu survives the
              // cursor travelling from the link down onto it.
              <div className="absolute left-1/2 top-full z-40 -translate-x-1/2 pt-4">
                <ul className="w-60 list-none rounded-lg border border-gray-200 bg-white py-2 shadow-lg">
                  {menuCourses.map((course) => (
                    <li key={course.slug}>
                      <Link
                        to={`/courses/${course.slug}`}
                        onClick={() => setCourseMenuOpen(false)}
                        className="block px-4 py-2 text-sm text-gray-800 transition hover:bg-[#f4f8fb] hover:text-[#ff3348]"
                      >
                        {course.category || course.title}
                      </Link>
                    </li>
                  ))}

                  <li className="mt-1 border-t border-gray-100 pt-1">
                    <Link
                      to="/courses"
                      onClick={() => setCourseMenuOpen(false)}
                      className="block px-4 py-2 text-sm font-medium text-[#074a68] transition hover:bg-[#f4f8fb]"
                    >
                      View all {courses.length} courses &rarr;
                    </Link>
                  </li>
                </ul>
              </div>
            )}
          </div>

          <NavLink to="/service" className={navLinkClass}>
            Service
          </NavLink>

          <NavLink to="/gallery" className={navLinkClass}>
            Gallery
          </NavLink>

          <NavLink to="/contact" className={navLinkClass}>
            Contact
          </NavLink>

        </div>

        {/* Desktop Right Section */}
        <div className="hidden items-center gap-4 lg:flex">
          <button className="rounded-md bg-[#074a68] px-10 py-3 text-sm font-medium text-white transition hover:bg-[#063c55]">
            Enquire
          </button>
        </div>

        {/* Hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex h-10 w-10 items-center justify-center rounded-md border border-[#074a68] text-[#074a68] lg:hidden"
          aria-label="Toggle navigation menu"
        >
          <div className="flex flex-col gap-1">
            <span className="block h-0.5 w-5 bg-[#074a68]"></span>
            <span className="block h-0.5 w-5 bg-[#074a68]"></span>
            <span className="block h-0.5 w-5 bg-[#074a68]"></span>
          </div>
        </button>
      </div>

      {/* Mobile & Medium Navigation */}
      {menuOpen && (
        <div className="border-t border-gray-200 bg-white px-6 py-4 lg:hidden">
          <div className="flex flex-col items-start gap-4">

            <NavLink
              to="/"
              className={mobileNavLinkClass}
              onClick={() => setMenuOpen(false)}
            >
              Home
            </NavLink>

            <NavLink
              to="/courses"
              className={mobileNavLinkClass}
              onClick={() => setMenuOpen(false)}
            >
              Course
            </NavLink>

            <NavLink
              to="/service"
              className={mobileNavLinkClass}
              onClick={() => setMenuOpen(false)}
            >
              Service
            </NavLink>

            <NavLink
              to="/gallery"
              className={mobileNavLinkClass}
              onClick={() => setMenuOpen(false)}
            >
              Gallery
            </NavLink>

            <NavLink
              to="/contact"
              className={mobileNavLinkClass}
              onClick={() => setMenuOpen(false)}
            >
              Contact
            </NavLink>

            <button className="w-full rounded-md bg-[#074a68] py-3 text-sm font-medium text-white">
              Enquire
            </button>

          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;