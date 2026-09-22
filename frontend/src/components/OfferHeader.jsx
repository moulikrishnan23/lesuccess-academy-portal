import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import apiClient from "../services/apiClient.js";
import useCourses from "../hooks/useCourses.js";

const FALLBACK = [
  {
    text: "Data Analytics Course - 30% Offer 10 Days Only - Limited Seats!",
    linkLabel: "Enroll Now",
    linkUrl: null,
  },
];

const INTERVAL_MS = 5000;
const FADE_MS = 400;

const OfferHeader = () => {
  const [announcements, setAnnouncements] = useState(FALLBACK);
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const timerRef = useRef(null);

  useEffect(() => {
    const controller = new AbortController();
    apiClient
      .get("/api/announcements/active-all", { signal: controller.signal })
      .then(({ data }) => {
        const list = data?.data;
        if (Array.isArray(list) && list.length > 0) {
          setAnnouncements(list);
        }
      })
      .catch(() => {/* keep fallback */});
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (announcements.length <= 1) return;

    timerRef.current = setInterval(() => {
      // fade out
      setVisible(false);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % announcements.length);
        // fade in
        setVisible(true);
      }, FADE_MS);
    }, INTERVAL_MS);

    return () => clearInterval(timerRef.current);
  }, [announcements]);

  const location = useLocation();
  const navigate = useNavigate();
  const { courses } = useCourses();

  const current = announcements[index] ?? FALLBACK[0];
  const text = current.text ?? FALLBACK[0].text;

  const handleEnrollNow = () => {
    // 1. If user is already on a course detail page, identify that course and scroll to enroll form
    if (location.pathname.startsWith("/courses/")) {
      const currentSlug = location.pathname.replace(/^\/courses\//, "").split("/")[0].split("#")[0];
      if (currentSlug) {
        const enrollEl = document.getElementById("enroll");
        if (enrollEl) {
          enrollEl.scrollIntoView({ behavior: "smooth", block: "center" });
          window.setTimeout(() => {
            enrollEl.querySelector("input")?.focus({ preventScroll: true });
          }, 350);
          window.history.replaceState(null, "", `/courses/${currentSlug}#enroll`);
        } else {
          navigate(`/courses/${currentSlug}#enroll`);
        }
        return;
      }
    }

    // 2. If on another page, identify the course from current announcement or fallback
    let targetSlug = null;

    if (current?.linkUrl && current.linkUrl.includes("/courses/")) {
      targetSlug = current.linkUrl.replace(/.*\/courses\//, "").split("#")[0].split("/")[0];
    }

    if (!targetSlug && current?.text) {
      const lower = current.text.toLowerCase();
      const matched = courses.find((c) => {
        const titleMatch = c.title && lower.includes(c.title.toLowerCase());
        const slugMatch = c.slug && lower.includes(c.slug.replace(/-/g, " "));
        return titleMatch || slugMatch;
      });

      if (matched) {
        targetSlug = matched.slug;
      } else if (lower.includes("data analytic")) {
        targetSlug = "data-analytics";
      } else if (lower.includes("python")) {
        targetSlug = "python-full-stack-development";
      } else if (lower.includes("java")) {
        targetSlug = "java-full-stack-development";
      } else if (lower.includes("aws") || lower.includes("devops")) {
        targetSlug = "aws-with-devops";
      } else if (lower.includes("mern")) {
        targetSlug = "mern-full-stack";
      }
    }

    if (!targetSlug) {
      targetSlug = courses[0]?.slug || "data-analytics";
    }

    navigate(`/courses/${targetSlug}#enroll`);
  };

  return (
    <div className="w-full bg-gradient-to-r from-[#F44246] to-[#CA164B] text-white shadow-xs">
      <div className="mx-auto flex min-h-11 flex-wrap items-center justify-center gap-3 px-4 py-2 text-center">
        <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-white/20 px-2.5 py-0.5 text-[11px] font-bold tracking-wide uppercase text-white border border-white/30 select-none">
          Special Offer
        </span>

        <p
          className="text-xs font-semibold sm:text-sm md:text-base tracking-wide"
          style={{
            opacity: visible ? 1 : 0,
            transition: `opacity ${FADE_MS}ms ease-in-out`,
          }}
        >
          {text}
        </p>

        <button
          type="button"
          onClick={handleEnrollNow}
          className="
            animate-[pulse_1.2s_ease-in-out_infinite]
            rounded-lg
            bg-white
            px-4
            py-1.5
            text-xs
            sm:text-sm
            font-bold
            text-[#DF1E26]
            shadow-sm
            transition
            duration-200
            hover:bg-slate-100
            active:scale-95
            cursor-pointer
          "
        >
          Enroll Now
        </button>
      </div>
    </div>
  );
};

export default OfferHeader;
