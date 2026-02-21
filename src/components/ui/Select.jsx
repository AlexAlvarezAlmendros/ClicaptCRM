import { forwardRef } from "react";
import { ChevronDown } from "lucide-react";

export const Select = forwardRef(function Select(
  { label, error, required = false, options = [], placeholder, className = "", id, ...props },
  ref
) {
  const selectId = id || props.name;

  return (
    <div className={`input-wrapper ${className}`}>
      {label && (
        <label
          htmlFor={selectId}
          className={`input-label ${required ? "input-label--required" : ""}`}
        >
          {label}
        </label>
      )}
      <div className="input-icon-wrapper" style={{ position: "relative" }}>
        <select
          ref={ref}
          id={selectId}
          className={`input ${error ? "input--error" : ""}`}
          style={{ appearance: "none", paddingRight: "var(--space-10)" }}
          aria-invalid={!!error}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={18}
          style={{
            position: "absolute",
            right: "var(--space-3)",
            top: "50%",
            transform: "translateY(-50%)",
            color: "var(--text-tertiary)",
            pointerEvents: "none",
          }}
        />
      </div>
      {error && (
        <span className="input-error-text" role="alert">{error}</span>
      )}
    </div>
  );
});
