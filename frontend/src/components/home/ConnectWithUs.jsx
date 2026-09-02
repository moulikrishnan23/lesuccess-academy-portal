import { useState } from "react";

export default function ConnectWithUs() {
  const [form, setForm] = useState({ name: "", mobile: "", email: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    if (!form.name || !form.mobile || !form.email) return;
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <section className="w-full bg-[#0f3f4f] py-16 px-6 md:px-12">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-3">
          Connect with Us
        </h2>
        <p className="text-slate-300 mb-10">
          Our vibrant community produces content, teaches courses, and leads events all over.
        </p>

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
          className="w-full md:w-auto md:min-w-[240px] bg-gradient-to-r from-rose-500 to-rose-700 text-white font-semibold py-3.5 px-10 rounded-full hover:opacity-90 transition-opacity shadow-lg"
        >
          Submit
        </button>

        {submitted && (
          <p className="mt-4 text-sm text-emerald-300">
            Thanks! We'll be in touch shortly.
          </p>
        )}
      </div>
    </section>
  );
}
