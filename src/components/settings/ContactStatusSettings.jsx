import { useState, useEffect } from "react";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { Spinner } from "../ui/Spinner";
import { useToast } from "../ui/Toast";
import {
  useContactStatuses,
  useUpdateContactStatuses,
  useCreateContactStatus,
  useDeleteContactStatus,
} from "../../hooks/useContactStatuses";
import { StatusBadge } from "../contacts/StatusBadge";
import { Plus, Trash2 } from "lucide-react";

export function ContactStatusSettings() {
  const { data, isLoading } = useContactStatuses();
  const updateStatuses = useUpdateContactStatuses();
  const createStatus = useCreateContactStatus();
  const deleteStatus = useDeleteContactStatus();
  const { addToast } = useToast();

  const [statuses, setStatuses] = useState([]);
  const [dirty, setDirty] = useState(false);
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState("#6B7280");
  const [showAdd, setShowAdd] = useState(false);

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

  function moveStatus(from, to) {
    if (to < 0 || to >= statuses.length) return;
    setStatuses((prev) => {
      const next = [...prev];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
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

  async function handleAdd() {
    if (!newName.trim()) {
      addToast({ type: "error", message: "El nombre es obligatorio" });
      return;
    }
    try {
      await createStatus.mutateAsync({ name: newName.trim(), color: newColor });
      addToast({ type: "success", message: "Estado creado" });
      setNewName("");
      setNewColor("#6B7280");
      setShowAdd(false);
    } catch (err) {
      addToast({ type: "error", message: err.message || "Error al crear el estado" });
    }
  }

  async function handleDelete(value) {
    try {
      await deleteStatus.mutateAsync(value);
      addToast({ type: "success", message: "Estado eliminado" });
    } catch (err) {
      addToast({ type: "error", message: err.message || "Error al eliminar" });
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
              Personaliza los nombres, colores y orden. Los contactos con un estado eliminado mantendrán su valor hasta que lo cambies.
            </p>
          </div>
          <Button size="sm" variant="secondary" leftIcon={Plus} onClick={() => setShowAdd((v) => !v)}>
            Añadir estado
          </Button>
        </div>
      </Card.Header>
      <Card.Body>

        {/* Add form */}
        {showAdd && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--space-3)",
              padding: "var(--space-3)",
              marginBottom: "var(--space-3)",
              borderRadius: "var(--radius-md)",
              background: "var(--color-primary-50)",
              border: "1px solid var(--color-primary-200)",
            }}
          >
            <input
              type="color"
              value={newColor}
              onChange={(e) => setNewColor(e.target.value)}
              style={{ width: 32, height: 32, padding: 0, border: "none", borderRadius: "var(--radius-sm)", cursor: "pointer", flexShrink: 0 }}
            />
            <input
              autoFocus
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleAdd(); if (e.key === "Escape") setShowAdd(false); }}
              placeholder="Nombre del nuevo estado"
              style={{
                flex: 1,
                padding: "var(--space-2) var(--space-3)",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border-default)",
                background: "var(--surface-primary)",
                fontSize: "var(--text-sm)",
                color: "var(--text-primary)",
              }}
            />
            <StatusBadge value="_preview" statuses={[{ value: "_preview", name: newName || "Vista previa", color: newColor }]} />
            <Button size="sm" onClick={handleAdd} isLoading={createStatus.isPending} disabled={!newName.trim()}>
              Crear
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setShowAdd(false)}>
              Cancelar
            </Button>
          </div>
        )}

        {/* Status list */}
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
              {/* Reorder */}
              <div style={{ display: "flex", flexDirection: "column", gap: 2, flexShrink: 0 }}>
                <button
                  onClick={() => moveStatus(i, i - 1)}
                  disabled={i === 0}
                  style={{ all: "unset", cursor: i === 0 ? "default" : "pointer", fontSize: 10, color: "var(--text-tertiary)", lineHeight: 1, opacity: i === 0 ? 0.3 : 1 }}
                >▲</button>
                <button
                  onClick={() => moveStatus(i, i + 1)}
                  disabled={i === statuses.length - 1}
                  style={{ all: "unset", cursor: i === statuses.length - 1 ? "default" : "pointer", fontSize: 10, color: "var(--text-tertiary)", lineHeight: 1, opacity: i === statuses.length - 1 ? 0.3 : 1 }}
                >▼</button>
              </div>

              {/* Color picker */}
              <input
                type="color"
                value={status.color || "#6B7280"}
                onChange={(e) => handleChange(i, "color", e.target.value)}
                style={{ width: 32, height: 32, padding: 0, border: "none", borderRadius: "var(--radius-sm)", cursor: "pointer", flexShrink: 0 }}
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

              {/* Internal value (read-only slug) */}
              <span style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)", fontFamily: "monospace", background: "var(--surface-tertiary)", padding: "2px 8px", borderRadius: "var(--radius-sm)", flexShrink: 0 }}>
                {status.value}
              </span>

              {/* Live preview */}
              <StatusBadge value={status.value} statuses={statuses} />

              {/* Delete */}
              <button
                onClick={() => handleDelete(status.value)}
                disabled={deleteStatus.isPending || statuses.length <= 1}
                title={statuses.length <= 1 ? "Debe haber al menos un estado" : "Eliminar estado"}
                style={{
                  all: "unset",
                  cursor: statuses.length <= 1 ? "not-allowed" : "pointer",
                  color: "var(--color-danger-500)",
                  opacity: statuses.length <= 1 ? 0.3 : 1,
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <Trash2 size={15} />
              </button>
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
