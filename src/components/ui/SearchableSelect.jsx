import { useState, useRef, useEffect, useId } from "react";
import { ChevronDown, Search, X } from "lucide-react";

/**
 * SearchableSelect
 * Props:
 *   label, error, required, placeholder, disabled
 *   options: Array<{ value: string, label: string }>
 *   value: string          – controlled selected value
 *   onChange: (value) => void
 */
export function SearchableSelect({
  label,
  error,
  required = false,
  placeholder = "Seleccionar...",
  disabled = false,
  options = [],
  value = "",
  onChange,
  className = "",
}) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef(null);
  const searchRef = useRef(null);
  const listRef = useRef(null);

  const selected = options.find((o) => o.value === value) || null;

  const filtered = query.trim()
    ? options.filter((o) =>
        o.label.toLowerCase().includes(query.toLowerCase())
      )
    : options;

  // Close on outside click
  useEffect(() => {
    function onPointerDown(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (open) {
      setTimeout(() => searchRef.current?.focus(), 10);
    }
  }, [open]);

  function handleSelect(opt) {
    onChange(opt.value);
    setOpen(false);
    setQuery("");
  }

  function handleClear(e) {
    e.stopPropagation();
    onChange("");
    setQuery("");
  }

  function handleKeyDown(e) {
    if (e.key === "Escape") {
      setOpen(false);
      setQuery("");
    }
  }

  return (
    <div
      className={`input-wrapper ${className}`}
      ref={containerRef}
      style={{ position: "relative" }}
    >
      {label && (
        <label
          htmlFor={id}
          className={`input-label ${required ? "input-label--required" : ""}`}
        >
          {label}
        </label>
      )}

      {/* Trigger button */}
      <button
        id={id}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => !disabled && setOpen((v) => !v)}
        onKeyDown={handleKeyDown}
        style={{
          display: "flex",
          alignItems: "center",
          width: "100%",
          height: 40,
          padding: "0 var(--space-3)",
          background: "var(--surface-primary)",
          border: `1px solid ${error ? "var(--border-error)" : open ? "var(--border-focus)" : "var(--border-default)"}`,
          borderRadius: "var(--radius-lg)",
          boxShadow: open
            ? "var(--shadow-focus-ring)"
            : error
            ? "var(--shadow-error-ring)"
            : "none",
          cursor: disabled ? "not-allowed" : "pointer",
          outline: "none",
          transition: "all var(--transition-fast)",
          gap: "var(--space-2)",
          textAlign: "left",
          fontFamily: "var(--font-sans)",
          fontSize: "var(--text-sm)",
          color: selected ? "var(--text-primary)" : "var(--text-tertiary)",
          opacity: disabled ? 0.5 : 1,
        }}
      >
        <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {selected ? selected.label : placeholder}
        </span>

        {selected && !disabled && (
          <X
            size={14}
            onClick={handleClear}
            style={{ flexShrink: 0, color: "var(--text-tertiary)" }}
          />
        )}
        <ChevronDown
          size={16}
          style={{
            flexShrink: 0,
            color: "var(--text-tertiary)",
            transform: open ? "rotate(180deg)" : "none",
            transition: "transform var(--transition-fast)",
          }}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div
          role="listbox"
          ref={listRef}
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            left: 0,
            right: 0,
            zIndex: 200,
            background: "var(--surface-primary)",
            border: "1px solid var(--border-default)",
            borderRadius: "var(--radius-lg)",
            boxShadow: "var(--shadow-lg)",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            maxHeight: 280,
          }}
        >
          {/* Search input */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--space-2)",
              padding: "var(--space-2) var(--space-3)",
              borderBottom: "1px solid var(--border-default)",
              background: "var(--surface-secondary)",
            }}
          >
            <Search size={14} style={{ color: "var(--text-tertiary)", flexShrink: 0 }} />
            <input
              ref={searchRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Buscar..."
              style={{
                flex: 1,
                border: "none",
                outline: "none",
                background: "transparent",
                fontSize: "var(--text-sm)",
                color: "var(--text-primary)",
                fontFamily: "var(--font-sans)",
              }}
            />
            {query && (
              <X
                size={13}
                onClick={() => setQuery("")}
                style={{ cursor: "pointer", color: "var(--text-tertiary)", flexShrink: 0 }}
              />
            )}
          </div>

          {/* Options list */}
          <div style={{ overflowY: "auto", flex: 1 }}>
            {filtered.length === 0 ? (
              <div
                style={{
                  padding: "var(--space-3) var(--space-4)",
                  fontSize: "var(--text-sm)",
                  color: "var(--text-tertiary)",
                  textAlign: "center",
                }}
              >
                Sin resultados
              </div>
            ) : (
              filtered.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <div
                    key={opt.value}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelect(opt)}
                    style={{
                      padding: "var(--space-2) var(--space-4)",
                      fontSize: "var(--text-sm)",
                      cursor: "pointer",
                      color: isSelected ? "var(--color-primary-600)" : "var(--text-primary)",
                      background: isSelected ? "var(--color-primary-50)" : "transparent",
                      fontWeight: isSelected ? "var(--font-weight-medium)" : "normal",
                      transition: "background var(--transition-fast)",
                    }}
                    onPointerEnter={(e) => {
                      if (!isSelected) e.currentTarget.style.background = "var(--surface-secondary)";
                    }}
                    onPointerLeave={(e) => {
                      if (!isSelected) e.currentTarget.style.background = "transparent";
                    }}
                  >
                    {opt.label}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {error && (
        <span className="input-error-text" role="alert">{error}</span>
      )}
    </div>
  );
}
