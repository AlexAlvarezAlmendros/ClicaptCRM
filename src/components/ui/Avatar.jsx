export function Avatar({ src, name = "", size = 40, className = "" }) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={className}
        style={{
          width: size,
          height: size,
          borderRadius: "var(--radius-full)",
          objectFit: "cover",
        }}
      />
    );
  }

  return (
    <div
      className={className}
      title={name}
      style={{
        width: size,
        height: size,
        borderRadius: "var(--radius-full)",
        background: "var(--color-primary-100)",
        color: "var(--color-primary-700)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.4,
        fontWeight: "var(--font-weight-semibold)",
        flexShrink: 0,
      }}
    >
      {initials || "?"}
    </div>
  );
}
