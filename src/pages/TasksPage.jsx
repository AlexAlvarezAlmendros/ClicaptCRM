import { useState } from "react";
import { useTasks, useCompleteTask } from "../hooks/useTasks";
import { Button } from "../components/ui/Button";
import { Spinner } from "../components/ui/Spinner";
import { EmptyState } from "../components/ui/EmptyState";
import { Badge } from "../components/ui/Badge";
import { TaskForm } from "../components/tasks/TaskForm";
import { Plus, CheckSquare, Circle, CheckCircle2, Calendar, User } from "lucide-react";
import { formatDate, formatRelativeTime } from "../lib/formatters";
import { useSubscriptionGate } from "../components/onboarding/SubscriptionGate";
import { SkeletonList } from "../components/ui/Skeleton";

const FILTERS = [
  { key: "all", label: "Todas" },
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
  const [filter, setFilter] = useState("all");
  const { data, isLoading } = useTasks({ filter: filter === "all" ? undefined : filter });
  const completeTask = useCompleteTask();

  const [formOpen, setFormOpen] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const { canWrite } = useSubscriptionGate();

  const tasks = data?.data || [];

  function handleToggle(task) {
    if (!task.is_completed) {
      completeTask.mutate(task.id);
    }
  }

  function handleEdit(task) {
    setEditTask(task);
    setFormOpen(true);
  }

  function handleNew() {
    setEditTask(null);
    setFormOpen(true);
  }

  // Check if a date is overdue
  function isOverdue(dateStr) {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return d < now;
  }

  return (
    <div>
      {/* Header */}
      <div className="tasks-header" style={{ marginBottom: "var(--space-6)" }}>
        <div>
          <h1 className="text-h1">Tareas</h1>
          <p className="text-body-sm" style={{ color: "var(--text-tertiary)" }}>
            {tasks.length} tarea{tasks.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button leftIcon={Plus} onClick={handleNew} disabled={!canWrite} title={!canWrite ? "Suscripción requerida" : undefined}>Nueva tarea</Button>
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
          overflowX: "auto",
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
              whiteSpace: "nowrap",
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Task list */}
      {isLoading ? (
        <SkeletonList count={6} />
      ) : tasks.length === 0 ? (
        <EmptyState
          icon={CheckSquare}
          title="Sin tareas"
          description="No hay tareas para este filtro. ¡Crea una nueva!"
          action={<Button leftIcon={Plus} onClick={handleNew}>Crear tarea</Button>}
        />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
          {tasks.map((task) => {
            const priority = PRIORITY_BADGES[task.priority] || PRIORITY_BADGES.medium;
            const overdue = !task.is_completed && isOverdue(task.due_date);

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
                  opacity: task.is_completed ? 0.6 : 1,
                }}
                onClick={() => handleEdit(task)}
              >
                {/* Toggle button */}
                <button
                  onClick={(e) => { e.stopPropagation(); handleToggle(task); }}
                  style={{
                    all: "unset",
                    cursor: task.is_completed ? "default" : "pointer",
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                  }}
                  disabled={task.is_completed}
                  title={task.is_completed ? "Completada" : "Marcar como completada"}
                >
                  {task.is_completed ? (
                    <CheckCircle2 size={20} style={{ color: "var(--color-success-500)" }} />
                  ) : (
                    <Circle size={20} style={{ color: "var(--text-tertiary)" }} />
                  )}
                </button>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
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
                  <div style={{ display: "flex", gap: "var(--space-3)", marginTop: 2, flexWrap: "wrap" }}>
                    {task.due_date && (
                      <span
                        style={{
                          fontSize: "var(--text-xs)",
                          color: overdue ? "var(--color-danger-500)" : "var(--text-tertiary)",
                          display: "flex",
                          alignItems: "center",
                          gap: 3,
                          fontWeight: overdue ? "var(--font-weight-semibold)" : "normal",
                        }}
                      >
                        <Calendar size={12} />
                        {formatDate(task.due_date)}
                      </span>
                    )}
                    {task.contact_name && (
                      <span style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)", display: "flex", alignItems: "center", gap: 3 }}>
                        <User size={12} />
                        {task.contact_name}
                      </span>
                    )}
                  </div>
                </div>

                {/* Priority */}
                <Badge variant={priority.variant}>{priority.label}</Badge>
              </div>
            );
          })}
        </div>
      )}

      {/* Task Form Drawer */}
      <TaskForm
        isOpen={formOpen}
        onClose={() => { setFormOpen(false); setEditTask(null); }}
        task={editTask}
      />
    </div>
  );
}
