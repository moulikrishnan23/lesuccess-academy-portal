
import { useState, useEffect, useRef } from "react";
import {
  CalendarDays,
  Clock3,
  Video,
  Award,
  BriefcaseBusiness,
} from "lucide-react";
import { listUpcoming } from "../../services/upcomingProgramApi.js";

const IMAGES = {
  WEBINAR: "/home/webinar.png",
  INTERNSHIP: "/home/webinarHost.jpg",
};

const FALLBACK = {
  WEBINAR: [{
    label: "Free Webinar",
    title: "Communication Masterclass",
    topic: "Topic: common interview mistakes that cost you your dream job.",
    displayDate: "Saturday",
    displayTime: "5:00PM - 6:30PM",
    platform: "Google Meet",
    image: "/home/webinarHost.jpg",
    badge: "Free Webinar",
  },

  internship: {
    title: "Full Stack Internship Program",
    topic: "Build real-world projects and gain practical industry experience.",
    displayDate: "Monday",
    displayTime: "10:00AM - 4:00PM",
    platform: "LeSuccess Campus",
    meetLink: null,
    certificateIncluded: true,
  }],
};

const INTERVAL_MS = 7000;
const FADE_MS = 400;

function formatDate(dateStr) {
  if (!dateStr) return null;
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-IN", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

function formatTimeRange(startStr, endStr) {
  if (!startStr) return null;
  const fmt = (t) => {
    const [h, min] = t.split(":").map(Number);
    return new Date(2000, 0, 1, h, min)
      .toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })
      .toUpperCase();
  };
  return endStr ? `${fmt(startStr)} - ${fmt(endStr)}` : fmt(startStr);
}

const UpcomingPrograms = () => {
  const [activeType, setActiveType] = useState("WEBINAR");
  const [apiPrograms, setApiPrograms] = useState({ WEBINAR: [], INTERNSHIP: [] });
  const [programIndex, setProgramIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const timerRef = useRef(null);

  useEffect(() => {
    const controller = new AbortController();
    listUpcoming(null, { signal: controller.signal })
      .then((list) => {
        const grouped = { WEBINAR: [], INTERNSHIP: [] };
        list.forEach((p) => grouped[p.type]?.push(p));
        setApiPrograms(grouped);
      })
      .catch(() => {/* keep fallback */});
    return () => controller.abort();
  }, []);

  // Reset index and fade when switching tabs
  useEffect(() => {
    clearInterval(timerRef.current);
    setProgramIndex(0);
    setVisible(true);
  }, [activeType]);

  // Cycle through programs of the active type every 7 seconds
  useEffect(() => {
    const programs = apiPrograms[activeType];
    if (!programs || programs.length <= 1) return;

    timerRef.current = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setProgramIndex((prev) => (prev + 1) % programs.length);
        setVisible(true);
      }, FADE_MS);
    }, INTERVAL_MS);

    return () => clearInterval(timerRef.current);
  }, [apiPrograms, activeType]);

  const programs = apiPrograms[activeType];
  const api = programs[programIndex];
  const fallback = FALLBACK[activeType][0];

  const program = api
    ? {
        ...api,
        displayDate: formatDate(api.eventDate) ?? fallback.displayDate,
        displayTime: formatTimeRange(api.startTime, api.endTime) ?? fallback.displayTime,
      }
    : fallback;

  const totalSlides = programs.length > 0 ? programs.length : 1;

  return (
    <section className="w-full bg-linear-to-r from-[#ff3b3f] to-[#cc0f4f] px-6 py-14 text-white sm:px-10 lg:px-20">
      <div className="mx-auto max-w-300 text-center">

        <h2 className="text-3xl font-bold sm:text-4xl">
          Upcoming Program Details:
        </h2>

        <p className="mt-4 text-base sm:text-lg">
          Get the basics right and enter the industry with confidence.
        </p>

        {/* Tab Switch */}
        <div className="mx-auto mt-7 flex w-fit rounded-lg bg-white p-1">
          <button
            onClick={() => setActiveType("WEBINAR")}
            className={`rounded-md px-7 py-2 text-sm font-medium transition sm:text-base ${
              activeType === "WEBINAR" ? "bg-[#d91b4d] text-white" : "text-gray-800"
            }`}
          >
            Webinar
          </button>
          <button
            onClick={() => setActiveType("INTERNSHIP")}
            className={`rounded-md px-7 py-2 text-sm font-medium transition sm:text-base ${
              activeType === "INTERNSHIP" ? "bg-[#d91b4d] text-white" : "text-gray-800"
            }`}
          >
            Internship
          </button>
        </div>

        {/* Program Card */}
        <div
          className="mx-auto mt-10 max-w-250 rounded-[28px] border border-white/60 bg-white/10 p-5 sm:p-7"
          style={{ opacity: visible ? 1 : 0, transition: `opacity ${FADE_MS}ms ease-in-out` }}
        >
          <div className="grid items-center justify-items-center gap-7 md:grid-cols-[200px_1fr]">

            {/* Image */}
            <div className="overflow-hidden rounded-[28px]">
              <img
                src={IMAGES[activeType]}
                alt={program.title}
                className="h-64 w-52 object-cover"
              />
            </div>

            {/* Content */}
            <div className="w-full text-center">

              <div className="flex justify-center">
                <span className="rounded-lg bg-green-300 px-4 py-2 text-xs font-semibold text-green-800 transition animate-pulse">
                  {program.badge}
                </span>
              </div>

              <h3 className="mt-4 text-2xl font-bold sm:text-3xl">
                {program.title}
              </h3>

              <p className="mt-3 text-base sm:text-lg">
                {program.topic}
              </p>

              {/* Details */}
              <div className="mt-6 grid gap-5 sm:grid-cols-3">
                <div className="flex flex-col items-center">
                  <CalendarDays size={22} />
                  <span className="mt-2 text-sm">Date</span>
                  <strong>{program.displayDate}</strong>
                </div>
                <div className="flex flex-col items-center">
                  <Clock3 size={22} />
                  <span className="mt-2 text-sm">Timing</span>
                  <strong>{program.displayTime}</strong>
                </div>
                <div className="flex flex-col items-center">
                  {activeType === "WEBINAR" ? <Video size={22} /> : <BriefcaseBusiness size={22} />}
                  <span className="mt-2 text-sm">Platform</span>
                  <strong>{program.platform}</strong>
                </div>
              </div>

              <div className="mt-7 flex flex-wrap justify-center gap-5">
                {program.meetLink ? (
                  <a
                    href={program.meetLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-md bg-[#074a68] px-10 py-3 text-sm font-medium text-white"
                  >
                    {activeType === "WEBINAR" ? "Register Now" : "Apply Now"}
                  </a>
                ) : (
                  <button className="rounded-md bg-[#074a68] px-10 py-3 text-sm font-medium text-white">
                    {activeType === "WEBINAR" ? "Register Now" : "Apply Now"}
                  </button>
                )}

                {program.certificateIncluded && (
                  <div className="flex items-center gap-2 text-yellow-300">
                    <Award size={22} />
                    <span>Certificate Included</span>
                  </div>
                )}
              </div>

              {/* Slide dots */}
              {totalSlides > 1 && (
                <div className="mt-5 flex justify-center gap-2">
                  {Array.from({ length: totalSlides }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setVisible(false);
                        setTimeout(() => {
                          setProgramIndex(i);
                          setVisible(true);
                        }, FADE_MS);
                      }}
                      className={`h-2 rounded-full transition-all ${
                        i === programIndex ? "w-6 bg-white" : "w-2 bg-white/40"
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
