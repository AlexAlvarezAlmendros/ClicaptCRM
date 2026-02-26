import { Select } from "../ui/Select";
import { Button } from "../ui/Button";
import { CONTACT_SOURCES, CONTACT_STATUSES } from "../../lib/constants";
import { useGroups } from "../../hooks/useGroups";
import { RotateCcw } from "lucide-react";

export function ContactFilters({ filters, onChange, onReset }) {
  const { data: groupsData } = useGroups();
  const groups = groupsData?.data || [];
  const groupOptions = groups.map((g) => ({ value: String(g.id), label: g.name }));
  const hasFilters = filters.status || filters.source || filters.group_id;

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

      <div style={{ minWidth: 160 }}>
        <Select
          label="Grupo"
          name="group_id"
          value={filters.group_id}
          onChange={(e) => onChange({ group_id: e.target.value })}
          options={groupOptions}
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
