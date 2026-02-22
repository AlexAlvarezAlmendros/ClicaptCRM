// LeadFlow CRM — API — CSV Import contacts
// POST /api/contacts/import — Receives CSV text, creates contacts

import { verifyAuth } from "../_lib/middleware/auth.js";
import { resolveTenant, requireActiveSubscription } from "../_lib/middleware/tenant.js";
import { sendSuccess, sendError } from "../_lib/utils/response.js";
import db from "../_lib/db/client.js";

/**
 * Simple CSV parser — handles quoted fields and commas inside quotes.
 */
function parseCSV(text) {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return [];

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
        } else if (ch === ",") {
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

  const headers = parseLine(lines[0]).map((h) => h.toLowerCase().trim());
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseLine(lines[i]);
    const row = {};
    headers.forEach((h, idx) => {
      row[h] = values[idx] || "";
    });
    rows.push(row);
  }

  return rows;
}

// Map common CSV header names to DB fields
const HEADER_MAP = {
  nombre: "first_name",
  first_name: "first_name",
  apellido: "last_name",
  last_name: "last_name",
  email: "email",
  "correo electrónico": "email",
  "correo electronico": "email",
  teléfono: "phone",
  telefono: "phone",
  phone: "phone",
  empresa: "company",
  company: "company",
  cargo: "position",
  position: "position",
  estado: "status",
  status: "status",
  origen: "source",
  source: "source",
  notas: "notes",
  notes: "notes",
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return sendError(res, 405, "METHOD_NOT_ALLOWED", "Método no permitido");
  }

  try {
    const authUser = await verifyAuth(req);
    const tenant = await resolveTenant(authUser);
    requireActiveSubscription(tenant);

    const { csv } = req.body;
    if (!csv || typeof csv !== "string") {
      return sendError(res, 400, "INVALID_INPUT", "Se requiere un campo 'csv' con el contenido del archivo");
    }

    const rows = parseCSV(csv);
    if (rows.length === 0) {
      return sendError(res, 400, "EMPTY_CSV", "El archivo CSV está vacío o no tiene datos");
    }

    // Map headers to our DB fields
    const mappedRows = rows.map((row) => {
      const mapped = {};
      for (const [key, value] of Object.entries(row)) {
        const dbField = HEADER_MAP[key];
        if (dbField && value) {
          mapped[dbField] = value;
        }
      }
      return mapped;
    });

    let imported = 0;
    let skipped = 0;
    const errors = [];

    for (const row of mappedRows) {
      // Require at minimum first_name or email
      if (!row.first_name && !row.email) {
        skipped++;
        continue;
      }

      try {
        // Validate status
        const validStatuses = ["new", "contacted", "qualified", "customer", "lost"];
        const status = validStatuses.includes(row.status) ? row.status : "new";

        // Validate source
        const validSources = ["web", "referral", "social", "ads", "cold", "event", "other"];
        const source = validSources.includes(row.source) ? row.source : "other";

        await db.execute({
          sql: `INSERT INTO contacts (id, organization_id, first_name, last_name, email, phone,
                company, position, status, source, notes, created_by, created_at, updated_at)
                VALUES (lower(hex(randomblob(16))), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
          args: [
            tenant.orgId,
            row.first_name || "",
            row.last_name || "",
            row.email || null,
            row.phone || null,
            row.company || null,
            row.position || null,
            status,
            source,
            row.notes || null,
            tenant.userId,
          ],
        });
        imported++;
      } catch (err) {
        skipped++;
        errors.push({ row: row.first_name || row.email, error: err.message });
      }
    }

    return sendSuccess(res, 200, {
      imported,
      skipped,
      total: mappedRows.length,
      errors: errors.length > 0 ? errors.slice(0, 10) : undefined,
    });
  } catch (err) {
    console.error("[contacts/import]", err);
    return sendError(res, err.status || 500, err.code || "INTERNAL_ERROR", err.message);
  }
}
