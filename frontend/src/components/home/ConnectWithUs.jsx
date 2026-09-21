import { useEffect, useRef, useState } from "react";
import useConnectWithUsSubmit from "../../hooks/useConnectWithUsSubmit.js";

export default function ConnectWithUs() {
  const [form, setForm] = useState({ name: "", mobile: "", email: "" });
  // Honeypot. Never shown to a person, so anything in it came from a bot.
  const [website, setWebsite] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const { submit, isSubmitting, error, fieldErrors, reset } =
    useConnectWithUsSubmit();

  // The success banner hides itself after five seconds. Tracked in a ref so an
  // unmount — or a second submit inside the window — clears the pending timer
  // rather than firing setState on a gone component.
  const hideTimerRef = useRef(null);

  useEffect(
    () => () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    },
    [],
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!form.name || !form.mobile || !form.email || isSubmitting) return;

    const accepted = await submit({ ...form, website });
    if (!accepted) return;

    setSubmitted(true);
    setForm({ name: "", mobile: "", email: "" });
    setWebsite("");

    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => {
      setSubmitted(false);
      // Drops isSuccess with the banner, so the hook is not left reporting a
      // success the visitor can no longer see.
      reset();
    }, 5000);
  };

  const errorMessage = error
    ? fieldErrors.mobile ||
      fieldErrors.email ||
      fieldErrors.name ||
      error.message ||
      "Something went wrong. Please try again."
    : "";

  return (
    <section className="w-full bg-[#0f3f4f] py-16 px-6 md:px-12">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-3">
          Connect with Us
        </h2>
        <p className="text-slate-300 mb-10">
          Our vibrant community produces content, teaches courses, and leads events all over.
        </p>

        {/*
          Honeypot: off-screen rather than display:none, and tabbable only by
          something that ignores the label. A real visitor never sees it.
          Matches the markup on Contact.jsx and DemoClass.jsx — a bot that filters
          on `display: none` walks straight past that trick, so no form uses it.
        */}
        <div aria-hidden="true" className="absolute left-[-9999px] top-auto h-px w-px overflow-hidden">
          <label htmlFor="connect-website">Leave this field empty</label>
          <input
            id="connect-website"
            name="website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Enter Your Name"
            className="w-full bg-transparent border border-slate-400/60 rounded-lg px-4 py-3.5 text-white placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
          />
          <input
            type="tel"
            name="mobile"
            value={form.mobile}
            onChange={handleChange}
            placeholder="Enter Mobile Number"
            className="w-full bg-transparent border border-slate-400/60 rounded-lg px-4 py-3.5 text-white placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
          />
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Enter Email id"
            className="w-full bg-transparent border border-slate-400/60 rounded-lg px-4 py-3.5 text-white placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
          />
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full md:w-auto md:min-w-[240px] bg-gradient-to-r from-rose-500 to-rose-700 text-white font-semibold py-3.5 px-10 rounded-full hover:opacity-90 transition-opacity shadow-lg disabled:opacity-50"
        >
          {isSubmitting ? "Submitting..." : "Submit"}
        </button>

        {submitted && (
          <p className="mt-4 text-sm text-emerald-300">
            Thanks! We'll be in touch shortly.
          </p>
        )}

        {errorMessage && (
          <p className="mt-4 text-sm text-rose-300">
            {errorMessage}
          </p>
        )}
      </div>
    </section>
  );
}
