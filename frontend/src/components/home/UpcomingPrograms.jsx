import { useState, useEffect, useRef } from "react";
import {
  CalendarDays,
  Clock3,
  Video,
  Award,
  BriefcaseBusiness,
} from "lucide-react";
import { listUpcoming } from "../../services/upcomingProgramApi.js";

/* =========================================================
   CONSTANTS
========================================================= */

const IMAGES = {
  WEBINAR: "/home/webinar.png",
  INTERNSHIP: "/home/webinarHost.jpg",
};

const FALLBACK = {
  WEBINAR: [
    {
      label: "Free Webinar",
      title: "Communication Masterclass",
      topic: "Topic: common interview mistakes that cost you your dream job.",
      displayDate: "Saturday",
      displayTime: "5:00 PM - 6:30 PM",
      platform: "Google Meet",
      image: "/home/webinarHost.jpg",
      badge: "Free Webinar",
      meetLink: null,
      certificateIncluded: false,
    },
  ],

  INTERNSHIP: [
    {
      label: "Internship Program",
      title: "Full Stack Internship Program",
      topic:
        "Build real-world projects and gain practical industry experience.",
      displayDate: "Monday",
      displayTime: "10:00 AM - 4:00 PM",
      platform: "LeSuccess Campus",
      image: "/home/webinarHost.jpg",
      badge: "Internship Program",
      meetLink: null,
      certificateIncluded: true,
    },
  ],
};

const INTERVAL_MS = 7000;
const FADE_MS = 400;

/* =========================================================
   HELPERS
========================================================= */

/**
 * Converts API type into the format used by this component.
 *
 * Supports:
 * WEBINAR
 * webinar
 * Webinar
 * INTERNSHIP
 * internship
 * Internship
 */
function normalizeType(type) {
  if (!type) return null;

  const normalized = String(type).trim().toUpperCase();

  if (normalized === "WEBINAR") {
    return "WEBINAR";
  }

  if (normalized === "INTERNSHIP") {
    return "INTERNSHIP";
  }

  return null;
}

/**
 * Formats YYYY-MM-DD into:
 * Saturday, Sep 5
 */
function formatDate(dateStr) {
  if (!dateStr) return null;

  try {
    const value = String(dateStr).trim();

    const parts = value.split("-");

    if (parts.length !== 3) {
      return null;
    }

    const [y, m, d] = parts.map(Number);

    if (!Number.isInteger(y) || !Number.isInteger(m) || !Number.isInteger(d)) {
      return null;
    }

    const date = new Date(y, m - 1, d);

    if (Number.isNaN(date.getTime())) {
      return null;
    }

    return date.toLocaleDateString("en-IN", {
      weekday: "long",
      month: "short",
      day: "numeric",
    });
  } catch {
    return null;
  }
}

/**
 * Converts:
 * 17:00 + 18:30
 *
 * into:
 * 5:00 PM - 6:30 PM
 */
function formatTimeRange(startStr, endStr) {
  if (!startStr) return null;

  try {
    const formatSingleTime = (timeValue) => {
      const value = String(timeValue).trim();

      const parts = value.split(":");

      if (parts.length < 2) {
        return null;
      }

      const hour = Number(parts[0]);
      const minute = Number(parts[1]);

      if (
        !Number.isInteger(hour) ||
        !Number.isInteger(minute) ||
        hour < 0 ||
        hour > 23 ||
        minute < 0 ||
        minute > 59
      ) {
        return null;
      }

      const date = new Date(2000, 0, 1, hour, minute);

      return date
        .toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })
        .toUpperCase();
    };

    const start = formatSingleTime(startStr);

    if (!start) {
      return null;
    }

    if (!endStr) {
      return start;
    }

    const end = formatSingleTime(endStr);

    if (!end) {
      return start;
    }

    return `${start} - ${end}`;
  } catch {
    return null;
  }
}

/**
 * Creates a safe program object from API data.
 */
function buildProgram(apiProgram, fallback, activeType) {
  if (!apiProgram) {
    return fallback;
  }

  return {
    ...fallback,
    ...apiProgram,

    title: apiProgram.title || fallback.title,

    topic: apiProgram.topic || fallback.topic,

    platform: apiProgram.platform || fallback.platform,

    badge:
      apiProgram.badge ||
      apiProgram.label ||
      fallback.badge ||
      (activeType === "WEBINAR" ? "Free Webinar" : "Internship Program"),

    image:
      apiProgram.image ||
      apiProgram.imageUrl ||
      fallback.image ||
      IMAGES[activeType],

    displayDate:
      formatDate(apiProgram.eventDate) ||
      apiProgram.displayDate ||
      fallback.displayDate,

    displayTime:
      formatTimeRange(apiProgram.startTime, apiProgram.endTime) ||
      apiProgram.displayTime ||
      fallback.displayTime,

    meetLink:
      apiProgram.meetLink ||
      apiProgram.registrationLink ||
      apiProgram.registerLink ||
      fallback.meetLink ||
      null,

    certificateIncluded:
      typeof apiProgram.certificateIncluded === "boolean"
        ? apiProgram.certificateIncluded
        : fallback.certificateIncluded,
  };
}

/* =========================================================
   COMPONENT
========================================================= */

const UpcomingPrograms = () => {
  const [activeType, setActiveType] = useState("WEBINAR");

  const [apiPrograms, setApiPrograms] = useState({
    WEBINAR: [],
    INTERNSHIP: [],
  });

  const [programIndex, setProgramIndex] = useState(0);

  const [visible, setVisible] = useState(true);

  const timerRef = useRef(null);
  const fadeTimeoutRef = useRef(null);

  /* =======================================================
     FETCH UPCOMING PROGRAMS
  ======================================================= */

  useEffect(() => {
    const controller = new AbortController();

    const fetchPrograms = async () => {
      try {
        const list = await listUpcoming(null, {
          signal: controller.signal,
        });

        if (!Array.isArray(list)) {
          return;
        }

        const grouped = {
          WEBINAR: [],
          INTERNSHIP: [],
        };

        list.forEach((program) => {
          const type = normalizeType(program?.type);

          if (type) {
            grouped[type].push(program);
          }
        });

        setApiPrograms(grouped);
      } catch (error) {
        /*
          If API fails, we intentionally keep empty arrays.
          The FALLBACK data will automatically be displayed.
        */

        if (error?.name !== "AbortError") {
          console.error("Failed to load upcoming programs:", error);
        }
      }
    };

    fetchPrograms();

    return () => {
      controller.abort();
    };
  }, []);


  /* =======================================================
     AUTO SLIDE
  ======================================================= */

  useEffect(() => {
    const programs = apiPrograms[activeType] || [];

    /*
      No need to start timer when:
      - no API programs
      - only one API program
    */
    if (programs.length <= 1) {
      return undefined;
    }

    timerRef.current = setInterval(() => {
      setVisible(false);

      fadeTimeoutRef.current = setTimeout(() => {
        setProgramIndex((previousIndex) => {
          return (previousIndex + 1) % programs.length;
        });

        setVisible(true);
        fadeTimeoutRef.current = null;
      }, FADE_MS);
    }, INTERVAL_MS);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      if (fadeTimeoutRef.current) {
        clearTimeout(fadeTimeoutRef.current);
        fadeTimeoutRef.current = null;
      }
    };
  }, [apiPrograms, activeType]);

  /* =======================================================
     CURRENT PROGRAM
  ======================================================= */

  const programs = apiPrograms[activeType] || [];

  const fallbackList = FALLBACK[activeType] || [];

  const fallback = fallbackList[0] || FALLBACK.WEBINAR[0];

  /*
    Safety check:
    If programIndex somehow becomes larger than the
    available API programs, use the first program.
  */
  const apiProgram =
    programs.length > 0 ? programs[programIndex] || programs[0] : null;

  const program = buildProgram(apiProgram, fallback, activeType);

  /*
    Dots should only appear when there are multiple
    actual API programs.
  */
  const totalSlides = programs.length;

  /* =======================================================
     MANUAL SLIDE CHANGE
  ======================================================= */

  const changeSlide = (index) => {
    if (index === programIndex) {
      return;
    }

    if (fadeTimeoutRef.current) {
      clearTimeout(fadeTimeoutRef.current);
      fadeTimeoutRef.current = null;
    }

    setVisible(false);

    fadeTimeoutRef.current = setTimeout(() => {
      setProgramIndex(index);
      setVisible(true);
      fadeTimeoutRef.current = null;
    }, FADE_MS);
  };

  /* =======================================================
     TAB CHANGE
  ======================================================= */

  const changeTab = (type) => {
    if (type === activeType) {
      return;
    }

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (fadeTimeoutRef.current) {
      clearTimeout(fadeTimeoutRef.current);
      fadeTimeoutRef.current = null;
    }

    setProgramIndex(0);
    setVisible(true);
    setActiveType(type);
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <section className="w-full bg-linear-to-r from-[#ff3b3f] to-[#cc0f4f] px-6 py-14 text-white sm:px-10 lg:px-20">
      <div className="mx-auto max-w-300 text-center">
        {/* =================================================
            HEADING
        ================================================= */}

        <h2 className="text-3xl font-bold sm:text-4xl">
          Upcoming Program Details:
        </h2>

        <p className="mt-4 text-base sm:text-lg">
          Get the basics right and enter the industry with confidence.
        </p>

        {/* =================================================
            TAB SWITCH
        ================================================= */}

        <div className="mx-auto mt-7 flex w-fit rounded-lg bg-white p-1">
          {/* WEBINAR TAB */}

          <button
            type="button"
            onClick={() => changeTab("WEBINAR")}
            className={`rounded-md px-7 py-2 text-sm font-medium transition sm:text-base ${
              activeType === "WEBINAR"
                ? "bg-[#d91b4d] text-white"
                : "text-gray-800 hover:bg-gray-100"
            }`}
          >
            Webinar
          </button>

          {/* INTERNSHIP TAB */}

          <button
            type="button"
            onClick={() => changeTab("INTERNSHIP")}
            className={`rounded-md px-7 py-2 text-sm font-medium transition sm:text-base ${
              activeType === "INTERNSHIP"
                ? "bg-[#d91b4d] text-white"
                : "text-gray-800 hover:bg-gray-100"
            }`}
          >
            Internship
          </button>
        </div>

        {/* =================================================
            PROGRAM CARD
        ================================================= */}

        <div
          className="mx-auto mt-10 max-w-250 rounded-[28px] border border-white/60 bg-white/10 p-5 sm:p-7"
          style={{
            opacity: visible ? 1 : 0,
            transition: `opacity ${FADE_MS}ms ease-in-out`,
          }}
        >
          <div className="grid items-center justify-items-center gap-7 md:grid-cols-[200px_1fr]">
            {/* =================================================
                IMAGE
            ================================================= */}

            <div className="overflow-hidden rounded-[28px]">
              <img
                src={program.image || IMAGES[activeType]}
                alt={program.title || "Upcoming Program"}
                className="h-64 w-52 object-cover"
                onError={(event) => {
                  /*
                    If API image is broken, automatically
                    switch to the default image.
                  */
                  if (event.currentTarget.src.endsWith(IMAGES[activeType])) {
                    return;
                  }

                  event.currentTarget.src = IMAGES[activeType];
                }}
              />
            </div>

            {/* =================================================
                CONTENT
            ================================================= */}

            <div className="w-full text-center">
              {/* BADGE */}

              <div className="flex justify-center">
                <span className="animate-pulse rounded-lg bg-green-300 px-4 py-2 text-xs font-semibold text-green-800">
                  {program.badge}
                </span>
              </div>

              {/* TITLE */}

              <h3 className="mt-4 text-2xl font-bold sm:text-3xl">
                {program.title}
              </h3>

              {/* TOPIC */}

              <p className="mt-3 text-base sm:text-lg">{program.topic}</p>

              {/* =================================================
                  DETAILS
              ================================================= */}

              <div className="mt-6 grid gap-5 sm:grid-cols-3">
                {/* DATE */}

                <div className="flex flex-col items-center">
                  <CalendarDays size={22} />

                  <span className="mt-2 text-sm">Date</span>

                  <strong>{program.displayDate}</strong>
                </div>

                {/* TIME */}

                <div className="flex flex-col items-center">
                  <Clock3 size={22} />

                  <span className="mt-2 text-sm">Timing</span>

                  <strong>{program.displayTime}</strong>
                </div>

                {/* PLATFORM */}

                <div className="flex flex-col items-center">
                  {activeType === "WEBINAR" ? (
                    <Video size={22} />
                  ) : (
                    <BriefcaseBusiness size={22} />
                  )}

                  <span className="mt-2 text-sm">Platform</span>

                  <strong>{program.platform}</strong>
                </div>
              </div>

              {/* =================================================
                  ACTION BUTTON + CERTIFICATE
              ================================================= */}

              <div className="mt-7 flex flex-wrap justify-center gap-5">
                {program.meetLink ? (
                  <a
                    href={program.meetLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-md bg-[#074a68] px-10 py-3 text-sm font-medium text-white transition hover:bg-[#053a52]"
                  >
                    {activeType === "WEBINAR" ? "Register Now" : "Apply Now"}
                  </a>
                ) : (
                  <button
                    type="button"
                    className="cursor-not-allowed rounded-md bg-[#074a68]/70 px-10 py-3 text-sm font-medium text-white"
                    disabled
                    title="Registration link will be available soon"
                  >
                    {activeType === "WEBINAR" ? "Register Now" : "Apply Now"}
                  </button>
                )}

                {/* CERTIFICATE */}

                {program.certificateIncluded && (
                  <div className="flex items-center gap-2 text-yellow-300">
                    <Award size={22} />

                    <span>Certificate Included</span>
                  </div>
                )}
              </div>

              {/* =================================================
                  SLIDE DOTS
              ================================================= */}

              {totalSlides > 1 && (
                <div className="mt-5 flex justify-center gap-2">
                  {Array.from({
                    length: totalSlides,
                  }).map((_, index) => (
                    <button
                      key={index}
                      type="button"
                      aria-label={`Go to program ${index + 1}`}
                      aria-current={index === programIndex ? "true" : undefined}
                      onClick={() => changeSlide(index)}
                      className={`h-2 rounded-full transition-all ${
                        index === programIndex
                          ? "w-6 bg-white"
                          : "w-2 bg-white/40 hover:bg-white/70"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default UpcomingPrograms;
