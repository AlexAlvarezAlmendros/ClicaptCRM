import { forwardRef } from "react";

export const Input = forwardRef(function Input(
  {
    label,
    error,
    helpText,
    required = false,
    icon: Icon,
    className = "",
    id,
    ...props
  },
  ref
) {
  const inputId = id || props.name;

  return (
    <div className={`input-wrapper ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className={`input-label ${required ? "input-label--required" : ""}`}
        >
          {label}
        </label>
      )}

      <div className={Icon ? "input-icon-wrapper" : ""}>
        {Icon && <Icon size={18} className="input-icon" />}
        <input
          ref={ref}
          id={inputId}
          className={`input ${error ? "input--error" : ""}`}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
          {...props}
        />
      </div>

      {error && (
        <span id={`${inputId}-error`} className="input-error-text" role="alert">
          {error}
        </span>
      )}
      {helpText && !error && (
        <span className="input-help-text">{helpText}</span>
      )}
    </div>
  );
});

export const Textarea = forwardRef(function Textarea(
  { label, error, helpText, required = false, className = "", id, ...props },
  ref
) {
  const inputId = id || props.name;

  return (
    <div className={`input-wrapper ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className={`input-label ${required ? "input-label--required" : ""}`}
        >
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={inputId}
        className={`input textarea ${error ? "input--error" : ""}`}
        aria-invalid={!!error}
        {...props}
      />
      {error && (
        <span className="input-error-text" role="alert">{error}</span>
      )}
      {helpText && !error && (
        <span className="input-help-text">{helpText}</span>
      )}
    </div>
  );
});
