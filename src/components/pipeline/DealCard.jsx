import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { formatCurrency } from "../../lib/formatters";
import { GripVertical, Calendar } from "lucide-react";
import "./DealCard.css";

export function DealCard({ deal, onClick }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: deal.id,
    data: { type: "deal", deal },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`deal-card${isDragging ? " deal-card--dragging" : ""}`}
      onClick={() => onClick?.(deal)}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: "var(--space-1)" }}>
        <button
          className="deal-card__grip"
          {...attributes}
          {...listeners}
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical size={14} />
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="deal-card__title">{deal.title}</div>
          <div className="deal-card__company">
            {deal.contact_name || "Sin contacto"}
            {deal.contact_company ? ` · ${deal.contact_company}` : ""}
          </div>
        </div>
      </div>
      <div className="deal-card__footer">
        <span className="deal-card__value">
          {deal.value ? formatCurrency(deal.value) : "—"}
        </span>
        {deal.expected_close && (
          <span className="deal-card__date">
            <Calendar size={12} style={{ marginRight: 3 }} />
            {new Date(deal.expected_close).toLocaleDateString("es-ES", { day: "numeric", month: "short" })}
          </span>
        )}
      </div>
    </div>
  );
}
