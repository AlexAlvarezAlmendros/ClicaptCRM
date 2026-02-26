import { useState } from "react";
import { useGroups, useCreateGroup, useUpdateGroup, useDeleteGroup } from "../../hooks/useGroups";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Spinner } from "../ui/Spinner";
import { Badge } from "../ui/Badge";
import { ConfirmDialog } from "../ui/ConfirmDialog";
import { useToast } from "../ui/Toast";
import { Plus, Pencil, Trash2, FolderOpen, Users, Check, X } from "lucide-react";

const GROUP_COLORS = [
  "#3B82F6", // blue
  "#10B981", // green
  "#F59E0B", // amber
  "#EF4444", // red
  "#8B5CF6", // violet
  "#EC4899", // pink
  "#06B6D4", // cyan
  "#F97316", // orange
  "#6B7280", // gray
  "#14B8A6", // teal
];

export function GroupSettings() {
  const { data, isLoading } = useGroups();
  const createGroup = useCreateGroup();
  const updateGroup = useUpdateGroup();
  const deleteGroup = useDeleteGroup();
  const { addToast } = useToast();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: "", color: "#3B82F6", description: "" });
  const [deleteId, setDeleteId] = useState(null);

  const groups = data?.data || [];

  function resetForm() {
    setForm({ name: "", color: "#3B82F6", description: "" });
    setEditingId(null);
    setShowForm(false);
  }

  function startEdit(group) {
    setForm({ name: group.name, color: group.color, description: group.description || "" });
    setEditingId(group.id);
    setShowForm(true);
  }

  async function handleSave() {
    if (!form.name.trim()) {
      addToast({ type: "error", message: "El nombre del grupo es obligatorio" });
      return;
    }

    try {
      if (editingId) {
        await updateGroup.mutateAsync({ id: editingId, ...form });
        addToast({ type: "success", message: "Grupo actualizado" });
      } else {
        await createGroup.mutateAsync(form);
        addToast({ type: "success", message: "Grupo creado" });
      }
      resetForm();
    } catch (err) {
      addToast({ type: "error", message: err.message || "Error al guardar" });
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    try {
      await deleteGroup.mutateAsync(deleteId);
      addToast({ type: "success", message: "Grupo eliminado" });
    } catch (err) {
      addToast({ type: "error", message: err.message || "Error al eliminar" });
    }
    setDeleteId(null);
  }

  if (isLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "var(--space-10)" }}>
        <Spinner size={28} />
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-5)" }}>
        <div>
          <h2 className="text-h2">Grupos de contactos</h2>
          <p style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)", marginTop: "var(--space-1)" }}>
            Organiza tus contactos en grupos por tipo de empresa, sector o cualquier criterio.
          </p>
        </div>
        {!showForm && (
          <Button leftIcon={Plus} size="sm" onClick={() => setShowForm(true)}>
            Nuevo grupo
          </Button>
        )}
      </div>

      {/* Create / Edit form */}
      {showForm && (
        <div
          className="card"
          style={{
            padding: "var(--space-4)",
            marginBottom: "var(--space-4)",
            border: "1px solid var(--color-primary-200)",
            background: "var(--color-primary-50)",
          }}
        >
          <div style={{ display: "flex", gap: "var(--space-3)", flexWrap: "wrap", alignItems: "flex-end" }}>
            <div style={{ flex: 1, minWidth: 180 }}>
              <Input
                label="Nombre del grupo"
                placeholder="Ej: Inmobiliarias"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                required
              />
            </div>
            <div style={{ flex: 1, minWidth: 180 }}>
              <Input
                label="Descripción (opcional)"
                placeholder="Ej: Empresas del sector inmobiliario"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
            </div>
          </div>

          {/* Color picker */}
          <div style={{ marginTop: "var(--space-3)" }}>
            <label className="input-label" style={{ marginBottom: "var(--space-2)", display: "block" }}>Color</label>
            <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap" }}>
              {GROUP_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, color: c }))}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    background: c,
                    border: form.color === c ? "2px solid var(--text-primary)" : "2px solid transparent",
                    outline: form.color === c ? "2px solid var(--surface-primary)" : "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all var(--transition-fast)",
                  }}
                  aria-label={`Color ${c}`}
                >
                  {form.color === c && <Check size={14} style={{ color: "#fff" }} />}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", gap: "var(--space-2)", marginTop: "var(--space-4)" }}>
            <Button
              size="sm"
              onClick={handleSave}
              isLoading={createGroup.isPending || updateGroup.isPending}
            >
              {editingId ? "Guardar cambios" : "Crear grupo"}
            </Button>
            <Button variant="ghost" size="sm" onClick={resetForm}>
              Cancelar
            </Button>
          </div>
        </div>
      )}

      {/* Groups list */}
      {groups.length === 0 && !showForm ? (
        <div
          className="card"
          style={{
            padding: "var(--space-8)",
            textAlign: "center",
          }}
        >
          <FolderOpen
            size={40}
            style={{ color: "var(--text-tertiary)", margin: "0 auto var(--space-3)" }}
          />
          <p style={{ fontWeight: "var(--font-weight-medium)", marginBottom: "var(--space-1)" }}>
            Sin grupos
          </p>
          <p style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)", marginBottom: "var(--space-4)" }}>
            Crea grupos para organizar tus contactos por tipo de empresa, sector, etc.
          </p>
          <Button leftIcon={Plus} size="sm" onClick={() => setShowForm(true)}>
            Crear primer grupo
          </Button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
          {groups.map((group) => (
            <div
              key={group.id}
              className="card"
              style={{
                padding: "var(--space-3) var(--space-4)",
                display: "flex",
                alignItems: "center",
                gap: "var(--space-3)",
              }}
            >
              {/* Color dot */}
              <div
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  background: group.color,
                  flexShrink: 0,
                }}
              />

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: "var(--font-weight-medium)", fontSize: "var(--text-sm)" }}>
                  {group.name}
                </div>
                {group.description && (
                  <div style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)", marginTop: 1 }}>
                    {group.description}
                  </div>
                )}
              </div>

              {/* Contact count */}
              <Badge variant="neutral" style={{ flexShrink: 0 }}>
                <Users size={12} style={{ marginRight: 4 }} />
                {group.contact_count || 0}
              </Badge>

              {/* Actions */}
              <div style={{ display: "flex", gap: "var(--space-1)" }}>
                <Button variant="ghost" size="sm" iconOnly onClick={() => startEdit(group)} aria-label="Editar grupo">
                  <Pencil size={14} />
                </Button>
                <Button variant="ghost" size="sm" iconOnly onClick={() => setDeleteId(group.id)} aria-label="Eliminar grupo">
                  <Trash2 size={14} style={{ color: "var(--color-danger-500)" }} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete confirmation */}
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Eliminar grupo"
        message="Se eliminará el grupo. Los contactos de este grupo no se borrarán, pero perderán la asignación de grupo."
        confirmText="Eliminar"
        variant="danger"
      />
    </div>
  );
}
