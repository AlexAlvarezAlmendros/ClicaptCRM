import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGroups, useCreateGroup, useUpdateGroup, useDeleteGroup } from "../hooks/useGroups";
import { useFiltersStore } from "../stores/filtersStore";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Spinner } from "../components/ui/Spinner";
import { useToast } from "../components/ui/Toast";
import { formatCurrency } from "../lib/formatters";
import {
  Users, Kanban, DollarSign, ClipboardList, Plus,
  FolderOpen, Pencil, Trash2, ArrowRight, Check, X, AlertTriangle,
} from "lucide-react";

/* ─── Color palette for new groups ─── */
const GROUP_COLORS = [
  "#F97316", "#10B981", "#F59E0B", "#EF4444",
  "#8B5CF6", "#EC4899", "#06B6D4", "#14B8A6", "#6B7280",
];

/* ─── Delete modal ─── */
function DeleteGroupModal({ group, onClose, onConfirm, isLoading }) {
  const [mode, setMode] = useState("group"); // "group" | "all"

  if (!group) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-modal-title"
      style={{
        position: "fixed", inset: 0, zIndex: "var(--z-modal)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "var(--space-4)",
      }}
    >
      {/* Overlay */}
      <div
        style={{
          position: "absolute", inset: 0,
          background: "var(--surface-overlay)",
          backdropFilter: "blur(4px)",
        }}
        onClick={onClose}
      />

      {/* Dialog */}
      <div
        className="card"
        style={{
          position: "relative", zIndex: 1,
          width: "100%", maxWidth: 460,
          padding: "var(--space-6)",
          boxShadow: "var(--shadow-xl)",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: "var(--space-3)", marginBottom: "var(--space-5)" }}>
          <div
            style={{
              flexShrink: 0, width: 40, height: 40, borderRadius: "var(--radius-full)",
              background: "var(--color-danger-50)", display: "flex",
              alignItems: "center", justifyContent: "center",
            }}
          >
            <AlertTriangle size={20} style={{ color: "var(--color-danger-500)" }} />
          </div>
          <div>
            <h2
              id="delete-modal-title"
              className="text-h2"
              style={{ marginBottom: "var(--space-1)" }}
            >
              Eliminar &ldquo;{group.name}&rdquo;
            </h2>
            <p style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)" }}>
              Elige qué quieres hacer con los{" "}
              <strong>{group.contact_count || 0} contacto{group.contact_count !== 1 ? "s" : ""}</strong>{" "}
              que pertenecen a este grupo.
            </p>
          </div>
        </div>

        {/* Options */}
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)", marginBottom: "var(--space-6)" }}>
          {/* Option 1: group only */}
          <label
            style={{
              display: "flex", alignItems: "flex-start", gap: "var(--space-3)",
              padding: "var(--space-3) var(--space-4)",
              borderRadius: "var(--radius-lg)",
              border: `2px solid ${mode === "group" ? "var(--color-primary-500)" : "var(--border-default)"}`,
              background: mode === "group" ? "var(--color-primary-50)" : "var(--surface-primary)",
              cursor: "pointer",
              transition: "all var(--transition-fast)",
            }}
          >
            <input
              type="radio"
              name="delete_mode"
              value="group"
              checked={mode === "group"}
              onChange={() => setMode("group")}
              style={{ marginTop: 2, accentColor: "var(--color-primary-500)" }}
            />
            <div>
              <div style={{ fontWeight: "var(--font-weight-semibold)", fontSize: "var(--text-sm)" }}>
                Eliminar solo el grupo
              </div>
              <div style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)", marginTop: 2 }}>
                Los contactos <strong>se conservan</strong> pero pierden la asignación de grupo.
              </div>
            </div>
          </label>

          {/* Option 2: group + contacts */}
          <label
            style={{
              display: "flex", alignItems: "flex-start", gap: "var(--space-3)",
              padding: "var(--space-3) var(--space-4)",
              borderRadius: "var(--radius-lg)",
              border: `2px solid ${mode === "all" ? "var(--color-danger-500)" : "var(--border-default)"}`,
              background: mode === "all" ? "var(--color-danger-50)" : "var(--surface-primary)",
              cursor: "pointer",
              transition: "all var(--transition-fast)",
            }}
          >
            <input
              type="radio"
              name="delete_mode"
              value="all"
              checked={mode === "all"}
              onChange={() => setMode("all")}
              style={{ marginTop: 2, accentColor: "var(--color-danger-500)" }}
            />
            <div>
              <div style={{ fontWeight: "var(--font-weight-semibold)", fontSize: "var(--text-sm)", color: "var(--color-danger-600)" }}>
                Eliminar grupo y todos sus contactos
              </div>
              <div style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)", marginTop: 2 }}>
                Se eliminarán permanentemente <strong>{group.contact_count || 0} contacto{group.contact_count !== 1 ? "s" : ""}</strong> junto con sus deals, tareas y actividades.
              </div>
            </div>
          </label>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: "var(--space-2)", justifyContent: "flex-end" }}>
          <Button variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button
            variant={mode === "all" ? "danger" : "primary"}
            onClick={() => onConfirm(mode === "all")}
            isLoading={isLoading}
          >
            {mode === "all" ? "Eliminar grupo y contactos" : "Eliminar grupo"}
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ─── Group form (create / edit) ─── */
function GroupForm({ initial, onSave, onCancel, isPending }) {
  const [form, setForm] = useState(
    initial || { name: "", color: "#F97316", description: "" }
  );

  return (
    <div
      className="card"
      style={{
        padding: "var(--space-5)",
        marginBottom: "var(--space-6)",
        border: "2px solid var(--color-primary-200)",
        background: "var(--color-primary-50)",
      }}
    >
      <h3 className="text-h3" style={{ marginBottom: "var(--space-4)" }}>
        {initial ? "Editar grupo" : "Nuevo grupo"}
      </h3>

      <div style={{ display: "flex", gap: "var(--space-4)", flexWrap: "wrap", marginBottom: "var(--space-4)" }}>
        <div style={{ flex: "1 1 200px" }}>
          <Input
            label="Nombre"
            placeholder="Ej: Inmobiliarias"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            required
            autoFocus
          />
        </div>
        <div style={{ flex: "2 1 280px" }}>
          <Input
            label="Descripción (opcional)"
            placeholder="Ej: Empresas del sector inmobiliario"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          />
        </div>
      </div>

      {/* Color picker */}
      <div style={{ marginBottom: "var(--space-4)" }}>
        <label className="input-label" style={{ display: "block", marginBottom: "var(--space-2)" }}>Color</label>
        <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap" }}>
          {GROUP_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setForm((f) => ({ ...f, color: c }))}
              style={{
                width: 30, height: 30, borderRadius: "50%", background: c,
                border: form.color === c ? "3px solid var(--text-primary)" : "2px solid transparent",
                outline: form.color === c ? "2px solid var(--surface-app)" : "none",
                cursor: "pointer", flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all var(--transition-fast)",
              }}
              aria-label={`Color ${c}`}
            >
              {form.color === c && <Check size={14} color="#fff" />}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", gap: "var(--space-2)" }}>
        <Button size="sm" onClick={() => onSave(form)} isLoading={isPending}>
          {initial ? "Guardar cambios" : "Crear grupo"}
        </Button>
        <Button variant="ghost" size="sm" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </div>
  );
}

/* ─── KPI chip ─── */
function Kpi({ icon: Icon, label, value, color }) {
  return (
    <div
      style={{
        display: "flex", alignItems: "center", gap: "var(--space-1-5)",
        padding: "var(--space-1-5) var(--space-2-5, 10px)",
        background: "var(--surface-secondary)",
        borderRadius: "var(--radius-md)",
        fontSize: "var(--text-xs)",
        color: color || "var(--text-secondary)",
      }}
    >
      <Icon size={13} style={{ flexShrink: 0 }} />
      <span style={{ fontWeight: "var(--font-weight-semibold)", color: "var(--text-primary)" }}>{value}</span>
      <span>{label}</span>
    </div>
  );
}

/* ─── Main page ─── */
export default function GroupsPage() {
  const navigate = useNavigate();
  const setContactFilters = useFiltersStore((s) => s.setContactFilters);
  const resetContactFilters = useFiltersStore((s) => s.resetContactFilters);

  const { data, isLoading } = useGroups();
  const createGroup = useCreateGroup();
  const updateGroup = useUpdateGroup();
  const deleteGroup = useDeleteGroup();
  const { addToast } = useToast();

  const [showForm, setShowForm] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null); // group object | null
  const [deletingGroup, setDeletingGroup] = useState(null); // group object | null

  const groups = data || [];

  /* ─── Handlers ─── */
  async function handleSave(form) {
    if (!form.name.trim()) {
      addToast({ type: "error", message: "El nombre del grupo es obligatorio" });
      return;
    }
    try {
      if (editingGroup) {
        await updateGroup.mutateAsync({ id: editingGroup.id, ...form });
        addToast({ type: "success", message: "Grupo actualizado" });
        setEditingGroup(null);
      } else {
        await createGroup.mutateAsync(form);
        addToast({ type: "success", message: "Grupo creado" });
        setShowForm(false);
      }
    } catch (err) {
      if (err?.code === "DUPLICATE") {
        addToast({ type: "error", message: "Ya existe un grupo con ese nombre" });
      } else {
        addToast({ type: "error", message: err.message || "Error al guardar" });
      }
    }
  }

  async function handleDelete(deleteContacts) {
    if (!deletingGroup) return;
    try {
      await deleteGroup.mutateAsync({ id: deletingGroup.id, deleteContacts });
      addToast({
        type: "success",
        message: deleteContacts
          ? `Grupo y ${deletingGroup.contact_count || 0} contacto(s) eliminados`
          : "Grupo eliminado",
      });
    } catch (err) {
      addToast({ type: "error", message: err.message || "Error al eliminar" });
    }
    setDeletingGroup(null);
  }

  function goToContacts(group) {
    resetContactFilters();
    setContactFilters({ group_id: group.id });
    navigate("/contactos");
  }

  /* ─── Loading ─── */
  if (isLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "var(--space-12)" }}>
        <Spinner size={32} />
      </div>
    );
  }

  return (
    <div>
      {/* Page header */}
      <div
        style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          marginBottom: "var(--space-6)",
        }}
      >
        <div>
          <h1 className="text-h1">Grupos</h1>
          <p style={{ color: "var(--text-secondary)", marginTop: "var(--space-1)", fontSize: "var(--text-sm)" }}>
            {groups.length} grupo{groups.length !== 1 ? "s" : ""} de contactos
          </p>
        </div>
        {!showForm && !editingGroup && (
          <Button leftIcon={Plus} onClick={() => setShowForm(true)}>
            Nuevo grupo
          </Button>
        )}
      </div>

      {/* Create form */}
      {showForm && !editingGroup && (
        <GroupForm
          onSave={handleSave}
          onCancel={() => setShowForm(false)}
          isPending={createGroup.isPending}
        />
      )}

      {/* Empty state */}
      {groups.length === 0 && !showForm && (
        <div
          className="card"
          style={{
            padding: "var(--space-16)", textAlign: "center",
            display: "flex", flexDirection: "column", alignItems: "center",
          }}
        >
          <FolderOpen size={48} style={{ color: "var(--text-tertiary)", marginBottom: "var(--space-4)" }} />
          <h2 className="text-h2" style={{ marginBottom: "var(--space-2)" }}>Sin grupos</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "var(--text-sm)", maxWidth: 380, marginBottom: "var(--space-5)" }}>
            Los grupos te permiten organizar tus contactos por tipo de empresa, sector o cualquier criterio que necesites.
          </p>
          <Button leftIcon={Plus} onClick={() => setShowForm(true)}>
            Crear primer grupo
          </Button>
        </div>
      )}

      {/* Groups grid */}
      {groups.length > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: "var(--space-4)",
          }}
        >
          {groups.map((group) =>
            editingGroup?.id === group.id ? (
              <div key={group.id} style={{ gridColumn: "1 / -1" }}>
                <GroupForm
                  initial={editingGroup}
                  onSave={handleSave}
                  onCancel={() => setEditingGroup(null)}
                  isPending={updateGroup.isPending}
                />
              </div>
            ) : (
              <div
                key={group.id}
                className="card"
                style={{
                  padding: 0, overflow: "hidden",
                  display: "flex", flexDirection: "column",
                  transition: "box-shadow var(--transition-fast)",
                }}
              >
                {/* Color band */}
                <div
                  style={{
                    height: 6,
                    background: group.color || "var(--color-primary-500)",
                  }}
                />

                {/* Card body */}
                <div style={{ padding: "var(--space-4)", flex: 1, display: "flex", flexDirection: "column" }}>
                  {/* Name + description */}
                  <div style={{ marginBottom: "var(--space-3)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", marginBottom: "var(--space-1)" }}>
                      <div
                        style={{
                          width: 10, height: 10, borderRadius: "50%",
                          background: group.color || "var(--color-primary-500)",
                          flexShrink: 0,
                        }}
                      />
                      <h3
                        className="text-h3"
                        style={{ margin: 0, fontSize: "var(--text-base)" }}
                      >
                        {group.name}
                      </h3>
                    </div>
                    {group.description && (
                      <p
                        style={{
                          fontSize: "var(--text-xs)", color: "var(--text-secondary)",
                          marginLeft: 18, lineHeight: "var(--leading-normal)",
                        }}
                      >
                        {group.description}
                      </p>
                    )}
                  </div>

                  {/* KPI chips */}
                  <div
                    style={{
                      display: "flex", flexWrap: "wrap",
                      gap: "var(--space-2)", marginBottom: "var(--space-4)",
                    }}
                  >
                    <Kpi icon={Users} value={group.contact_count ?? 0} label="contactos" />
                    <Kpi icon={Kanban} value={group.active_deals ?? 0} label="deals activos" />
                    <Kpi
                      icon={DollarSign}
                      value={formatCurrency(group.pipeline_value ?? 0)}
                      label="en pipeline"
                    />
                    <Kpi icon={ClipboardList} value={group.pending_tasks ?? 0} label="tareas pendientes" />
                  </div>

                  {/* Actions */}
                  <div
                    style={{
                      display: "flex", gap: "var(--space-2)",
                      marginTop: "auto", paddingTop: "var(--space-3)",
                      borderTop: "1px solid var(--border-default)",
                    }}
                  >
                    <Button
                      variant="secondary"
                      size="sm"
                      rightIcon={ArrowRight}
                      onClick={() => goToContacts(group)}
                      style={{ flex: 1 }}
                    >
                      Ver contactos
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      iconOnly
                      onClick={() => setEditingGroup(group)}
                      aria-label="Editar grupo"
                    >
                      <Pencil size={15} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      iconOnly
                      onClick={() => setDeletingGroup(group)}
                      aria-label="Eliminar grupo"
                    >
                      <Trash2 size={15} style={{ color: "var(--color-danger-500)" }} />
                    </Button>
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      )}

      {/* Delete modal */}
      <DeleteGroupModal
        group={deletingGroup}
        onClose={() => setDeletingGroup(null)}
        onConfirm={handleDelete}
        isLoading={deleteGroup.isPending}
      />
    </div>
  );
}
