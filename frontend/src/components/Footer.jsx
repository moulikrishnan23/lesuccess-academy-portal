import { Link } from "react-router-dom";
import { MessageCircle, ArrowRight } from "lucide-react";
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaYoutube,
} from "react-icons/fa";

const COURSES = [
  { name: "Python: Full Stack Development", slug: "python-full-stack" },
  { name: "Java: Full Stack Development", slug: "java-full-stack" },
  { name: "Data Analytics", slug: "data-analytics" },
  { name: "DevOps with AWS", slug: "aws-devops" },
];

const QUICK_LINKS = [
  { name: "About Us", path: "/about" },
  { name: "Our Team", path: "/our-team" },
  { name: "Courses", path: "/courses" },
  { name: "Gallery", path: "/gallery" },
  { name: "Contact Us", path: "/contact" },
];

const SOCIALS = [
  {
    icon: FaInstagram,
    href: "https://www.instagram.com/lesuccess_academy/",
    label: "Instagram",
    bg: "bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600",
  },
  {
    icon: FaFacebookF,
    href: "https://www.facebook.com/lesuccessacademy/",
    label: "Facebook",
    bg: "bg-blue-600",
  },
  {
    icon: FaLinkedinIn,
    href: "https://www.linkedin.com/company/lesuccess-academy/",
    label: "LinkedIn",
    bg: "bg-blue-700",
  },
  {
    icon: MessageCircle,
    href: "https://wa.me/918012060000",
    label: "WhatsApp",
    bg: "bg-green-500",
  },
  {
    icon: FaYoutube,
    href: "https://www.youtube.com/@lesuccessacademy",
    label: "YouTube",
    bg: "bg-red-600",
  },
];

export default function Footer() {
  return (
    <footer className="w-full bg-white overflow-hidden border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-6 md:px-12 pt-16 pb-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">
          
          {/* Our Courses */}
          <div>
            <h3 className="text-xl font-bold text-slate-900 mb-5">
              Our Courses
            </h3>
            <ul className="space-y-3">
              {COURSES.map((course) => (
                <li key={course.name}>
                  <Link
                    to={`/courses/${course.slug}`}
                    className="text-slate-500 hover:text-rose-600 transition-colors text-sm font-medium"
                  >
                    {course.name}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-4 pt-3 border-t border-slate-100">
              <Link
                to="/courses"
                className="inline-flex items-center gap-1.5 text-sm font-bold text-[#ef334c] hover:text-[#d4273e] transition-colors"
              >
                View All Courses <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-bold text-slate-900 mb-5">
              Quick Links
            </h3>
            <ul className="space-y-3">
              {QUICK_LINKS.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="text-slate-500 hover:text-rose-600 transition-colors text-sm font-medium"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Follow Us */}
          <div>
            <h3 className="text-xl font-bold text-slate-900 mb-5">Follow Us</h3>
            <p className="text-xs text-slate-500 mb-4">
              Stay connected with us across our social channels for regular updates, batch alerts, and tech webinars.
            </p>
            <div className="flex gap-3">
              {SOCIALS.map(({ icon: Icon, href, label, bg }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className={`w-9 h-9 rounded-lg flex items-center justify-center text-white ${bg} hover:opacity-90 transition-opacity shadow-sm`}
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Big background tagline */}
      <div className="w-full select-none leading-none">
        <p className="whitespace-nowrap text-center font-extrabold text-slate-200 text-[14vw] sm:text-[10vw] md:text-[7vw] tracking-tight -mb-4 md:-mb-8">
          LEARN.EDUCATE.SUCCEED
        </p>
      </div>

      <div className="border-t border-slate-100 py-5">
        <p className="text-center text-xs text-slate-400">
          © {new Date().getFullYear()} LeSuccess Academy. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
