import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown, Search } from "lucide-react";
import useReducedMotion from "../../hooks/useReducedMotion.js";
import { onCourseLogoError as onLogoError } from "../../utils/imageUtils.js";

const PANEL_GAP = 8;
const PANEL_MAX = 352; // 22rem; the panel also caps at 60vh
const EDGE = 12;
const SEARCH_FROM = 10; // show the search box once the list is this long

const same = (a, b) => String(a ?? "") === String(b ?? "");

/**
 * The site's dropdown, used in place of the native <select> everywhere.
 *
 * The closed trigger takes the caller's `className`, so it matches whatever
 * field style it replaces; the open panel looks the same on every page: an
 * optional logo and hint per option, a tick on the chosen one, a search box for
 * long lists, and full keyboard support (listbox pattern).
 *
 * The panel is portalled to <body> with fixed positioning so overflow-clipped
 * bands, cards and tables cannot cut it off. It follows the trigger on scroll
 * and resize and flips above it when there is no room below.
 *
 * options      [{ value, label, icon?, hint?, disabled? }]; values may be
 *              numbers, they are compared as strings and handed back as given
 * placeholder  shown (with `placeholderClassName`) when no option matches
 * onChange     receives { target: { name, value } }, like a native select
 * renderValue  optional (selectedOption) => node for the trigger content
 * searchLabel  noun for the search box ("Search 20 courses")
 */
export default function Select({
  id,
  name,
  value,
  onChange,
  options,
  placeholder = "Select an option",
  placeholderClassName = "",
  className = "",
  chevronClassName = "",
  disabled = false,
  renderValue,
  searchLabel = "options",
  minPanelWidth = 220,
  ...rest
}) {
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

  const selected = options.find((o) => same(o.value, value)) || null;
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
    const width = Math.min(Math.max(r.width, minPanelWidth), window.innerWidth - EDGE * 2);
    setPos({
      left: Math.max(EDGE, Math.min(r.left, window.innerWidth - width - EDGE)),
      width,
      maxHeight: Math.min(PANEL_MAX, window.innerHeight * 0.6, (up ? above : below) - EDGE),
      ...(up ? { bottom: window.innerHeight - r.top + PANEL_GAP } : { top: r.bottom + PANEL_GAP }),
      up,
    });
  }, [minPanelWidth]);

  const firstEnabled = (from, step) => {
    for (let i = from, n = 0; n < visible.length; i += step, n += 1) {
      const k = (i + visible.length) % visible.length;
      if (!visible[k].disabled) return k;
    }
    return -1;
  };

  const openPanel = () => {
    if (disabled) return;
    place();
    setQuery("");
    setActive(Math.max(0, options.findIndex((o) => same(o.value, value))));
    setOpen(true);
  };

  const close = (refocus = true) => {
    setOpen(false);
    if (refocus) triggerRef.current?.focus();
  };

  const choose = (option) => {
    if (option.disabled) return;
    if (!same(option.value, value)) onChange?.({ target: { name, value: option.value } });
    close();
  };

  // Keep the panel pinned to the trigger while open.
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
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActive((i) => firstEnabled(i + 1, 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setActive((i) => firstEnabled(i - 1, -1));
        break;
      case "Home":
        if (!searchable) {
          e.preventDefault();
          setActive(firstEnabled(0, 1));
        }
        break;
      case "End":
        if (!searchable) {
          e.preventDefault();
          setActive(firstEnabled(visible.length - 1, -1));
        }
        break;
      case "Enter":
        e.preventDefault();
        if (visible[active]) choose(visible[active]);
        break;
      case "Escape":
        e.preventDefault();
        e.stopPropagation(); // close the list, not a surrounding modal
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
    <>
      <button
        ref={triggerRef}
        id={id}
        type="button"
        className={`ui-sel-trigger ${className} ${selected ? "" : placeholderClassName}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        disabled={disabled}
        onClick={() => (open ? close() : openPanel())}
        onKeyDown={onTriggerKey}
        {...rest}
      >
        {renderValue ? (
          renderValue(selected)
        ) : (
          <span className="ui-sel-value">
            {selected?.icon && <img src={selected.icon} alt="" className="ui-sel-value-logo" onError={onLogoError} />}
            <span className="truncate">{selected ? selected.label : placeholder}</span>
          </span>
        )}
        <ChevronDown size={16} className={`ui-sel-chev ${chevronClassName}`} aria-hidden="true" />
      </button>

      {createPortal(
        <AnimatePresence>
          {open && pos && (
            <motion.div
              ref={panelRef}
              className={`ui-sel-panel${up ? " is-up" : ""}`}
              style={style}
              onKeyDown={onPanelKey}
              {...motionProps}
            >
              {searchable && (
                <div className="ui-sel-search">
                  <Search size={16} aria-hidden="true" />
                  <input
                    ref={searchRef}
                    type="text"
                    value={query}
                    placeholder={`Search ${options.length} ${searchLabel}`}
                    aria-label={`Search ${searchLabel}`}
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
                aria-labelledby={id}
                aria-activedescendant={searchable ? undefined : activeId}
                className="ui-sel-list"
              >
                {visible.map((option, i) => {
                  const isSelected = same(option.value, value);
                  return (
                    <li
                      key={String(option.value)}
                      id={`${uid}-opt-${i}`}
                      data-index={i}
                      role="option"
                      aria-selected={isSelected}
                      aria-disabled={option.disabled || undefined}
                      data-active={i === active || undefined}
                      data-cursor-hover
                      className="ui-sel-opt"
                      onMouseMove={() => !option.disabled && setActive(i)}
                      onClick={() => choose(option)}
                    >
                      {option.icon && (
                        <span className="ui-sel-logo">
                          <img src={option.icon} alt="" loading="lazy" onError={onLogoError} />
                        </span>
                      )}
                      <span className="min-w-0 flex-1">
                        <span className="ui-sel-label">{option.label}</span>
                        {option.hint && <span className="ui-sel-hint">{option.hint}</span>}
                      </span>
                      <Check size={16} className="ui-sel-tick" aria-hidden="true" />
                    </li>
                  );
                })}
                {visible.length === 0 && (
                  <li className="ui-sel-empty" role="presentation">
                    Nothing matches “{query.trim()}”
                  </li>
                )}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </>
  );
}
