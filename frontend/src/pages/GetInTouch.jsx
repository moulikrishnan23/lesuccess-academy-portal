import { useState } from "react";
import { Mail, Phone, MapPin, Instagram, Facebook, Linkedin, Youtube, MessageCircle, Send } from "lucide-react";

const SOCIALS = [
  { icon: Instagram, href: "#", label: "Instagram" },
  { icon: Facebook, href: "#", label: "Facebook" },
  { icon: Linkedin, href: "#", label: "LinkedIn" },
  { icon: MessageCircle, href: "#", label: "WhatsApp" },
  { icon: Youtube, href: "#", label: "YouTube" },
];

const initialForm = {
  name: "",
  mobile: "",
  email: "",
  whoYouAre: "",
  lookingFor: "",
  location: "",
  message: "",
};

export default function GetInTouch() {
  const [form, setForm] = useState(initialForm);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSend = () => {
    if (!form.name || !form.mobile || !form.email) return;
    // wire up to your submit endpoint here
    console.log("Get in touch submission:", form);
  };

  return (
    <section className="w-full bg-slate-50 py-12 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-6">
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 flex items-center justify-center gap-2">
            Get in Touch <span aria-hidden="true">👋</span>
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            We're here to help would love to hear from you.
          </p>
        </div>

        {/* Form card */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Field
              label="Name"
              name="name"
              value={form.name}
              onChange={handleChange}
            />
            <Field
              label="Mobile Number"
              name="mobile"
              value={form.mobile}
              onChange={handleChange}
            />
            <Field
              label="Email ID"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <Field
              label="Who you are?"
              name="whoYouAre"
              value={form.whoYouAre}
              onChange={handleChange}
            />

            <div>
              <label className="sr-only" htmlFor="lookingFor">
                You looking for?
              </label>
              <select
                id="lookingFor"
                name="lookingFor"
                value={form.lookingFor}
                onChange={handleChange}
                className="w-full bg-slate-100 rounded-md px-4 py-3 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-rose-400"
              >
                <option value="">You looking for?</option>
                <option value="course">A course</option>
                <option value="training">Corporate training</option>
                <option value="internship">Internship</option>
                <option value="other">Other</option>
              </select>
            </div>

            <Field
              label="Location"
              name="location"
              value={form.location}
              onChange={handleChange}
            />
          </div>

          <div className="mt-4">
            <label className="sr-only" htmlFor="message">
              What help you want?
            </label>
            <textarea
              id="message"
              name="message"
              rows={4}
              value={form.message}
              onChange={handleChange}
              placeholder="What help you want?"
              className="w-full bg-slate-100 rounded-md px-4 py-3 text-sm text-slate-600 placeholder-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-rose-400"
            />
          </div>

          <button
            type="button"
            onClick={handleSend}
            className="mt-5 w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-rose-500 to-rose-700 text-white font-semibold py-3 px-8 rounded-md hover:opacity-90 transition-opacity"
          >
            Send <Send size={16} />
          </button>
        </div>

        {/* Info + Map */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#0f3f4f] rounded-2xl p-6 text-white flex flex-col gap-5">
            <div className="flex gap-3">
              <Mail size={18} className="mt-0.5 shrink-0 text-rose-300" />
              <div className="text-sm leading-relaxed">
                <p>training@lesuccess.in</p>
                <p>training@lesuccess.in</p>
              </div>
            </div>

            <div className="flex gap-3">
              <Phone size={18} className="mt-0.5 shrink-0 text-rose-300" />
              <div className="text-sm leading-relaxed">
                <p>+91 80120 60000</p>
                <p>+91 81898 22000</p>
              </div>
            </div>

            <div className="flex gap-3">
              <MapPin size={18} className="mt-0.5 shrink-0 text-rose-300" />
              <p className="text-sm leading-relaxed">
                4th Floor, Tristar Tower, Avinashi road, Lakshmi Mills,
                Coimbatore, Tamil Nadu - 641037
              </p>
            </div>

            <div>
              <p className="text-sm font-semibold mb-2">Follow Us</p>
              <div className="flex gap-2">
                {SOCIALS.map(({ icon: Icon, href, label }) => (
                  <a
                    key={label}
                    href={href}
                    aria-label={label}
                    className="w-8 h-8 rounded-md bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                  >
                    <Icon size={16} />
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-2xl overflow-hidden shadow-sm min-h-[260px]">
            <iframe
              title="LeSuccess location map"
              className="w-full h-full min-h-[260px]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              src="https://maps.google.com/maps?q=Tristar%20Tower%20Avinashi%20Road%20Coimbatore&output=embed"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function Field({ label, name, value, onChange, type = "text" }) {
  return (
    <div>
      <label className="sr-only" htmlFor={name}>
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={label}
        className="w-full bg-slate-100 rounded-md px-4 py-3 text-sm text-slate-600 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-400"
      />
    </div>
  );
}
