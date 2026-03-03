// CliCapt CRM — API — Contact Statuses (GET, POST, PUT, DELETE)

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

    /* ─── CREATE ─── */
    case "POST": {
      if (tenant.role !== "admin") {
        return sendError(res, 403, "FORBIDDEN", "Solo el administrador puede gestionar los estados");
      }

      const { name, color } = req.body;
      if (!name?.trim()) {
        return sendError(res, 400, "VALIDATION_ERROR", "El nombre es obligatorio");
      }

      // Auto-generate a slug value from the name
      const value = name.trim()
        .toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")   // strip accents
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_|_$/g, "")
        .substring(0, 32);

      // Check uniqueness
      const existing = await db.execute({
        sql: `SELECT id FROM contact_statuses WHERE organization_id = ? AND value = ?`,
        args: [orgId, value],
      });
      if (existing.rows.length > 0) {
        return sendError(res, 409, "DUPLICATE", "Ya existe un estado con ese nombre");
      }

      // Get current max position
      const maxPos = await db.execute({
        sql: `SELECT COALESCE(MAX(position), 0) as pos FROM contact_statuses WHERE organization_id = ?`,
        args: [orgId],
      });
      const position = Number(maxPos.rows[0].pos) + 1;

      await db.execute({
        sql: `INSERT INTO contact_statuses (id, organization_id, value, name, color, position)
              VALUES (lower(hex(randomblob(16))), ?, ?, ?, ?, ?)`,
        args: [orgId, value, name.trim(), color || "#6B7280", position],
      });

      const created = await db.execute({
        sql: `SELECT * FROM contact_statuses WHERE organization_id = ? AND value = ?`,
        args: [orgId, value],
      });
      return sendSuccess(res, 201, created.rows[0]);
    }

    /* ─── BULK UPDATE (name + color + order) ─── */
    case "PUT": {
      if (tenant.role !== "admin") {
        return sendError(res, 403, "FORBIDDEN", "Solo el administrador puede modificar los estados");
      }

      const { statuses } = req.body;
      if (!Array.isArray(statuses) || statuses.length === 0) {
        return sendError(res, 400, "VALIDATION_ERROR", "Se requiere un array de estados");
      }

      await ensureStatuses(orgId);

      const batch = statuses.map((s, i) => ({
        sql: `UPDATE contact_statuses SET name = ?, color = ?, position = ?
              WHERE organization_id = ? AND value = ?`,
        args: [s.name?.trim() || s.value, s.color || "#6B7280", i + 1, orgId, s.value],
      }));
      await db.batch(batch);

      const updated = await db.execute({
        sql: `SELECT * FROM contact_statuses WHERE organization_id = ? ORDER BY position ASC`,
        args: [orgId],
      });
      return sendSuccess(res, 200, updated.rows);
    }

    /* ─── DELETE ─── */
    case "DELETE": {
      if (tenant.role !== "admin") {
        return sendError(res, 403, "FORBIDDEN", "Solo el administrador puede eliminar estados");
      }

      const { value } = req.body;
      if (!value) {
        return sendError(res, 400, "VALIDATION_ERROR", "Se requiere el valor del estado");
      }

      // Check if it's the last status
      const countRes = await db.execute({
        sql: `SELECT COUNT(*) as cnt FROM contact_statuses WHERE organization_id = ?`,
        args: [orgId],
      });
      if (Number(countRes.rows[0].cnt) <= 1) {
        return sendError(res, 409, "LAST_STATUS", "No puedes eliminar el único estado disponible");
      }

      // Count contacts using this status
      const usedBy = await db.execute({
        sql: `SELECT COUNT(*) as cnt FROM contacts WHERE organization_id = ? AND status = ? AND is_deleted = 0`,
        args: [orgId, value],
      });
      const contactCount = Number(usedBy.rows[0].cnt);
      if (contactCount > 0) {
        return sendError(
          res, 409, "STATUS_IN_USE",
          `Este estado está en uso por ${contactCount} contacto${contactCount !== 1 ? "s" : ""}. Reasígnalos antes de eliminarlo.`,
          [{ count: contactCount }]
        );
      }

      await db.execute({
        sql: `DELETE FROM contact_statuses WHERE organization_id = ? AND value = ?`,
        args: [orgId, value],
      });

      return sendSuccess(res, 200, { deleted: value });
    }

    default:
      return sendError(res, 405, "METHOD_NOT_ALLOWED", "Método no permitido");
  }
}

export default withErrorHandler(handler);
