import { useState } from "react";
import { useContacts } from "../hooks/useContacts";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Table } from "../components/ui/Table";
import { Badge } from "../components/ui/Badge";
import { Spinner } from "../components/ui/Spinner";
import { EmptyState } from "../components/ui/EmptyState";
import { Plus, Search, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

const STATUS_BADGES = {
  new: { label: "Nuevo", variant: "primary" },
  contacted: { label: "Contactado", variant: "neutral" },
  qualified: { label: "Cualificado", variant: "warning" },
  customer: { label: "Cliente", variant: "success" },
  lost: { label: "Perdido", variant: "danger" },
};

export default function ContactsPage() {
  const [search, setSearch] = useState("");
  const { data, isLoading } = useContacts({ search });
  const navigate = useNavigate();

  const contacts = data?.data?.items || [];

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
        <Button leftIcon={Plus}>Nuevo contacto</Button>
      </div>

      {/* Search */}
      <div style={{ marginBottom: "var(--space-4)", maxWidth: 400 }}>
        <Input
          placeholder="Buscar contactos..."
          icon={Search}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      {isLoading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "var(--space-12)" }}>
          <Spinner size={32} />
        </div>
      ) : contacts.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Sin contactos"
          description="Crea tu primer contacto para empezar a gestionar tus leads."
          action={<Button leftIcon={Plus}>Crear contacto</Button>}
        />
      ) : (
        <div className="card">
          <Table>
            <Table.Head>
              <tr>
                <Table.Th>Nombre</Table.Th>
                <Table.Th>Empresa</Table.Th>
                <Table.Th>Email</Table.Th>
                <Table.Th>Estado</Table.Th>
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
                      {new Date(contact.created_at).toLocaleDateString("es-ES")}
                    </Table.Td>
                  </Table.Row>
                );
              })}
            </Table.Body>
          </Table>
        </div>
      )}
    </div>
  );
}
