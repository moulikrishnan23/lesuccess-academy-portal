import { Blocks, Code2, Zap } from "lucide-react";

const CARDS = [
  { title: "Learn Visually", description: "Master complex topics through interactive diagrams and abstract mental models.", icon: Blocks, color: "text-blue-600" },
  { title: "Build Real Systems", description: "Write code that matters. Build scalable applications from day one.", icon: Code2, color: "text-emerald-600" },
  { title: "Accelerate Career", description: "Get hired faster with 1-on-1 mentorship and direct industry placement.", icon: Zap, color: "text-[#CA164B]" },
];

export default function AboutSection() {
  return (
    <section id="about-section" aria-label="About LeSuccess" className="bg-white py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex max-w-[38rem] flex-col gap-5">
          {CARDS.map(({ title, description, icon: Icon, color }) => (
            <article key={title} className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm sm:p-7">
              <div className="flex items-start gap-4 sm:gap-6">
                <span className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-slate-50 ${color}`}>
                  <Icon aria-hidden="true" className="h-7 w-7" strokeWidth={1.5} />
                </span>
                <div>
                  <h2 className="mb-2 text-xl font-bold text-[#101010] sm:text-2xl">{title}</h2>
                  <p className="text-sm leading-relaxed text-slate-600 sm:text-base">{description}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
