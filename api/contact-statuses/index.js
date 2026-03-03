// CliCapt CRM — API — Contact Statuses (GET list, PUT bulk-update)

import { withErrorHandler } from "../_lib/middleware/errorHandler.js";
import { verifyAuth } from "../_lib/middleware/auth.js";
import { resolveTenant } from "../_lib/middleware/tenant.js";
import { sendSuccess, sendError } from "../_lib/utils/response.js";
import db from "../_lib/db/client.js";

const DEFAULT_STATUSES = [
  { value: "new",       name: "Nuevo",       color: "#3B82F6", position: 1 },
  { value: "contacted", name: "Contactado",  color: "#F59E0B", position: 2 },
  { value: "qualified", name: "Cualificado", color: "#8B5CF6", position: 3 },
  { value: "customer",  name: "Cliente",     color: "#10B981", position: 4 },
  { value: "lost",      name: "Perdido",     color: "#EF4444", position: 5 },
];

async function ensureStatuses(orgId) {
  const result = await db.execute({
    sql: `SELECT * FROM contact_statuses WHERE organization_id = ? ORDER BY position ASC`,
    args: [orgId],
  });

  if (result.rows.length > 0) return result.rows;

  // Auto-seed defaults for this org
  const batch = DEFAULT_STATUSES.map((s) => ({
    sql: `INSERT OR IGNORE INTO contact_statuses (id, organization_id, value, name, color, position)
          VALUES (lower(hex(randomblob(16))), ?, ?, ?, ?, ?)`,
    args: [orgId, s.value, s.name, s.color, s.position],
  }));
  await db.batch(batch);

  const seeded = await db.execute({
    sql: `SELECT * FROM contact_statuses WHERE organization_id = ? ORDER BY position ASC`,
    args: [orgId],
  });
  return seeded.rows;
}

async function handler(req, res) {
  const authUser = await verifyAuth(req);
  const tenant = await resolveTenant(authUser);
  const orgId = tenant.orgId;

  switch (req.method) {
    /* ─── LIST ─── */
    case "GET": {
      const statuses = await ensureStatuses(orgId);
      return sendSuccess(res, 200, statuses);
    }

    /* ─── BULK UPDATE (names + colors only) ─── */
    case "PUT": {
      if (tenant.role !== "admin") {
        return sendError(res, 403, "FORBIDDEN", "Solo el administrador puede modificar los estados");
      }

      const { statuses } = req.body;
      if (!Array.isArray(statuses) || statuses.length === 0) {
        return sendError(res, 400, "VALIDATION_ERROR", "Se requiere un array de estados");
      }

      // Ensure statuses exist before updating
      await ensureStatuses(orgId);

      const batch = statuses.map((s) => ({
        sql: `UPDATE contact_statuses
              SET name = ?, color = ?
              WHERE organization_id = ? AND value = ?`,
        args: [s.name?.trim() || s.value, s.color || "#6B7280", orgId, s.value],
      }));

      await db.batch(batch);

      const updated = await db.execute({
        sql: `SELECT * FROM contact_statuses WHERE organization_id = ? ORDER BY position ASC`,
        args: [orgId],
      });
      return sendSuccess(res, 200, updated.rows);
    }

    default:
      return sendError(res, 405, "METHOD_NOT_ALLOWED", "Método no permitido");
  }
}

export default withErrorHandler(handler);
