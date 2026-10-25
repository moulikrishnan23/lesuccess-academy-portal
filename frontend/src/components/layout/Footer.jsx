import { useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Mail, MapPin, Phone } from "lucide-react";
import { SOCIAL_LINKS } from "../../data/socialLinks.js";
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

/**
 * Site footer: brand rule along the top, four link columns, a faint
 * "Learn • Educate • Succeed" watermark and an inset copyright bar. The red
 * CTA carries the Home page colour flow (.btn-flow).
 */
export default function Footer() {
  const footRef = useRef(null);
  const inView = useInView(footRef, { threshold: 0.1 });

  return (
    <footer ref={footRef} className={`lh-foot${inView ? " is-in" : ""}`}>
      <div className="lh-wrap">
        <div className="lh-foot-g">
          <div>
            <Link to="/" className="inline-block rounded-xl bg-white px-3 py-2 shadow-md">
              <img src="/logo/logo.png" alt="LeSuccess Academy" className="h-9 w-auto object-contain" />
            </Link>
            <p className="lh-foot-lead">
              Premier technology learning accelerator in Coimbatore. Empowering
              students and professionals with hands-on coding, enterprise
              frameworks, and verified career placements.
            </p>
            <ul className="lh-foot-contact">
              <li>
                <span className="lh-foot-live" aria-hidden="true" />
                <MapPin size={15} className="text-[#F44246]" aria-hidden="true" />
                <a href={GOOGLE_MAPS_URL} target="_blank" rel="noopener noreferrer">
                  4th Floor, Tristar Tower, Avinashi Rd, Coimbatore
                </a>
              </li>
              <li>
                <Phone size={15} className="text-sky-400" aria-hidden="true" />
                <a href="tel:+918012060000" className="font-semibold text-white">
                  +91 80120 60000
                </a>
              </li>
              <li>
                <Mail size={15} className="text-[#F44246]" aria-hidden="true" />
                <a href="mailto:training@lesuccess.in" className="font-semibold text-white">
                  training@lesuccess.in
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="lh-foot-h">Popular Programs</h4>
            <ul>
              {COURSES.map((course) => (
                <li key={course.slug}>
                  <Link to={`/courses/${course.slug}`}>{course.name}</Link>
                </li>
              ))}
            </ul>
            <Link to="/courses" className="lh-foot-more">
              View All 20+ Courses
              <ArrowRight size={14} aria-hidden="true" />
            </Link>
          </div>

          <div>
            <h4 className="lh-foot-h lh-foot-h--cyan">Navigation</h4>
            <ul>
              {QUICK_LINKS.map((link) => (
                <li key={link.path}>
                  <Link to={link.path}>{link.name}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="lh-foot-h">Connect With Us</h4>
            <p className="lh-foot-note">
              Follow our social channels for regular batch announcements, free
              webinars, and student placement spotlights.
            </p>
            <div className="lh-soc">
              {SOCIAL_LINKS.map(({ icon: Icon, href, name }, k) => (
                <a
                  key={name}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={name}
                  style={{ "--k": k }}
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
            <Link to="/contact" className="lh-foot-cta lh-foot-cta--block btn-flow">
              Request a Callback
            </Link>
          </div>
        </div>
      </div>

      <div className="lh-wm" aria-hidden="true">
        {[0, 1].map((k) => (
          <span key={k}>
            LEARN <i /> EDUCATE <i /> SUCCEED
          </span>
        ))}
      </div>

      <div className="lh-wrap">
        <div className="lh-copy">
          <span>© {new Date().getFullYear()} LeSuccess Academy. All rights reserved.</span>
          <span className="flex flex-wrap gap-6">
            <Link to="/courses">Courses</Link>
            <Link to="/services">Services</Link>
            <Link to="/contact">Contact</Link>
          </span>
        </div>
      </div>
    </footer>
  );
}
