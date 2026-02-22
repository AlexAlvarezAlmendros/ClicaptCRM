import { useState } from "react";
import { ChevronDown, ChevronRight, Plus } from "lucide-react";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import { formatCurrency } from "../../lib/formatters";

/**
 * PipelineAccordion — Mobile-friendly alternative to the Kanban board.
 * Displays pipeline stages as collapsible accordion sections.
 */
export function PipelineAccordion({ stages, deals, onDealClick, onAddDeal, canWrite }) {
  const [openStages, setOpenStages] = useState(() => {
    // Open the first stage with deals by default, or the first stage
    const firstWithDeals = stages.find((s) => deals.some((d) => d.stage_id === s.id));
    return new Set(firstWithDeals ? [firstWithDeals.id] : stages.length > 0 ? [stages[0].id] : []);
  });

  function toggleStage(stageId) {
    setOpenStages((prev) => {
      const next = new Set(prev);
      if (next.has(stageId)) {
        next.delete(stageId);
      } else {
        next.add(stageId);
      }
      return next;
    });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
      {stages.map((stage) => {
        const stageDeals = deals.filter((d) => d.stage_id === stage.id);
        const isOpen = openStages.has(stage.id);
        const totalValue = stageDeals.reduce((sum, d) => sum + (d.value || 0), 0);

        return (
          <div
            key={stage.id}
            style={{
              border: "1px solid var(--border-default)",
              borderRadius: "var(--radius-lg)",
              overflow: "hidden",
              background: "var(--surface-primary)",
            }}
          >
            {/* Accordion header */}
            <button
              onClick={() => toggleStage(stage.id)}
              aria-expanded={isOpen}
              style={{
                all: "unset",
                display: "flex",
                alignItems: "center",
                gap: "var(--space-3)",
                padding: "var(--space-3) var(--space-4)",
                width: "100%",
                cursor: "pointer",
                background: isOpen ? "var(--surface-secondary)" : "transparent",
                transition: "background var(--transition-fast)",
                boxSizing: "border-box",
              }}
            >
              {/* Stage color dot */}
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "var(--radius-full)",
                  background: stage.color || "var(--text-tertiary)",
                  flexShrink: 0,
                }}
              />

              {/* Stage name */}
              <span style={{
                flex: 1,
                fontSize: "var(--text-sm)",
                fontWeight: "var(--font-weight-semibold)",
                color: "var(--text-primary)",
                textAlign: "left",
              }}>
                {stage.name}
              </span>

              {/* Count badge */}
              <Badge variant="neutral">{stageDeals.length}</Badge>

              {/* Total value */}
              {totalValue > 0 && (
                <span style={{
                  fontSize: "var(--text-xs)",
                  color: "var(--text-tertiary)",
                  fontWeight: "var(--font-weight-medium)",
                }}>
                  {formatCurrency(totalValue)}
                </span>
              )}

              {/* Chevron */}
              {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>

            {/* Accordion body */}
            {isOpen && (
              <div style={{ padding: "var(--space-2) var(--space-3) var(--space-3)" }}>
                {stageDeals.length === 0 ? (
                  <p style={{
                    fontSize: "var(--text-xs)",
                    color: "var(--text-tertiary)",
                    textAlign: "center",
                    padding: "var(--space-3) 0",
                  }}>
                    Sin oportunidades en esta etapa
                  </p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
                    {stageDeals.map((deal) => (
                      <div
                        key={deal.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => onDealClick?.(deal)}
                        onKeyDown={(e) => e.key === "Enter" && onDealClick?.(deal)}
                        style={{
                          padding: "var(--space-3)",
                          borderRadius: "var(--radius-md)",
                          background: "var(--surface-secondary)",
                          cursor: "pointer",
                          transition: "background var(--transition-fast)",
                        }}
                      >
                        <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--font-weight-medium)", color: "var(--text-primary)", marginBottom: 2 }}>
                          {deal.title}
                        </div>
                        <div style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)", marginBottom: "var(--space-1)" }}>
                          {deal.contact_name || "Sin contacto"}
                          {deal.contact_company ? ` · ${deal.contact_company}` : ""}
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--font-weight-semibold)", color: "var(--color-primary-600)" }}>
                            {deal.value ? formatCurrency(deal.value) : "—"}
                          </span>
                          {deal.expected_close && (
                            <span style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)" }}>
                              {new Date(deal.expected_close).toLocaleDateString("es-ES", { day: "numeric", month: "short" })}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add deal button */}
                <div style={{ marginTop: "var(--space-2)" }}>
                  <Button
                    variant="ghost"
                    size="sm"
                    leftIcon={Plus}
                    onClick={() => onAddDeal?.(stage.id)}
                    disabled={!canWrite}
                    style={{ width: "100%" }}
                  >
                    Añadir oportunidad
                  </Button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
