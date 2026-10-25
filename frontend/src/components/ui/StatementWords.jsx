const WORDS = ["Learn.", "Educate.", "Succeed."];

export default function StatementWords() {
  return WORDS.map((word, i) => (
    <span key={word} aria-hidden="true">
      <span className="lh-sw" style={{ "--i": i }}>{word}</span>
      {i < WORDS.length - 1 ? " " : null}
    </span>
  ));
}
