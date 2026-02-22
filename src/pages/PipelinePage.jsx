import { useState, useMemo } from "react";
import { useDeals, useDeleteDeal } from "../hooks/useDeals";
import { usePipelineStages } from "../hooks/usePipelineStages";
import { useIsMobile } from "../hooks/useMediaQuery";
import { Spinner } from "../components/ui/Spinner";
import { Button } from "../components/ui/Button";
import { EmptyState } from "../components/ui/EmptyState";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { useToast } from "../components/ui/Toast";
import { PipelineBoard } from "../components/pipeline/PipelineBoard";
import { PipelineAccordion } from "../components/pipeline/PipelineAccordion";
import { DealForm } from "../components/pipeline/DealForm";
import { DealDetail } from "../components/pipeline/DealDetail";
import { Plus, Kanban, CircleDollarSign } from "lucide-react";
import { formatCurrency } from "../lib/formatters";
import { useSubscriptionGate } from "../components/onboarding/SubscriptionGate";

export default function PipelinePage() {
  const { data: dealsData, isLoading: dealsLoading } = useDeals();
  const { data: stagesData, isLoading: stagesLoading } = usePipelineStages();
  const deleteDeal = useDeleteDeal();
  const { addToast } = useToast();
  const isMobile = useIsMobile();

  const [formOpen, setFormOpen] = useState(false);
  const [editDeal, setEditDeal] = useState(null);
  const [defaultStageId, setDefaultStageId] = useState("");
  const [detailDeal, setDetailDeal] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const { canWrite } = useSubscriptionGate();

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
    setDetailDeal(deal);
  }

  function handleEditFromDetail(deal) {
    setDetailDeal(null);
    setEditDeal(deal);
    setDefaultStageId("");
    setFormOpen(true);
  }

  function handleDeleteFromDetail(deal) {
    setDetailDeal(null);
    setDeleteConfirm(deal);
  }

  async function confirmDelete() {
    if (!deleteConfirm) return;
    try {
      await deleteDeal.mutateAsync(deleteConfirm.id);
      addToast({ type: "success", message: "Oportunidad eliminada" });
    } catch {
      addToast({ type: "error", message: "Error al eliminar la oportunidad" });
    }
    setDeleteConfirm(null);
  }

  if (isLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "var(--space-12)" }}>
        <Spinner size={32} />
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", minWidth: 0, overflow: "hidden" }}>
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
        <Button leftIcon={Plus} onClick={() => handleAddDeal("")} disabled={!canWrite} title={!canWrite ? "Suscripción requerida" : undefined}>
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
      ) : isMobile ? (
        <PipelineAccordion
          stages={stages}
          deals={deals}
          onDealClick={handleDealClick}
          onAddDeal={handleAddDeal}
          canWrite={canWrite}
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

      {/* Deal Detail Drawer */}
      <DealDetail
        deal={detailDeal}
        isOpen={!!detailDeal}
        onClose={() => setDetailDeal(null)}
        onEdit={handleEditFromDetail}
        onDelete={handleDeleteFromDetail}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteConfirm}
        title="Eliminar oportunidad"
        message={`¿Estás seguro de eliminar "${deleteConfirm?.title}"? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        variant="danger"
        isLoading={deleteDeal.isPending}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirm(null)}
      />
    </div>
  );
}
