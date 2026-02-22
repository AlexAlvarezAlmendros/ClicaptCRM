import { X } from "lucide-react";

export function TagBadge({ name, color = "var(--color-primary-500)", onRemove }) {
  return (
    <span
      className="tag-badge"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "var(--space-1)",
        padding: "2px var(--space-2)",
        borderRadius: "var(--radius-full)",
        fontSize: "var(--text-xs)",
        fontWeight: "var(--font-weight-medium)",
        background: color + "18",
        color: color,
        border: `1px solid ${color}30`,
        lineHeight: "var(--leading-normal)",
        whiteSpace: "nowrap",
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: color,
          flexShrink: 0,
        }}
      />
      {name}
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          style={{
            background: "none",
            border: "none",
            padding: 0,
            cursor: "pointer",
            color: "inherit",
            display: "flex",
            alignItems: "center",
            opacity: 0.7,
          }}
          aria-label={`Eliminar etiqueta ${name}`}
        >
          <X size={12} />
        </button>
      )}
    </span>
  );
}
