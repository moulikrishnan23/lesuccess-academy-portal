import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown, Search } from "lucide-react";
import { useReducedMotion } from "../motion/index.js";
import { COURSE_LOGO_PLACEHOLDER } from "../../utils/imageUtils.js";

const PANEL_GAP = 8;
const PANEL_MAX = 352; // 22rem; the panel also caps at 60vh
const SEARCH_FROM = 7; // show the search box once the list is this long
const PANEL_MIN_W = 320; // wide enough for full course names
const EDGE = 12;

// An uploaded logo that fails to load falls back to the neutral placeholder.
const onLogoError = (e) => {
  if (!e.currentTarget.src.endsWith(COURSE_LOGO_PLACEHOLDER)) e.currentTarget.src = COURSE_LOGO_PLACEHOLDER;
};

/**
 * The floating-label field's dropdown (FloatField renders this for `options`).
 * Same look as the text fields, but opens a listbox panel instead of the
 * browser's native picker: logo + hint per option, a tick on the chosen one,
 * a search box for long lists, and full keyboard support.
 *
 * The panel is portalled to <body> with fixed positioning, because the bands
 * these forms sit in clip their overflow; it flips above the field when there
 * is not enough room below.
 *
 * `onChange` receives `{ target: { value } }`, like the native select did, so
 * callers that read `e.target.value` keep working.
 */
export default function FloatSelect({ id, label, options, value, onChange, className = "", ...rest }) {
  const reduced = useReducedMotion();
  const uid = useId();
  const listId = `${uid}-list`;
  const triggerRef = useRef(null);
  const panelRef = useRef(null);
  const searchRef = useRef(null);
  const listRef = useRef(null);

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(-1);
  const [pos, setPos] = useState(null);

  const selected = options.find((o) => o.value === value) || null;
  const searchable = options.length >= SEARCH_FROM;

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => `${o.label} ${o.hint || ""}`.toLowerCase().includes(q));
  }, [options, query]);

  const place = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const below = window.innerHeight - r.bottom - PANEL_GAP;
    const above = r.top - PANEL_GAP;
    const up = below < Math.min(PANEL_MAX, 260) && above > below;
    const width = Math.min(Math.max(r.width, PANEL_MIN_W), window.innerWidth - EDGE * 2);
    setPos({
      left: Math.max(EDGE, Math.min(r.left, window.innerWidth - width - EDGE)),
      width,
      maxHeight: Math.min(PANEL_MAX, window.innerHeight * 0.6, (up ? above : below) - 12),
      ...(up ? { bottom: window.innerHeight - r.top + PANEL_GAP } : { top: r.bottom + PANEL_GAP }),
      up,
    });
  }, []);

  const openPanel = () => {
    place();
    setQuery("");
    setActive(Math.max(0, options.findIndex((o) => o.value === value)));
    setOpen(true);
  };

  const close = (refocus = true) => {
    setOpen(false);
    if (refocus) triggerRef.current?.focus();
  };

  const choose = (option) => {
    onChange?.({ target: { value: option.value } });
    close();
  };

  // Keep the panel pinned to the field while open.
  useLayoutEffect(() => {
    if (!open) return undefined;
    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [open, place]);

  // Focus the search box (or the list) on open; close on an outside press.
  useEffect(() => {
    if (!open) return undefined;
    (searchable ? searchRef.current : listRef.current)?.focus({ preventScroll: true });
    const onDown = (e) => {
      if (!panelRef.current?.contains(e.target) && !triggerRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open, searchable]);

  // Keep the highlighted option in view.
  useEffect(() => {
    if (!open || active < 0) return;
    listRef.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [open, active]);

  const onTriggerKey = (e) => {
    if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) {
      e.preventDefault();
      openPanel();
    }
  };

  const onPanelKey = (e) => {
    const last = visible.length - 1;
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActive((i) => (i >= last ? 0 : i + 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setActive((i) => (i <= 0 ? last : i - 1));
        break;
      case "Home":
        if (!searchable) {
          e.preventDefault();
          setActive(0);
        }
        break;
      case "End":
        if (!searchable) {
          e.preventDefault();
          setActive(last);
        }
        break;
      case "Enter":
        e.preventDefault();
        if (visible[active]) choose(visible[active]);
        break;
      case "Escape":
        e.preventDefault();
        close();
        break;
      case "Tab":
        close(false);
        break;
      default:
    }
  };

  const activeId = active >= 0 && visible[active] ? `${uid}-opt-${active}` : undefined;
  const { up, ...style } = pos || {};
  const motionProps = reduced
    ? {}
    : {
        initial: { opacity: 0, y: up ? 8 : -8, scale: 0.98 },
        animate: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, y: up ? 8 : -8, scale: 0.98 },
        transition: { duration: 0.18, ease: [0.22, 1, 0.36, 1] },
      };

  return (
    <div className={`lh-f lh-f--select ${className}`}>
      <button
        ref={triggerRef}
        id={id}
        type="button"
        className={`lh-fs-trigger${selected ? " has-value" : ""}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-labelledby={`${id}-label ${id}`}
        data-cursor-text="Choose"
        onClick={() => (open ? close() : openPanel())}
        onKeyDown={onTriggerKey}
        {...rest}
      >
        <span className="lh-fs-value">
          {selected?.icon && <img src={selected.icon} alt="" className="lh-fs-value-logo" onError={onLogoError} />}
          <span className="truncate">{selected ? selected.label : " "}</span>
        </span>
        <ChevronDown size={18} className="lh-fs-chev" aria-hidden="true" />
      </button>
      <label id={`${id}-label`} htmlFor={id}>
        {label}
      </label>

      {createPortal(
        <AnimatePresence>
          {open && pos && (
            <motion.div
              ref={panelRef}
              className={`lh-fs-panel${up ? " is-up" : ""}`}
              style={style}
              onKeyDown={onPanelKey}
              {...motionProps}
            >
              {searchable && (
                <div className="lh-fs-search">
                  <Search size={16} aria-hidden="true" />
                  <input
                    ref={searchRef}
                    type="text"
                    value={query}
                    placeholder={`Search ${options.length} courses`}
                    aria-label="Search courses"
                    aria-controls={listId}
                    aria-activedescendant={activeId}
                    autoComplete="off"
                    onChange={(e) => {
                      setQuery(e.target.value);
                      setActive(0);
                    }}
                  />
                </div>
              )}
              <ul
                ref={listRef}
                id={listId}
                role="listbox"
                tabIndex={-1}
                aria-labelledby={`${id}-label`}
                aria-activedescendant={searchable ? undefined : activeId}
                className="lh-fs-list"
              >
                {visible.map((option, i) => {
                  const isSelected = option.value === value;
                  return (
                    <li
                      key={option.value}
                      id={`${uid}-opt-${i}`}
                      data-index={i}
                      role="option"
                      aria-selected={isSelected}
                      data-active={i === active || undefined}
                      data-cursor-hover
                      className="lh-fs-opt"
                      onMouseMove={() => setActive(i)}
                      onClick={() => choose(option)}
                    >
                      {option.icon && (
                        <span className="lh-fs-logo">
                          <img src={option.icon} alt="" loading="lazy" onError={onLogoError} />
                        </span>
                      )}
                      <span className="min-w-0 flex-1">
                        <span className="lh-fs-label">{option.label}</span>
                        {option.hint && <span className="lh-fs-hint">{option.hint}</span>}
                      </span>
                      <Check size={18} className="lh-fs-tick" aria-hidden="true" />
                    </li>
                  );
                })}
                {visible.length === 0 && (
                  <li className="lh-fs-empty" role="presentation">
                    No course matches “{query.trim()}”
                  </li>
                )}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </div>
  );
}
