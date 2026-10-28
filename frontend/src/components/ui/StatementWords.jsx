const WORDS = ["Learn.", "Educate.", "Succeed."];

export default function StatementWords({ punctuation = true }) {
  return WORDS.map((word, i) => (
    <span key={word} aria-hidden="true">
      <span className="lh-sw" style={{ "--i": i }}>{punctuation ? word : word.replace(/\.$/, "")}</span>
      {i < WORDS.length - 1 ? " " : null}
    </span>
  ));
}
