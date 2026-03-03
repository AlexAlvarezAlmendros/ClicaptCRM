import { useState, useEffect } from "react";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { Spinner } from "../ui/Spinner";
import { useToast } from "../ui/Toast";
import { useContactStatuses, useUpdateContactStatuses } from "../../hooks/useContactStatuses";
import { StatusBadge } from "../contacts/StatusBadge";

export function ContactStatusSettings() {
  const { data, isLoading } = useContactStatuses();
  const updateStatuses = useUpdateContactStatuses();
  const { addToast } = useToast();

  const [statuses, setStatuses] = useState([]);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (data) {
      setStatuses(data.map((s) => ({ ...s })));
      setDirty(false);
    }
  }, [data]);

  function handleChange(index, field, value) {
    setStatuses((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
    setDirty(true);
  }

  async function handleSave() {
    for (const s of statuses) {
      if (!s.name.trim()) {
        addToast({ type: "error", message: "Todos los estados necesitan nombre" });
        return;
      }
    }
    try {
      await updateStatuses.mutateAsync(statuses);
      addToast({ type: "success", message: "Estados actualizados" });
      setDirty(false);
    } catch (err) {
      addToast({ type: "error", message: err.message || "Error al guardar" });
    }
  }

  if (isLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "var(--space-8)" }}>
        <Spinner size={24} />
      </div>
    );
  }

  return (
    <Card>
      <Card.Header>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
          <div>
            <Card.Title>Estados de contacto</Card.Title>
            <p style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)", marginTop: "var(--space-1)" }}>
              Personaliza los nombres y colores de los estados. Los valores internos no cambian.
            </p>
          </div>
        </div>
      </Card.Header>
      <Card.Body>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
          {statuses.map((status, i) => (
            <div
              key={status.id || status.value}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--space-3)",
                padding: "var(--space-3)",
                borderRadius: "var(--radius-md)",
                background: "var(--surface-secondary)",
              }}
            >
              {/* Color picker */}
              <input
                type="color"
                value={status.color || "#6B7280"}
                onChange={(e) => handleChange(i, "color", e.target.value)}
                style={{
                  width: 32,
                  height: 32,
                  padding: 0,
                  border: "none",
                  borderRadius: "var(--radius-sm)",
                  cursor: "pointer",
                  flexShrink: 0,
                }}
              />

              {/* Name input */}
              <input
                type="text"
                value={status.name}
                onChange={(e) => handleChange(i, "name", e.target.value)}
                placeholder="Nombre del estado"
                style={{
                  flex: 1,
                  padding: "var(--space-2) var(--space-3)",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border-default)",
                  background: "var(--surface-primary)",
                  fontSize: "var(--text-sm)",
                  color: "var(--text-primary)",
                  minWidth: 0,
                }}
              />

              {/* Internal value (read-only) */}
              <span
                style={{
                  fontSize: "var(--text-xs)",
                  color: "var(--text-tertiary)",
                  fontFamily: "monospace",
                  background: "var(--surface-tertiary)",
                  padding: "2px 8px",
                  borderRadius: "var(--radius-sm)",
                  flexShrink: 0,
                }}
              >
                {status.value}
              </span>

              {/* Live preview */}
              <StatusBadge value={status.value} statuses={statuses} />
            </div>
          ))}
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "var(--space-4)" }}>
          <Button
            onClick={handleSave}
            disabled={!dirty || updateStatuses.isPending}
            isLoading={updateStatuses.isPending}
          >
            Guardar cambios
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
}
