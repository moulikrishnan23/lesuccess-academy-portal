import { Link } from "react-router-dom";
import { MessageCircle, ArrowRight, Mail, Phone, MapPin } from "lucide-react";
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaYoutube,
} from "react-icons/fa";

const COURSES = [
  { name: "Python: Full Stack Development", slug: "python-full-stack" },
  { name: "Java: Full Stack Development", slug: "java-full-stack" },
  { name: "Data Analytics & AI", slug: "data-analytics" },
  { name: "DevOps with AWS Cloud", slug: "aws-devops" },
];

const QUICK_LINKS = [
  { name: "About Us", path: "/about" },
  { name: "Corporate Services", path: "/services" },
  { name: "Mentors & Team", path: "/our-team" },
  { name: "Courses Catalog", path: "/courses" },
  { name: "Campus Gallery", path: "/gallery" },
  { name: "Contact & Support", path: "/contact" },
];

const SOCIALS = [
  {
    icon: FaInstagram,
    href: "https://www.instagram.com/lesuccess_academy/",
    label: "Instagram",
  },
  {
    icon: FaLinkedinIn,
    href: "https://www.linkedin.com/company/lesuccess-academy/",
    label: "LinkedIn",
  },
  {
    icon: MessageCircle,
    href: "https://wa.me/918012060000",
    label: "WhatsApp",
  },
  {
    icon: FaYoutube,
    href: "https://www.youtube.com/@lesuccessacademy",
    label: "YouTube",
  },
  {
    icon: FaFacebookF,
    href: "https://www.facebook.com/lesuccessacademy/",
    label: "Facebook",
  },
];

export default function Footer() {
  return (
    <footer className="w-full bg-gradient-to-br from-[#024D72] via-[#07405C] to-[#012f45] text-white overflow-hidden relative">
      {/* Top brand gradient accent bar */}
      <div className="h-1.5 w-full bg-gradient-to-r from-[#DF1E26] via-[#F44246] to-[#CA164B]" />

      {/* Decorative ambient subtle glow */}
      <div
        aria-hidden="true"
        className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none"
      />
      <div
        aria-hidden="true"
        className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-[#DF1E26]/10 blur-3xl pointer-events-none"
      />

      <div className="max-w-7xl mx-auto px-6 md:px-12 pt-16 pb-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">
          
          {/* Col 1: Brand Info (4 cols) */}
          <div className="lg:col-span-4 space-y-5">
            <Link to="/" className="inline-flex items-center gap-3">
              <div className="bg-white p-2.5 rounded-xl shadow-md inline-block">
                <img
                  src="/logo/logo.png"
                  alt="LeSuccess Academy"
                  className="h-8 w-auto object-contain"
                />
              </div>
            </Link>
            <p className="text-slate-200 text-sm leading-relaxed max-w-sm">
              Premier technology learning accelerator in Coimbatore. Empowering students and professionals with hands-on coding, enterprise frameworks, and verified career placements.
            </p>
            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <MapPin size={14} className="text-[#F44246] shrink-0" />
                <span>4th Floor, Tristar Tower, Avinashi Rd, Coimbatore</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={14} className="text-cyan-400 shrink-0" />
                <a href="tel:+918012060000" className="text-slate-200 hover:text-white font-medium transition-colors">
                  +91 80120 60000
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={14} className="text-[#F44246] shrink-0" />
                <a href="mailto:training@lesuccess.in" className="text-slate-200 hover:text-white font-medium transition-colors">
                  training@lesuccess.in
                </a>
              </div>
            </div>
          </div>

          {/* Col 2: Popular Programs (3 cols) */}
          <div className="lg:col-span-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-5 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#DF1E26]" />
              Popular Programs
            </h3>
            <ul className="space-y-3">
              {COURSES.map((course) => (
                <li key={course.name}>
                  <Link
                    to={`/courses/${course.slug}`}
                    className="text-slate-300 hover:text-white hover:translate-x-1.5 inline-block transition-all text-sm font-medium"
                  >
                    {course.name}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-5 pt-3 border-t border-white/10">
              <Link
                to="/courses"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#F44246] hover:text-white transition-colors"
              >
                View All 20+ Courses <ArrowRight size={13} />
              </Link>
            </div>
          </div>

          {/* Col 3: Quick Links (2 cols) */}
          <div className="lg:col-span-2">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-5 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-cyan-400" />
              Navigation
            </h3>
            <ul className="space-y-3">
              {QUICK_LINKS.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="text-slate-300 hover:text-white hover:translate-x-1.5 inline-block transition-all text-sm font-medium"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Connect & Socials (3 cols) */}
          <div className="lg:col-span-3 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-5 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#DF1E26]" />
              Connect With Us
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Follow our social channels for regular batch announcements, free webinars, and student placement spotlights.
            </p>
            <div className="flex flex-wrap gap-2.5 pt-2">
              {SOCIALS.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-9 h-9 rounded-xl bg-white/10 border border-white/15 text-white flex items-center justify-center hover:bg-[#DF1E26] hover:border-[#DF1E26] hover:scale-110 active:scale-95 transition-all shadow-sm"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>

            <div className="pt-3">
              <Link
                to="/contact"
                className="inline-flex items-center justify-center w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#F44246] to-[#CA164B] hover:brightness-110 text-white text-xs font-bold transition shadow-lg"
              >
                Request a Callback
              </Link>
            </div>
          </div>

        </div>
      </div>

      {/* Interactive watermark with smooth #DF1E26 brand hover transition */}
      <div className="w-full select-none overflow-hidden group py-2 sm:py-3">
        <p className="whitespace-nowrap text-center font-black text-white/10 text-[9vw] sm:text-[7vw] md:text-[5.5vw] tracking-wider transition-all duration-500 ease-out cursor-default hover:text-[#DF1E26] hover:opacity-60 leading-none">
          LEARN • EDUCATE • SUCCEED
        </p>
      </div>

      {/* Bottom Copyright Area with Glassmorphism Surface */}
      <div className="relative z-10 px-4 sm:px-6 md:px-12 pb-6 pt-2">
        <div className="max-w-7xl mx-auto rounded-2xl bg-white/[0.06] border border-white/15 backdrop-blur-md px-6 py-4.5 shadow-[0_8px_32px_rgba(0,0,0,0.25)] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-300 font-medium transition-all duration-300 hover:border-white/25">
          <p className="tracking-wide">
            © {new Date().getFullYear()} LeSuccess Academy. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link to="/courses" className="hover:text-white transition-colors">Courses</Link>
            <Link to="/services" className="hover:text-white transition-colors">Services</Link>
            <Link to="/contact" className="hover:text-white transition-colors">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
