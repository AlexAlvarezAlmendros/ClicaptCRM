import { useState } from "react";
import { useTasks } from "../hooks/useTasks";
import { Button } from "../components/ui/Button";
import { Spinner } from "../components/ui/Spinner";
import { EmptyState } from "../components/ui/EmptyState";
import { Badge } from "../components/ui/Badge";
import { Plus, CheckSquare, Circle, CheckCircle2 } from "lucide-react";

const FILTERS = [
  { key: "today", label: "Hoy" },
  { key: "overdue", label: "Vencidas" },
  { key: "upcoming", label: "Próximas" },
  { key: "completed", label: "Completadas" },
];

const PRIORITY_BADGES = {
  high: { label: "Alta", variant: "danger" },
  medium: { label: "Media", variant: "warning" },
  low: { label: "Baja", variant: "neutral" },
};

export default function TasksPage() {
  const [filter, setFilter] = useState("today");
  const { data, isLoading } = useTasks({ filter });

  const tasks = data?.data?.items || [];

  return (
    <div>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "var(--space-6)",
        }}
      >
        <h1 className="text-h1">Tareas</h1>
        <Button leftIcon={Plus}>Nueva tarea</Button>
      </div>

      {/* Filter tabs */}
      <div
        style={{
          display: "flex",
          gap: "var(--space-1)",
          marginBottom: "var(--space-4)",
          background: "var(--surface-secondary)",
          padding: "var(--space-0-5)",
          borderRadius: "var(--radius-lg)",
          width: "fit-content",
        }}
      >
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            style={{
              padding: "var(--space-2) var(--space-4)",
              borderRadius: "var(--radius-md)",
              border: "none",
              background: filter === f.key ? "var(--surface-primary)" : "transparent",
              boxShadow: filter === f.key ? "var(--shadow-xs)" : "none",
              color: filter === f.key ? "var(--text-primary)" : "var(--text-secondary)",
              fontSize: "var(--text-sm)",
              fontWeight: "var(--font-weight-medium)",
              cursor: "pointer",
              transition: "all var(--transition-fast)",
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Task list */}
      {isLoading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "var(--space-12)" }}>
          <Spinner size={32} />
        </div>
      ) : tasks.length === 0 ? (
        <EmptyState
          icon={CheckSquare}
          title="Sin tareas"
          description="No hay tareas para este filtro. ¡Crea una nueva!"
          action={<Button leftIcon={Plus}>Crear tarea</Button>}
        />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
          {tasks.map((task) => {
            const priority = PRIORITY_BADGES[task.priority] || PRIORITY_BADGES.medium;
            return (
              <div
                key={task.id}
                className="card card--hoverable"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--space-3)",
                  padding: "var(--space-3) var(--space-4)",
                  cursor: "pointer",
                }}
              >
                {task.is_completed ? (
                  <CheckCircle2 size={20} style={{ color: "var(--color-success-500)", flexShrink: 0 }} />
                ) : (
                  <Circle size={20} style={{ color: "var(--text-tertiary)", flexShrink: 0 }} />
                )}
                <div style={{ flex: 1 }}>
                  <span
                    style={{
                      fontSize: "var(--text-sm)",
                      fontWeight: "var(--font-weight-medium)",
                      color: "var(--text-primary)",
                      textDecoration: task.is_completed ? "line-through" : "none",
                    }}
                  >
                    {task.title}
                  </span>
                  {task.due_date && (
                    <span className="text-caption" style={{ marginLeft: "var(--space-2)" }}>
                      {new Date(task.due_date).toLocaleDateString("es-ES")}
                    </span>
                  )}
                </div>
                <Badge variant={priority.variant}>{priority.label}</Badge>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
