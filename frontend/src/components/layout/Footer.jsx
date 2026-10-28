import { OFFICIAL_PHONE } from "../../data/contactDetails.js";
import { useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Mail, Phone, MapPin } from "lucide-react";
import useSiteSettings from "../../hooks/useSiteSettings.js";
import { formatPhone, getSocialLinks } from "../../data/socialLinks.js";
import { useInView } from "../motion/index.js";

const COURSES = [
  { name: "Python: Full Stack Development", slug: "python-full-stack-development" },
  { name: "Java: Full Stack Development", slug: "full-stack-java" },
  { name: "Data Analytics & AI", slug: "data-analytics" },
  { name: "DevOps with AWS Cloud", slug: "aws-and-devops" },
];

const QUICK_LINKS = [
  { name: "About Us", path: "/about" },
  { name: "Corporate Services", path: "/services" },
  { name: "Mentors & Team", path: "/our-team" },
  { name: "Courses Catalog", path: "/courses" },
  { name: "Success Stories", path: "/success-stories" },
  { name: "Campus Gallery", path: "/gallery" },
  { name: "Contact & Support", path: "/contact" },
];

const GOOGLE_MAPS_URL =
  "https://www.google.com/maps/place/LeSuccess/@11.0118985,76.9826524,17z/data=!3m1!4b1!4m6!3m5!1s0x3ba837c0178b0805:0x27b8de4c436b2d9d!8m2!3d11.0118932!4d76.9852327!16s%2Fg%2F11krkw3qh_?entry=ttu&g_ep=EgoyMDI2MDkzMC4wIKXMDSoASAFQAw%3D%3D";

const WAVE = (
  <svg viewBox="0 0 1440 70" preserveAspectRatio="none" aria-hidden="true">
    <path d="M0 35C180 0 360 70 540 35S900 0 1080 35 1260 70 1440 35V70H0Z" />
  </svg>
);

/**
 * Site footer (spec: docs/mockup/lower-home.html, footer): a wave edge, the
 * "Build your future." band, four link columns, the preserved watermark, and the copyright bar.
 */
export default function Footer() {
  const { settings } = useSiteSettings();
  const socialLinks = getSocialLinks(settings);
  const phone = settings.phone_primary || OFFICIAL_PHONE;
  const trainingEmail = settings.email_training || "training@lesuccess.in";
  const footRef = useRef(null);
  const inView = useInView(footRef, { threshold: 0.1 });

  return (
    <>
      <div className="lh-wave" aria-hidden="true">
        <div>
          {WAVE}
          {WAVE}
        </div>
      </div>
      <footer ref={footRef} className={`lh-foot bg-gradient-to-br from-[#024D72] via-[#07405C] to-[#012f45]${inView ? " is-in" : ""}`}>
        <div className="lh-wrap">
          <div className="lh-build">
            <h2>Build your future.</h2>
            <div className="relative z-[1] flex flex-wrap gap-3">
              <Link to="/courses" className="lh-btn lh-btn-w">
                Enroll Now
                <ArrowRight size={18} className="lh-arr" aria-hidden="true" />
              </Link>
              <Link
                to="/contact"
                className="lh-btn text-white shadow-[inset_0_0_0_2px_rgb(255_255_255/0.7)] hover:bg-white hover:text-[#07405C]"
              >
                Enquire
              </Link>
            </div>
          </div>

          <div className="lh-foot-g">
            <div>
              <Link to="/" className="inline-block rounded-xl bg-white p-2.5 shadow-md">
                <img src="/logo/logo.png" alt="LeSuccess Academy" className="h-8 w-auto object-contain" />
              </Link>
              <p className="lh-foot-note" style={{ marginTop: "1.25rem", maxWidth: "36ch" }}>
                Premier technology learning accelerator in Coimbatore. Empowering
                students and professionals with hands-on coding, enterprise
                frameworks, and verified career placements.
              </p>
              <div className="space-y-2.5 text-xs text-slate-300 mb-4">
                <div className="flex items-center gap-2">
                  <MapPin size={14} className="text-[#F44246] shrink-0" aria-hidden="true" />
                  <a href={GOOGLE_MAPS_URL} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                    4th Floor, Tristar Tower, Avinashi Rd, Coimbatore
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={14} className="text-cyan-400 shrink-0" aria-hidden="true" />
                  <a href={`tel:${phone.replace(/[^+\d]/g, "")}`} className="text-slate-200 hover:text-white font-medium transition-colors">{formatPhone(phone)}</a>
                </div>
                <div className="flex items-center gap-2">
                  <Mail size={14} className="text-[#F44246] shrink-0" aria-hidden="true" />
                  <a href={`mailto:${trainingEmail}`} className="text-slate-200 hover:text-white font-medium transition-colors">{trainingEmail}</a>
                </div>
              </div>
            </div>

            <div>
              <h4 className="flex items-center gap-2"><span aria-hidden="true" className="h-2 w-2 rounded-full bg-[#DF1E26]" />Popular Programs</h4>
              <ul>
                {COURSES.map((course) => (
                  <li key={course.slug}>
                    <Link to={`/courses/${course.slug}`}>{course.name}</Link>
                  </li>
                ))}
              </ul>
              <Link
                to="/courses"
                className="lh-btn lh-btn-sm mt-4 text-white shadow-[inset_0_0_0_2px_rgb(255_255_255/0.5)] hover:bg-white hover:text-[#07405C]"
              >
                View All 20+ Courses
              </Link>
            </div>

            <div>
              <h4 className="flex items-center gap-2"><span aria-hidden="true" className="h-2 w-2 rounded-full bg-cyan-400" />Navigation</h4>
              <ul>
                {QUICK_LINKS.map((link) => (
                  <li key={link.path}>
                    <Link to={link.path}>{link.name}</Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="flex items-center gap-2"><span aria-hidden="true" className="h-2 w-2 rounded-full bg-[#DF1E26]" />Connect With Us</h4>
              <p className="lh-foot-note">
                Follow our social channels for regular batch announcements, free
                webinars, and student placement spotlights.
              </p>
              <div className="lh-soc">
                {socialLinks.map(({ icon: Icon, href, name }, k) => (
                  <a
                    key={name}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={name}
                    style={{ "--k": k }}
                  >
                    <Icon size={18} />
                  </a>
                ))}
              </div>
              <Link to="/contact" className="lh-btn lh-btn-a lh-btn-sm mt-4">
                Request a Callback
                <ArrowRight size={16} className="lh-arr" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>

        <div data-preserve-ui className="contents">
      {/* Interactive watermark with smooth #DF1E26 brand hover transition */}
      <div className="w-full select-none overflow-hidden group py-2 sm:py-3">
        <p className="whitespace-nowrap text-center font-black text-white/10 text-[9vw] sm:text-[7vw] md:text-[5.5vw] tracking-wider transition-all duration-500 ease-out cursor-default hover:text-[#DF1E26] hover:opacity-60 leading-none">
          LEARN • EDUCATE • SUCCEED
        </p>
      </div>

        </div>

        {/* Original glass copyright surface, borderless as requested. */}
        <div className="relative z-10 px-4 sm:px-6 md:px-12 pb-6 pt-2">
          <div className="footer-copyright max-w-7xl mx-auto rounded-2xl bg-white/[0.06] backdrop-blur-md px-6 py-4.5 shadow-[0_8px_32px_rgba(0,0,0,0.25)] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-300 font-medium">
            <p className="tracking-wide">© {new Date().getFullYear()} LeSuccess Academy. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <Link to="/courses" className="hover:text-white transition-colors">Courses</Link>
              <Link to="/services" className="hover:text-white transition-colors">Services</Link>
              <Link to="/contact" className="hover:text-white transition-colors">Contact</Link>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
