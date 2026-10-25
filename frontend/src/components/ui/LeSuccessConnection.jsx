import { useEffect, useId, useRef, useState } from "react";
import useReducedMotion from "../../hooks/useReducedMotion.js";
import "./LeSuccessConnection.css";

// Content follows the academy's original About page, without adding outcome claims.
const AREAS = [
  {
    key: "serve", label: "Who we serve", title: "People at the heart of learning.",
    description: "Students, working professionals, and institutions — connected through opportunities to learn and grow.",
    illustration: "Highlighted: learners and institutions connecting with LeSuccess.",
  },
  {
    key: "help", label: "How we help", title: "Practical learning. Personal guidance.",
    description: "Hands-on training, experienced instructors, and career guidance connect learning with the workplace.",
    illustration: "Highlighted: LeSuccess connects education and industry through practical learning and guidance.",
  },
  {
    key: "purpose", label: "What we work toward", title: "Bringing education and industry closer.",
    description: "We work to build practical skills and industry knowledge, helping learners prepare for their next step.",
    illustration: "Highlighted: connections to industry and career opportunities.",
  },
];

function ConnectionArtwork({ description, titleId, loop = false }) {
  const paths = loop ? [
    "M192 182C152 182 165 63 112 63",
    "M192 218C152 218 165 326 112 326",
    "M368 182C410 182 396 63 448 63",
    "M368 218C410 218 396 326 448 326",
  ] : [
    "M112 63C165 63 152 132 192 132",
    "M112 226C165 226 152 168 192 168",
    "M368 132C410 132 396 63 448 63",
    "M368 168C410 168 396 226 448 226",
  ];
  const channels = ["one", "two", "three", "four"];
  return (
    <div className="ls-connection__diagram">
    <svg className="ls-connection__art" viewBox={loop ? "0 0 560 400" : "0 0 560 300"} role="img" aria-labelledby={titleId}>
      <title id={titleId}>{description}</title>
      <g aria-hidden="true">
        {/* Static connections remain visible; only the Home variant adds moving highlights. */}
        <g fill="none" strokeLinecap="round" strokeWidth="2">
          <path className="ls-connection__guide" d={paths.join(" ")} />
          {paths.map((path, index) => <path key={path} className={`ls-connection__line ls-connection__line--${index < 2 ? "serve" : "purpose"}`} pathLength="1" d={path} />)}
          {loop && <g className="ls-connection__flows" strokeWidth="4" aria-hidden="true">
            {paths.map((path, index) => <path key={path} className={`ls-connection__flow ls-connection__channel--${channels[index]}`} pathLength="1" d={path} />)}
          </g>}
        </g>
        <g transform={loop ? "translate(0 50)" : undefined}>
        <circle className="ls-connection__halo" cx="280" cy="150" r="83" fill="none" stroke="#8AC3D8" strokeWidth="1" strokeDasharray="3 7" />
        <rect x="185" y="101" width="190" height="104" rx="30" fill="#022A3E" opacity=".5" />
        <rect className="ls-connection__hub-border" x="185" y="95" width="190" height="104" rx="30" fill="none" strokeWidth="6" />
        <rect x="188" y="98" width="184" height="98" rx="27" fill="#F7FAFC" />
        <image href="/logo/logo.png" x="205" y="130" width="150" height="29" preserveAspectRatio="xMidYMid meet" />
        {!loop && <text x="280" y="178" textAnchor="middle" fill="#567081" fontSize="9" letterSpacing="1.3">EDUCATION + INDUSTRY</text>}
        </g>

        {/* Learner: a dimensional graduation cap and person. */}
        <g className="ls-connection__node ls-connection__node--serve ls-connection__channel--one">
          {loop && <rect className="ls-connection__arrival" x="39" y="25" width="74" height="75" rx="22" fill="none" stroke="#FFBCC0" strokeWidth="8" />}
          <rect className="ls-connection__node-frame" x="39" y="25" width="74" height="75" rx="22" />
          <path d="M53 86v-6c0-17 46-17 46 0v6" fill="#155B96" />
          <path d="M50 82v-6c0-17 46-17 46 0v6" fill="#62C7E7" />
          <path d="m68 64 6 12 6-12" fill="#E5F7FC" />
          <circle cx="74" cy="51" r="13" fill="#F3C48F" />
          <path d="M61 50V40h26v10l-6-8-13 4Z" fill="#263E67" />
          <path d="m49 35 25-11 25 11-25 11Z" fill="#4B78BD" />
          <path d="m49 32 25-11 25 11-25 11Z" fill="#A4CCFF" />
          <path d="M95 34v16" stroke="#FFD36E" strokeWidth="3" strokeLinecap="round" />
        </g>

        {/* Institution: a school building, drawn locally rather than a campus photo. */}
        <g className="ls-connection__node ls-connection__node--serve ls-connection__channel--two" transform={loop ? "translate(0 100)" : undefined}>
          {loop && <rect className="ls-connection__arrival" x="39" y="184" width="74" height="75" rx="22" fill="none" stroke="#FFBCC0" strokeWidth="8" />}
          <rect className="ls-connection__node-frame" x="39" y="184" width="74" height="75" rx="22" />
          <path d="M51 213h49v36H51Z" fill="#177D88" />
          <path d="M47 209h49v36H47Z" fill="#87DDD9" />
          <path d="m43 208 29-21 29 21Z" fill="#279DAF" />
          <path d="m43 205 29-21 29 21Z" fill="#C3F3EA" />
          <rect x="67" y="225" width="10" height="20" rx="2" fill="#14677B" />
          <path d="M54 215h6v7h-6Zm30 0h6v7h-6Z" fill="#F7FBED" />
          <rect x="43" y="244" width="57" height="5" rx="2" fill="#D6FAF1" />
        </g>

        {/* Industry: a briefcase, with a second layer for depth. */}
        <g className="ls-connection__node ls-connection__node--purpose ls-connection__channel--three">
          {loop && <rect className="ls-connection__arrival" x="447" y="25" width="74" height="75" rx="22" fill="none" stroke="#FFBCC0" strokeWidth="8" />}
          <rect className="ls-connection__node-frame" x="447" y="25" width="74" height="75" rx="22" />
          <rect x="475" y="38" width="23" height="14" rx="4" fill="none" stroke="#B68AF2" strokeWidth="5" />
          <rect x="461" y="48" width="51" height="35" rx="7" fill="#5C4AA0" />
          <rect x="457" y="44" width="51" height="35" rx="7" fill="#B79AEE" />
          <path d="M457 55c11 11 40 11 51 0" fill="none" stroke="#E4D9FF" strokeWidth="3" />
          <rect x="479" y="58" width="8" height="10" rx="2" fill="#FFD789" />
        </g>

        {/* Career growth is an aspiration, not a promise of a placement outcome. */}
        <g className="ls-connection__node ls-connection__node--purpose ls-connection__channel--four" transform={loop ? "translate(0 100)" : undefined}>
          {loop && <rect className="ls-connection__arrival" x="447" y="184" width="74" height="75" rx="22" fill="none" stroke="#FFBCC0" strokeWidth="8" />}
          <rect className="ls-connection__node-frame" x="447" y="184" width="74" height="75" rx="22" />
          <path d="M459 246v-14h14v-14h14v-14h15v42Z" fill="#B56836" />
          <path d="M455 242v-14h14v-14h14v-14h15v42Z" fill="#F3BB65" />
          <path d="M456 214l13-13 8 1 20-16m-13 0h13v13" fill="none" stroke="#FFDF9D" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </g>
    </svg>
    <span aria-hidden="true" className="ls-connection__node-label ls-connection__node-label--learner">Learners</span>
    <span aria-hidden="true" className="ls-connection__node-label ls-connection__node-label--institution">Institutions</span>
    <span aria-hidden="true" className="ls-connection__node-label ls-connection__node-label--industry">Industry</span>
    <span aria-hidden="true" className="ls-connection__node-label ls-connection__node-label--career">Careers</span>
    </div>
  );
}

export default function LeSuccessConnection({ interactive = false }) {
  const reduced = useReducedMotion();
  const rootRef = useRef(null);
  const [entered, setEntered] = useState(false);
  const [selected, setSelected] = useState(0);
  const id = useId();
  const area = AREAS[selected];

  useEffect(() => {
    if (reduced) return undefined;
    const root = rootRef.current;
    if (!root) return undefined;
    let visible = false;
    const updatePlayback = () => {
      root.style.setProperty("--ls-flow-play-state", visible && !document.hidden ? "running" : "paused");
    };
    const checkVisibility = () => {
      const rect = root.getBoundingClientRect();
      visible = rect.bottom > 0 && rect.top < window.innerHeight;
      if (visible) setEntered(true);
      updatePlayback();
    };
    const observer = typeof IntersectionObserver === "undefined" ? null : new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) {
        setEntered(true);
        if (interactive) observer.disconnect();
      }
      if (!interactive) updatePlayback();
    }, { threshold: 0.2 });
    observer?.observe(root);
    const frame = !observer ? window.requestAnimationFrame(checkVisibility) : null;
    if (!interactive) {
      document.addEventListener("visibilitychange", updatePlayback);
      if (!observer) {
        window.addEventListener("scroll", checkVisibility, { passive: true });
        window.addEventListener("resize", checkVisibility);
      }
    }
    return () => {
      observer?.disconnect();
      if (frame !== null) window.cancelAnimationFrame(frame);
      document.removeEventListener("visibilitychange", updatePlayback);
      window.removeEventListener("scroll", checkVisibility);
      window.removeEventListener("resize", checkVisibility);
    };
  }, [interactive, reduced]);

  return (
    <div ref={rootRef} className="ls-connection" data-ready={entered || reduced} data-focus={interactive ? area.key : "overview"}
      data-mode={interactive ? "interactive" : "overview"}
      tabIndex={!interactive && !reduced ? 0 : undefined}
      role={!interactive ? "group" : undefined}
      aria-label={!interactive ? (reduced ? "The LeSuccess connection" : "The LeSuccess connection. Focus here to pause the connection animation.") : undefined}
    >
      {interactive && <header className="ls-connection__heading">
        <span className="ls-connection__eyebrow"><span aria-hidden="true" /> THE LESUCCESS CONNECTION</span>
        <h3>Where learning meets opportunity.</h3>
      </header>}
      <ConnectionArtwork loop={!interactive} titleId={`${id}-art`} description={interactive ? area.illustration : "LeSuccess connects learners and institutions with industry and career opportunities through practical learning and guidance."} />
      {interactive && <>
        <div className="ls-connection__areas" role="group" aria-label="Explore the LeSuccess connection">
          {AREAS.map(({ key, label }, index) => <button key={key} type="button" aria-pressed={selected === index} aria-controls={`${id}-detail`} onClick={() => setSelected(index)}>{label}</button>)}
        </div>
        <div className="ls-connection__detail" id={`${id}-detail`} aria-live="polite" aria-atomic="true">
          <p className="ls-connection__title">{area.title}</p>
          <p className="ls-connection__description">{area.description}</p>
        </div>
      </>}
    </div>
  );
}
