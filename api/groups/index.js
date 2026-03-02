// LeadFlow CRM — API — Contact Groups CRUD

import { withErrorHandler } from "../_lib/middleware/errorHandler.js";
import { verifyAuth } from "../_lib/middleware/auth.js";
import { resolveTenant } from "../_lib/middleware/tenant.js";
import { sendSuccess, sendError } from "../_lib/utils/response.js";
import db from "../_lib/db/client.js";

async function handler(req, res) {
  const authUser = await verifyAuth(req);
  const tenant = await resolveTenant(authUser);
  const orgId = tenant.orgId;

  switch (req.method) {
    /* ─── LIST ─── */
    case "GET": {
      const rows = await db.execute({
        sql: `SELECT
                g.id, g.name, g.color, g.description,
                (SELECT COUNT(*)
                 FROM contacts c
                 WHERE c.group_id = g.id AND c.is_deleted = 0
                ) AS contact_count,
                (SELECT COUNT(*)
                 FROM deals d
                 JOIN contacts c2 ON d.contact_id = c2.id
                 WHERE c2.group_id = g.id AND c2.is_deleted = 0
                   AND d.is_won = 0 AND d.is_lost = 0
                ) AS active_deals,
                (SELECT COALESCE(SUM(d2.value), 0)
                 FROM deals d2
                 JOIN contacts c3 ON d2.contact_id = c3.id
                 WHERE c3.group_id = g.id AND c3.is_deleted = 0
                   AND d2.is_won = 0 AND d2.is_lost = 0
                ) AS pipeline_value,
                (SELECT COUNT(*)
                 FROM tasks t
                 JOIN contacts c4 ON t.contact_id = c4.id
                 WHERE c4.group_id = g.id AND c4.is_deleted = 0
                   AND t.is_completed = 0
                ) AS pending_tasks
              FROM contact_groups g
              WHERE g.organization_id = ?
              ORDER BY g.name ASC`,
        args: [orgId],
      });
      return sendSuccess(res, 200, rows.rows);
    }

    /* ─── CREATE ─── */
    case "POST": {
      const { name, color, description } = req.body;
      if (!name || typeof name !== "string" || name.trim().length === 0) {
        return sendError(res, 400, "VALIDATION_ERROR", "El nombre del grupo es obligatorio");
      }

      const id = crypto.randomUUID().replace(/-/g, "");
      try {
        await db.execute({
          sql: "INSERT INTO contact_groups (id, organization_id, name, color, description) VALUES (?, ?, ?, ?, ?)",
          args: [id, orgId, name.trim(), color || "#6B7280", description?.trim() || null],
        });
      } catch (err) {
        if (err.message?.includes("UNIQUE")) {
          return sendError(res, 409, "DUPLICATE", "Ya existe un grupo con ese nombre");
        }
        throw err;
      }

      return sendSuccess(res, 201, { id, name: name.trim(), color: color || "#6B7280", description: description?.trim() || null, contact_count: 0 });
    }

    /* ─── UPDATE ─── */
    case "PUT": {
      const { id, name, color, description } = req.body;
      if (!id) {
        return sendError(res, 400, "VALIDATION_ERROR", "Se requiere el ID del grupo");
      }
      if (!name || typeof name !== "string" || name.trim().length === 0) {
        return sendError(res, 400, "VALIDATION_ERROR", "El nombre del grupo es obligatorio");
      }

      const existing = await db.execute({
        sql: "SELECT id FROM contact_groups WHERE id = ? AND organization_id = ?",
        args: [id, orgId],
      });
      if (existing.rows.length === 0) {
        return sendError(res, 404, "NOT_FOUND", "Grupo no encontrado");
      }

      try {
        await db.execute({
          sql: "UPDATE contact_groups SET name = ?, color = ?, description = ? WHERE id = ? AND organization_id = ?",
          args: [name.trim(), color || "#6B7280", description?.trim() || null, id, orgId],
        });
      } catch (err) {
        if (err.message?.includes("UNIQUE")) {
          return sendError(res, 409, "DUPLICATE", "Ya existe un grupo con ese nombre");
        }
        throw err;
      }

      return sendSuccess(res, 200, { id, name: name.trim(), color: color || "#6B7280", description: description?.trim() || null });
    }

    /* ─── DELETE ─── */
    case "DELETE": {
      const groupId = req.query?.id || req.body?.id;
      if (!groupId) {
        return sendError(res, 400, "VALIDATION_ERROR", "Se requiere el ID del grupo");
      }

      const deleteContacts = req.query?.deleteContacts === "true";

      if (deleteContacts) {
        // Soft-delete all contacts in this group
        await db.execute({
          sql: "UPDATE contacts SET is_deleted = 1 WHERE group_id = ? AND organization_id = ?",
          args: [groupId, orgId],
        });
      } else {
        // Just unlink contacts from the group
        await db.execute({
          sql: "UPDATE contacts SET group_id = NULL WHERE group_id = ? AND organization_id = ?",
          args: [groupId, orgId],
        });
      }

      await db.execute({
        sql: "DELETE FROM contact_groups WHERE id = ? AND organization_id = ?",
        args: [groupId, orgId],
      });

      return sendSuccess(res, 200, { deleted: true, contactsDeleted: deleteContacts });
    }

    default:
      return sendError(res, 405, "METHOD_NOT_ALLOWED", "Método no permitido");
  }
}

export default withErrorHandler(handler);
