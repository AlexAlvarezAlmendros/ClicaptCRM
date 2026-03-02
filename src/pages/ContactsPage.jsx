import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { useContacts, useUpdateContact } from "../hooks/useContacts";
import { useCreateActivity } from "../hooks/useActivities";
import { useFiltersStore } from "../stores/filtersStore";
import { useIsMobile } from "../hooks/useMediaQuery";
import { useDebounce } from "../hooks/useDebounce";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Table } from "../components/ui/Table";
import { EmptyState } from "../components/ui/EmptyState";
import { ContactForm } from "../components/contacts/ContactForm";
import { ContactFilters } from "../components/contacts/ContactFilters";
import { ContactCard } from "../components/contacts/ContactCard";
import { CSVImportWizard } from "../components/contacts/CSVImportWizard";
import { Plus, Search, Users, ChevronLeft, ChevronRight, Filter, Download, Upload, FolderPlus, Phone, Mail, Calendar, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToken } from "../hooks/useToken";
import { useQueryClient } from "@tanstack/react-query";
import { useSubscriptionGate } from "../components/onboarding/SubscriptionGate";
import { SkeletonTable } from "../components/ui/Skeleton";
import { Drawer } from "../components/ui/Drawer";
import { useCreateGroup } from "../hooks/useGroups";
import { useToast } from "../components/ui/Toast";
import { CONTACT_STATUSES, ACTIVITY_TYPES } from "../lib/constants";

const GROUP_COLORS = [
  { value: "#3B82F6", label: "Azul" },
  { value: "#10B981", label: "Verde" },
  { value: "#F59E0B", label: "Ámbar" },
  { value: "#EF4444", label: "Rojo" },
  { value: "#8B5CF6", label: "Violeta" },
  { value: "#EC4899", label: "Rosa" },
  { value: "#06B6D4", label: "Cian" },
  { value: "#F97316", label: "Naranja" },
  { value: "#6B7280", label: "Gris" },
  { value: "#14B8A6", label: "Teal" },
];

const ACTIVITY_ICONS = [
  { type: "call",    Icon: Phone,    label: "Llamada" },
  { type: "email",   Icon: Mail,     label: "Email" },
  { type: "meeting", Icon: Calendar, label: "Reunión" },
  { type: "note",    Icon: FileText, label: "Nota" },
];

const STATUS_BADGES = {
  new: { label: "Nuevo", variant: "primary" },
  contacted: { label: "Contactado", variant: "neutral" },
  qualified: { label: "Cualificado", variant: "warning" },
  customer: { label: "Cliente", variant: "success" },
  lost: { label: "Perdido", variant: "danger" },
};

export default function ContactsPage() {
  const filters = useFiltersStore((s) => s.contacts);
  const setFilters = useFiltersStore((s) => s.setContactFilters);
  const resetFilters = useFiltersStore((s) => s.resetContactFilters);

  const [searchInput, setSearchInput] = useState(filters.search);
  const debouncedSearch = useDebounce(searchInput, 300);
  const [showFilters, setShowFilters] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [groupOpen, setGroupOpen] = useState(false);
  const [groupForm, setGroupForm] = useState({ name: "", color: "#3B82F6", description: "" });
  const [editingCell, setEditingCell] = useState(null);
  const [activityForm, setActivityForm] = useState(null);

  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { canWrite } = useSubscriptionGate();
  const getToken = useToken();
  const queryClient = useQueryClient();
  const createGroup = useCreateGroup();
  const updateContact = useUpdateContact();
  const createActivity = useCreateActivity();
  const { addToast } = useToast();

  // Build query params from store + debounced search
  const queryParams = {
    search: debouncedSearch,
    status: filters.status || undefined,
    source: filters.source || undefined,
    group_id: filters.group_id || undefined,
    page: filters.page,
    limit: filters.limit,
  };

  const { data, isLoading } = useContacts(queryParams);

  const contacts = data?.contacts || [];
  const pagination = data?.pagination || null;
  const totalCount = pagination?.total || contacts.length;
  const totalPages = pagination?.totalPages || 1;
  const page = filters.page;
  const hasMore = pagination ? page < totalPages : contacts.length === filters.limit;

  const handleSearch = useCallback((e) => {
    setSearchInput(e.target.value);
    setFilters({ page: 1 });
  }, [setFilters]);

  const handleFilterChange = useCallback((partial) => {
    setFilters({ ...partial, page: 1 });
  }, [setFilters]);

  const handleReset = useCallback(() => {
    resetFilters();
    setSearchInput("");
  }, [resetFilters]);

  // CSV Export
  async function handleExport() {
    try {
      const token = await getToken();
      const response = await fetch("/api/contacts/export", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `contactos_${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export failed:", err);
    }
  }

  // Inline editing
  function startInlineEdit(contactId, field, currentValue) {
    setEditingCell({ contactId, field, value: currentValue || "" });
  }

  async function saveInlineEdit() {
    if (!editingCell) return;
    try {
      await updateContact.mutateAsync({
        id: editingCell.contactId,
        data: { [editingCell.field]: editingCell.value },
      });
    } catch {
      addToast({ type: "error", message: "Error al guardar" });
    }
    setEditingCell(null);
  }

  function cancelInlineEdit() {
    setEditingCell(null);
  }

  // Inline activity registration
  async function saveInlineActivity() {
    if (!activityForm) return;
    try {
      await createActivity.mutateAsync({
        contact_id: activityForm.contactId,
        type: activityForm.type,
        description: activityForm.description || null,
      });
      addToast({ type: "success", message: "Actividad registrada" });
    } catch {
      addToast({ type: "error", message: "Error al registrar actividad" });
    }
    setActivityForm(null);
  }

  const inlineInputStyle = {
    width: "100%",
    padding: "4px 8px",
    fontSize: "var(--text-sm)",
    border: "1px solid var(--border-active)",
    borderRadius: "var(--radius-sm)",
    background: "var(--bg-primary)",
    color: "var(--text-primary)",
    outline: "none",
  };

  const miniIconBtnStyle = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: 26,
    height: 26,
    border: "1px solid var(--border-default)",
    borderRadius: "var(--radius-sm)",
    background: "var(--bg-secondary)",
    color: "var(--text-secondary)",
    cursor: "pointer",
    padding: 0,
  };

  // Group creation
  async function handleCreateGroup(e) {
    e.preventDefault();
    if (!groupForm.name.trim()) return;
    try {
      await createGroup.mutateAsync(groupForm);
      addToast({ type: "success", message: "Grupo creado" });
      setGroupForm({ name: "", color: "#3B82F6", description: "" });
      setGroupOpen(false);
    } catch (err) {
      addToast({ type: "error", message: err.message || "Error al crear grupo" });
    }
  }


  return (
    <div>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "var(--space-6)",
          flexWrap: "wrap",
          gap: "var(--space-3)",
        }}
      >
        <h1 className="text-h1">Contactos</h1>
        <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap" }}>
          <Button variant="outline" size="sm" leftIcon={Download} onClick={handleExport}>
            Exportar
          </Button>
          <Button variant="outline" size="sm" leftIcon={Upload} onClick={() => setImportOpen(true)} disabled={!canWrite}>
            Importar
          </Button>
          <Button variant="outline" size="sm" leftIcon={FolderPlus} onClick={() => setGroupOpen(true)} disabled={!canWrite}>
            Nuevo grupo
          </Button>
          <Button leftIcon={Plus} onClick={() => setFormOpen(true)} disabled={!canWrite} title={!canWrite ? "Suscripción requerida" : undefined}>
            Nuevo contacto
          </Button>
        </div>
      </div>

      {/* Search + Filter Toggle */}
      <div
        style={{
          display: "flex",
          gap: "var(--space-3)",
          alignItems: "flex-end",
          marginBottom: "var(--space-4)",
          flexWrap: "wrap",
        }}
      >
        <div style={{ flex: 1, minWidth: 200, maxWidth: 400 }}>
          <Input
            placeholder="Buscar contactos..."
            icon={Search}
            value={searchInput}
            onChange={handleSearch}
          />
        </div>
        <Button
          variant={showFilters ? "secondary" : "ghost"}
          size="sm"
          leftIcon={Filter}
          onClick={() => setShowFilters((v) => !v)}
        >
          Filtros
        </Button>
      </div>

      {/* Filters */}
      {showFilters && (
        <div style={{ marginBottom: "var(--space-4)" }}>
          <ContactFilters
            filters={filters}
            onChange={handleFilterChange}
            onReset={handleReset}
          />
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <SkeletonTable rows={6} cols={4} />
      ) : contacts.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Sin contactos"
          description={
            debouncedSearch || filters.status || filters.source || filters.group_id
              ? "No se encontraron contactos con estos filtros."
              : "Crea tu primer contacto para empezar a gestionar tus leads."
          }
          action={
            debouncedSearch || filters.status || filters.source || filters.group_id ? (
              <Button variant="secondary" onClick={handleReset}>Limpiar filtros</Button>
            ) : (
              <Button leftIcon={Plus} onClick={() => setFormOpen(true)}>Crear contacto</Button>
            )
          }
        />
      ) : isMobile ? (
        /* Mobile: Card view */
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
          {contacts.map((contact) => (
            <ContactCard
              key={contact.id}
              contact={contact}
              onClick={() => navigate(`/contactos/${contact.id}`)}
            />
          ))}
        </div>
      ) : (
        /* Desktop: Table view */
        <div className="card" style={{ overflowX: "auto" }}>
          <Table style={{ tableLayout: "fixed", minWidth: 640 }}>
            <Table.Head>
              <tr>
                <Table.Th style={{ width: "22%" }}>Empresa</Table.Th>
                <Table.Th style={{ width: "22%" }}>Email</Table.Th>
                <Table.Th style={{ width: "13%" }}>Teléfono</Table.Th>
                <Table.Th style={{ width: "11%" }}>Estado</Table.Th>
                <Table.Th style={{ width: "22%" }}>Notas</Table.Th>
                <Table.Th style={{ width: "10%" }}>Actividad</Table.Th>
              </tr>
            </Table.Head>
            <Table.Body>
              {contacts.map((contact) => {
                const status = STATUS_BADGES[contact.status] || STATUS_BADGES.new;
                return (
                  <Table.Row
                    key={contact.id}
                    onClick={() => navigate(`/contactos/${contact.id}`)}
                  >
                    {/* Empresa + nombre */}
                    <Table.Td>
                      <div style={{ lineHeight: 1.3, overflow: "hidden" }}>
                        <span style={{ fontWeight: "var(--font-weight-medium)", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={contact.company || ""}>
                          {contact.company || "—"}
                        </span>
                        <span style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={`${contact.name} ${contact.surname || ""}`}>
                          {contact.name} {contact.surname || ""}
                        </span>
                      </div>
                    </Table.Td>

                    {/* Email — editable */}
                    <Table.Td onClick={(e) => e.stopPropagation()}>
                      {editingCell?.contactId === contact.id && editingCell?.field === "email" ? (
                        <input
                          autoFocus
                          type="email"
                          value={editingCell.value}
                          onChange={(e) => setEditingCell((prev) => ({ ...prev, value: e.target.value }))}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") saveInlineEdit();
                            if (e.key === "Escape") cancelInlineEdit();
                          }}
                          onBlur={saveInlineEdit}
                          style={inlineInputStyle}
                        />
                      ) : (
                        <span
                          onClick={() => startInlineEdit(contact.id, "email", contact.email)}
                          style={{ cursor: "pointer", fontSize: "var(--text-sm)", borderBottom: "1px dashed var(--border-default)", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                          title={contact.email || "Clic para editar"}
                        >
                          {contact.email || "—"}
                        </span>
                      )}
                    </Table.Td>

                    {/* Teléfono */}
                    <Table.Td>
                      <span style={{ fontSize: "var(--text-sm)" }}>{contact.phone || "—"}</span>
                    </Table.Td>

                    {/* Estado — editable select */}
                    <Table.Td onClick={(e) => e.stopPropagation()}>
                      <select
                        value={contact.status}
                        onChange={async (e) => {
                          try {
                            await updateContact.mutateAsync({ id: contact.id, data: { status: e.target.value } });
                          } catch {
                            addToast({ type: "error", message: "Error al cambiar estado" });
                          }
                        }}
                        style={{
                          appearance: "none",
                          WebkitAppearance: "none",
                          background: `var(--color-${status.variant === "primary" ? "primary" : status.variant === "success" ? "success" : status.variant === "warning" ? "warning" : status.variant === "danger" ? "danger" : "neutral"}-100)`,
                          color: `var(--color-${status.variant === "primary" ? "primary" : status.variant === "success" ? "success" : status.variant === "warning" ? "warning" : status.variant === "danger" ? "danger" : "neutral"}-700)`,
                          border: "none",
                          borderRadius: "var(--radius-full)",
                          padding: "4px 12px",
                          fontSize: "var(--text-xs)",
                          fontWeight: "var(--font-weight-medium)",
                          cursor: "pointer",
                          outline: "none",
                          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                          backgroundRepeat: "no-repeat",
                          backgroundPosition: "right 6px center",
                          paddingRight: "24px",
                        }}
                      >
                        {CONTACT_STATUSES.map((s) => (
                          <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                      </select>
                    </Table.Td>

                    {/* Notas — editable */}
                    <Table.Td onClick={(e) => e.stopPropagation()}>
                      {editingCell?.contactId === contact.id && editingCell?.field === "notes" ? (
                        <input
                          autoFocus
                          value={editingCell.value}
                          onChange={(e) => setEditingCell((prev) => ({ ...prev, value: e.target.value }))}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") saveInlineEdit();
                            if (e.key === "Escape") cancelInlineEdit();
                          }}
                          onBlur={saveInlineEdit}
                          style={inlineInputStyle}
                          placeholder="Añadir nota..."
                        />
                      ) : (
                        <span
                          onClick={() => startInlineEdit(contact.id, "notes", contact.notes)}
                          style={{
                            cursor: "pointer",
                            fontSize: "var(--text-sm)",
                            color: contact.notes ? "var(--text-primary)" : "var(--text-tertiary)",
                            borderBottom: "1px dashed var(--border-default)",
                            display: "block",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                          title={contact.notes || "Clic para añadir nota"}
                        >
                          {contact.notes || "Añadir nota..."}
                        </span>
                      )}
                    </Table.Td>

                    {/* Registrar actividad */}
                    <Table.Td onClick={(e) => e.stopPropagation()}>
                      <div style={{ display: "flex", gap: 4 }}>
                        {ACTIVITY_ICONS.map(({ type, Icon, label }) => {
                          const isActive = activityForm?.contactId === contact.id && activityForm?.type === type;
                          return (
                            <button
                              key={type}
                              title={label}
                              onClick={(e) => {
                                e.stopPropagation();
                                const rect = e.currentTarget.getBoundingClientRect();
                                setActivityForm((prev) =>
                                  prev?.contactId === contact.id && prev?.type === type
                                    ? null
                                    : { contactId: contact.id, type, description: "", rect }
                                );
                              }}
                              style={{
                                ...miniIconBtnStyle,
                                background: isActive ? "var(--color-primary-100)" : "var(--bg-secondary)",
                                color: isActive ? "var(--color-primary-600)" : "var(--text-secondary)",
                                borderColor: isActive ? "var(--color-primary-300)" : "var(--border-default)",
                                transition: "background 0.15s, color 0.15s, border-color 0.15s",
                              }}
                            >
                              <Icon size={14} />
                            </button>
                          );
                        })}
                      </div>
                    </Table.Td>
                  </Table.Row>
                );
              })}
            </Table.Body>
          </Table>
        </div>
      )}

      {/* Pagination */}
      {contacts.length > 0 && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "var(--space-3)",
            marginTop: "var(--space-6)",
          }}
        >
          <Button
            variant="ghost"
            size="sm"
            iconOnly
            disabled={page <= 1}
            onClick={() => setFilters({ page: page - 1 })}
            aria-label="Página anterior"
          >
            <ChevronLeft size={18} />
          </Button>
          <span
            className="text-body-sm"
            style={{ color: "var(--text-secondary)", minWidth: 80, textAlign: "center" }}
          >
            Página {page}{totalPages > 1 ? ` de ${totalPages}` : ""}
          </span>
          <Button
            variant="ghost"
            size="sm"
            iconOnly
            disabled={!hasMore}
            onClick={() => setFilters({ page: page + 1 })}
            aria-label="Página siguiente"
          >
            <ChevronRight size={18} />
          </Button>
        </div>
      )}

      {/* Create/Edit Form Drawer */}
      <ContactForm
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
      />

      {/* CSV Import Wizard */}
      <CSVImportWizard
        isOpen={importOpen}
        onClose={() => setImportOpen(false)}
      />

      {/* Group Creation Drawer */}
      <Drawer
        isOpen={groupOpen}
        onClose={() => { setGroupOpen(false); setGroupForm({ name: "", color: "#3B82F6", description: "" }); }}
        title="Nuevo grupo"
        width="380px"
      >
        <form onSubmit={handleCreateGroup} style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
          <Input
            label="Nombre del grupo"
            name="name"
            value={groupForm.name}
            onChange={(e) => setGroupForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="Ej: Agencias, Proveedores..."
            required
            autoFocus
          />

          <div>
            <label className="input-label" style={{ marginBottom: "var(--space-2)", display: "block" }}>Color</label>
            <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap" }}>
              {GROUP_COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setGroupForm((f) => ({ ...f, color: c.value }))}
                  title={c.label}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "var(--radius-full)",
                    background: c.value,
                    border: groupForm.color === c.value ? "3px solid var(--text-primary)" : "2px solid transparent",
                    cursor: "pointer",
                    transition: "border 0.15s",
                    outline: groupForm.color === c.value ? "2px solid var(--bg-primary)" : "none",
                  }}
                  aria-label={c.label}
                />
              ))}
            </div>
          </div>

          <Input
            label="Descripción (opcional)"
            name="description"
            value={groupForm.description}
            onChange={(e) => setGroupForm((f) => ({ ...f, description: e.target.value }))}
            placeholder="Descripción breve del grupo..."
          />

          <div style={{ display: "flex", gap: "var(--space-3)", justifyContent: "flex-end", paddingTop: "var(--space-4)", borderTop: "1px solid var(--border-default)" }}>
            <Button type="button" variant="secondary" onClick={() => { setGroupOpen(false); setGroupForm({ name: "", color: "#3B82F6", description: "" }); }}>
              Cancelar
            </Button>
            <Button type="submit" isLoading={createGroup.isPending} disabled={!groupForm.name.trim()}>
              Crear grupo
            </Button>
          </div>
        </form>
      </Drawer>
      {/* Activity Popover */}
      <ActivityPopover
        form={activityForm}
        onTypeChange={(type) => setActivityForm((prev) => ({ ...prev, type }))}
        onChange={(description) => setActivityForm((prev) => ({ ...prev, description }))}
        onSave={saveInlineActivity}
        onClose={() => setActivityForm(null)}
        isSaving={createActivity.isPending}
      />

    </div>
  );
}

/* ─── Activity Popover ─── */
function ActivityPopover({ form, onChange, onTypeChange, onSave, onClose, isSaving }) {
  const ref = useRef(null);

  // Compute position from snapshot rect stored in form
  const pos = useMemo(() => {
    if (!form?.rect) return null;
    const W = 310;
    const vw = window.innerWidth;
    let left = form.rect.left;
    if (left + W > vw - 12) left = vw - W - 12;
    if (left < 12) left = 12;
    // Try below first; if too close to bottom flip above
    const spaceBelow = window.innerHeight - form.rect.bottom;
    const top = spaceBelow > 180
      ? form.rect.bottom + 8
      : form.rect.top - 180;
    return { top, left, width: W };
  }, [form?.rect]);

  // Close on outside click
  useEffect(() => {
    if (!form) return;
    function onDown(e) {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [form, onClose]);

  // Close on Escape
  useEffect(() => {
    if (!form) return;
    function onKey(e) { if (e.key === "Escape") onClose(); }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [form, onClose]);

  if (!form || !pos) return null;

  const activeEntry = ACTIVITY_ICONS.find((a) => a.type === form.type);

  return (
    <div
      ref={ref}
      style={{
        position: "fixed",
        top: pos.top,
        left: pos.left,
        width: pos.width,
        zIndex: 1200,
        background: "var(--surface-primary)",
        border: "1px solid var(--border-default)",
        borderRadius: "var(--radius-lg)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.14), 0 2px 8px rgba(0,0,0,0.08)",
        padding: "var(--space-4)",
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-3)",
      }}
    >
      {/* Arrow caret */}
      <div style={{
        position: "absolute",
        top: -7,
        left: Math.min(Math.max(form.rect.left - pos.left + 10, 16), pos.width - 24),
        width: 12,
        height: 12,
        background: "var(--surface-primary)",
        border: "1px solid var(--border-default)",
        borderBottom: "none",
        borderRight: "none",
        transform: "rotate(45deg)",
        borderRadius: 2,
      }} />

      {/* Type switcher */}
      <div style={{
        display: "flex",
        gap: 2,
        background: "var(--surface-secondary)",
        borderRadius: "var(--radius-md)",
        padding: 3,
      }}>
        {ACTIVITY_ICONS.map(({ type, Icon, label }) => {
          const active = form.type === type;
          return (
            <button
              key={type}
              onClick={() => onTypeChange(type)}
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 4,
                padding: "6px 4px",
                borderRadius: "var(--radius-sm)",
                border: "none",
                cursor: "pointer",
                fontSize: "var(--text-xs)",
                fontWeight: active ? "var(--font-weight-semibold)" : "var(--font-weight-normal)",
                background: active ? "var(--surface-primary)" : "transparent",
                color: active ? "var(--color-primary-600)" : "var(--text-tertiary)",
                boxShadow: active ? "0 1px 3px rgba(0,0,0,0.10)" : "none",
                transition: "all 0.15s",
                whiteSpace: "nowrap",
              }}
            >
              <Icon size={13} />
              {label}
            </button>
          );
        })}
      </div>

      {/* Description input */}
      <input
        autoFocus
        value={form.description}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") { e.preventDefault(); onSave(); }
          if (e.key === "Escape") onClose();
        }}
        placeholder={`Nota sobre la ${activeEntry?.label.toLowerCase()}… (opcional)`}
        style={{
          width: "100%",
          padding: "var(--space-2) var(--space-3)",
          fontSize: "var(--text-sm)",
          border: "1px solid var(--border-default)",
          borderRadius: "var(--radius-md)",
          background: "var(--surface-secondary)",
          color: "var(--text-primary)",
          outline: "none",
          boxSizing: "border-box",
          transition: "border-color 0.15s",
        }}
        onFocus={(e) => (e.target.style.borderColor = "var(--border-active)")}
        onBlur={(e) => (e.target.style.borderColor = "var(--border-default)")}
      />

      {/* Actions */}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--space-2)" }}>
        <button
          onClick={onClose}
          style={{
            padding: "5px 14px",
            borderRadius: "var(--radius-sm)",
            border: "1px solid var(--border-default)",
            background: "transparent",
            color: "var(--text-secondary)",
            fontSize: "var(--text-sm)",
            cursor: "pointer",
          }}
        >
          Cancelar
        </button>
        <button
          onClick={onSave}
          disabled={isSaving}
          style={{
            padding: "5px 14px",
            borderRadius: "var(--radius-sm)",
            border: "none",
            background: "var(--color-primary-500)",
            color: "#fff",
            fontSize: "var(--text-sm)",
            fontWeight: "var(--font-weight-medium)",
            cursor: isSaving ? "not-allowed" : "pointer",
            opacity: isSaving ? 0.7 : 1,
            transition: "opacity 0.15s",
          }}
        >
          {isSaving ? "Guardando…" : "Registrar"}
        </button>
      </div>
    </div>
  );
}
