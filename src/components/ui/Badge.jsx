export function Badge({ children, variant = "neutral", dot = false, className = "" }) {
  return (
    <span className={`badge badge--${variant} ${className}`}>
      {dot && <span className="badge__dot" />}
      {children}
    </span>
  );
}
