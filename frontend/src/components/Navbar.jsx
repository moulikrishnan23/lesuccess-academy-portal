import { useState } from "react";
import { NavLink } from "react-router-dom";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

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

          <NavLink to="/course" className={navLinkClass}>
            Course
          </NavLink>

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