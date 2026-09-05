import { useState, useEffect, useRef } from "react";
import apiClient from "../services/apiClient.js";

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

  const current = announcements[index] ?? FALLBACK[0];
  const text = current.text ?? FALLBACK[0].text;
  const label = current.linkLabel ?? "Enroll Now";
  const href = current.linkUrl ?? null;

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
