import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Check,
  Code2,
  Copy,
  Eye,
  Layers,
  Lightbulb,
  Monitor,
  Play,
  RotateCcw,
  Smartphone,
  Sparkles,
  Terminal,
  X,
} from "lucide-react";
import useConnectWithUsSubmit from "../../../hooks/useConnectWithUsSubmit.js";
import { burstConfetti } from "../../motion/index.js";
import FloatField from "../FloatField.jsx";
import {
  MISSIONS,
  PRESETS,
  STARTER_FILES,
  buildPreviewDoc,
  checkProject,
  highlight,
  insertSnippet,
  isPreviewMessage,
  loadSaved,
  missionFeedback,
  missionReady,
  save,
  trackBuilderEvent,
} from "./challenges.js";
import "./challenge-builder.css";

const FILES = [
  { key: "html", label: "index.html", lang: "html" },
  { key: "css", label: "style.css", lang: "css" },
  { key: "js", label: "script.js", lang: "js" },
];
const AUTO_RUN_MS = 450;
const MIN_PREVIEW = 140;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const INTRO = "Write a little HTML. Run it. See it come to life.";

function initialState() {
  const saved = loadSaved();
  const preset = PRESETS.find((p) => p.id === saved?.presetId) || PRESETS[0];
  return {
    mode: saved?.mode === "playground" ? "playground" : "challenge",
    step: Math.min(Math.max(Number(saved?.step) || 0, 0), MISSIONS.length - 1),
    solved: Array.isArray(saved?.solved) ? saved.solved.filter((id) => MISSIONS.some((m) => m.id === id)) : [],
    completed: Boolean(saved?.completed),
    presetId: preset.id,
    files: {
      challenge: { ...STARTER_FILES, ...(saved?.files?.challenge || {}) },
      playground: { ...preset.files, ...(saved?.files?.playground || {}) },
    },
  };
}

/**
 * The hero's Challenge Builder: a small sandboxed HTML / CSS / JS editor with
 * three guided missions, a free playground of course-themed starters, a live
 * preview, a console, and, once all three missions are done, a short form that
 * submits to the Connect With Us endpoint.
 *
 * Window dots: red closes (hands back to the hero's launcher), yellow
 * collapses to the title bar, green opens a large focus view.
 *
 * Progress and code are saved in the browser; usage events are announced via
 * trackBuilderEvent (challenges.js) for analytics.
 */
export default function ChallengeBuilder({ className = "", onMinimize }) {
  const uid = useId();
  const panelRef = useRef(null);
  const iframeRef = useRef(null);
  const textareaRef = useRef(null);
  const preRef = useRef(null);
  const gutterRef = useRef(null);
  const tokenRef = useRef("");
  const runCountRef = useRef(0);
  const checksRef = useRef(null);
  const tabReleasedRef = useRef(false);
  const solvedCountRef = useRef(0);

  const [state, setState] = useState(initialState);
  const { mode, step, solved, completed, presetId, files: allFiles } = state;
  const files = allFiles[mode];

  const [activeFile, setActiveFile] = useState("html");
  const [viewMode, setViewMode] = useState("split");
  const [device, setDevice] = useState("desktop");
  const [collapsed, setCollapsed] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [previewDoc, setPreviewDoc] = useState("");
  const [previewHeight, setPreviewHeight] = useState(MIN_PREVIEW);
  const [logs, setLogs] = useState([]);
  const [consoleOpen, setConsoleOpen] = useState(false);
  const [status, setStatus] = useState("live"); // live | busy | updated
  const [feedback, setFeedback] = useState(INTRO);
  const [caretLine, setCaretLine] = useState(1);
  const [copied, setCopied] = useState(false);
  const [showForm, setShowForm] = useState(state.completed);
  const [form, setForm] = useState({ name: "", email: "", mobile: "" });
  const [clientError, setClientError] = useState("");
  const { submit, isSubmitting, isSuccess, error, fieldErrors, reset } = useConnectWithUsSubmit();

  const mission = MISSIONS[step];
  const currentSolved = solved.includes(mission.id);
  const preset = PRESETS.find((p) => p.id === presetId) || PRESETS[0];
  const errorCount = logs.filter((l) => l.level === "error").length;

  /* ── Run ──────────────────────────────────────────────────────────── */

  // Builds a fresh preview for `runFiles`. Only uses setters and refs, so it is
  // stable and safe to call from timers and handlers.
  const runProject = useCallback(
    (runFiles, ctx) => {
      runCountRef.current += 1;
      const token = `${uid}-${runCountRef.current}`;
      tokenRef.current = token;
      setPreviewDoc(buildPreviewDoc(runFiles, token));
      setLogs([]);
      setStatus("updated");
      trackBuilderEvent("run", { mode: ctx.mode });

      if (ctx.mode !== "challenge" || ctx.completed) {
        checksRef.current = null;
        return;
      }
      const checks = checkProject(runFiles.html);
      checksRef.current = checks;
      const current = MISSIONS[ctx.step];
      setFeedback(missionFeedback(current, checks));
      // A mission with no button to click is solved as soon as it is built.
      if (!current.action && missionReady(current, checks)) {
        setState((s) => (s.solved.includes(current.id) ? s : { ...s, solved: [...s.solved, current.id] }));
      }
    },
    [uid],
  );

  // Live update: re-run shortly after the visitor stops typing.
  useEffect(() => {
    const timer = setTimeout(() => runProject(files, { mode, step, completed }), AUTO_RUN_MS);
    return () => clearTimeout(timer);
  }, [files, mode, step, completed, runProject]);

  const runNow = () => runProject(files, { mode, step, completed });

  /* ── Messages from the preview ───────────────────────────────────── */

  useEffect(() => {
    const onMessage = (event) => {
      if (event.source !== iframeRef.current?.contentWindow) return;
      const data = event.data;
      if (!isPreviewMessage(data, tokenRef.current)) return;

      if (data.kind === "height") {
        setPreviewHeight(Math.max(MIN_PREVIEW, Number(data.height) || MIN_PREVIEW));
      } else if (data.kind === "log") {
        setLogs((prev) => [...prev.slice(-49), { level: data.level, text: String(data.text) }]);
        if (data.level === "error") setConsoleOpen(true);
      } else if (data.kind === "action" && mode === "challenge" && !completed) {
        const current = MISSIONS[step];
        if (current.action === data.action && missionReady(current, checksRef.current)) {
          setState((s) => (s.solved.includes(current.id) ? s : { ...s, solved: [...s.solved, current.id] }));
          setFeedback(
            step === MISSIONS.length - 1
              ? "Light, dark, and made by you. Your project is ready!"
              : "You made your card interactive. Try another colour!",
          );
        }
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [mode, step, completed]);

  // Celebrate each newly solved mission once.
  useEffect(() => {
    if (solved.length > solvedCountRef.current) {
      trackBuilderEvent("mission_solved", { mission: solved[solved.length - 1] });
      burstConfetti(panelRef.current, { count: 70 });
    }
    solvedCountRef.current = solved.length;
  }, [solved]);

  // Remember progress and code.
  useEffect(() => {
    save({ mode, step, solved, completed, presetId, files: allFiles });
  }, [mode, step, solved, completed, presetId, allFiles]);

  // Esc leaves focus mode.
  useEffect(() => {
    if (!focusMode) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape" && document.activeElement !== textareaRef.current) setFocusMode(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [focusMode]);

  /* ── Editing ──────────────────────────────────────────────────────── */

  const updateFile = (key, value) => {
    setState((s) => ({ ...s, files: { ...s.files, [s.mode]: { ...s.files[s.mode], [key]: value } } }));
    setStatus("busy");
  };

  const syncScroll = (e) => {
    const { scrollTop, scrollLeft } = e.currentTarget;
    if (preRef.current) {
      preRef.current.scrollTop = scrollTop;
      preRef.current.scrollLeft = scrollLeft;
    }
    if (gutterRef.current) gutterRef.current.scrollTop = scrollTop;
  };

  const trackCaret = (e) => {
    const t = e.currentTarget;
    setCaretLine(t.value.slice(0, t.selectionStart).split("\n").length);
  };

  const onEditorKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      runNow();
      return;
    }
    if (e.key === "Escape") {
      // Releases Tab so the next press moves focus out of the editor.
      tabReleasedRef.current = true;
      return;
    }
    if (e.key === "Tab" && !e.shiftKey && !tabReleasedRef.current) {
      e.preventDefault();
      const t = e.currentTarget;
      const { selectionStart: start, selectionEnd: end, value } = t;
      updateFile(activeFile, `${value.slice(0, start)}  ${value.slice(end)}`);
      requestAnimationFrame(() => {
        t.selectionStart = t.selectionEnd = start + 2;
      });
      return;
    }
    tabReleasedRef.current = false;
  };

  /* ── Actions ──────────────────────────────────────────────────────── */

  const switchMode = (next) => {
    if (next === mode) return;
    setState((s) => ({ ...s, mode: next }));
    setActiveFile("html");
    setFeedback(next === "challenge" ? INTRO : "Free play: edit any starter and watch it update.");
  };

  const choosePreset = (p) => {
    setState((s) => ({ ...s, presetId: p.id, files: { ...s.files, playground: { ...p.files } } }));
    trackBuilderEvent("preset", { preset: p.id });
  };

  const resetCode = () => {
    if (mode === "playground") {
      setState((s) => ({ ...s, files: { ...s.files, playground: { ...preset.files } } }));
      return;
    }
    setState((s) => ({ ...s, step: 0, solved: [], completed: false, files: { ...s.files, challenge: { ...STARTER_FILES } } }));
    setShowForm(false);
    setFeedback(INTRO);
    reset();
  };

  const copyCode = () => {
    navigator.clipboard
      ?.writeText(files[activeFile])
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      })
      .catch(() => {});
  };

  const giveHint = () => {
    updateFile("html", insertSnippet(files.html, mission.snippet));
    setActiveFile("html");
    trackBuilderEvent("hint", { mission: mission.id });
  };

  const nextMission = () => {
    if (!currentSolved) return;
    if (step === MISSIONS.length - 1) {
      setState((s) => ({ ...s, completed: true }));
      setShowForm(true);
      trackBuilderEvent("completed");
      return;
    }
    setState((s) => ({ ...s, step: s.step + 1 }));
    setActiveFile("html");
    setFeedback("Keep your card. Add the next interaction, then run it.");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    const name = form.name.trim();
    const email = form.email.trim();
    const mobile = form.mobile.trim();
    if (!name) return setClientError("Please enter your name.");
    if (!EMAIL_RE.test(email)) return setClientError("Please enter a valid email address.");
    if (!mobile) return setClientError("Please enter your phone number.");
    setClientError("");
    const accepted = await submit({
      name,
      email,
      mobile,
      message: "Completed all 3 Challenge Builder missions on the Home page and would like to learn more.",
      website: "",
    });
    if (accepted) trackBuilderEvent("lead_submitted");
  };

  /* ── Render helpers ───────────────────────────────────────────────── */

  const fileMeta = FILES.find((f) => f.key === activeFile);
  const code = files[activeFile] ?? "";
  const highlighted = useMemo(() => highlight(code, fileMeta.lang), [code, fileMeta.lang]);
  const lineCount = Math.max(code.split("\n").length, 7);
  const maxPreview = focusMode ? 640 : 220;
  const showEditor = viewMode !== "preview";
  const showPreview = viewMode !== "code";

  const consoleToggle = (
    <button
      type="button"
      className={`cb-console-toggle${errorCount ? " has-error" : ""}`}
      aria-expanded={consoleOpen}
      aria-controls={`${uid}-console`}
      onClick={() => setConsoleOpen((o) => !o)}
      title={consoleOpen ? "Hide console" : "Show console"}
      aria-label={`Console, ${logs.length} ${logs.length === 1 ? "message" : "messages"}`}
    >
      <Terminal size={12} aria-hidden="true" /> {logs.length}
    </button>
  );

  const statusBadge =
    errorCount > 0 ? (
      <span className="cb-status cb-status--error" role="status" title={`${errorCount} errors`}>
        <i /> <span className="cb-status-text">{errorCount} {errorCount === 1 ? "error" : "errors"}</span>
      </span>
    ) : status === "busy" ? (
      <span className="cb-status cb-status--busy" role="status" title="Updating">
        <i /> <span className="cb-status-text">Updating…</span>
      </span>
    ) : status === "updated" ? (
      <span className="cb-status" role="status" title="Updated">
        <Check size={10} aria-hidden="true" /> <span className="cb-status-text">Updated</span>
      </span>
    ) : (
      <span className="cb-status" title="Live">
        <i /> <span className="cb-status-text">Live</span>
      </span>
    );

  const completion = (
    <div className="cb-complete lh-dark" style={{ background: "transparent" }}>
      <span className="cb-status">
        <Check size={10} aria-hidden="true" /> 3 of 3 missions complete
      </span>
      {isSuccess ? (
        <>
          <h3>Your next chapter starts here.</h3>
          <p role="status" className="text-sm text-slate-300">
            Thank you, {form.name.trim()}. Our advisors will reach out shortly.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <a href="#demo-class" className="cb-run btn-flow" onClick={() => trackBuilderEvent("demo_click", { from: "completion" })}>
              Book free demo <ArrowRight size={14} aria-hidden="true" />
            </a>
            <button type="button" className="cb-ghost" onClick={() => { setShowForm(false); switchMode("playground"); }}>
              Keep experimenting
            </button>
          </div>
        </>
      ) : (
        <>
          <h3>Nice! Learn this properly with us.</h3>
          <p className="text-sm text-slate-300">
            You just built an interactive card. Leave your details and we will
            show you how far the Full Stack Development track takes it.
          </p>
          <form className="lh-form-grid" onSubmit={handleSubmit} noValidate>
            <FloatField id={`${uid}-name`} label="Name *" autoComplete="name" className="lh-full" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <FloatField id={`${uid}-email`} label="Email *" type="email" autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <FloatField id={`${uid}-mobile`} label="Phone number *" type="tel" inputMode="tel" autoComplete="tel" value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} />
            {(clientError || error) && (
              <p role="alert" className="lh-full text-xs font-semibold text-[#ff9e94]">
                {clientError || fieldErrors.mobile || fieldErrors.email || fieldErrors.name || error?.message || "We could not send that. Please try again."}
              </p>
            )}
            <button type="submit" disabled={isSubmitting} className="lh-btn lh-btn-a lh-full btn-flow">
              {isSubmitting ? "Sending…" : "Start learning with LeSuccess"}
              <ArrowRight size={16} className="lh-arr" aria-hidden="true" />
            </button>
          </form>
          <button type="button" className="cb-ghost mt-3" onClick={() => setShowForm(false)}>
            Keep experimenting
          </button>
        </>
      )}
    </div>
  );

  const panel = (
      <section
        ref={panelRef}
        className="cb-panel"
        aria-label="LeSuccess Challenge Builder"
        data-competing-form={showForm ? "true" : undefined}
        role={focusMode ? "dialog" : undefined}
        aria-modal={focusMode ? "true" : undefined}
      >
        {/* Title bar */}
        <div className="cb-bar">
          <div className="cb-dots">
            <button type="button" className="cb-dot cb-dot--close" onClick={onMinimize} aria-label="Close the Challenge Builder" title="Close" />
            <button type="button" className="cb-dot cb-dot--min" onClick={() => setCollapsed((c) => !c)} aria-label={collapsed ? "Expand the Challenge Builder" : "Collapse the Challenge Builder"} aria-expanded={!collapsed} title={collapsed ? "Expand" : "Collapse"} />
            <button type="button" className="cb-dot cb-dot--focus" onClick={() => setFocusMode((f) => !f)} aria-label={focusMode ? "Exit focus view" : "Open focus view"} aria-pressed={focusMode} title="Focus view" />
          </div>
          <div className="cb-seg" role="tablist" aria-label="Mode">
            <button type="button" role="tab" aria-selected={mode === "challenge"} onClick={() => switchMode("challenge")}>
              <Sparkles size={12} aria-hidden="true" /> Challenges
            </button>
            <button type="button" role="tab" aria-selected={mode === "playground"} onClick={() => switchMode("playground")}>
              <Code2 size={12} aria-hidden="true" /> Playground
            </button>
          </div>
          <div className="cb-bar-end">
            {statusBadge}
            {onMinimize && (
              <button type="button" className="cb-icon-btn" onClick={onMinimize} aria-label="Minimise the Challenge Builder">
                <X size={14} aria-hidden="true" />
              </button>
            )}
          </div>
        </div>

        {!collapsed && (
          <div onKeyDown={(e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
              e.preventDefault();
              runNow();
            }
          }}>

            {mode === "challenge" && showForm ? (
              completion
            ) : (
              <>
                {/* Mission strip or presets */}
                {mode === "challenge" ? (
                  <div className="cb-mission">
                    <div className="flex items-center justify-between gap-2">
                      <h3>
                        {completed ? "Your project playground" : `Challenge ${step + 1} of ${MISSIONS.length} · ${mission.title}`}
                      </h3>
                      <div className="cb-steps" aria-label={`${solved.length} of ${MISSIONS.length} missions complete`}>
                        {MISSIONS.map((m, i) => {
                          const done = completed || solved.includes(m.id);
                          return (
                            <span key={m.id} className={`cb-step ${done ? "cb-step--done" : i === step ? "cb-step--current" : ""}`}>
                              {done ? <Check size={11} aria-hidden="true" /> : i + 1}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                    <p id={`${uid}-mission`}>
                      {completed ? "All three done. Keep building, or switch to Playground for course-themed starters." : mission.detail}
                    </p>
                  </div>
                ) : (
                  <div className="cb-mission">
                    <div className="cb-presets" role="group" aria-label="Starters">
                      {PRESETS.map((p) => (
                        <button key={p.id} type="button" className="cb-chip" aria-pressed={presetId === p.id} onClick={() => choosePreset(p)}>
                          <Sparkles size={11} className="mr-1 inline" aria-hidden="true" />
                          {p.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Files + tools */}
                <div className="cb-tabs">
                  {showEditor ? (
                    <div className="cb-tablist" role="tablist" aria-label="Files">
                      {FILES.map((f) => (
                        <button key={f.key} type="button" role="tab" aria-selected={activeFile === f.key} onClick={() => setActiveFile(f.key)} title={f.label}>
                          <span className="cb-long">{f.label}</span>
                          <span className="cb-short">{f.lang.toUpperCase()}</span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <span className="cb-tabs-label">Preview only</span>
                  )}
                  <div className="cb-toolset">
                    <div className="cb-seg" role="group" aria-label="Layout">
                      {[["split", Layers, "Split view"], ["code", Code2, "Code only"], ["preview", Eye, "Preview only"]].map(([key, Icon, label]) => (
                        <button key={key} type="button" aria-pressed={viewMode === key} onClick={() => setViewMode(key)} title={label} aria-label={label}>
                          <Icon size={12} aria-hidden="true" />
                        </button>
                      ))}
                    </div>
                    <button type="button" className="cb-icon-btn" onClick={resetCode} aria-label={mode === "challenge" ? "Restart the challenges" : "Reset this starter"} title="Reset">
                      <RotateCcw size={13} aria-hidden="true" />
                    </button>
                    <button type="button" className="cb-icon-btn cb-copy" onClick={copyCode} aria-label="Copy this file" title="Copy">
                      {copied ? <Check size={13} className="text-[#4fd18b]" aria-hidden="true" /> : <Copy size={13} aria-hidden="true" />}
                    </button>
                    <button type="button" className="cb-run btn-flow" onClick={runNow} title="Run (Ctrl+Enter)">
                      <Play size={12} aria-hidden="true" /> Run <kbd>Ctrl ↵</kbd>
                    </button>
                  </div>
                </div>

                {/* Editor */}
                {showEditor && (
                  <>
                    <div className={`cb-editor ${viewMode === "code" ? "cb-editor--tall" : ""}`}>
                      <div ref={gutterRef} className="cb-gutter" aria-hidden="true">
                        {Array.from({ length: lineCount }, (_, i) => (
                          <div key={i} className={i + 1 === caretLine ? "is-current" : undefined}>
                            {i + 1}
                          </div>
                        ))}
                      </div>
                      <div className="cb-code">
                        <pre ref={preRef} aria-hidden="true" dangerouslySetInnerHTML={{ __html: `${highlighted}\n` }} />
                        <textarea
                          ref={textareaRef}
                          value={code}
                          onChange={(e) => {
                            updateFile(activeFile, e.target.value);
                            trackCaret(e);
                          }}
                          onKeyDown={onEditorKeyDown}
                          onKeyUp={trackCaret}
                          onClick={trackCaret}
                          onScroll={syncScroll}
                          spellCheck={false}
                          autoCapitalize="off"
                          autoComplete="off"
                          autoCorrect="off"
                          wrap="off"
                          maxLength={8000}
                          aria-label={`${fileMeta.label} editor`}
                          aria-describedby={mode === "challenge" ? `${uid}-mission` : undefined}
                        />
                      </div>
                    </div>
                    <div className="cb-statusbar">
                      <span>Ln {caretLine} · {fileMeta.lang.toUpperCase()}</span>
                      <span className="cb-hint">Ctrl+Enter to run · Esc, then Tab to leave</span>
                      {!showPreview && consoleToggle}
                    </div>
                  </>
                )}

                {/* Preview */}
                {showPreview && (
                  <div className="cb-preview">
                    <div className="cb-preview-head">
                      <span className="flex items-center gap-1">
                        <Eye size={11} aria-hidden="true" /> Live preview
                      </span>
                      <span className="flex items-center gap-1.5">
                        {consoleToggle}
                        <span className="cb-seg" role="group" aria-label="Preview size">
                          <button type="button" aria-pressed={device === "desktop"} onClick={() => setDevice("desktop")} title="Desktop width" aria-label="Desktop width">
                            <Monitor size={12} aria-hidden="true" />
                          </button>
                          <button type="button" aria-pressed={device === "phone"} onClick={() => setDevice("phone")} title="Phone width" aria-label="Phone width">
                            <Smartphone size={12} aria-hidden="true" />
                          </button>
                        </span>
                      </span>
                    </div>
                    <div className={`cb-frame ${device === "phone" ? "cb-frame--phone" : ""}`}>
                      <iframe
                        ref={iframeRef}
                        title="Your project, live preview"
                        sandbox="allow-scripts"
                        referrerPolicy="no-referrer"
                        srcDoc={previewDoc}
                        style={{ height: Math.min(previewHeight, maxPreview) }}
                      />
                    </div>
                  </div>
                )}

                {/* Console (toggled from the preview header) */}
                {consoleOpen && (
                  <div className="cb-console" id={`${uid}-console`}>
                    <ol aria-live="polite">
                      {logs.length === 0 && <li>Nothing logged yet. Try console.log(&apos;hi&apos;) in script.js.</li>}
                      {logs.map((log, i) => (
                        <li key={i} className={log.level === "error" ? "is-error" : log.level === "warn" ? "is-warn" : undefined}>
                          {log.text}
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                {/* Feedback */}
                <div className="cb-feedback">
                  {mode === "challenge" ? (
                    <>
                      <p role="status" aria-live="polite" className={currentSolved ? "is-ok" : undefined}>
                        {completed ? "Project complete. Change anything you like." : feedback}
                      </p>
                      {!completed && !currentSolved && (
                        <button type="button" className="cb-ghost" onClick={giveHint}>
                          <Lightbulb size={13} aria-hidden="true" /> Hint
                        </button>
                      )}
                      {!completed && currentSolved && (
                        <button type="button" className="cb-next" onClick={nextMission}>
                          {step === MISSIONS.length - 1 ? "Finish project" : "Next challenge"}
                          <ArrowRight size={13} aria-hidden="true" />
                        </button>
                      )}
                      {completed && (
                        <button type="button" className="cb-next" onClick={() => setShowForm(true)}>
                          Learn with us <ArrowRight size={13} aria-hidden="true" />
                        </button>
                      )}
                      {currentSolved && !completed && (
                        <div className="cb-cta">
                          Nice! Learn this properly in Full Stack Development.
                          <a href="#demo-class" onClick={() => trackBuilderEvent("demo_click", { from: mission.id })}>
                            Book free demo
                          </a>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <p>{feedback}</p>
                      {preset.course ? (
                        <Link to={`/courses/${preset.course.slug}`} className="cb-next" onClick={() => trackBuilderEvent("course_click", { course: preset.course.slug })}>
                          See the {preset.course.name} course <ArrowRight size={13} aria-hidden="true" />
                        </Link>
                      ) : (
                        <a href="#demo-class" className="cb-next" onClick={() => trackBuilderEvent("demo_click", { from: "playground" })}>
                          Book free demo <ArrowRight size={13} aria-hidden="true" />
                        </a>
                      )}
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </section>
  );

  // Focus view is portalled to <body>: the hero's animated wrapper creates its
  // own stacking context, so a fixed overlay inside it would sit under the
  // site header. State lives here, so moving the panel keeps all progress.
  if (focusMode) {
    return (
      <div className={`cb ${className}`}>
        <div className="cb-panel grid min-h-40 place-items-center p-6 text-center text-sm text-[#8aa0b5]">
          Open in focus view
        </div>
        {createPortal(
          <div className="cb cb--focus">
            <div className="cb-backdrop" onClick={() => setFocusMode(false)} aria-hidden="true" />
            {panel}
          </div>,
          document.body,
        )}
      </div>
    );
  }

  return (
    <div className={`cb ${className}`}>
      <div className="cb-glow" aria-hidden="true" />
      {panel}
    </div>
  );
}
