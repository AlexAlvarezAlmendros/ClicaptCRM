export function EmptyState({ icon: Icon, title, description, action, className = "" }) {
  return (
    <div
      className={className}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "var(--space-12) var(--space-6)",
        textAlign: "center",
      }}
    >
      {Icon && (
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: "var(--radius-2xl)",
            background: "var(--surface-secondary)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--text-tertiary)",
            marginBottom: "var(--space-4)",
          }}
        >
          <Icon size={32} />
        </div>
      )}
      <h3
        style={{
          fontSize: "var(--text-lg)",
          fontWeight: "var(--font-weight-semibold)",
          color: "var(--text-primary)",
          marginBottom: "var(--space-2)",
        }}
      >
        {title}
      </h3>
      {description && (
        <p
          style={{
            fontSize: "var(--text-sm)",
            color: "var(--text-secondary)",
            maxWidth: 360,
            marginBottom: action ? "var(--space-6)" : 0,
          }}
        >
          {description}
        </p>
      )}
      {action}
    </div>
  );
}
