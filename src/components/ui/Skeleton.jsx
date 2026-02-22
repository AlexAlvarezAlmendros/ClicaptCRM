/**
 * Skeleton — Animated loading placeholder.
 *
 * Usage:
 *   <Skeleton width={200} height={20} />                    — single bar
 *   <Skeleton variant="circle" width={40} height={40} />    — circle (avatar)
 *   <Skeleton variant="card" />                              — full card skeleton
 *   <SkeletonList count={5} />                               — repeated rows
 */
export function Skeleton({ width, height = 16, variant = "text", borderRadius, className = "", style = {} }) {
  const baseStyle = {
    background: "var(--surface-secondary)",
    animation: "skeleton-pulse 1.5s ease-in-out infinite",
    ...style,
  };

  if (variant === "circle") {
    return (
      <div
        className={`skeleton ${className}`}
        style={{
          ...baseStyle,
          width: width || 40,
          height: height || 40,
          borderRadius: "50%",
          flexShrink: 0,
        }}
      />
    );
  }

  if (variant === "card") {
    return (
      <div
        className={`skeleton-card ${className}`}
        style={{
          padding: "var(--space-4)",
          borderRadius: "var(--radius-lg)",
          border: "1px solid var(--border-default)",
          ...style,
        }}
      >
        <div style={{ display: "flex", gap: "var(--space-3)", marginBottom: "var(--space-3)" }}>
          <Skeleton variant="circle" width={36} height={36} />
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
            <Skeleton width="60%" height={14} />
            <Skeleton width="40%" height={12} />
          </div>
        </div>
        <Skeleton width="100%" height={12} />
        <Skeleton width="80%" height={12} style={{ marginTop: 6 }} />
      </div>
    );
  }

  return (
    <div
      className={`skeleton ${className}`}
      style={{
        ...baseStyle,
        width: width || "100%",
        height,
        borderRadius: borderRadius || "var(--radius-sm)",
      }}
    />
  );
}

/**
 * SkeletonList — Renders N skeleton rows.
 */
export function SkeletonList({ count = 5, gap = "var(--space-3)", style = {} }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap, ...style }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
          <Skeleton variant="circle" width={32} height={32} />
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "var(--space-1)" }}>
            <Skeleton width={`${60 + Math.random() * 30}%`} height={14} />
            <Skeleton width={`${30 + Math.random() * 30}%`} height={10} />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * SkeletonTable — Table-like skeleton for list views.
 */
export function SkeletonTable({ rows = 5, cols = 4 }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
      {/* Header */}
      <div style={{ display: "flex", gap: "var(--space-4)", padding: "var(--space-3) var(--space-4)" }}>
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} height={12} width={`${100 / cols - 2}%`} />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, r) => (
        <div
          key={r}
          style={{
            display: "flex",
            gap: "var(--space-4)",
            padding: "var(--space-3) var(--space-4)",
            borderTop: "1px solid var(--border-subtle)",
          }}
        >
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton key={c} height={14} width={`${100 / cols - 2}%`} />
          ))}
        </div>
      ))}
    </div>
  );
}
