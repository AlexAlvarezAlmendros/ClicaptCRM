import { Select } from "../ui/Select";
import { Button } from "../ui/Button";
import { CONTACT_SOURCES, CONTACT_STATUSES } from "../../lib/constants";
import { RotateCcw } from "lucide-react";

export function ContactFilters({ filters, onChange, onReset }) {
  const hasFilters = filters.status || filters.source;

  return (
    <div
      style={{
        display: "flex",
        gap: "var(--space-3)",
        alignItems: "flex-end",
        flexWrap: "wrap",
      }}
    >
      <div style={{ minWidth: 160 }}>
        <Select
          label="Estado"
          name="status"
          value={filters.status}
          onChange={(e) => onChange({ status: e.target.value })}
          options={CONTACT_STATUSES}
          placeholder="Todos"
        />
      </div>

      <div style={{ minWidth: 160 }}>
        <Select
          label="Origen"
          name="source"
          value={filters.source}
          onChange={(e) => onChange({ source: e.target.value })}
          options={CONTACT_SOURCES}
          placeholder="Todos"
        />
      </div>

      {hasFilters && (
        <Button
          variant="ghost"
          size="sm"
          leftIcon={RotateCcw}
          onClick={onReset}
          style={{ marginBottom: 2 }}
        >
          Limpiar
        </Button>
      )}
    </div>
  );
}
