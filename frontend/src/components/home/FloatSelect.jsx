import Select from "../ui/Select.jsx";
import { onCourseLogoError } from "../../utils/imageUtils.js";

/**
 * The floating-label field's dropdown (FloatField renders this for `options`):
 * the site Select with the text-field look, the floating label after the
 * trigger, and the chosen course's logo beside its name.
 */
export default function FloatSelect({ id, label, options, value, onChange, className = "", ...rest }) {
  return (
    <div className={`lh-f lh-f--select ${className}`}>
      <Select
        id={id}
        value={value}
        onChange={onChange}
        options={options}
        searchLabel="courses"
        minPanelWidth={320}
        className={`lh-fs-trigger${options.some((o) => o.value === value) ? " has-value" : ""}`}
        chevronClassName="lh-fs-chev"
        aria-labelledby={`${id}-label ${id}`}
        data-cursor-text="Choose"
        renderValue={(selected) => (
          <span className="lh-fs-value">
            {selected?.icon && <img src={selected.icon} alt="" className="lh-fs-value-logo" onError={onCourseLogoError} />}
            <span className="truncate">{selected ? selected.label : " "}</span>
          </span>
        )}
        {...rest}
      />
      <label id={`${id}-label`} htmlFor={id}>
        {label}
      </label>
    </div>
  );
}
