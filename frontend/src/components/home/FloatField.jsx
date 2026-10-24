/**
 * A floating-label field (spec: docs/mockup/lower-home.html, .f). The label sits
 * inside the field and shrinks to the top once it has focus or a value, and a
 * brand underline draws in on focus. Reads correctly on light and on `.lh-dark`
 * bands. Styles: lower-home.css.
 *
 * `options` turns it into a select. Text inputs need the single-space
 * placeholder: `:placeholder-shown` is how the CSS knows the field is empty.
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
    return (
      <div className={`lh-f lh-f--select ${className}`}>
        <select id={id} {...inputProps}>
          <option value="">&nbsp;</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <label htmlFor={id}>{label}</label>
      </div>
    );
  }

  const Control = multiline ? "textarea" : "input";
  return (
    <div className={`lh-f ${className}`}>
      <Control id={id} type={multiline ? undefined : type} placeholder=" " {...inputProps} />
      <label htmlFor={id}>{label}</label>
    </div>
  );
}
