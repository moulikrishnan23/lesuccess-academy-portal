import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { ChevronDown, ArrowRight, Menu, X, Sparkles } from "lucide-react";
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

const Navbar = ({ onOpenEnquiry }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [courseMenuOpen, setCourseMenuOpen] = useState(false);

  const { courses } = useCourses();

  const menuCourses = MENU_SLUGS.map((slug) =>
    courses.find((course) => course.slug === slug)
  ).filter(Boolean);

  const navLinkClass = ({ isActive }) =>
    `relative py-2 text-sm font-semibold tracking-wide transition-all duration-200 ${
      isActive
        ? "text-[#DF1E26] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#DF1E26] after:rounded-full"
        : "text-slate-700 hover:text-[#07405C]"
    }`;

  const mobileNavLinkClass = ({ isActive }) =>
    `w-full py-2.5 px-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
      isActive
        ? "bg-[#DF1E26]/10 text-[#DF1E26] border-l-3 border-[#DF1E26]"
        : "text-slate-700 hover:bg-slate-50 hover:text-[#07405C]"
    }`;

  const closeMobileMenu = () => {
    setMenuOpen(false);
    setCourseMenuOpen(false);
  };

  return (
    <nav className="w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md shadow-xs transition-colors">
      {/* =====================================================
          MAIN NAVBAR
      ===================================================== */}
      <div className="mx-auto flex min-h-[72px] max-w-7xl items-center justify-between px-6 lg:px-8">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center transition-transform hover:scale-[1.02]"
          onClick={closeMobileMenu}
        >
          <img
            src="/logo/logo.png"
            alt="LeSuccess Academy"
            className="h-9 sm:h-10 w-auto object-contain"
          />
        </Link>

        {/* =====================================================
            DESKTOP NAVIGATION
        ===================================================== */}
        <div className="hidden items-center gap-6 xl:gap-8 lg:flex">
          {/* Home */}
          <NavLink to="/" className={navLinkClass}>
            Home
          </NavLink>

          {/* About */}
          <NavLink to="/about" className={navLinkClass}>
            About
          </NavLink>

          {/* Services */}
          <NavLink to="/services" className={navLinkClass}>
            Services
          </NavLink>

          {/* Our Team */}
          <NavLink to="/our-team" className={navLinkClass}>
            Our Team
          </NavLink>

          {/* =================================================
              COURSE DROPDOWN
          ================================================= */}
          <div
            className="relative"
            onMouseEnter={() => setCourseMenuOpen(true)}
            onMouseLeave={() => setCourseMenuOpen(false)}
            onFocus={() => setCourseMenuOpen(true)}
            onBlur={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget)) {
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
                `${navLinkClass(state)} inline-flex items-center gap-1`
              }
              aria-haspopup="true"
              aria-expanded={courseMenuOpen}
            >
              <span>Courses</span>
              <ChevronDown
                size={14}
                className={`transition-transform duration-200 ${
                  courseMenuOpen ? "rotate-180 text-[#07405C]" : "text-slate-400"
                }`}
              />
            </NavLink>

            {/* Modern Elevated Dropdown */}
            {courseMenuOpen && menuCourses.length > 0 && (
              <div className="absolute left-1/2 top-full z-50 -translate-x-1/2 pt-3">
                <div className="w-80 rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="px-3 py-1.5 mb-1 flex items-center justify-between border-b border-slate-100">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Popular Programs
                    </span>
                    <Sparkles size={13} className="text-[#DF1E26]" />
                  </div>

                  <ul className="list-none space-y-1">
                    {menuCourses.map((course) => (
                      <li key={course.slug}>
                        <Link
                          to={`/courses/${course.slug}`}
                          onClick={() => setCourseMenuOpen(false)}
                          className="flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 hover:text-[#DF1E26] group"
                        >
                          <span className="truncate">
                            {course.category || course.title}
                          </span>
                          <ArrowRight
                            size={12}
                            className="text-slate-300 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all"
                          />
                        </Link>
                      </li>
                    ))}
                  </ul>

                  {/* View All Footer */}
                  <div className="mt-2 border-t border-slate-100 pt-2">
                    <Link
                      to="/courses"
                      onClick={() => setCourseMenuOpen(false)}
                      className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-xs font-bold text-[#07405C] transition-colors hover:bg-[#07405C] hover:text-white"
                    >
                      <span>View all {courses.length} courses</span>
                      <ArrowRight size={13} />
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Gallery */}
          <NavLink to="/gallery" className={navLinkClass}>
            Gallery
          </NavLink>

          {/* Contact Us */}
          <NavLink to="/contact" className={navLinkClass}>
            Contact Us
          </NavLink>
        </div>

        {/* =====================================================
            DESKTOP ENQUIRE CTA
        ===================================================== */}
        <div className="hidden items-center gap-4 lg:flex">
          <button
            type="button"
            onClick={onOpenEnquiry}
            className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#F44246] to-[#CA164B] px-6 py-2.5 text-sm font-bold text-white shadow-sm transition hover:brightness-105 hover:shadow-md active:scale-98 cursor-pointer"
          >
            <span>Enquire Now</span>
            <ArrowRight size={15} className="transition-transform duration-200 group-hover:translate-x-1" />
          </button>
        </div>

        {/* =====================================================
            MOBILE HAMBURGER TRIGGER
        ===================================================== */}
        <button
          type="button"
          onClick={() => setMenuOpen((previous) => !previous)}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-[#07405C] hover:bg-slate-50 transition lg:hidden cursor-pointer"
          aria-label="Toggle navigation menu"
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* =====================================================
          MOBILE DRAWER
      ===================================================== */}
      <div
        className={`
          overflow-hidden
          border-t
          border-slate-100
          bg-white
          transition-all
          duration-300
          lg:hidden
          ${menuOpen ? "max-h-[500px] opacity-100 shadow-xl" : "max-h-0 opacity-0"}
        `}
      >
        <div className="flex flex-col gap-1.5 px-6 py-5">
          <NavLink to="/" className={mobileNavLinkClass} onClick={closeMobileMenu}>
            Home
          </NavLink>

          <NavLink to="/about" className={mobileNavLinkClass} onClick={closeMobileMenu}>
            About
          </NavLink>

          <NavLink to="/services" className={mobileNavLinkClass} onClick={closeMobileMenu}>
            Services
          </NavLink>

          <NavLink to="/our-team" className={mobileNavLinkClass} onClick={closeMobileMenu}>
            Our Team
          </NavLink>

          <NavLink to="/courses" className={mobileNavLinkClass} onClick={closeMobileMenu}>
            Courses
          </NavLink>

          <NavLink to="/gallery" className={mobileNavLinkClass} onClick={closeMobileMenu}>
            Gallery
          </NavLink>

          <NavLink to="/contact" className={mobileNavLinkClass} onClick={closeMobileMenu}>
            Contact Us
          </NavLink>

          <div className="pt-3">
            <button
              type="button"
              onClick={() => {
                closeMobileMenu();
                onOpenEnquiry?.();
              }}
              className="w-full rounded-xl bg-gradient-to-r from-[#F44246] to-[#CA164B] py-3 text-sm font-bold text-white shadow-md transition hover:brightness-105 active:scale-98 cursor-pointer"
            >
              Enquire Now
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;