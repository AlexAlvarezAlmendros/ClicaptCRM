import { useState, useCallback } from "react";
import { useContacts } from "../hooks/useContacts";
import { useFiltersStore } from "../stores/filtersStore";
import { useIsMobile } from "../hooks/useMediaQuery";
import { useDebounce } from "../hooks/useDebounce";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Table } from "../components/ui/Table";
import { Badge } from "../components/ui/Badge";
import { Spinner } from "../components/ui/Spinner";
import { EmptyState } from "../components/ui/EmptyState";
import { ContactForm } from "../components/contacts/ContactForm";
import { ContactFilters } from "../components/contacts/ContactFilters";
import { ContactCard } from "../components/contacts/ContactCard";
import { Plus, Search, Users, ChevronLeft, ChevronRight, Filter } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { formatDate } from "../lib/formatters";

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

  const isMobile = useIsMobile();
  const navigate = useNavigate();

  // Build query params from store + debounced search
  const queryParams = {
    search: debouncedSearch,
    status: filters.status || undefined,
    source: filters.source || undefined,
    page: filters.page,
    limit: filters.limit,
  };

  const { data, isLoading } = useContacts(queryParams);

  const contacts = data?.data || [];
  const totalCount = parseInt(data?.data?.length || 0, 10);
  // If the API returns X-Total-Count via header, we use the array length
  const hasMore = contacts.length === filters.limit;
  const page = filters.page;

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
        <Button leftIcon={Plus} onClick={() => setFormOpen(true)}>
          Nuevo contacto
        </Button>
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
        <div style={{ display: "flex", justifyContent: "center", padding: "var(--space-12)" }}>
          <Spinner size={32} />
        </div>
      ) : contacts.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Sin contactos"
          description={
            debouncedSearch || filters.status || filters.source
              ? "No se encontraron contactos con estos filtros."
              : "Crea tu primer contacto para empezar a gestionar tus leads."
          }
          action={
            debouncedSearch || filters.status || filters.source ? (
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
                      <Badge variant={status.variant} dot>{status.label}</Badge>
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
          >
            <ChevronLeft size={18} />
          </Button>
          <span
            className="text-body-sm"
            style={{ color: "var(--text-secondary)", minWidth: 80, textAlign: "center" }}
          >
            Página {page}
          </span>
          <Button
            variant="ghost"
            size="sm"
            iconOnly
            disabled={!hasMore}
            onClick={() => setFilters({ page: page + 1 })}
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
    </div>
  );
}
