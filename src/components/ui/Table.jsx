export function Table({ children, className = "" }) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table
        className={className}
        style={{
          width: "100%",
          borderCollapse: "collapse",
          fontSize: "var(--text-sm)",
        }}
      >
        {children}
      </table>
    </div>
  );
}

Table.Head = function TableHead({ children }) {
  return (
    <thead
      style={{
        background: "var(--surface-secondary)",
        borderBottom: "1px solid var(--border-default)",
      }}
    >
      {children}
    </thead>
  );
};

Table.Body = function TableBody({ children }) {
  return <tbody>{children}</tbody>;
};

Table.Row = function TableRow({ children, onClick, className = "" }) {
  return (
    <tr
      className={className}
      onClick={onClick}
      style={{
        borderBottom: "1px solid var(--border-default)",
        cursor: onClick ? "pointer" : "default",
        transition: "background var(--transition-fast)",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface-secondary)")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "")}
    >
      {children}
    </tr>
  );
};

Table.Th = function TableTh({ children, className = "", ...props }) {
  return (
    <th
      className={className}
      style={{
        padding: "var(--space-3) var(--space-4)",
        textAlign: "left",
        fontWeight: "var(--font-weight-medium)",
        color: "var(--text-secondary)",
        fontSize: "var(--text-xs)",
        textTransform: "uppercase",
        letterSpacing: "0.05em",
        whiteSpace: "nowrap",
      }}
      {...props}
    >
      {children}
    </th>
  );
};

Table.Td = function TableTd({ children, className = "", ...props }) {
  return (
    <td
      className={className}
      style={{
        padding: "var(--space-3) var(--space-4)",
        color: "var(--text-primary)",
        whiteSpace: "nowrap",
      }}
      {...props}
    >
      {children}
    </td>
  );
};
