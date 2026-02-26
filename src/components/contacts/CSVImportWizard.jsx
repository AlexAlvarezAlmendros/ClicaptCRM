import { useState, useCallback, useMemo, useRef } from "react";
import { Drawer } from "../ui/Drawer";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import { Table } from "../ui/Table";
import { Spinner } from "../ui/Spinner";
import { useToast } from "../ui/Toast";
import { useToken } from "../../hooks/useToken";
import { apiClient } from "../../lib/api";
import { useQueryClient } from "@tanstack/react-query";
import {
  Upload,
  FileSpreadsheet,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  X,
  Info,
} from "lucide-react";

// CRM fields the user can map CSV columns to
const CRM_FIELDS = [
  { value: "", label: "— No importar —" },
  { value: "first_name", label: "Nombre", required: true },
  { value: "last_name", label: "Apellido" },
  { value: "email", label: "Email" },
  { value: "phone", label: "Teléfono" },
  { value: "company", label: "Empresa" },
  { value: "position", label: "Cargo" },
  { value: "status", label: "Estado" },
  { value: "source", label: "Origen" },
  { value: "notes", label: "Notas" },
];

const VALID_STATUSES = ["new", "contacted", "qualified", "customer", "lost"];
const VALID_SOURCES = ["web", "referral", "social", "ads", "cold", "event", "other"];

// Step names
const STEPS = ["upload", "mapping", "preview", "importing"];
const STEP_LABELS = {
  upload: "Subir archivo",
  mapping: "Mapear columnas",
  preview: "Vista previa",
  importing: "Importando",
};

/**
 * Parse CSV text into { headers[], rows[][] }
 */
function parseCSV(text) {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return { headers: [], rows: [] };

  function parseLine(line) {
    const fields = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (inQuotes) {
        if (ch === '"' && line[i + 1] === '"') {
          current += '"';
          i++;
        } else if (ch === '"') {
          inQuotes = false;
        } else {
          current += ch;
        }
      } else {
        if (ch === '"') {
          inQuotes = true;
        } else if (ch === "," || ch === ";") {
          fields.push(current.trim());
          current = "";
        } else {
          current += ch;
        }
      }
    }
    fields.push(current.trim());
    return fields;
  }

  const headers = parseLine(lines[0]);
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseLine(lines[i]);
    if (values.some((v) => v)) {
      rows.push(values);
    }
  }

  return { headers, rows };
}

/**
 * Try to auto-detect mapping from CSV header names to CRM fields.
 */
function autoDetectMapping(headers) {
  const HEADER_MAP = {
    nombre: "first_name",
    "first name": "first_name",
    first_name: "first_name",
    name: "first_name",
    apellido: "last_name",
    "last name": "last_name",
    last_name: "last_name",
    surname: "last_name",
    email: "email",
    "e-mail": "email",
    "correo electrónico": "email",
    "correo electronico": "email",
    mail: "email",
    teléfono: "phone",
    telefono: "phone",
    phone: "phone",
    tel: "phone",
    móvil: "phone",
    movil: "phone",
    mobile: "phone",
    empresa: "company",
    company: "company",
    organización: "company",
    organizacion: "company",
    organization: "company",
    cargo: "position",
    position: "position",
    puesto: "position",
    "job title": "position",
    title: "position",
    estado: "status",
    status: "status",
    origen: "source",
    source: "source",
    fuente: "source",
    notas: "notes",
    notes: "notes",
    comentarios: "notes",
    comments: "notes",
    observaciones: "notes",
  };

  const mapping = {};
  const usedFields = new Set();

  headers.forEach((header, index) => {
    const normalized = header.toLowerCase().trim();
    const field = HEADER_MAP[normalized];
    if (field && !usedFields.has(field)) {
      mapping[index] = field;
      usedFields.add(field);
    } else {
      mapping[index] = "";
    }
  });

  return mapping;
}

export function CSVImportWizard({ isOpen, onClose }) {
  const [step, setStep] = useState("upload");
  const [csvData, setCsvData] = useState({ headers: [], rows: [] });
  const [mapping, setMapping] = useState({});
  const [fileName, setFileName] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef(null);

  const getToken = useToken();
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  // Reset wizard state
  const resetWizard = useCallback(() => {
    setStep("upload");
    setCsvData({ headers: [], rows: [] });
    setMapping({});
    setFileName("");
    setImportResult(null);
    setIsImporting(false);
    setDragActive(false);
  }, []);

  const handleClose = useCallback(() => {
    resetWizard();
    onClose();
  }, [onClose, resetWizard]);

  // Handle file parsing
  const processFile = useCallback((file) => {
    if (!file) return;
    if (!file.name.endsWith(".csv") && !file.type.includes("csv") && !file.type.includes("text")) {
      addToast({ type: "error", message: "Por favor, selecciona un archivo CSV válido." });
      return;
    }

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const parsed = parseCSV(text);

      if (parsed.headers.length === 0 || parsed.rows.length === 0) {
        addToast({ type: "error", message: "El archivo CSV está vacío o no tiene datos." });
        return;
      }

      setCsvData(parsed);
      setMapping(autoDetectMapping(parsed.headers));
      setStep("mapping");
    };
    reader.readAsText(file);
  }, [addToast]);

  // Drag & drop handlers
  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    processFile(file);
  }, [processFile]);

  const handleFileInput = useCallback((e) => {
    processFile(e.target.files?.[0]);
  }, [processFile]);

  // Mapping change handler
  const handleMappingChange = useCallback((colIndex, value) => {
    setMapping((prev) => {
      const next = { ...prev };
      // If the same CRM field is already used elsewhere, clear that first
      if (value) {
        for (const [key, val] of Object.entries(next)) {
          if (val === value && Number(key) !== colIndex) {
            next[key] = "";
          }
        }
      }
      next[colIndex] = value;
      return next;
    });
  }, []);

  // Validation: Check if at least first_name or email is mapped
  const mappingValid = useMemo(() => {
    const mappedFields = Object.values(mapping);
    return mappedFields.includes("first_name") || mappedFields.includes("email");
  }, [mapping]);

  // Generate preview data
  const previewData = useMemo(() => {
    if (step !== "preview") return [];

    const mappedCols = Object.entries(mapping).filter(([, field]) => field);

    return csvData.rows.slice(0, 50).map((row) => {
      const obj = {};
      for (const [colIdx, field] of mappedCols) {
        obj[field] = row[Number(colIdx)] || "";
      }
      return obj;
    });
  }, [step, mapping, csvData.rows]);

  // Fields that are actually mapped for preview table
  const mappedFields = useMemo(() => {
    return Object.entries(mapping)
      .filter(([, field]) => field)
      .map(([, field]) => {
        const meta = CRM_FIELDS.find((f) => f.value === field);
        return { value: field, label: meta?.label || field };
      });
  }, [mapping]);

  // Send import to API
  const handleImport = useCallback(async () => {
    setStep("importing");
    setIsImporting(true);

    try {
      const token = await getToken();

      // Build mapped rows on the client
      const mappedCols = Object.entries(mapping).filter(([, field]) => field);
      const rows = csvData.rows.map((row) => {
        const obj = {};
        for (const [colIdx, field] of mappedCols) {
          obj[field] = row[Number(colIdx)] || "";
        }
        return obj;
      });

      const result = await apiClient.post(
        "/api/contacts/import",
        { rows, mappings: mapping },
        token
      );

      setImportResult(result.data);
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
      addToast({
        type: "success",
        message: `${result.data?.imported || 0} contactos importados correctamente.`,
      });
    } catch (err) {
      setImportResult({ error: err.message || "Error desconocido" });
      addToast({ type: "error", message: "Error al importar: " + (err.message || "Error desconocido") });
    } finally {
      setIsImporting(false);
    }
  }, [getToken, mapping, csvData.rows, queryClient, addToast]);

  return (
    <Drawer isOpen={isOpen} onClose={handleClose} title="Importar contactos" width="720px">
      {/* Step indicator */}
      <StepIndicator currentStep={step} />

      <div style={{ marginTop: "var(--space-5)" }}>
        {step === "upload" && (
          <UploadStep
            dragActive={dragActive}
            onDrag={handleDrag}
            onDrop={handleDrop}
            onFileInput={handleFileInput}
            fileInputRef={fileInputRef}
            fileName={fileName}
          />
        )}

        {step === "mapping" && (
          <MappingStep
            headers={csvData.headers}
            sampleRows={csvData.rows.slice(0, 3)}
            mapping={mapping}
            onMappingChange={handleMappingChange}
            mappingValid={mappingValid}
            totalRows={csvData.rows.length}
            onBack={() => setStep("upload")}
            onNext={() => setStep("preview")}
          />
        )}

        {step === "preview" && (
          <PreviewStep
            data={previewData}
            fields={mappedFields}
            totalRows={csvData.rows.length}
            onBack={() => setStep("mapping")}
            onImport={handleImport}
          />
        )}

        {step === "importing" && (
          <ImportingStep
            isImporting={isImporting}
            result={importResult}
            onClose={handleClose}
            onRetry={resetWizard}
          />
        )}
      </div>
    </Drawer>
  );
}

/* ─── Step Indicator ─── */
function StepIndicator({ currentStep }) {
  const stepIndex = STEPS.indexOf(currentStep);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "var(--space-2)",
        paddingBottom: "var(--space-4)",
        borderBottom: "1px solid var(--border-default)",
      }}
    >
      {STEPS.filter((s) => s !== "importing").map((s, i) => {
        const isActive = STEPS.indexOf(s) === stepIndex;
        const isCompleted = STEPS.indexOf(s) < stepIndex;

        return (
          <div key={s} style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "var(--text-xs)",
                fontWeight: "var(--font-weight-semibold)",
                background: isActive
                  ? "var(--color-primary-500)"
                  : isCompleted
                    ? "var(--color-success-500)"
                    : "var(--surface-secondary)",
                color: isActive || isCompleted ? "#fff" : "var(--text-tertiary)",
                transition: "all var(--transition-fast)",
              }}
            >
              {isCompleted ? <CheckCircle2 size={14} /> : i + 1}
            </div>
            <span
              style={{
                fontSize: "var(--text-sm)",
                fontWeight: isActive ? "var(--font-weight-medium)" : "var(--font-weight-normal)",
                color: isActive ? "var(--text-primary)" : "var(--text-tertiary)",
              }}
            >
              {STEP_LABELS[s]}
            </span>
            {i < 2 && (
              <div
                style={{
                  width: 32,
                  height: 2,
                  background: isCompleted ? "var(--color-success-500)" : "var(--border-default)",
                  borderRadius: 1,
                  marginInline: "var(--space-1)",
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ─── Step 1: Upload ─── */
function UploadStep({ dragActive, onDrag, onDrop, onFileInput, fileInputRef }) {
  return (
    <div>
      <p style={{ color: "var(--text-secondary)", fontSize: "var(--text-sm)", marginBottom: "var(--space-4)" }}>
        Sube un archivo CSV con tus contactos. En el siguiente paso podrás elegir qué columna corresponde a cada campo.
      </p>

      {/* Drop zone */}
      <div
        onDragEnter={onDrag}
        onDragLeave={onDrag}
        onDragOver={onDrag}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
        style={{
          border: `2px dashed ${dragActive ? "var(--color-primary-500)" : "var(--border-default)"}`,
          borderRadius: "var(--radius-lg)",
          padding: "var(--space-10) var(--space-6)",
          textAlign: "center",
          cursor: "pointer",
          background: dragActive ? "var(--color-primary-50)" : "var(--surface-secondary)",
          transition: "all var(--transition-fast)",
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            background: "var(--color-primary-100)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto var(--space-4)",
          }}
        >
          <FileSpreadsheet size={24} style={{ color: "var(--color-primary-500)" }} />
        </div>
        <p style={{ fontWeight: "var(--font-weight-medium)", color: "var(--text-primary)", marginBottom: "var(--space-1)" }}>
          Arrastra tu archivo CSV aquí
        </p>
        <p style={{ fontSize: "var(--text-sm)", color: "var(--text-tertiary)" }}>
          o <span style={{ color: "var(--color-primary-500)", textDecoration: "underline" }}>haz clic para seleccionar</span>
        </p>
        <p style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)", marginTop: "var(--space-3)" }}>
          Formatos soportados: .csv (separado por comas o punto y coma)
        </p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,text/csv"
        style={{ display: "none" }}
        onChange={onFileInput}
      />

      {/* Tips */}
      <div
        style={{
          marginTop: "var(--space-5)",
          padding: "var(--space-4)",
          background: "var(--color-primary-50)",
          borderRadius: "var(--radius-md)",
          display: "flex",
          gap: "var(--space-3)",
        }}
      >
        <Info size={18} style={{ color: "var(--color-primary-500)", flexShrink: 0, marginTop: 2 }} />
        <div style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)" }}>
          <p style={{ fontWeight: "var(--font-weight-medium)", marginBottom: "var(--space-1)" }}>Consejos:</p>
          <ul style={{ paddingLeft: "var(--space-4)", margin: 0 }}>
            <li>La primera fila debe contener los nombres de las columnas</li>
            <li>Campos mínimos recomendados: Nombre o Email</li>
            <li>Se detectarán automáticamente las columnas más comunes</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

/* ─── Step 2: Mapping ─── */
function MappingStep({ headers, sampleRows, mapping, onMappingChange, mappingValid, totalRows, onBack, onNext }) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-4)" }}>
        <div>
          <p style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)" }}>
            Selecciona a qué campo del CRM corresponde cada columna de tu CSV.
          </p>
          <p style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)", marginTop: "var(--space-1)" }}>
            {totalRows} fila{totalRows !== 1 ? "s" : ""} detectada{totalRows !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {!mappingValid && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--space-2)",
            padding: "var(--space-3) var(--space-4)",
            background: "var(--color-warning-50)",
            borderRadius: "var(--radius-md)",
            marginBottom: "var(--space-4)",
            border: "1px solid var(--color-warning-200)",
          }}
        >
          <AlertTriangle size={16} style={{ color: "var(--color-warning-500)" }} />
          <span style={{ fontSize: "var(--text-sm)", color: "var(--color-warning-700)" }}>
            Debes mapear al menos <strong>Nombre</strong> o <strong>Email</strong> para continuar.
          </span>
        </div>
      )}

      {/* Mapping table */}
      <div
        style={{
          border: "1px solid var(--border-default)",
          borderRadius: "var(--radius-md)",
          overflow: "hidden",
        }}
      >
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "var(--text-sm)" }}>
            <thead>
              <tr style={{ background: "var(--surface-secondary)", borderBottom: "1px solid var(--border-default)" }}>
                <th style={thStyle}>Columna CSV</th>
                <th style={thStyle}>Ejemplo</th>
                <th style={{ ...thStyle, minWidth: 180 }}>Campo CRM</th>
              </tr>
            </thead>
            <tbody>
              {headers.map((header, colIndex) => {
                const sampleValues = sampleRows
                  .map((row) => row[colIndex] || "")
                  .filter(Boolean)
                  .slice(0, 2);

                const currentField = mapping[colIndex] || "";
                const fieldMeta = CRM_FIELDS.find((f) => f.value === currentField);
                const isRequired = fieldMeta?.required;

                return (
                  <tr
                    key={colIndex}
                    style={{
                      borderBottom: "1px solid var(--border-default)",
                      background: currentField ? "var(--color-primary-50)" : "transparent",
                      transition: "background var(--transition-fast)",
                    }}
                  >
                    <td style={tdStyle}>
                      <span style={{ fontWeight: "var(--font-weight-medium)" }}>{header}</span>
                    </td>
                    <td style={tdStyle}>
                      <span
                        style={{
                          color: "var(--text-tertiary)",
                          fontSize: "var(--text-xs)",
                          maxWidth: 180,
                          display: "block",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {sampleValues.join(", ") || "—"}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <div style={{ position: "relative" }}>
                        <select
                          value={currentField}
                          onChange={(e) => onMappingChange(colIndex, e.target.value)}
                          className="input"
                          style={{
                            appearance: "none",
                            padding: "var(--space-2) var(--space-8) var(--space-2) var(--space-3)",
                            fontSize: "var(--text-sm)",
                            width: "100%",
                            borderColor: isRequired ? "var(--color-primary-400)" : undefined,
                          }}
                        >
                          {CRM_FIELDS.map((field) => {
                            // Disable options already used in other columns
                            const isUsedElsewhere =
                              field.value &&
                              Object.entries(mapping).some(
                                ([key, val]) => val === field.value && Number(key) !== colIndex
                              );
                            return (
                              <option
                                key={field.value}
                                value={field.value}
                                disabled={isUsedElsewhere}
                              >
                                {field.label}{isUsedElsewhere ? " (ya asignado)" : ""}
                              </option>
                            );
                          })}
                        </select>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "var(--space-5)" }}>
        <Button variant="ghost" leftIcon={ArrowLeft} onClick={onBack}>
          Atrás
        </Button>
        <Button leftIcon={ArrowRight} onClick={onNext} disabled={!mappingValid}>
          Vista previa
        </Button>
      </div>
    </div>
  );
}

/* ─── Step 3: Preview ─── */
function PreviewStep({ data, fields, totalRows, onBack, onImport }) {
  const showing = Math.min(data.length, 50);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-4)" }}>
        <div>
          <p style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)" }}>
            Revisa los datos antes de importar.
          </p>
          <p style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)", marginTop: "var(--space-1)" }}>
            Mostrando {showing} de {totalRows} fila{totalRows !== 1 ? "s" : ""}
          </p>
        </div>
        <Badge variant="primary">{totalRows} contactos</Badge>
      </div>

      {/* Preview table */}
      <div
        style={{
          border: "1px solid var(--border-default)",
          borderRadius: "var(--radius-md)",
          overflow: "hidden",
          maxHeight: 380,
          overflowY: "auto",
        }}
      >
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "var(--text-sm)" }}>
            <thead style={{ position: "sticky", top: 0, zIndex: 1 }}>
              <tr style={{ background: "var(--surface-secondary)", borderBottom: "1px solid var(--border-default)" }}>
                <th style={{ ...thStyle, width: 40, textAlign: "center" }}>#</th>
                {fields.map((f) => (
                  <th key={f.value} style={thStyle}>{f.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, i) => {
                const hasRequired = row.first_name || row.email;
                return (
                  <tr
                    key={i}
                    style={{
                      borderBottom: "1px solid var(--border-default)",
                      opacity: hasRequired ? 1 : 0.5,
                    }}
                  >
                    <td style={{ ...tdStyle, textAlign: "center", color: "var(--text-tertiary)", fontSize: "var(--text-xs)" }}>
                      {i + 1}
                    </td>
                    {fields.map((f) => (
                      <td key={f.value} style={tdStyle}>
                        <span
                          style={{
                            maxWidth: 160,
                            display: "block",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {row[f.value] || <span style={{ color: "var(--text-tertiary)" }}>—</span>}
                        </span>
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Row validity summary */}
      <div
        style={{
          marginTop: "var(--space-4)",
          padding: "var(--space-3) var(--space-4)",
          background: "var(--surface-secondary)",
          borderRadius: "var(--radius-md)",
          fontSize: "var(--text-sm)",
          color: "var(--text-secondary)",
          display: "flex",
          alignItems: "center",
          gap: "var(--space-2)",
        }}
      >
        <Info size={16} />
        Los contactos sin nombre ni email serán omitidos durante la importación.
      </div>

      {/* Actions */}
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "var(--space-5)" }}>
        <Button variant="ghost" leftIcon={ArrowLeft} onClick={onBack}>
          Atrás
        </Button>
        <Button leftIcon={Upload} onClick={onImport}>
          Importar {totalRows} contactos
        </Button>
      </div>
    </div>
  );
}

/* ─── Step 4: Importing / Result ─── */
function ImportingStep({ isImporting, result, onClose, onRetry }) {
  if (isImporting) {
    return (
      <div style={{ textAlign: "center", padding: "var(--space-10) 0" }}>
        <Spinner size={40} />
        <p style={{ marginTop: "var(--space-4)", color: "var(--text-secondary)", fontSize: "var(--text-sm)" }}>
          Importando contactos…
        </p>
        <p style={{ color: "var(--text-tertiary)", fontSize: "var(--text-xs)", marginTop: "var(--space-1)" }}>
          Esto puede tardar un momento
        </p>
      </div>
    );
  }

  if (result?.error) {
    return (
      <div style={{ textAlign: "center", padding: "var(--space-8) 0" }}>
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            background: "var(--color-danger-100)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto var(--space-4)",
          }}
        >
          <X size={24} style={{ color: "var(--color-danger-500)" }} />
        </div>
        <h3 className="text-h3" style={{ marginBottom: "var(--space-2)" }}>Error en la importación</h3>
        <p style={{ color: "var(--text-secondary)", fontSize: "var(--text-sm)", marginBottom: "var(--space-5)" }}>
          {result.error}
        </p>
        <div style={{ display: "flex", gap: "var(--space-3)", justifyContent: "center" }}>
          <Button variant="ghost" onClick={onClose}>Cerrar</Button>
          <Button onClick={onRetry}>Reintentar</Button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ textAlign: "center", padding: "var(--space-8) 0" }}>
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: "var(--color-success-100)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto var(--space-4)",
        }}
      >
        <CheckCircle2 size={24} style={{ color: "var(--color-success-500)" }} />
      </div>
      <h3 className="text-h3" style={{ marginBottom: "var(--space-2)" }}>Importación completada</h3>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "var(--space-6)",
          margin: "var(--space-5) 0",
        }}
      >
        <div>
          <div style={{ fontSize: "var(--text-2xl)", fontWeight: "var(--font-weight-bold)", color: "var(--color-success-500)" }}>
            {result?.imported || 0}
          </div>
          <div style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)" }}>Importados</div>
        </div>
        {(result?.skipped || 0) > 0 && (
          <div>
            <div style={{ fontSize: "var(--text-2xl)", fontWeight: "var(--font-weight-bold)", color: "var(--color-warning-500)" }}>
              {result.skipped}
            </div>
            <div style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)" }}>Omitidos</div>
          </div>
        )}
        <div>
          <div style={{ fontSize: "var(--text-2xl)", fontWeight: "var(--font-weight-bold)", color: "var(--text-secondary)" }}>
            {result?.total || 0}
          </div>
          <div style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)" }}>Total</div>
        </div>
      </div>

      {result?.errors && result.errors.length > 0 && (
        <div
          style={{
            textAlign: "left",
            marginTop: "var(--space-4)",
            padding: "var(--space-3) var(--space-4)",
            background: "var(--color-warning-50)",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--color-warning-200)",
            maxHeight: 120,
            overflowY: "auto",
          }}
        >
          <p style={{ fontSize: "var(--text-xs)", fontWeight: "var(--font-weight-medium)", color: "var(--color-warning-700)", marginBottom: "var(--space-2)" }}>
            Errores encontrados:
          </p>
          {result.errors.map((err, i) => (
            <p key={i} style={{ fontSize: "var(--text-xs)", color: "var(--color-warning-600)" }}>
              • {err.row}: {err.error}
            </p>
          ))}
        </div>
      )}

      <div style={{ marginTop: "var(--space-5)" }}>
        <Button onClick={onClose}>Cerrar</Button>
      </div>
    </div>
  );
}

/* ─── Shared table styles ─── */
const thStyle = {
  padding: "var(--space-3) var(--space-4)",
  textAlign: "left",
  fontWeight: "var(--font-weight-medium)",
  color: "var(--text-secondary)",
  fontSize: "var(--text-xs)",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  whiteSpace: "nowrap",
};

const tdStyle = {
  padding: "var(--space-3) var(--space-4)",
  color: "var(--text-primary)",
};
