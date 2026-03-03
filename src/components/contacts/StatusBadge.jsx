// CliCapt CRM — StatusBadge — renders a contact status with dynamic color

import { findStatus } from "../../hooks/useContactStatuses";

/**
 * @param {{ value: string, statuses: Array, dot?: boolean, style?: object }} props
 */
export function StatusBadge({ value, statuses = [], dot = false, style = {} }) {
  const s = findStatus(statuses, value);
  const color = s.color || "#6B7280";

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        padding: "2px 10px",
        borderRadius: 9999,
        fontSize: "var(--text-xs)",
        fontWeight: "var(--font-weight-medium)",
        background: color + "1a",
        color: color,
        border: `1px solid ${color}33`,
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      {dot && (
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: color,
            flexShrink: 0,
          }}
        />
      )}
      {s.name}
    </span>
  );
}
