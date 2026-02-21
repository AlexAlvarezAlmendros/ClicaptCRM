import { useDeals } from "../hooks/useDeals";
import { Spinner } from "../components/ui/Spinner";
import { Button } from "../components/ui/Button";
import { EmptyState } from "../components/ui/EmptyState";
import { Plus, Kanban } from "lucide-react";

export default function PipelinePage() {
  const { data, isLoading } = useDeals();

  if (isLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "var(--space-12)" }}>
        <Spinner size={32} />
      </div>
    );
  }

  const deals = data?.data?.items || [];
  const stages = data?.data?.stages || [];

  // Group deals by stage
  const dealsByStage = stages.reduce((acc, stage) => {
    acc[stage.id] = deals.filter((d) => d.stage_id === stage.id);
    return acc;
  }, {});

  return (
    <div>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "var(--space-4)",
        }}
      >
        <h1 className="text-h1">Pipeline</h1>
        <Button leftIcon={Plus}>Nueva oportunidad</Button>
      </div>

      {/* Kanban Board */}
      {stages.length === 0 ? (
        <EmptyState
          icon={Kanban}
          title="Sin etapas configuradas"
          description="Configura las etapas de tu pipeline en ajustes."
        />
      ) : (
        <div className="pipeline-board">
          {stages.map((stage) => {
            const stageDeals = dealsByStage[stage.id] || [];
            const totalValue = stageDeals.reduce((sum, d) => sum + (d.value || 0), 0);

            return (
              <div key={stage.id} className="pipeline-column">
                <div className="pipeline-column__header">
                  <div className="pipeline-column__title-group">
                    <div
                      className="pipeline-column__color-dot"
                      style={{ background: stage.color }}
                    />
                    <span className="pipeline-column__title">{stage.name}</span>
                    <span className="pipeline-column__count">{stageDeals.length}</span>
                  </div>
                  <span className="pipeline-column__total">
                    {totalValue.toLocaleString("es-ES")} €
                  </span>
                </div>

                <div className="pipeline-column__cards">
                  {stageDeals.map((deal) => (
                    <div key={deal.id} className="deal-card">
                      <div className="deal-card__title">{deal.title}</div>
                      <div className="deal-card__company">{deal.contact_name || "Sin contacto"}</div>
                      <div className="deal-card__footer">
                        <span className="deal-card__value">
                          {(deal.value || 0).toLocaleString("es-ES")} €
                        </span>
                        {deal.expected_close && (
                          <span className="deal-card__date">
                            {new Date(deal.expected_close).toLocaleDateString("es-ES")}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
