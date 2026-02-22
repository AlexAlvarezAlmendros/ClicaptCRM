import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useContact, useDeleteContact } from "../hooks/useContacts";
import { useActivities, useCreateActivity } from "../hooks/useActivities";
import { useDeals } from "../hooks/useDeals";
import { useTasks } from "../hooks/useTasks";
import { Spinner } from "../components/ui/Spinner";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Card } from "../components/ui/Card";
import { EmptyState } from "../components/ui/EmptyState";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { useToast } from "../components/ui/Toast";
import { ContactForm } from "../components/contacts/ContactForm";
import { TagBadge } from "../components/contacts/TagBadge";
import {
  ArrowLeft, Pencil, Trash2, Phone, Mail, Building2,
  MapPin, Globe, FileText, Clock, CircleDollarSign,
  CheckCircle2, MessageSquare, PhoneCall, CalendarClock,
} from "lucide-react";
import { formatDate, formatRelativeTime, formatCurrency } from "../lib/formatters";
import { CONTACT_SOURCES, CONTACT_STATUSES, ACTIVITY_TYPES } from "../lib/constants";
import { Textarea } from "../components/ui/Input";
import { Select } from "../components/ui/Select";

const STATUS_BADGES = {
  new: { label: "Nuevo", variant: "primary" },
  contacted: { label: "Contactado", variant: "neutral" },
  qualified: { label: "Cualificado", variant: "warning" },
  customer: { label: "Cliente", variant: "success" },
  lost: { label: "Perdido", variant: "danger" },
};

const ACTIVITY_ICONS = {
  call: PhoneCall,
  email: Mail,
  meeting: CalendarClock,
  note: MessageSquare,
  task_completed: CheckCircle2,
};

export default function ContactDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const { data, isLoading } = useContact(id);
  const { data: activitiesData } = useActivities({ contact_id: id });
  const { data: dealsData } = useDeals({ contact_id: id });
  const { data: tasksData } = useTasks({ contact_id: id });
  const deleteContact = useDeleteContact();
  const createActivity = useCreateActivity();

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [activityType, setActivityType] = useState("note");
  const [activityDesc, setActivityDesc] = useState("");

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

  const activities = activitiesData?.data || [];
  const deals = dealsData?.data || [];
  const tasks = tasksData?.data || [];
  const status = STATUS_BADGES[contact.status] || STATUS_BADGES.new;
  const sourceLbl = CONTACT_SOURCES.find((s) => s.value === contact.source)?.label;

  async function handleDelete() {
    try {
      await deleteContact.mutateAsync(id);
      addToast({ type: "success", message: "Contacto eliminado" });
      navigate("/contactos", { replace: true });
    } catch {
      addToast({ type: "error", message: "Error al eliminar el contacto" });
    }
  }

  async function handleAddActivity(e) {
    e.preventDefault();
    if (!activityDesc.trim()) return;
    try {
      await createActivity.mutateAsync({
        type: activityType,
        description: activityDesc,
        contact_id: id,
      });
      setActivityDesc("");
      addToast({ type: "success", message: "Actividad registrada" });
    } catch {
      addToast({ type: "error", message: "Error al registrar actividad" });
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="contact-detail-header">
        <Button variant="ghost" size="sm" iconOnly onClick={() => navigate("/contactos")} aria-label="Volver a contactos">
          <ArrowLeft size={18} />
        </Button>
        <div style={{ flex: 1 }}>
          <h1 className="text-h1" style={{ marginBottom: 2 }}>{contact.name} {contact.surname || ""}</h1>
          {contact.company && (
            <p className="text-body-sm" style={{ color: "var(--text-secondary)" }}>
              {contact.company}{contact.job_title ? ` — ${contact.job_title}` : ""}
            </p>
          )}
        </div>
        <Button variant="secondary" leftIcon={Pencil} onClick={() => setEditOpen(true)}>
          Editar
        </Button>
        <Button variant="ghost" size="sm" iconOnly onClick={() => setDeleteOpen(true)} style={{ color: "var(--color-danger-500)" }} aria-label="Eliminar contacto">
          <Trash2 size={18} />
        </Button>
      </div>

      {/* Main Grid */}
      <div className="contact-detail-grid">
        {/* Left: Info */}
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
          {/* Contact Info Card */}
          <Card>
            <Card.Header>
              <Card.Title>Información de contacto</Card.Title>
            </Card.Header>
            <Card.Body>
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
                {contact.email && (
                  <InfoRow icon={Mail} label="Email" value={contact.email} />
                )}
                {contact.phone && (
                  <InfoRow icon={Phone} label="Teléfono" value={contact.phone} />
                )}
                {contact.company && (
                  <InfoRow icon={Building2} label="Empresa" value={`${contact.company}${contact.job_title ? ` — ${contact.job_title}` : ""}`} />
                )}
                {(contact.address || contact.city) && (
                  <InfoRow icon={MapPin} label="Dirección" value={[contact.address, contact.city, contact.postal_code].filter(Boolean).join(", ")} />
                )}
                {contact.country && contact.country !== "España" && (
                  <InfoRow icon={Globe} label="País" value={contact.country} />
                )}
                {sourceLbl && (
                  <InfoRow icon={FileText} label="Origen" value={sourceLbl} />
                )}
                <InfoRow icon={Clock} label="Creado" value={formatDate(contact.created_at)} />
              </div>
            </Card.Body>
          </Card>

          {/* Status & Tags Card */}
          <Card>
            <Card.Header>
              <Card.Title>Estado y etiquetas</Card.Title>
            </Card.Header>
            <Card.Body>
              <div style={{ marginBottom: "var(--space-3)" }}>
                <Badge variant={status.variant} dot>{status.label}</Badge>
              </div>
              {contact.tags?.length > 0 && (
                <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap" }}>
                  {contact.tags.map((tag) => (
                    <TagBadge
                      key={typeof tag === "string" ? tag : tag.id}
                      name={typeof tag === "string" ? tag : tag.name}
                      color={typeof tag === "string" ? undefined : tag.color}
                    />
                  ))}
                </div>
              )}
              {contact.notes && (
                <div style={{ marginTop: "var(--space-4)", padding: "var(--space-3)", background: "var(--surface-secondary)", borderRadius: "var(--radius-md)" }}>
                  <p style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)", marginBottom: "var(--space-1)" }}>Notas</p>
                  <p style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)", whiteSpace: "pre-wrap" }}>{contact.notes}</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </div>

        {/* Right: Activity, Deals, Tasks */}
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
          {/* Deals Card */}
          <Card>
            <Card.Header>
              <Card.Title>Oportunidades ({deals.length})</Card.Title>
            </Card.Header>
            <Card.Body>
              {deals.length === 0 ? (
                <p style={{ fontSize: "var(--text-sm)", color: "var(--text-tertiary)" }}>Sin oportunidades asociadas.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
                  {deals.map((deal) => (
                    <div
                      key={deal.id}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "var(--space-2) var(--space-3)",
                        borderRadius: "var(--radius-md)",
                        background: "var(--surface-secondary)",
                        cursor: "pointer",
                      }}
                      onClick={() => navigate(`/pipeline`)}
                    >
                      <div>
                        <p style={{ fontSize: "var(--text-sm)", fontWeight: "var(--font-weight-medium)" }}>{deal.title}</p>
                        <p style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)" }}>{deal.stage_name || "—"}</p>
                      </div>
                      <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--font-weight-semibold)", color: "var(--color-success-600)" }}>
                        {deal.value ? formatCurrency(deal.value) : "—"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </Card.Body>
          </Card>

          {/* Tasks Card */}
          <Card>
            <Card.Header>
              <Card.Title>Tareas ({tasks.length})</Card.Title>
            </Card.Header>
            <Card.Body>
              {tasks.length === 0 ? (
                <p style={{ fontSize: "var(--text-sm)", color: "var(--text-tertiary)" }}>Sin tareas asociadas.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
                  {tasks.map((task) => (
                    <div
                      key={task.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "var(--space-2)",
                        padding: "var(--space-2) var(--space-3)",
                        borderRadius: "var(--radius-md)",
                        background: "var(--surface-secondary)",
                        opacity: task.is_completed ? 0.6 : 1,
                      }}
                    >
                      <CheckCircle2
                        size={16}
                        style={{ color: task.is_completed ? "var(--color-success-500)" : "var(--text-tertiary)", flexShrink: 0 }}
                      />
                      <p style={{
                        fontSize: "var(--text-sm)",
                        flex: 1,
                        textDecoration: task.is_completed ? "line-through" : "none",
                      }}>
                        {task.title}
                      </p>
                      {task.due_date && (
                        <span style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)" }}>
                          {formatDate(task.due_date)}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Card.Body>
          </Card>

          {/* Add Activity */}
          <Card>
            <Card.Header>
              <Card.Title>Registrar actividad</Card.Title>
            </Card.Header>
            <Card.Body>
              <form onSubmit={handleAddActivity} style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
                <Select
                  name="activityType"
                  value={activityType}
                  onChange={(e) => setActivityType(e.target.value)}
                  options={ACTIVITY_TYPES}
                />
                <Textarea
                  name="activityDesc"
                  value={activityDesc}
                  onChange={(e) => setActivityDesc(e.target.value)}
                  placeholder="Describe la actividad..."
                  rows={2}
                />
                <Button
                  type="submit"
                  size="sm"
                  disabled={!activityDesc.trim()}
                  isLoading={createActivity.isPending}
                >
                  Registrar
                </Button>
              </form>
            </Card.Body>
          </Card>

          {/* Activity Timeline */}
          <Card>
            <Card.Header>
              <Card.Title>Historial de actividad</Card.Title>
            </Card.Header>
            <Card.Body>
              {activities.length === 0 ? (
                <p style={{ fontSize: "var(--text-sm)", color: "var(--text-tertiary)" }}>Sin actividad registrada aún.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                  {activities.map((activity, i) => {
                    const ActIcon = ACTIVITY_ICONS[activity.type] || MessageSquare;
                    return (
                      <div
                        key={activity.id}
                        style={{
                          display: "flex",
                          gap: "var(--space-3)",
                          padding: "var(--space-3) 0",
                          borderBottom: i < activities.length - 1 ? "1px solid var(--border-default)" : "none",
                        }}
                      >
                        <div
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: "var(--radius-full)",
                            background: "var(--surface-secondary)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                            color: "var(--text-tertiary)",
                          }}
                        >
                          <ActIcon size={14} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: "var(--text-sm)", color: "var(--text-primary)" }}>
                            {activity.description}
                          </p>
                          <p style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)", marginTop: 2 }}>
                            {ACTIVITY_TYPES.find((t) => t.value === activity.type)?.label || activity.type}
                            {" · "}
                            {formatRelativeTime(activity.created_at)}
                            {activity.user_name && ` · ${activity.user_name}`}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card.Body>
          </Card>
        </div>
      </div>

      {/* Edit Drawer */}
      <ContactForm
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        contact={contact}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Eliminar contacto"
        message={`¿Estás seguro de que quieres eliminar a ${contact.name}? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        isLoading={deleteContact.isPending}
      />
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: "var(--space-2)" }}>
      <Icon size={16} style={{ color: "var(--text-tertiary)", marginTop: 2, flexShrink: 0 }} />
      <div>
        <p style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)" }}>{label}</p>
        <p style={{ fontSize: "var(--text-sm)", color: "var(--text-primary)" }}>{value}</p>
      </div>
    </div>
  );
}
