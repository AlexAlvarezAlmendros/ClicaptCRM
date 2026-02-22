import { useState } from "react";
import { Drawer } from "../ui/Drawer";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { useToast } from "../ui/Toast";
import { useActivities, useCreateActivity } from "../../hooks/useActivities";
import { useTasks } from "../../hooks/useTasks";
import { Textarea } from "../ui/Input";
import { Select } from "../ui/Select";
import { formatCurrency, formatDate, formatRelativeTime } from "../../lib/formatters";
import { ACTIVITY_TYPES } from "../../lib/constants";
import {
  CircleDollarSign, Calendar, User, Building2, Kanban,
  FileText, Pencil, Trash2, PhoneCall, Mail, CalendarClock,
  MessageSquare, CheckCircle2, Clock, TrendingUp, Plus,
} from "lucide-react";

const ACTIVITY_ICONS = {
  call: PhoneCall,
  email: Mail,
  meeting: CalendarClock,
  note: MessageSquare,
  task_completed: CheckCircle2,
};

export function DealDetail({ deal, isOpen, onClose, onEdit, onDelete }) {
  const { addToast } = useToast();
  const { data: activitiesData } = useActivities(
    deal ? { contact_id: deal.contact_id } : {}
  );
  const { data: tasksData } = useTasks(
    deal ? { deal_id: deal.id } : {}
  );

  const [activityType, setActivityType] = useState("note");
  const [activityDesc, setActivityDesc] = useState("");
  const createActivity = useCreateActivity();

  if (!deal) return null;

  const activities = activitiesData?.data || [];
  const tasks = tasksData?.data?.items || tasksData?.data || [];

  async function handleAddActivity(e) {
    e.preventDefault();
    if (!activityDesc.trim()) return;
    try {
      await createActivity.mutateAsync({
        type: activityType,
        description: activityDesc,
        contact_id: deal.contact_id,
        deal_id: deal.id,
      });
      setActivityDesc("");
      addToast({ type: "success", message: "Actividad registrada" });
    } catch {
      addToast({ type: "error", message: "Error al registrar actividad" });
    }
  }

  const probabilityVariant = (deal.stage_probability || 0) >= 60
    ? "success"
    : (deal.stage_probability || 0) >= 30
      ? "warning"
      : "neutral";

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title={deal.title} width="520px">
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>

        {/* Actions bar */}
        <div style={{ display: "flex", gap: "var(--space-2)", justifyContent: "flex-end" }}>
          <Button variant="secondary" size="sm" leftIcon={Pencil} onClick={() => onEdit?.(deal)}>
            Editar
          </Button>
          <Button variant="ghost" size="sm" leftIcon={Trash2} onClick={() => onDelete?.(deal)} style={{ color: "var(--color-danger-500)" }}>
            Eliminar
          </Button>
        </div>

        {/* Key metrics */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "var(--space-3)",
          }}
        >
          <MetricBox
            icon={CircleDollarSign}
            label="Valor"
            value={deal.value ? formatCurrency(deal.value) : "—"}
          />
          <MetricBox
            icon={TrendingUp}
            label="Probabilidad"
            value={`${deal.stage_probability ?? 0}%`}
            badge={<Badge variant={probabilityVariant} style={{ marginLeft: "var(--space-1)" }}>{deal.stage_name}</Badge>}
          />
          <MetricBox
            icon={Calendar}
            label="Cierre esperado"
            value={deal.expected_close ? formatDate(deal.expected_close) : "—"}
          />
          <MetricBox
            icon={Clock}
            label="Creado"
            value={formatRelativeTime(deal.created_at)}
          />
        </div>

        {/* Contact & Stage info */}
        <Card>
          <Card.Body>
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
              <InfoRow icon={User} label="Contacto" value={`${deal.contact_name || ""}${deal.contact_surname ? ` ${deal.contact_surname}` : ""}`} />
              {deal.contact_company && (
                <InfoRow icon={Building2} label="Empresa" value={deal.contact_company} />
              )}
              <InfoRow icon={Kanban} label="Etapa" value={deal.stage_name}>
                {deal.stage_color && (
                  <span
                    style={{
                      display: "inline-block",
                      width: 10,
                      height: 10,
                      borderRadius: "var(--radius-full)",
                      background: deal.stage_color,
                      marginRight: "var(--space-1)",
                    }}
                  />
                )}
              </InfoRow>
            </div>
          </Card.Body>
        </Card>

        {/* Notes */}
        {deal.notes && (
          <Card>
            <Card.Header><Card.Title>Notas</Card.Title></Card.Header>
            <Card.Body>
              <p style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)", whiteSpace: "pre-wrap" }}>
                {deal.notes}
              </p>
            </Card.Body>
          </Card>
        )}

        {/* Related Tasks */}
        {tasks.length > 0 && (
          <Card>
            <Card.Header><Card.Title>Tareas vinculadas ({tasks.length})</Card.Title></Card.Header>
            <Card.Body>
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
                {tasks.slice(0, 5).map((task) => (
                  <div
                    key={task.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "var(--space-2)",
                      fontSize: "var(--text-sm)",
                    }}
                  >
                    {task.is_completed ? (
                      <CheckCircle2 size={14} style={{ color: "var(--color-success-500)", flexShrink: 0 }} />
                    ) : (
                      <Clock size={14} style={{ color: "var(--text-tertiary)", flexShrink: 0 }} />
                    )}
                    <span style={{
                      flex: 1,
                      color: task.is_completed ? "var(--text-tertiary)" : "var(--text-primary)",
                      textDecoration: task.is_completed ? "line-through" : "none",
                    }}>
                      {task.title}
                    </span>
                    {task.due_date && (
                      <span style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)" }}>
                        {formatDate(task.due_date)}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </Card.Body>
          </Card>
        )}

        {/* Add Activity form */}
        <Card>
          <Card.Header><Card.Title>Registrar actividad</Card.Title></Card.Header>
          <Card.Body>
            <form onSubmit={handleAddActivity} style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
              <Select
                label="Tipo"
                value={activityType}
                onChange={(e) => setActivityType(e.target.value)}
                options={Object.entries(ACTIVITY_TYPES).map(([k, v]) => ({ value: k, label: v }))}
              />
              <Textarea
                label="Descripción"
                value={activityDesc}
                onChange={(e) => setActivityDesc(e.target.value)}
                rows={2}
                placeholder="Escribe una nota, resumen de llamada…"
              />
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <Button type="submit" size="sm" leftIcon={Plus} isLoading={createActivity.isPending} disabled={!activityDesc.trim()}>
                  Añadir
                </Button>
              </div>
            </form>
          </Card.Body>
        </Card>

        {/* Activity Timeline */}
        <Card>
          <Card.Header><Card.Title>Historial de actividad</Card.Title></Card.Header>
          <Card.Body>
            {activities.length === 0 ? (
              <p style={{ fontSize: "var(--text-sm)", color: "var(--text-tertiary)" }}>
                Sin actividad registrada aún.
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                {activities.slice(0, 15).map((act) => {
                  const Icon = ACTIVITY_ICONS[act.type] || FileText;
                  return (
                    <div
                      key={act.id}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "var(--space-3)",
                        padding: "var(--space-2) 0",
                        borderBottom: "1px solid var(--border-default)",
                      }}
                    >
                      <div style={{
                        width: 28,
                        height: 28,
                        borderRadius: "var(--radius-full)",
                        background: "var(--surface-secondary)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}>
                        <Icon size={14} style={{ color: "var(--text-secondary)" }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: "var(--text-sm)", color: "var(--text-primary)", marginBottom: 2 }}>
                          {act.description}
                        </p>
                        <span style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)" }}>
                          {ACTIVITY_TYPES[act.type] || act.type} · {formatRelativeTime(act.created_at)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card.Body>
        </Card>
      </div>
    </Drawer>
  );
}

/* ─── Internal sub-components ─── */

function MetricBox({ icon: Icon, label, value, badge }) {
  return (
    <div style={{
      padding: "var(--space-3)",
      borderRadius: "var(--radius-md)",
      background: "var(--surface-secondary)",
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-1)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-1)" }}>
        <Icon size={14} style={{ color: "var(--text-tertiary)" }} />
        <span style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)", fontWeight: "var(--font-weight-medium)" }}>
          {label}
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "center" }}>
        <span style={{ fontSize: "var(--text-base)", fontWeight: "var(--font-weight-semibold)", color: "var(--text-primary)" }}>
          {value}
        </span>
        {badge}
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value, children }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
      <Icon size={16} style={{ color: "var(--text-tertiary)", flexShrink: 0 }} />
      <span style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)", minWidth: 70 }}>{label}</span>
      {children}
      <span style={{ fontSize: "var(--text-sm)", color: "var(--text-primary)" }}>{value || "—"}</span>
    </div>
  );
}
