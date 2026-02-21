import { useDashboard } from "../hooks/useDashboard";
import { KpiCard } from "../components/dashboard/KpiCard";
import { Spinner } from "../components/ui/Spinner";
import { Users, Kanban, DollarSign, TrendingUp } from "lucide-react";

export default function DashboardPage() {
  const { data, isLoading } = useDashboard();

  if (isLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "var(--space-12)" }}>
        <Spinner size={32} />
      </div>
    );
  }

  const stats = data?.data || {};

  return (
    <div>
      <h1 className="text-h1" style={{ marginBottom: "var(--space-6)" }}>
        Dashboard
      </h1>

      {/* KPI Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "var(--space-4)",
          marginBottom: "var(--space-6)",
        }}
      >
        <KpiCard
          icon={Users}
          label="Nuevos leads"
          value={stats.newLeads ?? 0}
        />
        <KpiCard
          icon={Kanban}
          label="Oportunidades abiertas"
          value={stats.openDeals ?? 0}
        />
        <KpiCard
          icon={DollarSign}
          label="Valor del pipeline"
          value={`${(stats.pipelineValue ?? 0).toLocaleString("es-ES")} €`}
        />
        <KpiCard
          icon={TrendingUp}
          label="Tasa de conversión"
          value={`${stats.conversionRate ?? 0}%`}
        />
      </div>

      {/* Placeholder sections */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "var(--space-4)",
        }}
      >
        <div className="card">
          <div className="card__header">
            <h3 className="card__title">Actividad reciente</h3>
          </div>
          <div className="card__body">
            <p className="text-body-sm">Las actividades recientes aparecerán aquí.</p>
          </div>
        </div>
        <div className="card">
          <div className="card__header">
            <h3 className="card__title">Tareas de hoy</h3>
          </div>
          <div className="card__body">
            <p className="text-body-sm">Tus tareas pendientes aparecerán aquí.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
