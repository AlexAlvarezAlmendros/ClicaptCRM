import { useState, useEffect } from "react";
import { Card } from "../ui/Card";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { Spinner } from "../ui/Spinner";
import { useToast } from "../ui/Toast";
import { usePipelineStages, useUpdatePipelineStages } from "../../hooks/usePipelineStages";
import { Plus, Trash2, GripVertical, Trophy, XCircle } from "lucide-react";

export function PipelineSettings() {
  const { data, isLoading } = usePipelineStages();
  const updateStages = useUpdatePipelineStages();
  const { addToast } = useToast();

  const [stages, setStages] = useState([]);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (data?.data) {
      setStages(data.data.map((s) => ({ ...s })));
      setDirty(false);
    }
  }, [data]);

  function handleFieldChange(index, field, value) {
    setStages((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
    setDirty(true);
  }

  function addStage() {
    setStages((prev) => [
      ...prev,
      {
        id: null,
        name: "",
        color: "#3B82F6",
        probability: 0,
        position: prev.length + 1,
        is_won: 0,
        is_lost: 0,
      },
    ]);
    setDirty(true);
  }

  function removeStage(index) {
    setStages((prev) => prev.filter((_, i) => i !== index).map((s, i) => ({ ...s, position: i + 1 })));
    setDirty(true);
  }

  function moveStage(from, to) {
    if (to < 0 || to >= stages.length) return;
    setStages((prev) => {
      const next = [...prev];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next.map((s, i) => ({ ...s, position: i + 1 }));
    });
    setDirty(true);
  }

  async function handleSave() {
    // Validate
    for (const s of stages) {
      if (!s.name.trim()) {
        addToast({ type: "error", message: "Todas las etapas necesitan nombre" });
        return;
      }
    }

    try {
      await updateStages.mutateAsync(stages);
      addToast({ type: "success", message: "Etapas actualizadas" });
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
          <Card.Title>Etapas del pipeline</Card.Title>
          <Button size="sm" leftIcon={Plus} variant="secondary" onClick={addStage}>
            Añadir etapa
          </Button>
        </div>
      </Card.Header>
      <Card.Body>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
          {stages.map((stage, i) => (
            <div
              key={stage.id || `new-${i}`}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--space-2)",
                padding: "var(--space-3)",
                borderRadius: "var(--radius-md)",
                background: "var(--surface-secondary)",
              }}
            >
              {/* Reorder buttons */}
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <button
                  onClick={() => moveStage(i, i - 1)}
                  disabled={i === 0}
                  style={{ all: "unset", cursor: i === 0 ? "default" : "pointer", fontSize: 10, color: "var(--text-tertiary)", lineHeight: 1 }}
                >
                  ▲
                </button>
                <button
                  onClick={() => moveStage(i, i + 1)}
                  disabled={i === stages.length - 1}
                  style={{ all: "unset", cursor: i === stages.length - 1 ? "default" : "pointer", fontSize: 10, color: "var(--text-tertiary)", lineHeight: 1 }}
                >
                  ▼
                </button>
              </div>

              {/* Color picker */}
              <input
                type="color"
                value={stage.color || "#3B82F6"}
                onChange={(e) => handleFieldChange(i, "color", e.target.value)}
                style={{ width: 28, height: 28, padding: 0, border: "none", borderRadius: "var(--radius-sm)", cursor: "pointer" }}
              />

              {/* Name */}
              <input
                type="text"
                value={stage.name}
                onChange={(e) => handleFieldChange(i, "name", e.target.value)}
                placeholder="Nombre de etapa"
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

              {/* Probability */}
              <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={stage.probability ?? 0}
                  onChange={(e) => handleFieldChange(i, "probability", Number(e.target.value))}
                  style={{
                    width: 56,
                    padding: "var(--space-2)",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--border-default)",
                    background: "var(--surface-primary)",
                    fontSize: "var(--text-xs)",
                    color: "var(--text-primary)",
                    textAlign: "center",
                  }}
                />
                <span style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)" }}>%</span>
              </div>

              {/* Flags */}
              <button
                onClick={() => handleFieldChange(i, "is_won", stage.is_won ? 0 : 1)}
                title="Etapa ganada"
                style={{
                  all: "unset",
                  cursor: "pointer",
                  color: stage.is_won ? "var(--color-success-500)" : "var(--text-tertiary)",
                  display: "flex",
                }}
              >
                <Trophy size={16} />
              </button>
              <button
                onClick={() => handleFieldChange(i, "is_lost", stage.is_lost ? 0 : 1)}
                title="Etapa perdida"
                style={{
                  all: "unset",
                  cursor: "pointer",
                  color: stage.is_lost ? "var(--color-danger-500)" : "var(--text-tertiary)",
                  display: "flex",
                }}
              >
                <XCircle size={16} />
              </button>

              {/* Delete */}
              <button
                onClick={() => removeStage(i)}
                style={{ all: "unset", cursor: "pointer", color: "var(--text-tertiary)", display: "flex" }}
                title="Eliminar etapa"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>

        {dirty && (
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "var(--space-4)" }}>
            <Button onClick={handleSave} isLoading={updateStages.isPending}>
              Guardar cambios
            </Button>
          </div>
        )}
      </Card.Body>
    </Card>
  );
}
