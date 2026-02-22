import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { DealCard } from "./DealCard";
import { formatCurrency } from "../../lib/formatters";
import { Plus } from "lucide-react";
import { Button } from "../ui/Button";
import "./PipelineBoard.css";

export function PipelineColumn({ stage, deals, onDealClick, onAddDeal }) {
  const { setNodeRef, isOver } = useDroppable({
    id: `column-${stage.id}`,
    data: { type: "column", stageId: stage.id },
  });

  const totalValue = deals.reduce((sum, d) => sum + (d.value || 0), 0);

  return (
    <div className={`pipeline-column${isOver ? " pipeline-column--drag-over" : ""}`}>
      <div className="pipeline-column__header">
        <div className="pipeline-column__title-group">
          <div className="pipeline-column__color-dot" style={{ background: stage.color }} />
          <span className="pipeline-column__title">{stage.name}</span>
          <span className="pipeline-column__count">{deals.length}</span>
        </div>
        <span className="pipeline-column__total">
          {formatCurrency(totalValue)}
        </span>
      </div>

      <div ref={setNodeRef} className="pipeline-column__cards">
        <SortableContext items={deals.map((d) => d.id)} strategy={verticalListSortingStrategy}>
          {deals.map((deal) => (
            <DealCard key={deal.id} deal={deal} onClick={onDealClick} />
          ))}
        </SortableContext>

        <button
          className="pipeline-column__add-btn"
          onClick={() => onAddDeal(stage.id)}
        >
          <Plus size={14} /> Añadir
        </button>
      </div>
    </div>
  );
}
