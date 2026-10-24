const PHRASES = [
  "Live hands-on projects",
  "Mentor-led classes",
  "Placement support",
  "Mock interviews",
  "Offline & online",
  "Interview opportunities",
];

// Two copies make the -50% loop seamless; four fill wide screens.
const TRACK = [...PHRASES, ...PHRASES, ...PHRASES, ...PHRASES];

/**
 * A skewed brand-gradient ticker between the demo band and the course carousel
 * (spec: docs/mockup/lower-home.html, .tick). Decorative: every phrase is said
 * elsewhere on the page, so it is hidden from screen readers.
 */
export default function HomeTicker() {
  return (
    <div className="lh-tick" aria-hidden="true">
      <div className="lh-tick-track">
        {TRACK.map((phrase, i) => (
          <span key={i}>{phrase}</span>
        ))}
      </div>
    </div>
  );
}
