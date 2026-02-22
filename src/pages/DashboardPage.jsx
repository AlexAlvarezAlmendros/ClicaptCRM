import { useNavigate } from "react-router-dom";
import { useDashboard } from "../hooks/useDashboard";
import { KpiCard } from "../components/dashboard/KpiCard";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Spinner } from "../components/ui/Spinner";
import {
  Users, Kanban, DollarSign, TrendingUp, PhoneCall, Mail,
  CalendarClock, MessageSquare, CheckCircle2, Circle, Calendar,
} from "lucide-react";
import { formatCurrency, formatRelativeTime, formatDate } from "../lib/formatters";
import { ACTIVITY_TYPES } from "../lib/constants";

const ACTIVITY_ICONS = {
  call: PhoneCall,
  email: Mail,
  meeting: CalendarClock,
  note: MessageSquare,
  task_completed: CheckCircle2,
};

const PRIORITY_COLORS = {
  high: "var(--color-danger-500)",
  medium: "var(--color-warning-500)",
  low: "var(--text-tertiary)",
};

export default function DashboardPage() {
  const navigate = useNavigate();
  const { data, isLoading } = useDashboard();

  if (isLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "var(--space-12)" }}>
        <Spinner size={32} />
      </div>
    );
  }

  const stats = data?.data || {};
  const activities = stats.recentActivity || [];
  const todayTasks = stats.todayTasks || [];
  const dealsByStage = stats.dealsByStage || [];

  return (
    <div>
      <h1 className="text-h1" style={{ marginBottom: "var(--space-6)" }}>
        Dashboard
      </h1>

      {/* KPI Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "var(--space-4)",
          marginBottom: "var(--space-6)",
        }}
      >
        <KpiCard icon={Users} label="Nuevos leads" value={stats.newLeads ?? 0} />
        <KpiCard icon={Kanban} label="Oportunidades abiertas" value={stats.openDeals ?? 0} />
        <KpiCard icon={DollarSign} label="Valor del pipeline" value={formatCurrency(stats.pipelineValue ?? 0)} />
        <KpiCard icon={TrendingUp} label="Tasa de conversión" value={`${stats.conversionRate ?? 0}%`} />
      </div>

      {/* Pipeline funnel + Activity */}
      <div className="dashboard-grid-2col">
        {/* Pipeline funnel */}
        <Card>
          <Card.Header>
            <Card.Title>Pipeline por etapa</Card.Title>
          </Card.Header>
          <Card.Body>
            {dealsByStage.length === 0 ? (
              <p style={{ fontSize: "var(--text-sm)", color: "var(--text-tertiary)" }}>Sin datos de pipeline aún.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
                {dealsByStage.map((stage) => {
                  const maxValue = Math.max(...dealsByStage.map((s) => Number(s.count) || 0), 1);
                  const pct = Math.round(((Number(stage.count) || 0) / maxValue) * 100);
                  return (
                    <div key={stage.stage_id}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
                          <div style={{ width: 8, height: 8, borderRadius: "var(--radius-full)", background: stage.color }} />
                          <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--font-weight-medium)" }}>{stage.name}</span>
                          <span style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)" }}>{stage.count}</span>
                        </div>
                        <span style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)", fontWeight: "var(--font-weight-semibold)" }}>
                          {formatCurrency(Number(stage.value) || 0)}
                        </span>
                      </div>
                      <div style={{ height: 6, borderRadius: "var(--radius-full)", background: "var(--surface-secondary)", overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${pct}%`, background: stage.color, borderRadius: "var(--radius-full)", transition: "width 0.3s" }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card.Body>
        </Card>

        {/* Recent Activity */}
        <Card>
          <Card.Header>
            <Card.Title>Actividad reciente</Card.Title>
          </Card.Header>
          <Card.Body>
            {activities.length === 0 ? (
              <p style={{ fontSize: "var(--text-sm)", color: "var(--text-tertiary)" }}>Sin actividad reciente.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 0, maxHeight: 320, overflowY: "auto" }}>
                {activities.slice(0, 10).map((act, i) => {
                  const ActIcon = ACTIVITY_ICONS[act.type] || MessageSquare;
                  const label = ACTIVITY_TYPES.find((t) => t.value === act.type)?.label || act.type;
                  return (
                    <div
                      key={act.id}
                      style={{
                        display: "flex",
                        gap: "var(--space-3)",
                        padding: "var(--space-2) 0",
                        borderBottom: i < activities.length - 1 ? "1px solid var(--border-default)" : "none",
                      }}
                    >
                      <div
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: "var(--radius-full)",
                          background: "var(--surface-secondary)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          color: "var(--text-tertiary)",
                        }}
                      >
                        <ActIcon size={13} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: "var(--text-xs)", color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {act.description}
                        </p>
                        <p style={{ fontSize: 11, color: "var(--text-tertiary)" }}>
                          {label} · {formatRelativeTime(act.created_at)}
                          {act.created_by_name && ` · ${act.created_by_name}`}
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

      {/* Today's tasks */}
      <Card>
        <Card.Header>
          <Card.Title>Tareas pendientes de hoy</Card.Title>
        </Card.Header>
        <Card.Body>
          {todayTasks.length === 0 ? (
            <p style={{ fontSize: "var(--text-sm)", color: "var(--text-tertiary)" }}>
              🎉 ¡Sin tareas pendientes para hoy!
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
              {todayTasks.map((task) => (
                <div
                  key={task.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "var(--space-3)",
                    padding: "var(--space-2) var(--space-3)",
                    borderRadius: "var(--radius-md)",
                    background: "var(--surface-secondary)",
                    cursor: "pointer",
                  }}
                  onClick={() => navigate("/tareas")}
                >
                  <Circle size={16} style={{ color: PRIORITY_COLORS[task.priority] || "var(--text-tertiary)", flexShrink: 0 }} />
                  <span style={{ flex: 1, fontSize: "var(--text-sm)", color: "var(--text-primary)" }}>
                    {task.title}
                  </span>
                  {task.contact_name && (
                    <span style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)" }}>
                      {task.contact_name}
                    </span>
                  )}
                  {task.due_date && (
                    <span style={{ fontSize: "var(--text-xs)", color: task.due_date < new Date().toISOString().split("T")[0] ? "var(--color-danger-500)" : "var(--text-tertiary)" }}>
                      {formatDate(task.due_date)}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
}
