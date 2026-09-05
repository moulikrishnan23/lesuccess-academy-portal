import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import useCourses from "../hooks/useCourses.js";

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

  const { courses } = useCourses();

  const menuCourses = MENU_SLUGS.map((slug) =>
    courses.find((course) => course.slug === slug)
  ).filter(Boolean);

  const navLinkClass = ({ isActive }) =>
    `relative text-sm font-medium transition-colors duration-200 ${
      isActive
        ? "text-[#ff3348] active-link"
        : "text-gray-800 hover:text-[#ff3348]"
    }`;

  const mobileNavLinkClass = ({ isActive }) =>
    `w-full border-b border-gray-100 pb-3 text-sm font-medium transition-colors duration-200 ${
      isActive
        ? "text-[#ff3348]"
        : "text-gray-800 hover:text-[#ff3348]"
    }`;

  const closeMobileMenu = () => {
    setMenuOpen(false);
    setCourseMenuOpen(false);
  };

  return (
    <nav className="w-full border-b border-gray-200 bg-white">
      {/* =====================================================
          MAIN NAVBAR
      ===================================================== */}

      <div className="mx-auto flex min-h-19.5 max-w-360 items-center justify-between px-6 lg:px-8">

        {/* Logo */}

        <Link
          to="/"
          className="flex items-center"
          onClick={closeMobileMenu}
        >
          <img
            src="/logo/logo.png"
            alt="LeSuccess"
            className="h-9 w-auto object-contain"
          />
        </Link>

        {/* =====================================================
            DESKTOP NAVIGATION
        ===================================================== */}

        <div className="hidden items-center gap-9 lg:flex">

          {/* Home */}

          <NavLink
            to="/"
            className={navLinkClass}
          >
            Home
          </NavLink>

          {/* =================================================
              COURSE
          ================================================= */}

          <div
            className="relative"
            onMouseEnter={() =>
              setCourseMenuOpen(true)
            }
            onMouseLeave={() =>
              setCourseMenuOpen(false)
            }
            onFocus={() =>
              setCourseMenuOpen(true)
            }
            onBlur={(event) => {
              if (
                !event.currentTarget.contains(
                  event.relatedTarget
                )
              ) {
                setCourseMenuOpen(false);
              }
            }}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                setCourseMenuOpen(false);
              }
            }}
          >
            <NavLink
              to="/courses"
              className={(state) =>
                `${navLinkClass(
                  state
                )} inline-flex items-center gap-1`
              }
              aria-haspopup="true"
              aria-expanded={courseMenuOpen}
            >
              Course

              <span
                aria-hidden="true"
                className={`
                  text-[0.625rem]
                  leading-none
                  transition-transform
                  duration-200
                  ${
                    courseMenuOpen
                      ? "rotate-180"
                      : ""
                  }
                `}
              >
                &#9662;
              </span>
            </NavLink>

            {/* Course Dropdown */}

            {courseMenuOpen &&
              menuCourses.length > 0 && (
                <div className="absolute left-1/2 top-full z-40 -translate-x-1/2 pt-4">
                  <ul
                    className="
                      w-60
                      list-none
                      rounded-lg
                      border
                      border-gray-200
                      bg-white
                      py-2
                      shadow-xl
                    "
                  >
                    {menuCourses.map((course) => (
                      <li key={course.slug}>
                        <Link
                          to={`/courses/${course.slug}`}
                          onClick={() =>
                            setCourseMenuOpen(false)
                          }
                          className="
                            block
                            px-4
                            py-2.5
                            text-sm
                            text-gray-800
                            transition-colors
                            duration-200
                            hover:bg-[#f4f8fb]
                            hover:text-[#ff3348]
                          "
                        >
                          {course.category ||
                            course.title}
                        </Link>
                      </li>
                    ))}

                    {/* View All */}

                    <li className="mt-1 border-t border-gray-100 pt-1">
                      <Link
                        to="/courses"
                        onClick={() =>
                          setCourseMenuOpen(false)
                        }
                        className="
                          block
                          px-4
                          py-2.5
                          text-sm
                          font-medium
                          text-[#074a68]
                          transition-colors
                          duration-200
                          hover:bg-[#f4f8fb]
                        "
                      >
                        View all {courses.length} courses
                        &nbsp;&rarr;
                      </Link>
                    </li>
                  </ul>
                </div>
              )}
          </div>

          {/* Service */}

          <NavLink
            to="/service"
            className={navLinkClass}
          >
            Service
          </NavLink>

          {/* Gallery */}

          <NavLink
            to="/gallery"
            className={navLinkClass}
          >
            Gallery
          </NavLink>

          {/* Contact */}

          <NavLink
            to="/contact"
            className={navLinkClass}
          >
            Contact
          </NavLink>
        </div>

        {/* =====================================================
            DESKTOP ENQUIRE
        ===================================================== */}

        <div className="hidden items-center gap-4 lg:flex">
          <button
            type="button"
            className="
              rounded-md
              bg-[#074a68]
              px-10
              py-3
              text-sm
              font-medium
              text-white
              transition-colors
              duration-200
              hover:bg-[#063c55]
            "
          >
            Enquire
          </button>
        </div>

        {/* =====================================================
            MOBILE HAMBURGER
        ===================================================== */}

        <button
          type="button"
          onClick={() =>
            setMenuOpen((previous) => !previous)
          }
          className="
            flex
            h-10
            w-10
            items-center
            justify-center
            rounded-md
            border
            border-[#074a68]
            lg:hidden
          "
          aria-label="Toggle navigation menu"
          aria-expanded={menuOpen}
        >
          <div className="flex flex-col gap-1">

            <span
              className={`
                block
                h-0.5
                w-5
                bg-[#074a68]
                transition-all
                duration-200
                ${
                  menuOpen
                    ? "translate-y-1.5 rotate-45"
                    : ""
                }
              `}
            />

            <span
              className={`
                block
                h-0.5
                w-5
                bg-[#074a68]
                transition-all
                duration-200
                ${
                  menuOpen
                    ? "opacity-0"
                    : "opacity-100"
                }
              `}
            />

            <span
              className={`
                block
                h-0.5
                w-5
                bg-[#074a68]
                transition-all
                duration-200
                ${
                  menuOpen
                    ? "-translate-y-1.5 -rotate-45"
                    : ""
                }
              `}
            />

          </div>
        </button>
      </div>

      {/* =====================================================
          MOBILE MENU
      ===================================================== */}

      <div
        className={`
          overflow-hidden
          border-t
          border-gray-200
          bg-white
          transition-all
          duration-300
          lg:hidden
          ${
            menuOpen
              ? "max-h-125 opacity-100"
              : "max-h-0 opacity-0"
          }
        `}
      >
        <div className="flex flex-col items-start gap-4 px-6 py-5">

          <NavLink
            to="/"
            className={mobileNavLinkClass}
            onClick={closeMobileMenu}
          >
            Home
          </NavLink>

          <NavLink
            to="/courses"
            className={mobileNavLinkClass}
            onClick={closeMobileMenu}
          >
            Course
          </NavLink>

          <NavLink
            to="/service"
            className={mobileNavLinkClass}
            onClick={closeMobileMenu}
          >
            Service
          </NavLink>

          <NavLink
            to="/gallery"
            className={mobileNavLinkClass}
            onClick={closeMobileMenu}
          >
            Gallery
          </NavLink>

          <NavLink
            to="/contact"
            className={mobileNavLinkClass}
            onClick={closeMobileMenu}
          >
            Contact
          </NavLink>

          <button
            type="button"
            onClick={closeMobileMenu}
            className="
              w-full
              rounded-md
              bg-[#074a68]
              py-3
              text-sm
              font-medium
              text-white
              transition-colors
              duration-200
              hover:bg-[#063c55]
            "
          >
            Enquire
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;