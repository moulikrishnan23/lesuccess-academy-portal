import FloatSelect from "./FloatSelect.jsx";

/**
 * A floating-label field (spec: docs/mockup/lower-home.html, .f). The label sits
 * inside the field and shrinks to the top once it has focus or a value, and a
 * brand underline draws in on focus. Reads correctly on light and on `.lh-dark`
 * bands. Styles: lower-home.css.
 *
 * `options` turns it into a dropdown (FloatSelect): `{ value, label, icon?,
 * hint? }` each. Text inputs need the single-space placeholder:
 * `:placeholder-shown` is how the CSS knows the field is empty.
 */
export default function FloatField({
  id,
  label,
  type = "text",
  options,
  multiline = false,
  className = "",
  ...inputProps
}) {
  if (options) {
    return <FloatSelect id={id} label={label} options={options} className={className} {...inputProps} />;
  }

  const Control = multiline ? "textarea" : "input";
  return (
    <div className={`lh-f ${className}`}>
      <Control id={id} type={multiline ? undefined : type} placeholder=" " {...inputProps} />
      <label htmlFor={id}>{label}</label>
    </div>
  );
}
