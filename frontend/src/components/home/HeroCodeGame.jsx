import { useEffect, useId, useRef, useState } from "react";
import DOMPurify from "dompurify";
import { ArrowRight, Check, CheckCircle2, Code2, Play, RotateCcw, Sparkles } from "lucide-react";
import useLeadSubmit from "../../hooks/useLeadSubmit.js";

const STARTER_HTML = `<article data-card>
  <h2>My first project</h2>
  <!-- Add a paragraph below -->
</article>`;

const MISSIONS = [
  { title: "Create your card", detail: "Add a <p> with a short introduction inside your card. Make it yours!", snippet: "  <p>Built by me, with LeSuccess.</p>", action: null },
  { title: "Make it change color", detail: 'The lab wires up data-action="color". Add that button, run your HTML, then click it in the preview.', snippet: '  <button data-action="color">Switch color</button>', action: "color" },
  { title: "Bring on the dark mode", detail: 'Add a button with data-action="theme". Run your HTML, then try your light/dark switch.', snippet: '  <button data-action="theme">Light / dark</button>', action: "theme" },
];

function prepareProject(html, token) {
  const clean = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ["article", "section", "div", "h1", "h2", "h3", "p", "span", "strong", "em", "button", "br"],
    ALLOWED_ATTR: ["data-card", "data-action", "style", "class", "type"],
    ALLOW_DATA_ATTR: false,
    ALLOW_ARIA_ATTR: false,
  });
  const doc = new DOMParser().parseFromString(clean, "text/html");
  const card = doc.querySelector("article[data-card]");
  const hasText = (element) => Boolean(element?.textContent.trim());
  const checks = {
    card: hasText(card?.querySelector("h2")) && hasText(card?.querySelector("p")),
    color: hasText(card?.querySelector('button[data-action="color"]')),
    theme: hasText(card?.querySelector('button[data-action="theme"]')),
  };
  const source = `<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; connect-src 'none'; form-action 'none'; base-uri 'none'"><style>
    *{box-sizing:border-box}html{--accent:#DF1E26;background:#edf4f7;color:#07405C;font-family:system-ui,sans-serif}body{margin:0;min-height:100vh;display:grid;place-items:center;padding:18px;transition:background .2s,color .2s}article[data-card]{width:100%;max-width:290px;padding:22px 18px;border-radius:20px;background:white;border-top:4px solid var(--accent);box-shadow:0 12px 28px #07405C14;overflow-wrap:anywhere}h2{font-size:21px;line-height:1.15;margin:0 0 10px}p{font-size:13px;line-height:1.55;margin:0 0 14px;opacity:.75}button{display:inline-flex;align-items:center;justify-content:center;min-height:38px;padding:9px 12px;margin:4px 4px 0 0;border:0;border-radius:10px;background:var(--accent);color:#fff;font:600 12px system-ui;cursor:pointer}button:focus-visible{outline:3px solid #37AFC8;outline-offset:3px}html[data-theme="dark"]{background:#052b40;color:#f1f5f9}html[data-theme="dark"] article{background:#0b4059}html[data-theme="dark"] button{color:white}@media(max-height:180px){body{padding:10px}article[data-card]{padding:14px}h2{font-size:17px;margin-bottom:6px}p{font-size:11px;line-height:1.4;margin-bottom:8px}button{min-height:32px;padding:6px 8px;margin:2px 2px 0 0;font-size:11px}}@media(prefers-reduced-motion:reduce){*{transition:none!important}}
  </style></head><body>${clean}<script>
    const colors=['#DF1E26','#07405C','#0B759B'];let index=0;
    document.addEventListener('click',function(event){const button=event.target.closest('button[data-action]');if(!button)return;const action=button.dataset.action;if(action==='color'){index=(index+1)%colors.length;document.documentElement.style.setProperty('--accent',colors[index]);}else if(action==='theme'){document.documentElement.dataset.theme=document.documentElement.dataset.theme==='dark'?'light':'dark';}else{return;}parent.postMessage({type:'lesuccess-build-action',action:action,token:${JSON.stringify(token)}},'*');});
  </script></body></html>`;
  return { source, checks };
}

export default function HeroCodeGame() {
  const uid = useId();
  const iframeRef = useRef(null);
  const completionHeadingRef = useRef(null);
  const [code, setCode] = useState(STARTER_HTML);
  const [step, setStep] = useState(0);
  const [runId, setRunId] = useState(0);
  const [preview, setPreview] = useState(() => prepareProject(STARTER_HTML, `${uid}-0`).source);
  const [checks, setChecks] = useState(null);
  const [solved, setSolved] = useState(false);
  const [complete, setComplete] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState("html");
  const [feedback, setFeedback] = useState("Write a little HTML. Run it. See it come to life.");
  const [form, setForm] = useState({ name: "", email: "" });
  const [clientError, setClientError] = useState("");
  const { submit, isSubmitting, isSuccess, error, fieldErrors, reset } = useLeadSubmit({ live: true });
  const mission = MISSIONS[step];

  useEffect(() => {
    const handleMessage = (event) => {
      if (event.source !== iframeRef.current?.contentWindow || event.data?.type !== "lesuccess-build-action" || event.data?.token !== `${uid}-${runId}`) return;
      if (!checks?.card || !checks.color || (step === 2 && !checks.theme)) return;
      if (event.data.action === MISSIONS[step].action) {
        setSolved(true);
        setFeedback(step === 1 ? "You made your card interactive. Try another color!" : "Light, dark, and made by you. Your project is ready!");
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [checks, step, runId, uid]);

  useEffect(() => {
    if (showForm) completionHeadingRef.current?.focus({ preventScroll: true });
  }, [showForm]);

  const editCode = (value) => {
    setCode(value);
    setChecks(null);
    setSolved(false);
    setFeedback("Run your updated HTML to refresh the preview.");
  };

  const runCode = () => {
    const nextRunId = runId + 1;
    const project = prepareProject(code, `${uid}-${nextRunId}`);
    setRunId(nextRunId);
    setPreview(project.source);
    setChecks(project.checks);
    setActiveTab("preview");
    const ready = project.checks.card && (step < 1 || project.checks.color) && (step < 2 || project.checks.theme);
    setSolved(step === 0 && ready);
    setFeedback(!project.checks.card
      ? "Keep an <article data-card> with a heading and a paragraph to build your card."
      : !ready
        ? `Add the ${step === 1 ? "color" : "theme"} button inside your card. Give it a label, then run again.`
        : step === 0
          ? "First project, built! Your card is ready for a little interaction."
          : `Now click your ${step === 1 ? "color" : "light / dark"} button in the preview.`);
  };

  const nextMission = () => {
    if (!solved) return;
    if (step === 2) {
      setComplete(true);
      setShowForm(true);
      return;
    }
    setStep(step + 1);
    setSolved(false);
    setChecks(null);
    setActiveTab("html");
    setFeedback("Keep your card. Add the next interaction, then run your HTML.");
  };

  const restart = () => {
    const nextRunId = runId + 1;
    setStep(0);
    setRunId(nextRunId);
    setCode(STARTER_HTML);
    setPreview(prepareProject(STARTER_HTML, `${uid}-${nextRunId}`).source);
    setChecks(null);
    setSolved(false);
    setComplete(false);
    setShowForm(false);
    setActiveTab("html");
    setForm({ name: "", email: "" });
    setClientError("");
    setFeedback("Write a little HTML. Run it. See it come to life.");
    reset();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSubmitting) return;
    if (!form.name.trim() || !form.email.trim()) {
      setClientError("Please enter your name and a valid email address.");
      return;
    }
    setClientError("");
    await submit({ name: form.name.trim(), email: form.email.trim(), source: "HOME_CONNECT_FORM", lookingFor: "HTML Build Lab: project-based learning" });
  };

  return (
    <section aria-label="LeSuccess Build Lab" data-competing-form="true" className="w-full overflow-clip rounded-[28px] border border-white/80 bg-white text-[#07405C] shadow-[0_24px_64px_rgba(0,25,40,0.24)] sm:rounded-[32px]">
      <div className="build-lab-header flex items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-5 py-3">
        <div className="flex items-center gap-3">
          <span className="build-lab-icon flex h-9 w-9 items-center justify-center rounded-xl bg-[#07405C] text-white"><Code2 aria-hidden="true" size={19} /></span>
          <div><p className="text-[9px] font-bold uppercase tracking-[0.18em] text-slate-500">Learn by making</p><h2 className="build-lab-title text-base font-extrabold">LeSuccess Build Lab</h2></div>
        </div>
        <button type="button" onClick={restart} disabled={isSubmitting} aria-label="Restart Build Lab" className="build-lab-reset flex min-h-10 min-w-10 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:bg-white hover:text-[#DF1E26] focus-visible:outline-2 focus-visible:outline-[#DF1E26] disabled:opacity-50"><RotateCcw size={15} aria-hidden="true" /></button>
      </div>

      {showForm ? (
        <div className="build-lab-completion flex min-h-[398px] flex-col justify-center px-6 py-5 sm:px-7">
          <div className="build-lab-success mb-4 flex items-center gap-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600"><CheckCircle2 aria-hidden="true" size={22} /></span><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-700">Your first interactive project, complete</p></div>
          <h3 ref={completionHeadingRef} tabIndex={-1} className="build-lab-completion-title mb-2 whitespace-pre-line text-2xl font-extrabold leading-tight outline-none">{isSuccess ? "Your next chapter starts here." : "Learn with us.\nBuild real projects."}</h3>
          {isSuccess ? (
            <p role="status" className="mb-6 text-sm leading-relaxed text-slate-600">Thank you, {form.name.trim()}. Your enquiry has been received by LeSuccess.</p>
          ) : (
            <>
              <p className="build-lab-invitation mb-5 text-sm text-slate-500">Liked making something of your own? Take your next step with LeSuccess.</p>
              <form onSubmit={handleSubmit} className="build-lab-form grid gap-3 sm:grid-cols-2">
                <div><label htmlFor={`${uid}-name`} className="mb-1 block text-xs font-semibold">Name</label><input id={`${uid}-name`} name="name" autoComplete="name" required maxLength={120} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} aria-invalid={Boolean(fieldErrors.name)} aria-describedby={fieldErrors.name ? `${uid}-form-error` : undefined} className="min-h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-[#0B759B] focus:ring-2 focus:ring-[#0B759B]/20" /></div>
                <div><label htmlFor={`${uid}-email`} className="mb-1 block text-xs font-semibold">Email</label><input id={`${uid}-email`} name="email" type="email" autoComplete="email" required maxLength={160} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} aria-invalid={Boolean(fieldErrors.email)} aria-describedby={fieldErrors.email ? `${uid}-form-error` : undefined} className="min-h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-[#0B759B] focus:ring-2 focus:ring-[#0B759B]/20" /></div>
                {(clientError || error) && <p id={`${uid}-form-error`} role="alert" className="text-xs text-[#DF1E26] sm:col-span-2">{clientError || fieldErrors.name || fieldErrors.email || error?.message || "We couldn’t send your enquiry. Please try again."}</p>}
                <button type="submit" disabled={isSubmitting} className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#DF1E26] px-4 text-sm font-bold text-white transition hover:bg-[#C71921] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#DF1E26] disabled:opacity-60 sm:col-span-2">{isSubmitting ? "Sending…" : "Start learning with LeSuccess"}<ArrowRight size={16} aria-hidden="true" /></button>
              </form>
            </>
          )}
          <button type="button" onClick={() => setShowForm(false)} disabled={isSubmitting} className="build-lab-experiment mt-3 min-h-9 self-start text-xs font-semibold text-slate-500 underline underline-offset-4 hover:text-[#07405C]">Keep experimenting</button>
        </div>
      ) : (
        <>
          <div className="build-lab-mission border-b border-slate-100 px-5 py-3">
            <div className="mb-2 flex items-center justify-between gap-2"><h3 className="text-sm font-bold">{complete ? "Your project playground" : mission.title}</h3><span className="flex shrink-0 items-center gap-1.5" aria-label={`${complete ? 3 : step + (solved ? 1 : 0)} of 3 missions complete`}>{MISSIONS.map((item, index) => <span key={item.title} className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${complete || index < step || (index === step && solved) ? "bg-[#07405C] text-white" : index === step ? "bg-[#DF1E26] text-white" : "bg-slate-100 text-slate-400"}`}>{complete || index < step || (index === step && solved) ? <Check size={11} aria-hidden="true" /> : index + 1}</span>)}</span></div>
            <p id={`${uid}-instructions`} className="build-lab-instructions min-h-8 text-xs leading-relaxed text-slate-500">{complete ? "Try your own words, colors, or card styles. Your preview is ready to explore." : mission.detail}</p>
          </div>
          <div className="flex border-b border-slate-200 sm:hidden" role="group" aria-label="Build Lab panels">
            {[["html", "Your HTML"], ["preview", "Live preview"]].map(([key, label]) => <button key={key} type="button" onClick={() => setActiveTab(key)} aria-pressed={activeTab === key} className={`min-h-10 flex-1 text-xs font-bold ${activeTab === key ? "border-b-2 border-[#DF1E26] bg-slate-50 text-[#07405C]" : "text-slate-400"}`}>{label}</button>)}
          </div>
          <div className="grid sm:grid-cols-2">
            <div className={`${activeTab === "html" ? "block" : "hidden"} min-w-0 bg-[#092C40] sm:block`}>
              <div className="build-lab-pane-heading flex h-9 items-center justify-between px-4 text-[10px] text-slate-400"><label htmlFor={`${uid}-html`} className="font-semibold text-slate-200">index.html</label><span>HTML</span></div>
              <textarea id={`${uid}-html`} aria-label="Your HTML code" aria-describedby={`${uid}-instructions`} value={code} onChange={(e) => editCode(e.target.value)} spellCheck={false} autoCapitalize="off" autoCorrect="off" maxLength={5000} wrap="off" className="build-lab-editor block h-[220px] w-full resize-none border-0 bg-transparent px-4 pb-4 font-mono text-[12px] leading-6 text-sky-100 outline-none focus:ring-2 focus:ring-inset focus:ring-[#37AFC8] sm:h-[200px]" />
            </div>
            <div className={`${activeTab === "preview" ? "block" : "invisible h-0 overflow-hidden"} min-w-0 bg-[#EDF4F7] sm:visible sm:block sm:h-auto sm:overflow-visible`}>
              <div className="build-lab-pane-heading flex h-9 items-center gap-1.5 border-b border-slate-200 px-4 text-[10px] font-semibold text-slate-500"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />Your live preview</div>
              <iframe key={runId} ref={iframeRef} title="Your HTML project live preview" sandbox="allow-scripts" referrerPolicy="no-referrer" srcDoc={preview} className="build-lab-preview block h-[220px] w-full border-0 sm:h-[200px]" />
            </div>
          </div>
          <div className="build-lab-footer border-t border-slate-100 px-5 py-3">
            <p role="status" aria-live="polite" className={`build-lab-feedback mb-2 min-h-6 text-xs leading-relaxed ${solved ? "text-emerald-700" : "text-slate-500"}`}>{feedback}</p>
            <div className="build-lab-actions flex flex-wrap items-center gap-2">
              <button type="button" onClick={runCode} className="inline-flex min-h-10 items-center gap-1.5 rounded-xl bg-[#DF1E26] px-4 text-xs font-bold text-white hover:bg-[#C71921] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#DF1E26]"><Play size={13} aria-hidden="true" />Run HTML</button>
              {!complete && !solved && <button type="button" onClick={() => { editCode(code.includes("</article>") ? code.replace("</article>", `${mission.snippet}\n</article>`) : `${code}\n${mission.snippet}`); setActiveTab("html"); }} className="inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-slate-200 px-3 text-xs font-semibold text-slate-600 hover:bg-slate-50"><Sparkles size={13} aria-hidden="true" />Need a hint?</button>}
              {solved && !complete && <button type="button" onClick={nextMission} className="ml-auto inline-flex min-h-10 items-center gap-1.5 rounded-xl bg-[#07405C] px-3 text-xs font-bold text-white hover:bg-[#052F45]">{step === 2 ? "Finish project" : "Next mission"}<ArrowRight size={13} aria-hidden="true" /></button>}
              {complete && <button type="button" onClick={() => setShowForm(true)} className="ml-auto min-h-10 rounded-xl bg-[#07405C] px-3 text-xs font-bold text-white">Learn with us<ArrowRight className="ml-1 inline" size={13} aria-hidden="true" /></button>}
            </div>
          </div>
        </>
      )}
    </section>
  );
}
