import { useState } from "react";

const COLUMN_OPTIONS = [
  { key: "first_name", label: "Nombre" },
  { key: "last_name", label: "Apellido" },
  { key: "email", label: "Email" },
  { key: "phone", label: "Teléfono" },
  { key: "company", label: "Empresa" },
  { key: "position", label: "Cargo" },
  { key: "status", label: "Estado" },
  { key: "source", label: "Origen" },
  { key: "notes", label: "Notas" },
  { key: "created_at", label: "Fecha creación" },
];

export function ContactColumnsSelector({ selected, onChange }) {
  const [open, setOpen] = useState(false);

  function handleToggle(key) {
    if (selected.includes(key)) {
      onChange(selected.filter((k) => k !== key));
    } else {
      onChange([...selected, key]);
    }
  }

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <button type="button" onClick={() => setOpen((v) => !v)} style={{ padding: "4px 12px", border: "1px solid #ccc", borderRadius: 4 }}>
        Seleccionar columnas
      </button>
      {open && (
        <div style={{ position: "absolute", zIndex: 10, background: "white", border: "1px solid #ccc", borderRadius: 4, padding: 8, minWidth: 180 }}>
          {COLUMN_OPTIONS.map((col) => (
            <label key={col.key} style={{ display: "block", marginBottom: 4 }}>
              <input
                type="checkbox"
                checked={selected.includes(col.key)}
                onChange={() => handleToggle(col.key)}
                style={{ marginRight: 8 }}
              />
              {col.label}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
