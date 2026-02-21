import { useParams, useNavigate } from "react-router-dom";
import { useContact } from "../hooks/useContacts";
import { Spinner } from "../components/ui/Spinner";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Card } from "../components/ui/Card";
import { ArrowLeft, Pencil, Phone, Mail, Building2 } from "lucide-react";

export default function ContactDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading } = useContact(id);

  if (isLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "var(--space-12)" }}>
        <Spinner size={32} />
      </div>
    );
  }

  const contact = data?.data;

  if (!contact) {
    return (
      <div style={{ padding: "var(--space-8)", textAlign: "center" }}>
        <p className="text-body-sm">Contacto no encontrado.</p>
        <Button variant="secondary" onClick={() => navigate("/contactos")} style={{ marginTop: "var(--space-4)" }}>
          Volver a contactos
        </Button>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", marginBottom: "var(--space-6)" }}>
        <Button variant="ghost" size="sm" iconOnly onClick={() => navigate("/contactos")}>
          <ArrowLeft size={18} />
        </Button>
        <div style={{ flex: 1 }}>
          <h1 className="text-h1">{contact.name} {contact.surname || ""}</h1>
          {contact.company && <p className="text-body-sm">{contact.company}</p>}
        </div>
        <Button variant="secondary" leftIcon={Pencil}>Editar</Button>
      </div>

      {/* Detail Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-4)" }}>
        <Card>
          <Card.Header>
            <Card.Title>Información</Card.Title>
          </Card.Header>
          <Card.Body>
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
              {contact.email && (
                <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
                  <Mail size={16} style={{ color: "var(--text-tertiary)" }} />
                  <span className="text-body-sm">{contact.email}</span>
                </div>
              )}
              {contact.phone && (
                <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
                  <Phone size={16} style={{ color: "var(--text-tertiary)" }} />
                  <span className="text-body-sm">{contact.phone}</span>
                </div>
              )}
              {contact.company && (
                <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
                  <Building2 size={16} style={{ color: "var(--text-tertiary)" }} />
                  <span className="text-body-sm">{contact.company} — {contact.job_title || ""}</span>
                </div>
              )}
            </div>
          </Card.Body>
        </Card>

        <Card>
          <Card.Header>
            <Card.Title>Estado & Tags</Card.Title>
          </Card.Header>
          <Card.Body>
            <Badge variant="primary" dot>{contact.status}</Badge>
            {contact.tags?.length > 0 && (
              <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap", marginTop: "var(--space-3)" }}>
                {contact.tags.map((tag) => (
                  <Badge key={tag.id} variant="neutral" style={{ background: tag.color + "20", color: tag.color }}>
                    {tag.name}
                  </Badge>
                ))}
              </div>
            )}
          </Card.Body>
        </Card>
      </div>
    </div>
  );
}
