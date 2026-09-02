import {
  MessageCircle,
} from "lucide-react";
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaTwitter,
  FaYoutube 
} from "react-icons/fa";

const COURSES = [
  "Python: Full Stack Development",
  "Java: Full Stack Development",
  "Data Analytics",
  "DevOps with AWS",
];

const QUICK_LINKS = ["Course", "Service", "Gallery", "Contact", "Blog"];

const SOCIALS = [
  {
    icon: FaInstagram,
    href: "#",
    label: "Instagram",
    bg: "bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600",
  },
  { icon: FaFacebookF, href: "#", label: "Facebook", bg: "bg-blue-600" },
  { icon: FaLinkedinIn, href: "#", label: "LinkedIn", bg: "bg-blue-700" },
  { icon: MessageCircle, href: "#", label: "WhatsApp", bg: "bg-green-500" },
  { icon: FaYoutube, href: "#", label: "YouTube", bg: "bg-red-600" },
];

export default function Footer() {
  return (
    <footer className="w-full bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-12 pt-16 pb-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">
          {/* Our Course */}
          <div>
            <h3 className="text-xl font-bold text-slate-900 mb-5">
              Our Course
            </h3>
            <ul className="space-y-3">
              {COURSES.map((course) => (
                <li key={course}>
                  <a
                    href="#"
                    className="text-slate-500 hover:text-rose-600 transition-colors"
                  >
                    {course}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Link */}
          <div>
            <h3 className="text-xl font-bold text-slate-900 mb-5">
              Quick Link
            </h3>
            <ul className="space-y-3">
              {QUICK_LINKS.map((link) => (
                <li key={link}>
                  <a
                    href="#"
                    className="text-slate-500 hover:text-rose-600 transition-colors"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Follow Us */}
          <div>
            <h3 className="text-xl font-bold text-slate-900 mb-5">Follow Us</h3>
            <div className="flex gap-3">
              {SOCIALS.map(({ icon: Icon, href, label, bg }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className={`w-9 h-9 rounded-lg flex items-center justify-center text-white ${bg} hover:opacity-90 transition-opacity`}
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

      <div className="border-t border-slate-100 py-4">
        <p className="text-center text-xs text-slate-400">
          © {new Date().getFullYear()} LeSuccess. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
