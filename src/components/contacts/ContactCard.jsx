import { Badge } from "../ui/Badge";
import { Phone, Mail, Building2 } from "lucide-react";
import { TagBadge } from "./TagBadge";

const STATUS_BADGES = {
  new: { label: "Nuevo", variant: "primary" },
  contacted: { label: "Contactado", variant: "neutral" },
  qualified: { label: "Cualificado", variant: "warning" },
  customer: { label: "Cliente", variant: "success" },
  lost: { label: "Perdido", variant: "danger" },
};

export function ContactCard({ contact, onClick }) {
  const status = STATUS_BADGES[contact.status] || STATUS_BADGES.new;

  return (
    <div
      className="card"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClick?.()}
      style={{
        cursor: "pointer",
        padding: "var(--space-4)",
        transition: "box-shadow var(--transition-fast), border-color var(--transition-fast)",
        border: "1px solid var(--border-default)",
        borderRadius: "var(--radius-lg)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "var(--border-hover)";
        e.currentTarget.style.boxShadow = "var(--shadow-md)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "var(--border-default)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "var(--space-2)" }}>
        <div>
          <p style={{ fontWeight: "var(--font-weight-semibold)", fontSize: "var(--text-sm)", color: "var(--text-primary)" }}>
            {contact.name} {contact.surname || ""}
          </p>
          {contact.company && (
            <p style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)", display: "flex", alignItems: "center", gap: "var(--space-1)", marginTop: 2 }}>
              <Building2 size={12} />
              {contact.company}
            </p>
          )}
        </div>
        <Badge variant={status.variant} dot>{status.label}</Badge>
      </div>

      {/* Contact info */}
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-1)", marginTop: "var(--space-2)" }}>
        {contact.email && (
          <p style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "var(--space-1)" }}>
            <Mail size={12} style={{ color: "var(--text-tertiary)", flexShrink: 0 }} />
            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{contact.email}</span>
          </p>
        )}
        {contact.phone && (
          <p style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "var(--space-1)" }}>
            <Phone size={12} style={{ color: "var(--text-tertiary)", flexShrink: 0 }} />
            {contact.phone}
          </p>
        )}
      </div>

      {/* Tags */}
      {contact.tags?.length > 0 && (
        <div style={{ display: "flex", gap: "var(--space-1)", flexWrap: "wrap", marginTop: "var(--space-3)" }}>
          {contact.tags.slice(0, 3).map((tag) => (
            <TagBadge
              key={typeof tag === "string" ? tag : tag.id}
              name={typeof tag === "string" ? tag : tag.name}
              color={typeof tag === "string" ? undefined : tag.color}
            />
          ))}
          {contact.tags.length > 3 && (
            <span style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)", alignSelf: "center" }}>
              +{contact.tags.length - 3}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
