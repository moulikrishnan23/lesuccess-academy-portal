import { useState } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";

const TESTIMONIALS = [
  {
    name: "Saranya",
    text:
      "I recently joined Le Success Company for the Full Stack Java course, and it's been an amazing experience so far. The trainers explain every concept clearly, and the sessions are very interactive.",
    rating: 5,
    image:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop&crop=faces",
  },
  {
    name: "Kalyan",
    text:
      "I recently joined Le Success Company for the Full Stack Java course, and it's been an amazing experience so far. The trainers explain every concept clearly, and the sessions are very interactive.",
    rating: 5,
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=faces",
  },
  {
    name: "Aravind Kumar",
    text:
      "I recently joined Le Success Company for the Full Stack Java course, and it's been an amazing experience so far. The trainers explain every concept clearly, and the sessions are very interactive.",
    rating: 5,
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=faces",
  },
  {
    name: "Priya",
    text:
      "I recently joined Le Success Company for the Full Stack Java course, and it's been an amazing experience so far. The trainers explain every concept clearly, and the sessions are very interactive.",
    rating: 5,
    image:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=faces",
  },
];

const CARDS_PER_VIEW = 3;

export default function Testimonials() {
  const [startIndex, setStartIndex] = useState(0);
  const maxStart = Math.max(0, TESTIMONIALS.length - CARDS_PER_VIEW);

  const goPrev = () => setStartIndex((i) => Math.max(0, i - 1));
  const goNext = () => setStartIndex((i) => Math.min(maxStart, i + 1));

  const visible = TESTIMONIALS.slice(startIndex, startIndex + CARDS_PER_VIEW);
  // pad with a peek of the next card if available, mimicking the faded 4th card
  const peek = TESTIMONIALS[startIndex + CARDS_PER_VIEW];

  return (
    <section className="relative w-full bg-white py-16 px-6 md:px-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-10">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-rose-500 px-4 py-1.5 text-xs font-semibold tracking-wide text-rose-600 mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
              STUDENT TESTIMONIALS
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">
              What Our <span className="text-rose-600">Students Say</span>
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <svg viewBox="0 0 24 24" className="w-9 h-9 shrink-0" aria-hidden="true">
              <path
                fill="#4285F4"
                d="M23.52 12.27c0-.85-.08-1.66-.22-2.44H12v4.62h6.47a5.54 5.54 0 0 1-2.4 3.64v3h3.88c2.27-2.09 3.57-5.17 3.57-8.82Z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.96-1.07 7.95-2.91l-3.88-3c-1.08.72-2.46 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.26v3.1A12 12 0 0 0 12 24Z"
              />
              <path
                fill="#FBBC05"
                d="M5.27 14.28A7.2 7.2 0 0 1 4.89 12c0-.79.14-1.56.38-2.28v-3.1H1.26A12 12 0 0 0 0 12c0 1.94.46 3.77 1.26 5.38l4.01-3.1Z"
              />
              <path
                fill="#EA4335"
                d="M12 4.77c1.76 0 3.34.6 4.58 1.79l3.44-3.44C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.69 1.26 6.62l4.01 3.1C6.22 6.88 8.87 4.77 12 4.77Z"
              />
            </svg>
            <div>
              <p className="font-bold text-slate-900 leading-tight">Rated 4.6/5</p>
              <p className="text-sm text-blue-600 leading-tight">250+ Google Reviews</p>
            </div>
          </div>
        </div>

        {/* Carousel */}
        <div className="relative">
          <button
            type="button"
            onClick={goPrev}
            disabled={startIndex === 0}
            aria-label="Previous testimonials"
            className="hidden md:flex absolute -left-5 top-1/2 -translate-y-1/2 z-10 items-center justify-center w-11 h-11 rounded-full bg-white shadow-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={20} />
          </button>

          <div className="overflow-hidden">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {visible.map((t) => (
                <TestimonialCard key={t.name} {...t} />
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={goNext}
            disabled={startIndex === maxStart}
            aria-label="Next testimonials"
            className="hidden md:flex absolute -right-5 top-1/2 -translate-y-1/2 z-10 items-center justify-center w-11 h-11 rounded-full bg-slate-900 shadow-lg text-white hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* dots */}
        <div className="flex justify-center gap-2 mt-8 md:hidden">
          {Array.from({ length: maxStart + 1 }).map((_, i) => (
            <button
              key={i}
              onClick={() => setStartIndex(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-2 rounded-full transition-all ${
                i === startIndex ? "w-6 bg-rose-600" : "w-2 bg-slate-300"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function TestimonialCard({ name, text, rating, image }) {
  return (
    <div className="relative bg-white border-2 border-rose-500 rounded-2xl p-6 pt-8 shadow-sm h-full flex flex-col">
      <svg
        className="absolute top-5 left-5 w-8 h-8 text-slate-200"
        fill="currentColor"
        viewBox="0 0 32 32"
        aria-hidden="true"
      >
        <path d="M9.4 16c-2.5 0-4.4 2-4.4 4.6 0 2.5 1.9 4.5 4.3 4.5.4 2.7-1.5 5.4-4.3 6.1v2.3c4.9-.8 8.4-4.9 8.4-10.2C13.4 19 11.7 16 9.4 16zm14 0c-2.5 0-4.4 2-4.4 4.6 0 2.5 1.9 4.5 4.3 4.5.4 2.7-1.5 5.4-4.3 6.1v2.3c4.9-.8 8.4-4.9 8.4-10.2 0-6.3-1.7-9.3-4-9.3z" />
      </svg>

      <p className="text-slate-700 text-[15px] leading-relaxed relative z-10 flex-1">
        {text}
      </p>

      <div className="flex items-center gap-3 mt-6 pt-2">
        <img
          src={image}
          alt={name}
          className="w-12 h-12 rounded-full object-cover"
        />
        <div>
          <p className="font-bold text-slate-900">{name}</p>
          <div className="flex gap-0.5 mt-0.5">
            {Array.from({ length: rating }).map((_, i) => (
              <Star key={i} size={16} className="fill-yellow-400 text-yellow-400" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
