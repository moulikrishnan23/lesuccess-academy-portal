import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { SOCIAL_LINKS } from "../../data/socialLinks.js";
import { useInView, useReducedMotion } from "../motion/index.js";

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
 * Fills the outlined watermark with the brand gradient as it rises into view:
 * writes --fill straight to the element from a passive, rAF-throttled scroll
 * listener that only runs while the watermark is on screen.
 */
function useWatermarkFill(ref) {
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    if (reduced || typeof IntersectionObserver === "undefined") {
      el.style.setProperty("--fill", "100%");
      return undefined;
    }

    let frame = 0;
    const measure = () => {
      frame = 0;
      const h = window.innerHeight;
      const k = Math.min(1, Math.max(0, (h - el.getBoundingClientRect().top) / (h * 0.55)));
      el.style.setProperty("--fill", `${(k * 100).toFixed(1)}%`);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };

    const io = new IntersectionObserver(([entry]) => {
      const method = entry.isIntersecting ? "addEventListener" : "removeEventListener";
      window[method]("scroll", schedule, { passive: true });
      schedule();
    });
    io.observe(el);
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", schedule);
      cancelAnimationFrame(frame);
    };
  }, [ref, reduced]);
}

/**
 * Site footer (spec: docs/mockup/lower-home.html, footer): a wave edge, the
 * "Build your future." band, four link columns, a watermark that fills as it
 * scrolls in, and the copyright bar.
 */
export default function Footer() {
  const footRef = useRef(null);
  const wmRef = useRef(null);
  const inView = useInView(footRef, { threshold: 0.1 });
  useWatermarkFill(wmRef);

  return (
    <>
      <div className="lh-wave" aria-hidden="true">
        <div>
          {WAVE}
          {WAVE}
        </div>
      </div>
      <footer ref={footRef} className={`lh-foot${inView ? " is-in" : ""}`}>
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
              <p className="lh-foot-note">
                <a href={GOOGLE_MAPS_URL} target="_blank" rel="noopener noreferrer" className="hover:text-white">
                  4th Floor, Tristar Tower, Avinashi Rd, Coimbatore
                </a>
                <br />
                <a href="tel:+918012060000" className="hover:text-white">
                  +91 80120 60000
                </a>
                <br />
                <a href="mailto:training@lesuccess.in" className="hover:text-white">
                  training@lesuccess.in
                </a>
              </p>
              <a
                href="#employee-login"
                onClick={(e) => e.preventDefault()}
                role="button"
                className="lh-btn lh-btn-sm text-white shadow-[inset_0_0_0_2px_rgb(255_255_255/0.5)] hover:bg-white hover:text-[#07405C]"
              >
                Employee Login
                <ArrowRight size={16} className="lh-arr" aria-hidden="true" />
              </a>
            </div>

            <div>
              <h4>Popular Programs</h4>
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
              <h4>Navigation</h4>
              <ul>
                {QUICK_LINKS.map((link) => (
                  <li key={link.path}>
                    <Link to={link.path}>{link.name}</Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4>Connect With Us</h4>
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

        <div ref={wmRef} className="lh-wm" aria-hidden="true">
          <span>LEARN.EDUCATE.SUCCEED</span>
          <span>LEARN.EDUCATE.SUCCEED</span>
        </div>

        <div className="lh-copy-bar">
          <div className="lh-wrap lh-copy">
            <span>© {new Date().getFullYear()} LeSuccess Academy. All rights reserved.</span>
            <span className="flex flex-wrap gap-4">
              <Link to="/courses">Courses</Link>
              <Link to="/services">Services</Link>
              <Link to="/contact">Contact</Link>
            </span>
          </div>
        </div>
      </footer>
    </>
  );
}
