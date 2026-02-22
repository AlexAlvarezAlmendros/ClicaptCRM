// LeadFlow CRM — API — Tags CRUD

import { withErrorHandler } from "../_lib/middleware/errorHandler.js";
import { verifyAuth } from "../_lib/middleware/auth.js";
import { resolveTenant } from "../_lib/middleware/tenant.js";
import { sendSuccess, sendError } from "../_lib/utils/response.js";
import db from "../_lib/db/client.js";

async function handler(req, res) {
  const authUser = await verifyAuth(req);
  const tenant = await resolveTenant(authUser.auth0Id);
  const orgId = tenant.orgId;

  switch (req.method) {
    case "GET": {
      const rows = await db.execute({
        sql: "SELECT id, name, color FROM tags WHERE organization_id = ? ORDER BY name ASC",
        args: [orgId],
      });
      return sendSuccess(res, 200, rows.rows);
    }

    case "POST": {
      const { name, color } = req.body;
      if (!name || typeof name !== "string" || name.trim().length === 0) {
        return sendError(res, 400, "VALIDATION_ERROR", "El nombre de la etiqueta es obligatorio");
      }
      const id = crypto.randomUUID();
      await db.execute({
        sql: "INSERT INTO tags (id, organization_id, name, color) VALUES (?, ?, ?, ?)",
        args: [id, orgId, name.trim(), color || "#6b7280"],
      });
      return sendSuccess(res, 201, { id, name: name.trim(), color: color || "#6b7280" });
    }

    case "DELETE": {
      const tagId = req.query.id;
      if (!tagId) {
        return sendError(res, 400, "VALIDATION_ERROR", "Se requiere el ID de la etiqueta");
      }
      // Remove from contact_tags first
      await db.execute({
        sql: "DELETE FROM contact_tags WHERE tag_id = ? AND tag_id IN (SELECT id FROM tags WHERE organization_id = ?)",
        args: [tagId, orgId],
      });
      await db.execute({
        sql: "DELETE FROM tags WHERE id = ? AND organization_id = ?",
        args: [tagId, orgId],
      });
      return sendSuccess(res, 200, { deleted: true });
    }

    default:
      return sendError(res, 405, "METHOD_NOT_ALLOWED", "Método no permitido");
  }
}

export default withErrorHandler(handler);
