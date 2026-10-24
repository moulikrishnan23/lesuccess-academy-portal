import { useState, useEffect, useRef, useMemo } from "react";
import {
  Code2,
  Play,
  RotateCcw,
  Copy,
  Check,
  Sparkles,
  Eye,
  Layers,
  User,
  X,
} from "lucide-react";
import useReducedMotion from "../../hooks/useReducedMotion.js";
import BorderBeam from "../ui/BorderBeam.jsx";

/**
 * Escape HTML special characters for safe code rendering in the preview/pre layer
 */
function escapeHtml(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/**
 * Tokenize and highlight HTML + CSS code with VS Code Dark+ theme colors:
 * - Tags: #569cd6 (VS Code blue)
 * - Tag brackets: #808080
 * - Attributes & CSS Properties: #9cdcfe (VS Code light cyan)
 * - Strings: #ce9178 (VS Code peach/orange)
 * - CSS Class/ID selectors: #d7ba7d (VS Code yellow)
 * - Numbers & CSS units: #b5cea8 (VS Code light green)
 * - Functions: #dcdcaa (VS Code light yellow)
 * - Comments: #6a9955 (VS Code italic green)
 * - Punctuation: #d4d4d4
 */
function highlightCode(code) {
  const regex =
    /(\/\*[\s\S]*?\*\/|<!--[\s\S]*?-->)|(".*?"|'.*?')|(<\/?[a-zA-Z0-9-]+)|(\/?>)|(\b[a-zA-Z0-9-]+(?=\s*=))|(\b[a-zA-Z-]+(?=\s*:))|(#[0-9a-fA-F]{3,8}\b)|(\b\d+(?:\.\d+)?(?:px|%|rem|em|s|ms|deg)?\b)|(\b(?:rgba?|linear-gradient|radial-gradient|calc|url|var|scale|translateY|alert)\b)|(\.[a-zA-Z0-9_-]+)|(:|\{|\}|;)/g;

  let lastIndex = 0;
  let result = "";

  code.replace(
    regex,
    (
      match,
      comment,
      str,
      tag,
      closeBracket,
      attrName,
      cssProp,
      hexColor,
      num,
      fnName,
      cssClass,
      punct,
      offset,
    ) => {
      if (offset > lastIndex) {
        result += escapeHtml(code.slice(lastIndex, offset));
      }
      lastIndex = offset + match.length;

      if (comment) {
        result += `<span class="text-[#6a9955] italic">${escapeHtml(comment)}</span>`;
      } else if (str) {
        result += `<span class="text-[#ce9178]">${escapeHtml(str)}</span>`;
      } else if (tag) {
        const isClose = tag.startsWith("</");
        const name = tag.slice(isClose ? 2 : 1);
        result += `<span class="text-[#808080]">&lt;${
          isClose ? "/" : ""
        }</span><span class="text-[#569cd6]">${name}</span>`;
      } else if (closeBracket) {
        result += `<span class="text-[#808080]">${escapeHtml(closeBracket)}</span>`;
      } else if (attrName) {
        result += `<span class="text-[#9cdcfe]">${escapeHtml(attrName)}</span>`;
      } else if (cssProp) {
        result += `<span class="text-[#9cdcfe]">${escapeHtml(cssProp)}</span>`;
      } else if (hexColor) {
        result += `<span class="text-[#ce9178] font-mono">${escapeHtml(hexColor)}</span>`;
      } else if (num) {
        result += `<span class="text-[#b5cea8]">${escapeHtml(num)}</span>`;
      } else if (fnName) {
        result += `<span class="text-[#dcdcaa]">${escapeHtml(fnName)}</span>`;
      } else if (cssClass) {
        result += `<span class="text-[#d7ba7d]">${escapeHtml(cssClass)}</span>`;
      } else if (punct) {
        result += `<span class="text-[#d4d4d4]">${escapeHtml(punct)}</span>`;
      } else {
        result += escapeHtml(match);
      }
    },
  );

  if (lastIndex < code.length) {
    result += escapeHtml(code.slice(lastIndex));
  }

  return result;
}

const PRESETS = [
  {
    id: "hello",
    name: "Hello World",
    icon: Sparkles,
    code: `<div class="card">
  <h1>Hello LeSuccess! 👋</h1>
  <p>Start learning HTML & CSS today.</p>
  <button onclick="alert('Welcome to LeSuccess Academy! 🚀')">
    Click Me!
  </button>
</div>

<style>
  body {
    background-color: #021a24;
    font-family: sans-serif;
    text-align: center;
    padding: 16px;
  }
  .card {
    background-color: #07405c;
    color: white;
    padding: 20px;
    border-radius: 12px;
    border: 2px solid #38bdf8;
  }
  h1 {
    font-size: 20px;
    color: #38bdf8;
    margin-bottom: 8px;
  }
  p {
    font-size: 13px;
    color: #e2e8f0;
    margin-bottom: 14px;
  }
  button {
    background-color: #df1e26;
    color: white;
    border: none;
    padding: 8px 18px;
    border-radius: 8px;
    font-size: 13px;
    cursor: pointer;
  }
  button:hover {
    background-color: #ca164b;
  }
</style>`,
  },
  {
    id: "button",
    name: "Button Alert",
    icon: Play,
    code: `<div class="box">
  <h2>Interactive Button</h2>
  <p>Click below to test JavaScript:</p>
  <button onclick="alert('You clicked the button! 🎉')">
    ⚡ Click Me
  </button>
</div>

<style>
  body {
    background-color: #0b1120;
    font-family: sans-serif;
    text-align: center;
    padding: 20px;
  }
  .box {
    background-color: #1e293b;
    padding: 20px;
    border-radius: 12px;
  }
  h2 {
    color: white;
    font-size: 18px;
    margin-bottom: 6px;
  }
  p {
    color: #94a3b8;
    font-size: 13px;
    margin-bottom: 14px;
  }
  button {
    background-color: #38bdf8;
    color: #07405c;
    font-weight: bold;
    border: none;
    padding: 10px 20px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 13px;
  }
  button:hover {
    background-color: #df1e26;
    color: white;
  }
</style>`,
  },
  {
    id: "badge",
    name: "Student Card",
    icon: User,
    code: `<div class="profile">
  <div class="avatar">👨‍💻</div>
  <h3>Alex Kumar</h3>
  <span class="role">Frontend Developer</span>
  <p>Learning HTML, CSS & JavaScript</p>
</div>

<style>
  body {
    background-color: #06101e;
    font-family: sans-serif;
    text-align: center;
    padding: 16px;
  }
  .profile {
    background-color: #0d1e36;
    color: white;
    padding: 18px;
    border-radius: 12px;
    border: 1px solid #1e293b;
  }
  .avatar {
    font-size: 28px;
    margin-bottom: 4px;
  }
  h3 {
    font-size: 18px;
    margin-bottom: 4px;
  }
  .role {
    color: #38bdf8;
    font-size: 12px;
    font-weight: bold;
  }
  p {
    color: #cbd5e1;
    font-size: 12px;
    margin-top: 8px;
  }
</style>`,
  },
];

/**
 * Interactive Live HTML Coding Floating Section.
 * Features live code editing, instant sandboxed preview, preset components,
 * tab toggles, and VS Code-inspired macOS dark terminal styling.
 */
export default function LiveHtmlEditor({ className = "", onMinimize }) {
  const reduced = useReducedMotion();
  const [activePreset, setActivePreset] = useState(PRESETS[0].id);
  const [code, setCode] = useState(PRESETS[0].code);
  const [debouncedCode, setDebouncedCode] = useState(PRESETS[0].code);
  const [viewMode, setViewMode] = useState("split"); // 'split' | 'code' | 'preview'
  const [copied, setCopied] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const textareaRef = useRef(null);
  const preRef = useRef(null);
  const lineGutterRef = useRef(null);

  // Compute syntax highlighted HTML (VS Code Dark+ theme)
  const highlightedCode = useMemo(() => highlightCode(code), [code]);
  const lineCount = Math.max(code.split("\n").length, 12);

  // Debounce live code updates to prevent preview thrashing
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedCode(code);
      setIsUpdating(false);
    }, 150);
    return () => clearTimeout(handler);
  }, [code]);

  // Synchronize scroll between textarea, syntax highlighted pre, and line gutter
  const handleScroll = (e) => {
    const { scrollTop, scrollLeft } = e.currentTarget;
    if (preRef.current) {
      preRef.current.scrollTop = scrollTop;
      preRef.current.scrollLeft = scrollLeft;
    }
    if (lineGutterRef.current) {
      lineGutterRef.current.scrollTop = scrollTop;
    }
  };

  const resetScroll = () => {
    if (textareaRef.current) {
      textareaRef.current.scrollTop = 0;
      textareaRef.current.scrollLeft = 0;
    }
    if (preRef.current) {
      preRef.current.scrollTop = 0;
      preRef.current.scrollLeft = 0;
    }
    if (lineGutterRef.current) {
      lineGutterRef.current.scrollTop = 0;
    }
  };

  const handleCodeChange = (e) => {
    setCode(e.target.value);
    setIsUpdating(true);
  };

  const handlePresetSelect = (preset) => {
    setActivePreset(preset.id);
    setCode(preset.code);
    setIsUpdating(true);
    resetScroll();
  };

  const handleReset = () => {
    const current = PRESETS.find((p) => p.id === activePreset) || PRESETS[0];
    setCode(current.code);
    setIsUpdating(true);
    resetScroll();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Enable Tab indentation inside textarea
  const handleKeyDown = (e) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const target = e.target;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const newValue = code.substring(0, start) + "  " + code.substring(end);
      setCode(newValue);
      setTimeout(() => {
        target.selectionStart = target.selectionEnd = start + 2;
      }, 0);
    }
  };

  return (
    <div
      className={`relative w-full max-w-lg lg:max-w-lg xl:max-w-xl lg:ml-auto ${
        reduced ? "" : "animate-levitate-soft"
      } ${className}`}
    >
      {/* Outer Glow Halo behind the floating window */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-2 rounded-3xl bg-gradient-to-r from-[#DF1E26]/20 via-[#38bdf8]/15 to-[#CA164B]/20 blur-xl opacity-75"
      />

      <div className="relative overflow-hidden rounded-2xl border border-white/20 bg-slate-950/85 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.6)] transition-all">
        <BorderBeam
          size={180}
          duration={8}
          colorFrom="#38bdf8"
          colorTo="#DF1E26"
        />

        {/* ================= WINDOW TITLE BAR ================= */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 bg-slate-900/90 px-3.5 py-2.5 sm:px-4">
          {/* Traffic Lights + File Tab */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={onMinimize}
                title="Close Code Editor"
                aria-label="Close Code Editor"
                className="h-2.5 w-2.5 rounded-full bg-[#ff5f56] inline-block shadow-xs hover:opacity-80 active:scale-90 cursor-pointer transition"
              />
              <button
                type="button"
                onClick={onMinimize}
                title="Minimize Code Editor"
                aria-label="Minimize Code Editor"
                className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e] inline-block shadow-xs hover:opacity-80 active:scale-90 cursor-pointer transition"
              />
              <span className="h-2.5 w-2.5 rounded-full bg-[#27c93f] inline-block shadow-xs" />
            </div>

            <div className="ml-2 inline-flex items-center gap-1.5 rounded-t-md bg-[#1e1e1e] border-t-2 border-t-[#38bdf8] border-x border-[#333333] px-2.5 py-1 text-[11px] font-mono font-medium text-slate-200 shadow-xs">
              <span className="text-[#e44d26] font-bold text-xs">&lt;&gt;</span>
              <span>index.html</span>
              <span className="ml-1 w-1.5 h-1.5 rounded-full bg-[#38bdf8]/60 inline-block" />
            </div>
          </div>

          {/* Live Runner Status & View Mode Toggles & Red Close Button */}
          <div className="flex items-center gap-2">
            <div className="hidden sm:inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5 rounded-full">
              <span
                className={`h-1.5 w-1.5 rounded-full bg-emerald-400 ${
                  isUpdating ? "animate-ping" : "animate-pulse"
                }`}
              />
              <span>Live Code</span>
            </div>

            {/* View Mode Toggle */}
            <div className="inline-flex rounded-lg bg-white/10 p-0.5 border border-white/10 text-[10px] font-medium text-slate-300">
              <button
                type="button"
                onClick={() => setViewMode("split")}
                title="Split View"
                className={`rounded-md px-1.5 py-0.5 transition cursor-pointer ${
                  viewMode === "split"
                    ? "bg-[#DF1E26] text-white font-bold"
                    : "hover:text-white"
                }`}
              >
                <Layers size={12} className="inline sm:mr-0.5" />
                <span className="hidden sm:inline">Split</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("code")}
                title="Code Only"
                className={`rounded-md px-1.5 py-0.5 transition cursor-pointer ${
                  viewMode === "code"
                    ? "bg-[#DF1E26] text-white font-bold"
                    : "hover:text-white"
                }`}
              >
                <Code2 size={12} className="inline sm:mr-0.5" />
                <span className="hidden sm:inline">Code</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("preview")}
                title="Preview Only"
                className={`rounded-md px-1.5 py-0.5 transition cursor-pointer ${
                  viewMode === "preview"
                    ? "bg-[#DF1E26] text-white font-bold"
                    : "hover:text-white"
                }`}
              >
                <Eye size={12} className="inline sm:mr-0.5" />
                <span className="hidden sm:inline">Preview</span>
              </button>
            </div>

            {/* Red Color Close / Minimize Button in Top Right Corner */}
            {onMinimize && (
              <button
                type="button"
                onClick={onMinimize}
                title="Minimize Live Code Editor"
                aria-label="Minimize Live Code Editor"
                className="ml-0.5 sm:ml-1 inline-flex items-center justify-center h-6 w-6 rounded-md bg-[#DF1E26]/20 hover:bg-[#DF1E26] text-[#ff6b6b] hover:text-white border border-[#DF1E26]/40 transition-all cursor-pointer shadow-xs active:scale-95"
              >
                <X size={13} strokeWidth={2.5} />
              </button>
            )}
          </div>
        </div>

        {/* ================= PRESET PILLS BAR ================= */}
        <div className="flex items-center justify-between gap-1.5 border-b border-white/10 bg-slate-950/70 px-3 py-1.5 sm:px-4 text-[11px] overflow-x-auto">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mr-1 hidden sm:inline">
              Presets:
            </span>
            {PRESETS.map((preset) => {
              const IconComp = preset.icon;
              const isSelected = activePreset === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handlePresetSelect(preset)}
                  className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 font-medium transition cursor-pointer text-[11px] ${
                    isSelected
                      ? "bg-white/20 text-white border border-white/30 shadow-xs"
                      : "text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent"
                  }`}
                >
                  <IconComp
                    size={11}
                    className={isSelected ? "text-[#38bdf8]" : ""}
                  />
                  <span>{preset.name}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleReset}
              title="Reset Code"
              className="p-1 text-slate-400 hover:text-white hover:bg-white/10 rounded-md transition cursor-pointer"
            >
              <RotateCcw size={12} />
            </button>
            <button
              type="button"
              onClick={handleCopy}
              title="Copy Code"
              className="inline-flex items-center gap-1 rounded-md bg-white/10 px-2 py-0.5 text-[10px] font-semibold text-slate-200 hover:bg-white/20 hover:text-white transition cursor-pointer"
            >
              {copied ? (
                <>
                  <Check size={11} className="text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy size={11} />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* ================= EDITABLE CODE AREA (VS CODE DARK+ THEME) ================= */}
        {(viewMode === "split" || viewMode === "code") && (
          <div className="relative bg-[#1e1e1e] border-b border-white/10 font-mono text-[11px] sm:text-xs">
            {/* Editor Body */}
            <div
              className={`relative flex ${
                viewMode === "split"
                  ? "h-[160px] sm:h-[185px]"
                  : "h-[330px] sm:h-[370px]"
              }`}
            >
              {/* Line Numbers Gutter */}
              <div
                ref={lineGutterRef}
                aria-hidden="true"
                className="pointer-events-none select-none py-2.5 px-2 text-right font-mono text-[11px] sm:text-xs leading-5 text-[#858585] bg-[#1e1e1e] border-r border-[#333333] min-w-[2.4rem] overflow-hidden"
              >
                {Array.from({ length: lineCount }).map((_, i) => (
                  <div key={i}>{i + 1}</div>
                ))}
              </div>

              {/* Stacked Syntax-Highlighted <pre> + Interactive <textarea> */}
              <div className="relative flex-1 overflow-hidden bg-[#1e1e1e]">
                {/* Visual Syntax Highlighted Layer (VS Code Dark+ Colors) */}
                <pre
                  ref={preRef}
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 m-0 w-full h-full p-2.5 font-mono text-[11px] sm:text-xs leading-5 text-[#d4d4d4] overflow-hidden whitespace-pre z-0 selection:bg-transparent"
                  style={{ tabSize: 2, MozTabSize: 2 }}
                  dangerouslySetInnerHTML={{ __html: highlightedCode + "\n" }}
                />

                {/* Interactive Editable Layer (Transparent text, visible glowing caret & selection) */}
                <textarea
                  ref={textareaRef}
                  value={code}
                  onChange={handleCodeChange}
                  onKeyDown={handleKeyDown}
                  onScroll={handleScroll}
                  spellCheck="false"
                  autoCapitalize="off"
                  autoComplete="off"
                  autoCorrect="off"
                  aria-label="Interactive HTML Code Editor"
                  placeholder="Type your HTML and CSS here..."
                  className="absolute inset-0 m-0 w-full h-full resize-none bg-transparent p-2.5 font-mono text-[11px] sm:text-xs leading-5 text-transparent caret-[#38bdf8] selection:bg-[#264f78]/80 selection:text-transparent outline-none border-0 overflow-auto whitespace-pre z-10 scrollbar-thin scrollbar-thumb-white/10"
                  style={{ tabSize: 2, MozTabSize: 2 }}
                />
              </div>
            </div>

            {/* VS Code Status Bar & Helper */}
            <div className="flex items-center justify-between px-3 py-1 bg-[#181818] text-[10px] text-slate-400 border-t border-white/5">
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#38bdf8] shadow-[0_0_6px_#38bdf8]" />
                <span className="text-slate-300">VS Code Dark+</span>
                <span className="text-slate-500 hidden sm:inline">
                  &bull; Type to live-edit
                </span>
              </span>
              <span className="font-mono text-slate-400">
                HTML &bull; CSS &bull; UTF-8
              </span>
            </div>
          </div>
        )}

        {/* ================= LIVE PREVIEW CANVAS ================= */}
        {(viewMode === "split" || viewMode === "preview") && (
          <div className="relative bg-slate-950 p-2.5 sm:p-3">
            <div className="mb-1.5 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400">
              <span className="flex items-center gap-1">
                <Eye size={11} className="text-[#38bdf8]" />
                <span>Live Rendered Output:</span>
              </span>
              <span className="text-[9px] font-normal lowercase text-slate-500">
                sandboxed preview
              </span>
            </div>

            <div className="relative min-h-[145px] sm:min-h-[160px] overflow-hidden rounded-xl border border-white/15 bg-slate-900 shadow-inner">
              <iframe
                title="Live HTML Coding Preview"
                srcDoc={debouncedCode}
                sandbox="allow-scripts"
                className="h-[145px] sm:h-[160px] w-full border-0"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
