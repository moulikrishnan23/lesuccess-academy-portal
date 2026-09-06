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
    <div className="w-full bg-linear-to-r from-[#ff3b3f] to-[#cc0f4f] text-white">
      <div className="mx-auto flex min-h-13.75 flex-wrap items-center justify-center gap-3 px-4 py-2 text-center">
        <p
          className="text-sm font-semibold sm:text-base md:text-lg"
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
            animate-pulse
            rounded-md
            bg-white
            px-5
            py-2
            text-sm
            font-semibold
            text-[#e51d48]
            transition
            duration-200
            hover:bg-gray-100
          "
        >
          Enroll Now
        </button>
      </div>
    </div>
  );
};

export default OfferHeader;
