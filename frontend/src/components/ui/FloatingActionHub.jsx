import { useState } from "react";
import {
  MessageCircle,
  Phone,
  Sparkles,
  X,
  ChevronUp,
  GraduationCap,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import useReducedMotion from "../../hooks/useReducedMotion.js";

/**
 * Floating Quick Guidance Action Hub.
 * Directly inspired by Xplore IT Corp & premier ed-tech platforms.
 * Features animated pulsating radar beacon, quick WhatsApp/Call connect,
 * and Instant Demo registration trigger.
 */
export default function FloatingActionHub({ onOpenDemo }) {
  const reduced = useReducedMotion();
  const [isOpen, setIsOpen] = useState(false);

  const WHATSAPP_LINK =
    "https://wa.me/918012060000?text=Hi%20LeSuccess%20Academy,%20I%20would%20like%20to%20know%20more%20about%20your%20courses%20and%20placement%20programs.";
  const PHONE_LINK = "tel:+918012060000";

  const handleDemoClick = (e) => {
    e.preventDefault();
    if (onOpenDemo) {
      onOpenDemo();
    } else {
      const demoSec = document.getElementById("demo-class");
      if (demoSec) {
        demoSec.scrollIntoView({ behavior: "smooth" });
      } else {
        window.location.href = "/#demo-class";
      }
    }
    setIsOpen(false);
  };

  return (
    <div className="fixed z-40 bottom-[calc(8.25rem+env(safe-area-inset-bottom,0px))] lg:bottom-24 left-4 sm:left-6 lg:left-8 flex flex-col items-start select-none">
      {/* Expanded Quick Options Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={
              reduced ? { opacity: 0 } : { opacity: 0, y: 15, scale: 0.92 }
            }
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: 10, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className="mb-3 flex flex-col gap-2 rounded-2xl border border-white/80 bg-white/95 p-2.5 shadow-2xl backdrop-blur-xl min-w-[210px]"
          >
            {/* Header info */}
            <div className="px-2.5 py-1.5 border-b border-slate-100 flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Career Guidance
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                Live Now
              </span>
            </div>

            {/* WhatsApp button */}
            <a
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-emerald-700 bg-emerald-50/70 hover:bg-emerald-500 hover:text-white transition-all duration-200 group cursor-pointer"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500 text-white shadow-xs group-hover:scale-110 transition-transform">
                <MessageCircle size={15} />
              </div>
              <div className="text-left">
                <div>WhatsApp Chat</div>
                <div className="text-[10px] font-normal opacity-80">
                  Instant Replies
                </div>
              </div>
            </a>

            {/* Direct Call button */}
            <a
              href={PHONE_LINK}
              className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-[#07405C] bg-slate-50 hover:bg-[#07405C] hover:text-white transition-all duration-200 group cursor-pointer"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#07405C] text-white shadow-xs group-hover:scale-110 transition-transform">
                <Phone size={14} />
              </div>
              <div className="text-left">
                <div>Call Counselor</div>
                <div className="text-[10px] font-normal opacity-80">
                  +91 80120 60000
                </div>
              </div>
            </a>

            {/* Free Demo Trigger */}
            <button
              type="button"
              onClick={handleDemoClick}
              className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-[#DF1E26] bg-red-50/70 hover:bg-gradient-to-r hover:from-[#F44246] hover:to-[#CA164B] hover:text-white transition-all duration-200 group cursor-pointer text-left"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#DF1E26] text-white shadow-xs group-hover:scale-110 transition-transform">
                <GraduationCap size={15} />
              </div>
              <div>
                <div>Book Free Demo</div>
                <div className="text-[10px] font-normal opacity-80">
                  Reserved Seats
                </div>
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Pill / Floating Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Quick Career Counseling"
        className="group relative flex items-center gap-2.5 rounded-full border border-white/60 bg-white/95 px-3.5 py-2 sm:px-4 sm:py-2.5 shadow-xl shadow-[#07405C]/15 backdrop-blur-md transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer hover:border-[#DF1E26]/40 hover:shadow-2xl hover:shadow-[#DF1E26]/20"
      >
        {/* Animated Multi-Ring Radar Beacon */}
        <div className="relative flex h-3 w-3 shrink-0 items-center justify-center">
          <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
        </div>

        <div className="flex items-center gap-1.5 text-xs font-extrabold tracking-tight text-[#07405C] group-hover:text-[#DF1E26] transition-colors">
          <Sparkles size={14} className="text-[#DF1E26] animate-pulse" />
          <span className="hidden sm:inline">Talk to Counselor</span>
          <span className="inline sm:hidden">Counselor</span>
        </div>

        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-slate-500 group-hover:bg-[#DF1E26] group-hover:text-white transition-all">
          {isOpen ? <X size={12} /> : <ChevronUp size={12} />}
        </div>
      </button>
    </div>
  );
}
