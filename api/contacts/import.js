// LeadFlow CRM — API — CSV Import contacts
// POST /api/contacts/import — Receives pre-mapped rows from the frontend wizard

import { verifyAuth } from "../_lib/middleware/auth.js";
import { resolveTenant, requireActiveSubscription } from "../_lib/middleware/tenant.js";
import { sendSuccess, sendError } from "../_lib/utils/response.js";
import db from "../_lib/db/client.js";

// Allowed DB fields that the frontend can map to
const ALLOWED_FIELDS = new Set([
  "first_name", "last_name", "email", "phone",
  "company", "position", "status", "source", "notes",
]);

const VALID_STATUSES = ["new", "contacted", "qualified", "customer", "lost"];
const VALID_SOURCES = ["web", "referral", "social", "ads", "cold", "event", "other"];

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return sendError(res, 405, "METHOD_NOT_ALLOWED", "Método no permitido");
  }

  try {
    const authUser = await verifyAuth(req);
    const tenant = await resolveTenant(authUser);
    requireActiveSubscription(tenant);

    const { rows } = req.body;

    if (!rows || !Array.isArray(rows) || rows.length === 0) {
      return sendError(res, 400, "INVALID_INPUT", "Se requiere un array 'rows' con los contactos mapeados");
    }

    // Sanitize: only keep allowed fields
    const sanitizedRows = rows.map((row) => {
      const clean = {};
      for (const [key, value] of Object.entries(row)) {
        if (ALLOWED_FIELDS.has(key) && typeof value === "string" && value.trim()) {
          clean[key] = value.trim();
        }
      }
      return clean;
    });

    let imported = 0;
    let skipped = 0;
    const errors = [];

    for (const row of sanitizedRows) {
      // Require at minimum first_name or email
      if (!row.first_name && !row.email) {
        skipped++;
        continue;
      }

      try {
        const status = VALID_STATUSES.includes(row.status) ? row.status : "new";
        const source = VALID_SOURCES.includes(row.source) ? row.source : "other";

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
      total: sanitizedRows.length,
      errors: errors.length > 0 ? errors.slice(0, 10) : undefined,
    });
  } catch (err) {
    console.error("[contacts/import]", err);
    return sendError(res, err.status || 500, err.code || "INTERNAL_ERROR", err.message);
  }
}
