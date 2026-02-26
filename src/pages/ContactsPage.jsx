import { useState, useCallback } from "react";
import { useContacts, useUpdateContact } from "../hooks/useContacts";
import { useFiltersStore } from "../stores/filtersStore";
import { useIsMobile } from "../hooks/useMediaQuery";
import { useDebounce } from "../hooks/useDebounce";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Table } from "../components/ui/Table";
import { Badge } from "../components/ui/Badge";
import { EmptyState } from "../components/ui/EmptyState";
import { ContactForm } from "../components/contacts/ContactForm";
import { ContactFilters } from "../components/contacts/ContactFilters";
import { ContactCard } from "../components/contacts/ContactCard";
import { CSVImportWizard } from "../components/contacts/CSVImportWizard";
import { Plus, Search, Users, ChevronLeft, ChevronRight, Filter, Download, Upload, FolderPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToken } from "../hooks/useToken";
import { useQueryClient } from "@tanstack/react-query";
import { formatDate } from "../lib/formatters";
import { useSubscriptionGate } from "../components/onboarding/SubscriptionGate";
import { SkeletonTable } from "../components/ui/Skeleton";
import { Drawer } from "../components/ui/Drawer";
import { useCreateGroup } from "../hooks/useGroups";
import { useToast } from "../components/ui/Toast";
import { CONTACT_STATUSES } from "../lib/constants";

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

  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { canWrite } = useSubscriptionGate();
  const getToken = useToken();
  const queryClient = useQueryClient();
  const createGroup = useCreateGroup();
  const updateContact = useUpdateContact();
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

  const contacts = data?.data?.contacts || data?.data || [];
  const pagination = data?.data?.pagination || null;
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
        <div className="card">
          <Table>
            <Table.Head>
              <tr>
                <Table.Th>Nombre</Table.Th>
                <Table.Th>Empresa</Table.Th>
                <Table.Th>Email</Table.Th>
                <Table.Th>Estado</Table.Th>
                <Table.Th>Origen</Table.Th>
                <Table.Th>Creado</Table.Th>
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
                    <Table.Td>
                      <span style={{ fontWeight: "var(--font-weight-medium)" }}>
                        {contact.name} {contact.surname || ""}
                      </span>
                    </Table.Td>
                    <Table.Td>{contact.company || "—"}</Table.Td>
                    <Table.Td>{contact.email || "—"}</Table.Td>
                    <Table.Td>
                      <select
                        value={contact.status}
                        onChange={async (e) => {
                          e.stopPropagation();
                          try {
                            await updateContact.mutateAsync({ id: contact.id, data: { status: e.target.value } });
                          } catch {
                            addToast({ type: "error", message: "Error al cambiar estado" });
                          }
                        }}
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          appearance: "none",
                          WebkitAppearance: "none",
                          background: `var(--color-${status.variant === 'primary' ? 'primary' : status.variant === 'success' ? 'success' : status.variant === 'warning' ? 'warning' : status.variant === 'danger' ? 'danger' : 'neutral'}-100)`,
                          color: `var(--color-${status.variant === 'primary' ? 'primary' : status.variant === 'success' ? 'success' : status.variant === 'warning' ? 'warning' : status.variant === 'danger' ? 'danger' : 'neutral'}-700)`,
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
                    <Table.Td>
                      <span style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)" }}>
                        {contact.source || "—"}
                      </span>
                    </Table.Td>
                    <Table.Td>{formatDate(contact.created_at)}</Table.Td>
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
    </div>
  );
}
