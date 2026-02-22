import { useState, useMemo, useCallback } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { PipelineColumn } from "./PipelineColumn";
import { DealCard } from "./DealCard";
import { useMoveDealStage } from "../../hooks/useDeals";
import "./PipelineBoard.css";

export function PipelineBoard({ stages, deals, onDealClick, onAddDeal }) {
  const moveDealStage = useMoveDealStage();
  const [activeDeal, setActiveDeal] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
  );

  // Group deals by stage
  const dealsByStage = useMemo(() => {
    const grouped = {};
    for (const stage of stages) {
      grouped[stage.id] = [];
    }
    for (const deal of deals) {
      if (grouped[deal.stage_id]) {
        grouped[deal.stage_id].push(deal);
      }
    }
    // Sort by position within each stage
    for (const stageId in grouped) {
      grouped[stageId].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
    }
    return grouped;
  }, [stages, deals]);

  const findDealStage = useCallback(
    (dealId) => {
      for (const stageId in dealsByStage) {
        if (dealsByStage[stageId].some((d) => d.id === dealId)) {
          return stageId;
        }
      }
      return null;
    },
    [dealsByStage],
  );

  function handleDragStart(event) {
    const deal = event.active.data.current?.deal;
    if (deal) setActiveDeal(deal);
  }

  function handleDragEnd(event) {
    const { active, over } = event;
    setActiveDeal(null);

    if (!over) return;

    const activeDealId = active.id;
    const activeStageId = findDealStage(activeDealId);

    // Determine target stage
    let targetStageId;
    let targetPosition = 0;

    if (over.data.current?.type === "column") {
      targetStageId = over.data.current.stageId;
      const targetDeals = dealsByStage[targetStageId] || [];
      targetPosition = targetDeals.length; // place at end
    } else {
      // Dropped on another deal
      const overDealId = over.id;
      targetStageId = findDealStage(overDealId);

      if (!targetStageId) return;

      const targetDeals = dealsByStage[targetStageId] || [];
      const overIndex = targetDeals.findIndex((d) => d.id === overDealId);
      targetPosition = overIndex >= 0 ? overIndex : targetDeals.length;
    }

    if (!targetStageId || !activeStageId) return;

    // Same stage, same position — no-op
    if (activeStageId === targetStageId) {
      const stageDeals = dealsByStage[activeStageId];
      const oldIndex = stageDeals.findIndex((d) => d.id === activeDealId);
      if (oldIndex === targetPosition) return;
    }

    // Call API to move
    moveDealStage.mutate({
      id: activeDealId,
      stageId: targetStageId,
      position: targetPosition,
    });
  }

  function handleDragCancel() {
    setActiveDeal(null);
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="pipeline-board">
        {stages.map((stage) => (
          <PipelineColumn
            key={stage.id}
            stage={stage}
            deals={dealsByStage[stage.id] || []}
            onDealClick={onDealClick}
            onAddDeal={onAddDeal}
          />
        ))}
      </div>

      <DragOverlay dropAnimation={null}>
        {activeDeal ? (
          <div style={{ width: "var(--kanban-column-width)", maxWidth: 280 }}>
            <div className="deal-card deal-card--dragging">
              <div className="deal-card__title">{activeDeal.title}</div>
              <div className="deal-card__company">{activeDeal.contact_name || "Sin contacto"}</div>
              <div className="deal-card__footer">
                <span className="deal-card__value">
                  {activeDeal.value ? `${activeDeal.value.toLocaleString("es-ES")} €` : "—"}
                </span>
              </div>
            </div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
