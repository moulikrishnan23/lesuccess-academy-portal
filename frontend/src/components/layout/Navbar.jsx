import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Link, NavLink } from "react-router-dom";
import {
  ChevronDown,
  ArrowRight,
  LayoutGrid,
  X,
  Sparkles,
  Home,
  GraduationCap,
  Briefcase,
  Users,
  BookOpen,
  Image as ImageIcon,
  Send,
} from "lucide-react";
import useCourses from "../../hooks/useCourses.js";

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

const MOBILE_NAV_ITEMS = [
  { name: "Home", path: "/", icon: Home },
  { name: "About", path: "/about", icon: GraduationCap },
  { name: "Services", path: "/services", icon: Briefcase },
  { name: "Our Team", path: "/our-team", icon: Users },
  { name: "Courses", path: "/courses", icon: BookOpen },
  { name: "Gallery", path: "/gallery", icon: ImageIcon },
  { name: "Contact", path: "/contact", icon: Send },
];

const Navbar = ({ onOpenEnquiry }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [courseMenuOpen, setCourseMenuOpen] = useState(false);

  const { courses } = useCourses();

  const menuCourses = MENU_SLUGS.map((slug) =>
    courses.find((course) => course.slug === slug)
  ).filter(Boolean);

  const navLinkClass = ({ isActive }) =>
    `relative px-1.5 2xl:px-2 py-1.5 text-sm font-semibold tracking-normal rounded-full transition-all duration-200 flex items-center gap-1 whitespace-nowrap ${
      isActive
        ? "text-[#DF1E26] font-bold bg-[#DF1E26]/8 shadow-2xs"
        : "text-slate-700 hover:text-[#07405C] hover:bg-slate-100/80"
    }`;

  const closeMobileMenu = () => {
    setMenuOpen(false);
    setCourseMenuOpen(false);
  };

  // Close drawer on ESC key and prevent body scroll while drawer is open
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    if (menuOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <>
      <nav
        className="lesuccess-navbar w-full max-w-[76rem] min-h-12 sm:min-h-14 xl:min-h-16 rounded-full bg-white/95 backdrop-blur-xl border border-slate-200/80 shadow-[0_8px_32px_rgba(7,64,92,0.09)] px-3 sm:px-4 xl:px-4 2xl:px-5 py-1.5 transition-colors flex items-center justify-between gap-2.5 sm:gap-4 xl:gap-3 2xl:gap-6 mx-auto"
      >
        {/* =====================================================
            MAIN NAVBAR CONTAINER:
            Floating Pill layout inspired by Reference Image 2
        ===================================================== */}
        <div className="flex w-full items-center justify-between gap-2 sm:gap-4 xl:gap-2 2xl:gap-5">
          {/* Logo & Live Admissions Telemetry */}
          <div className="flex items-center gap-2.5">
            <Link
              to="/"
              className="flex items-center transition-transform hover:scale-[1.02] active:scale-95"
              onClick={closeMobileMenu}
            >
              <img
                src="/logo/logo.png"
                alt="LeSuccess Academy"
                className="lesuccess-nav-logo h-[26px] sm:h-[30px] xl:h-9 2xl:h-9 w-auto object-contain"
              />
            </Link>
            <span className="hidden 2xl:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200/70 text-[10px] font-mono font-bold text-emerald-700 tracking-wide">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              BATCHES OPEN
            </span>
          </div>

          {/* =====================================================
              DESKTOP CLEAN NAVIGATION (Brilliant.org Archetype)
          ===================================================== */}
          <div className="hidden lg:flex items-center gap-0.5 2xl:gap-1.5">
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
                    courseMenuOpen ? "rotate-180 text-current" : "text-current opacity-70"
                  }`}
                />
              </NavLink>

              {/* Modern Elevated Dropdown */}
              {courseMenuOpen && menuCourses.length > 0 && (
                <div className="absolute left-1/2 top-full z-50 -translate-x-1/2 pt-3">
                  <div className="w-80 rounded-2xl border border-slate-200/90 bg-white/98 p-3 shadow-[0_20px_50px_rgba(7,64,92,0.14)] backdrop-blur-2xl animate-in fade-in slide-in-from-top-2 duration-200">
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
          <div className="hidden items-center gap-2 lg:flex 2xl:gap-3">
            <button
              type="button"
              onClick={onOpenEnquiry}
              className="group inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-[#F44246] to-[#CA164B] px-3 2xl:px-4 py-1.5 lg:py-2 2xl:py-2 text-xs lg:text-[13px] font-bold text-white shadow-[0_4px_16px_rgba(244,66,70,0.35)] transition-all duration-200 hover:brightness-105 hover:shadow-[0_6px_24px_rgba(244,66,70,0.5)] hover:-translate-y-0.5 active:translate-y-0 active:scale-98 cursor-pointer"
            >
              <span>Enquire Now</span>
              <ArrowRight
                size={14}
                className="transition-transform duration-200 group-hover:translate-x-1"
              />
            </button>
          </div>

          {/* =====================================================
              MOBILE RIGHT CONTROLS: Enquire + Menu Trigger
          ===================================================== */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              type="button"
              onClick={onOpenEnquiry}
              className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-[#F44246] to-[#CA164B] px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:brightness-105 active:scale-95 transition cursor-pointer"
            >
              <span>Enquire</span>
            </button>
            <button
              type="button"
              onClick={() => setMenuOpen((previous) => !previous)}
              className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full border border-slate-200 text-[#07405C] hover:bg-slate-50 active:scale-95 transition cursor-pointer"
              aria-label="Toggle navigation menu"
              aria-expanded={menuOpen}
            >
              <LayoutGrid
                size={17}
                className={`transition-colors ${menuOpen ? "text-[#DF1E26]" : "text-[#07405C]"}`}
              />
            </button>
          </div>
        </div>
      </nav>

      {/* =====================================================
          MOBILE BOTTOM SHEET OVERLAY & DRAWER (Image 2)
          Rendered via Portal to escape parent transform context
      ===================================================== */}
      {typeof document !== "undefined" &&
        createPortal(
          <>
            {/* Backdrop */}
            {menuOpen && (
              <div
                role="presentation"
                onClick={closeMobileMenu}
                className="fixed inset-0 bg-black/40 backdrop-blur-xs z-70 lg:hidden animate-in fade-in duration-200"
              />
            )}

            {/* Slide-up Bottom Sheet Drawer */}
            <div
              className={`
                fixed bottom-0 inset-x-0 z-80 lg:hidden
                rounded-t-3xl bg-white p-6 shadow-[0_-10px_40px_rgba(0,0,0,0.18)]
                border-t border-slate-100
                transition-transform duration-300 ease-out
                ${menuOpen ? "translate-y-0" : "translate-y-full pointer-events-none"}
              `}
              style={{
                paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))",
              }}
            >
              {/* Grab Handle */}
              <div className="mx-auto w-12 h-1.5 rounded-full bg-slate-200 mb-6" />

              {/* 3-Column Touch-Friendly Navigation Grid */}
              <div className="grid grid-cols-3 gap-y-6 gap-x-2 text-center">
                {MOBILE_NAV_ITEMS.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={closeMobileMenu}
                      className={({ isActive }) =>
                        `flex flex-col items-center justify-center gap-2 p-2 rounded-2xl transition-all ${
                          isActive
                            ? "text-[#DF1E26] font-bold bg-red-50/80"
                            : "text-slate-700 hover:text-[#07405C] hover:bg-slate-50 active:scale-95"
                        }`
                      }
                    >
                      <Icon size={24} />
                      <span className="text-xs font-semibold tracking-wide">
                        {item.name}
                      </span>
                    </NavLink>
                  );
                })}

                {/* Enquire Now Action in the 3-column Grid */}
                <button
                  type="button"
                  onClick={() => {
                    closeMobileMenu();
                    onOpenEnquiry?.();
                  }}
                  className="flex flex-col items-center justify-center gap-2 p-2 rounded-2xl text-slate-700 hover:text-[#DF1E26] hover:bg-red-50/80 transition-all cursor-pointer active:scale-95"
                >
                  <Sparkles size={24} className="text-[#DF1E26]" />
                  <span className="text-xs font-semibold tracking-wide">
                    Enquire
                  </span>
                </button>
              </div>

              {/* Social links stay available in the fixed top rail as this drawer opens. */}
              <div className="mt-8 flex justify-end border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    closeMobileMenu();
                  }}
                  className="flex h-10 w-10 items-center justify-center rounded-full text-[#DF1E26] hover:bg-red-50 transition cursor-pointer"
                  aria-label="Close menu"
                >
                  <X size={22} />
                </button>
              </div>
            </div>
          </>,
          document.body
        )}
    </>
  );
};

export default Navbar;
