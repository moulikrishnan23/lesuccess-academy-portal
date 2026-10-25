import { useState, useEffect, useLayoutEffect, useMemo, useRef } from "react";
import {
  ArrowRight,
  Briefcase,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  MapPin,
  User,
  Video,
  Wrench,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import useReducedMotion from "../../hooks/useReducedMotion.js";
import { getImageUrl } from "../../utils/imageUtils.js";
import { useAppData } from "../../context/appData.js";
import ProgramRegistrationModal from "./ProgramRegistrationModal.jsx";
import SectionHead from "./SectionHead.jsx";
import { Reveal } from "../motion/index.js";

const INTERVAL_MS = 7000;

const CATEGORIES = [
  { id: "WEBINAR", label: "Webinars" },
  { id: "WORKSHOP", label: "Workshops" },
  { id: "INTERNSHIP", label: "Internships" },
];

/*
 * What each section shows while nothing of that type is scheduled: what the
 * program is, without inventing dates. Real programs from the admin panel
 * replace it as soon as one of that type is published.
 */
const TYPE_PREVIEW = {
  WEBINAR: {
    icon: Video,
    chips: ["Live Q&A", "Expert mentors", "Free entry"],
    tag: "Free Webinars",
    title: "Live webinars with industry mentors",
    description:
      "Interview skills, career talks and tech deep-dives, streamed live with time for your questions. New sessions are announced here first.",
    details: [
      ["Schedule", "Announced soon"],
      ["Mode", "Online · Google Meet"],
      ["Fee", "Free"],
    ],
  },
  WORKSHOP: {
    icon: Wrench,
    chips: ["Hands-on", "Small groups", "Take-home project"],
    tag: "Hands-on Workshops",
    title: "Build-along workshops on campus",
    description:
      "Small-group sessions where you code alongside a trainer and leave with a working project of your own.",
    details: [
      ["Schedule", "Announced soon"],
      ["Mode", "Offline · LeSuccess campus"],
      ["Seats", "Limited"],
    ],
  },
  INTERNSHIP: {
    icon: Briefcase,
    chips: ["Real projects", "Mentor reviews", "Experience letter"],
    tag: "Internship Program",
    title: "Industry internship program",
    description:
      "Guided real-world projects with mentors, ending with an experience certificate. The next batch is announced on enrollment.",
    details: [
      ["Duration", "Announced on enrollment"],
      ["Mode", "Offline / Online"],
      ["Seats", "Limited"],
    ],
  },
};

/** A section with nothing scheduled yet: the program, and a way to hear first. */
function TypePreview({ type, onRetry }) {
  const preview = TYPE_PREVIEW[type];
  const Icon = preview.icon;
  return (
    <article className="lh-feat" data-cursor-text="Soon">
      <div className="lh-feat-media lh-feat-art" aria-hidden="true">
        <span className="lh-art-ring lh-art-ring--1" />
        <span className="lh-art-ring lh-art-ring--2" />
        <span className="lh-art-icon">
          <Icon size={44} strokeWidth={1.75} />
        </span>
        <span className="lh-art-label">{preview.tag}</span>
        <div className="lh-art-chips">
          {preview.chips.map((chip, i) => (
            <span key={chip} style={{ "--i": i }}>{chip}</span>
          ))}
        </div>
      </div>
      <div className="lh-feat-body">
        <div className="flex flex-wrap items-center gap-2">
          <span className="lh-badge">{preview.tag}</span>
          <span className="text-xs font-bold text-slate-500">Next batch coming soon</span>
        </div>
        <h3>{preview.title}</h3>
        <p>{preview.description}</p>
        <div className="lh-details">
          {preview.details.map(([label, value]) => (
            <div key={label}>
              {label}
              <b>{value}</b>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <a href="#connect-with-us-section" className="lh-btn lh-btn-a btn-flow" data-cursor-text="Notify">
            Get notified
            <ArrowRight size={18} className="lh-arr" aria-hidden="true" />
          </a>
          <span className="lh-cert-tag">
            <CheckCircle2 size={18} aria-hidden="true" />
            Certificate Included
          </span>
        </div>
        {onRetry && (
          <p className="text-xs text-slate-500">
            The live schedule could not be loaded.{" "}
            <button type="button" onClick={onRetry} className="font-bold text-[#07405C] underline underline-offset-2">
              Try again
            </button>
          </p>
        )}
      </div>
    </article>
  );
}

const TYPE_TAG = {
  WEBINAR: "Free Webinar",
  WORKSHOP: "Hands-on Workshop",
  INTERNSHIP: "Internship Program",
};

const CTA_LABEL = {
  WEBINAR: "Register For Free",
  WORKSHOP: "Book Workshop Seat",
  INTERNSHIP: "Apply For Internship",
};

/* =========================================================
   HELPERS
========================================================= */

function formatDate(dateStr) {
  if (!dateStr) return null;
  try {
    const value = String(dateStr).trim();
    const parts = value.split("-");
    if (parts.length !== 3) return null;
    const [y, m, d] = parts.map(Number);
    if (!Number.isInteger(y) || !Number.isInteger(m) || !Number.isInteger(d))
      return null;
    const date = new Date(y, m - 1, d);
    if (Number.isNaN(date.getTime())) return null;
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return null;
  }
}

function formatTimeRange(startStr, endStr) {
  if (!startStr) return null;
  try {
    const formatSingleTime = (timeValue) => {
      const value = String(timeValue).trim();
      const parts = value.split(":");
      if (parts.length < 2) return null;
      const hour = Number(parts[0]);
      const minute = Number(parts[1]);
      if (
        !Number.isInteger(hour) ||
        !Number.isInteger(minute) ||
        hour < 0 ||
        hour > 23 ||
        minute < 0 ||
        minute > 59
      )
        return null;
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
    if (!start) return null;
    if (!endStr) return start;
    const end = formatSingleTime(endStr);
    if (!end) return start;
    return `${start} - ${end}`;
  } catch {
    return null;
  }
}

/** The event's start as a local timestamp, or null when the date is missing. */
function eventStart(program) {
  const [y, m, d] = String(program?.eventDate || "").split("-").map(Number);
  if (!y || !m || !d) return null;
  const [hh = 0, mm = 0] = String(program?.startTime || "").split(":").map(Number);
  const start = new Date(y, m - 1, d, hh || 0, mm || 0);
  return Number.isNaN(start.getTime()) ? null : start.getTime();
}

const pad = (n) => String(n).padStart(2, "0");

/**
 * Days / hours / minutes / seconds until `target`, in flip tiles. Each tile is
 * keyed by its value, so a change remounts it and replays the CSS flip
 * (lower-home.css, .lh-fu b). Renders nothing once the event has started.
 */
function FlipCountdown({ target }) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const left = Math.floor((target - now) / 1000);
  if (left <= 0) return null;

  const units = [
    ["Days", Math.floor(left / 86400)],
    ["Hours", Math.floor((left % 86400) / 3600)],
    ["Min", Math.floor((left % 3600) / 60)],
    ["Sec", left % 60],
  ];

  return (
    <div className="lh-fcd" role="timer" aria-label="Time until the event starts">
      {units.map(([label, value]) => (
        <div key={label} className="lh-fu">
          <b key={value}>{pad(value)}</b>
          {label}
        </div>
      ))}
    </div>
  );
}

/**
 * Upcoming programs and events (spec: docs/mockup/lower-home.html, #upcoming):
 * pill tabs with a sliding gradient indicator over a feature card with the
 * speaker image, a flip countdown and the detail tiles. Programs come from the
 * shared app data; registration and the remembered "registered" state are
 * unchanged.
 */
export default function UpcomingPrograms() {
  const reduced = useReducedMotion();
  const { programs } = useAppData();
  const { status, data: allPrograms, refetch } = programs;
  const loading = status === "loading";
  // Until the visitor picks a tab, open the first type that has events.
  const [pickedCategory, setPickedCategory] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [direction, setDirection] = useState(1);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [selectedProgramForModal, setSelectedProgramForModal] = useState(null);

  const tabsRef = useRef(null);
  const indicatorRef = useRef(null);

  const [registeredEvents, setRegisteredEvents] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem("lesuccess_registered_events") || "{}",
      );
    } catch {
      return {};
    }
  });

  const handleRegisterSuccess = (programId, regData) => {
    setRegisteredEvents((prev) => {
      const updated = { ...prev, [programId]: regData };
      try {
        localStorage.setItem(
          "lesuccess_registered_events",
          JSON.stringify(updated),
        );
      } catch (err) {
        console.error("Failed to cache registration", err);
      }
      return updated;
    });
  };

  const countByType = useMemo(() => {
    const counts = {};
    for (const p of allPrograms) {
      const type = (p.type || "").toUpperCase();
      counts[type] = (counts[type] || 0) + 1;
    }
    return counts;
  }, [allPrograms]);

  const selectedCategory =
    pickedCategory ?? CATEGORIES.find((c) => countByType[c.id])?.id ?? "WEBINAR";

  const filteredPrograms = useMemo(
    () => allPrograms.filter((p) => (p.type || "").toUpperCase() === selectedCategory),
    [allPrograms, selectedCategory],
  );

  const handleCategoryChange = (cat) => {
    if (cat === selectedCategory) return;
    setPickedCategory(cat);
    setCurrentIndex(0);
  };

  // Slide the tab indicator under the selected tab. Written straight to the
  // element: it is pure presentation and must follow resizes too.
  useLayoutEffect(() => {
    const place = () => {
      const tab = tabsRef.current?.querySelector('[aria-selected="true"]');
      const ind = indicatorRef.current;
      if (!tab || !ind) return;
      ind.style.width = `${tab.offsetWidth}px`;
      ind.style.height = `${tab.offsetHeight}px`;
      ind.style.transform = `translate(${tab.offsetLeft}px, ${tab.offsetTop}px)`;
    };
    place();
    window.addEventListener("resize", place);
    return () => window.removeEventListener("resize", place);
  }, [selectedCategory, loading]);

  // Auto-advance, paused on hover and while the registration modal is open.
  useEffect(() => {
    if (filteredPrograms.length <= 1 || isHovered || isRegisterModalOpen)
      return undefined;
    const timer = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % filteredPrograms.length);
    }, INTERVAL_MS);
    return () => clearInterval(timer);
  }, [filteredPrograms.length, isHovered, isRegisterModalOpen]);

  const goToNext = () => {
    if (filteredPrograms.length <= 1) return;
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % filteredPrograms.length);
  };

  const goToPrev = () => {
    if (filteredPrograms.length <= 1) return;
    setDirection(-1);
    setCurrentIndex(
      (prev) => (prev - 1 + filteredPrograms.length) % filteredPrograms.length,
    );
  };

  const goToSlide = (idx) => {
    if (idx === currentIndex) return;
    setDirection(idx > currentIndex ? 1 : -1);
    setCurrentIndex(idx);
  };

  const currentProgram =
    filteredPrograms[currentIndex] || filteredPrograms[0] || null;
  const eventType = (currentProgram?.type || "WEBINAR").toUpperCase();
  const isOffline = (currentProgram?.mode || "").toUpperCase() === "OFFLINE";
  const registrationInfo = currentProgram?.id
    ? registeredEvents[currentProgram.id]
    : null;
  const isRegisteredForCurrent = Boolean(registrationInfo);
  const registeredMeetLink =
    registrationInfo?.meetLink || currentProgram?.meetLink;
  const startsAt = eventStart(currentProgram);

  const handleOpenRegister = () => {
    if (!currentProgram) return;
    setSelectedProgramForModal(currentProgram);
    setIsRegisterModalOpen(true);
  };

  const handleCloseRegister = () => {
    setIsRegisterModalOpen(false);
    setSelectedProgramForModal(null);
  };

  const formattedDate = formatDate(currentProgram?.eventDate) || "Upcoming";
  const formattedTime =
    formatTimeRange(currentProgram?.startTime, currentProgram?.endTime) ||
    "Flexible Timings";
  const place = isOffline
    ? currentProgram?.venueName || currentProgram?.venueAddress || "LeSuccess Campus"
    : currentProgram?.platform || "Google Meet";

  let body;
  if (loading) {
    body = (
      <div className="lh-feat" aria-busy="true">
        <div className="lh-feat-media" />
        <div className="lh-feat-body">
          <div className="h-6 w-1/3 animate-pulse rounded-lg bg-slate-200" />
          <div className="h-10 animate-pulse rounded-lg bg-slate-200" />
          <div className="h-16 animate-pulse rounded-lg bg-slate-100" />
          <div className="h-12 w-2/5 animate-pulse rounded-full bg-slate-200" />
        </div>
      </div>
    );
  } else if (filteredPrograms.length === 0) {
    body = (
      <TypePreview
        key={selectedCategory}
        type={selectedCategory}
        onRetry={status === "error" ? refetch : null}
      />
    );
  } else {
    body = (
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.article
            key={currentProgram?.id || currentIndex}
            data-cursor-text="Event"
            initial={reduced ? false : { opacity: 0, x: direction * 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={reduced ? { opacity: 1 } : { opacity: 0, x: direction * -30 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="lh-feat"
          >
            <div className="lh-feat-media">
              {eventType !== "INTERNSHIP" && currentProgram?.imageUrl ? (
                <img
                  src={getImageUrl(currentProgram.imageUrl, "", { width: 800 })}
                  alt={currentProgram.speakerName || currentProgram.title}
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              ) : (
                <div className="relative grid justify-items-center gap-3 p-8 text-center">
                  <span className="grid h-20 w-20 place-items-center rounded-2xl border border-white/20 bg-white/10">
                    {eventType === "INTERNSHIP" ? (
                      <Briefcase size={36} aria-hidden="true" />
                    ) : (
                      <User size={36} aria-hidden="true" />
                    )}
                  </span>
                  <span className="text-sm font-bold">
                    {eventType === "INTERNSHIP"
                      ? "Live Industry Internship"
                      : currentProgram?.speakerName || "Faculty & Tech Mentors"}
                  </span>
                </div>
              )}
              {currentProgram?.speakerName && currentProgram?.imageUrl && eventType !== "INTERNSHIP" && (
                <span className="absolute bottom-3 left-3 rounded-full bg-[#013550]/60 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md">
                  {currentProgram.speakerName}
                </span>
              )}
            </div>

            <div className="lh-feat-body">
              <div className="flex flex-wrap items-center gap-2">
                <span className="lh-badge">
                  {currentProgram?.label || TYPE_TAG[eventType] || "Event"}
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-500">
                  {isOffline ? <MapPin size={13} aria-hidden="true" /> : <Video size={13} aria-hidden="true" />}
                  {isOffline ? "In-person campus" : "Online"}
                </span>
              </div>

              <h3>{currentProgram.title}</h3>
              {currentProgram.topic && <p>{currentProgram.topic}</p>}

              {startsAt && <FlipCountdown target={startsAt} />}

              <div className="lh-details">
                <div>
                  Date<b>{formattedDate}</b>
                </div>
                <div>
                  Timing<b>{formattedTime}</b>
                </div>
                <div>
                  {isOffline ? "Venue" : "Platform"}
                  <b>{place}</b>
                </div>
              </div>

              {isOffline && (currentProgram.organizationName || currentProgram.venueAddress) && (
                <p className="text-sm">
                  {currentProgram.organizationName && (
                    <>
                      <strong className="text-[#07405C]">Host:</strong> {currentProgram.organizationName}
                      {currentProgram.venueAddress ? " · " : ""}
                    </>
                  )}
                  {currentProgram.venueAddress}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-4">
                {isRegisteredForCurrent ? (
                  <>
                    <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2.5 text-sm font-bold text-emerald-700">
                      <CheckCircle2 size={16} aria-hidden="true" />
                      Registered for this session
                    </span>
                    {!isOffline && registeredMeetLink && (
                      <a
                        href={registeredMeetLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="lh-btn lh-btn-n"
                        data-cursor-text="Meet"
                      >
                        <Video size={16} aria-hidden="true" />
                        Join Google Meet
                      </a>
                    )}
                  </>
                ) : (
                  <button type="button" onClick={handleOpenRegister} className="lh-btn lh-btn-a btn-flow" data-cursor-text="Join">
                    {CTA_LABEL[eventType] || "Register Now"}
                    <ArrowRight size={18} className="lh-arr" aria-hidden="true" />
                  </button>
                )}
                {currentProgram.certificateIncluded && (
                  <span className="lh-cert-tag">
                    <CheckCircle2 size={18} aria-hidden="true" />
                    Certificate Included
                  </span>
                )}
              </div>
            </div>
          </motion.article>
        </AnimatePresence>

        {filteredPrograms.length > 1 && (
          <div className="lh-car-ctl" style={{ marginTop: "1.5rem" }}>
            <div className="lh-dots">
              {filteredPrograms.map((p, idx) => (
                <button
                  key={p.id || idx}
                  type="button"
                  aria-label={`Go to event ${idx + 1}: ${p.title}`}
                  data-cursor-text="Go"
                  aria-current={idx === currentIndex ? "true" : undefined}
                  onClick={() => goToSlide(idx)}
                />
              ))}
            </div>
            <div className="lh-arrows">
              <button type="button" onClick={goToPrev} aria-label="Previous upcoming event" data-cursor-text="Prev">
                <ChevronLeft size={20} aria-hidden="true" />
              </button>
              <button type="button" onClick={goToNext} aria-label="Next upcoming event" data-cursor-text="Next">
                <ChevronRight size={20} aria-hidden="true" />
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <section id="upcoming-events" className="lh-sec lh-soft">
      <div className="lh-wrap">
        <SectionHead
          badge="Upcoming Programs & Events"
          title="Level Up With Live Sessions"
          lead="Gain industry exposure, build hands-on projects, and learn live from experienced tech mentors."
        />

        <Reveal>
          <div ref={tabsRef} className="lh-tabs" role="tablist" aria-label="Event type">
            <span ref={indicatorRef} className="lh-tab-ind" aria-hidden="true" />
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                role="tab"
                aria-selected={selectedCategory === cat.id}
                onClick={() => handleCategoryChange(cat.id)}
                data-cursor-text="View"
              >
                {cat.label}
                {countByType[cat.id] > 0 && <span className="lh-tab-count">{countByType[cat.id]}</span>}
              </button>
            ))}
          </div>
        </Reveal>

        <Reveal>{body}</Reveal>
      </div>

      <ProgramRegistrationModal
        isOpen={isRegisterModalOpen && Boolean(selectedProgramForModal)}
        onClose={handleCloseRegister}
        program={selectedProgramForModal}
        activeType={selectedProgramForModal?.type || "WEBINAR"}
        onRegisterSuccess={handleRegisterSuccess}
      />
    </section>
  );
}
