import { useState, useMemo } from "react";
import { useDeals } from "../hooks/useDeals";
import { usePipelineStages } from "../hooks/usePipelineStages";
import { Spinner } from "../components/ui/Spinner";
import { Button } from "../components/ui/Button";
import { EmptyState } from "../components/ui/EmptyState";
import { PipelineBoard } from "../components/pipeline/PipelineBoard";
import { DealForm } from "../components/pipeline/DealForm";
import { Plus, Kanban, CircleDollarSign } from "lucide-react";
import { formatCurrency } from "../lib/formatters";

export default function PipelinePage() {
  const { data: dealsData, isLoading: dealsLoading } = useDeals();
  const { data: stagesData, isLoading: stagesLoading } = usePipelineStages();

  const [formOpen, setFormOpen] = useState(false);
  const [editDeal, setEditDeal] = useState(null);
  const [defaultStageId, setDefaultStageId] = useState("");

  const isLoading = dealsLoading || stagesLoading;

  const deals = dealsData?.data || [];
  const stages = stagesData?.data || [];

  // Summary metrics
  const totalDeals = deals.length;
  const totalValue = useMemo(() => deals.reduce((sum, d) => sum + (d.value || 0), 0), [deals]);

  function handleAddDeal(stageId) {
    setEditDeal(null);
    setDefaultStageId(stageId || (stages[0]?.id ?? ""));
    setFormOpen(true);
  }

  function handleDealClick(deal) {
    setEditDeal(deal);
    setDefaultStageId("");
    setFormOpen(true);
  }

  if (isLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "var(--space-12)" }}>
        <Spinner size={32} />
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "var(--space-4)",
          flexWrap: "wrap",
          gap: "var(--space-3)",
        }}
      >
        <div>
          <h1 className="text-h1" style={{ marginBottom: 2 }}>Pipeline</h1>
          <p className="text-body-sm" style={{ color: "var(--text-tertiary)" }}>
            {totalDeals} oportunidades · {formatCurrency(totalValue)} valor total
          </p>
        </div>
        <Button leftIcon={Plus} onClick={() => handleAddDeal("")}>
          Nueva oportunidad
        </Button>
      </div>

      {/* Board */}
      {stages.length === 0 ? (
        <EmptyState
          icon={Kanban}
          title="Sin etapas configuradas"
          description="Las etapas del pipeline se crean automáticamente al completar el registro. Si no aparecen, contacta con soporte."
        />
      ) : (
        <PipelineBoard
          stages={stages}
          deals={deals}
          onDealClick={handleDealClick}
          onAddDeal={handleAddDeal}
        />
      )}

      {/* Deal Form Drawer */}
      <DealForm
        isOpen={formOpen}
        onClose={() => { setFormOpen(false); setEditDeal(null); }}
        deal={editDeal}
        defaultStageId={defaultStageId}
      />
    </div>
  );
}
