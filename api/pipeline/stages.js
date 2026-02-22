// LeadFlow CRM — API — Pipeline stages (get, update)

import { verifyAuth } from "../_lib/middleware/auth.js";
import { resolveTenant } from "../_lib/middleware/tenant.js";
import { sendSuccess, sendError } from "../_lib/utils/response.js";
import db from "../_lib/db/client.js";

export default async function handler(req, res) {
  try {
    const authUser = await verifyAuth(req);
    const tenant = await resolveTenant(authUser);

    switch (req.method) {
      case "GET": {
        const result = await db.execute({
          sql: `SELECT * FROM pipeline_stages WHERE organization_id = ? ORDER BY position ASC`,
          args: [tenant.orgId],
        });
        return sendSuccess(res, 200, result.rows);
      }

      case "PUT": {
        if (tenant.role !== "admin") {
          return sendError(res, 403, "FORBIDDEN", "Solo el administrador puede modificar las etapas");
        }

        const { stages } = req.body;

        if (!Array.isArray(stages) || stages.length === 0) {
          return sendError(res, 400, "VALIDATION_ERROR", "Se requiere un array de etapas");
        }

        // Get existing stages
        const existing = await db.execute({
          sql: `SELECT id FROM pipeline_stages WHERE organization_id = ?`,
          args: [tenant.orgId],
        });
        const existingIds = new Set(existing.rows.map((r) => r.id));

        const batch = [];

        for (const stage of stages) {
          if (stage.id && existingIds.has(stage.id)) {
            // Update existing stage
            batch.push({
              sql: `UPDATE pipeline_stages
                    SET name = ?, color = ?, probability = ?, position = ?, is_won = ?, is_lost = ?
                    WHERE id = ? AND organization_id = ?`,
              args: [
                stage.name, stage.color || "#3B82F6", stage.probability ?? 0,
                stage.position, stage.is_won ? 1 : 0, stage.is_lost ? 1 : 0,
                stage.id, tenant.orgId,
              ],
            });
          } else {
            // Insert new stage
            const newId = stage.id || crypto.randomUUID().replace(/-/g, "");
            batch.push({
              sql: `INSERT INTO pipeline_stages (id, organization_id, name, color, probability, position, is_won, is_lost)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
              args: [
                newId, tenant.orgId, stage.name, stage.color || "#3B82F6",
                stage.probability ?? 0, stage.position,
                stage.is_won ? 1 : 0, stage.is_lost ? 1 : 0,
              ],
            });
          }
        }

        // Delete stages that are no longer in the list (only if not referenced by deals)
        const submittedIds = new Set(stages.filter((s) => s.id).map((s) => s.id));
        for (const id of existingIds) {
          if (!submittedIds.has(id)) {
            // Check if stage has deals
            const dealCheck = await db.execute({
              sql: `SELECT COUNT(*) as count FROM deals WHERE stage_id = ? AND is_archived = 0`,
              args: [id],
            });
            if (Number(dealCheck.rows[0].count) === 0) {
              batch.push({
                sql: `DELETE FROM pipeline_stages WHERE id = ? AND organization_id = ?`,
                args: [id, tenant.orgId],
              });
            }
          }
        }

        if (batch.length > 0) {
          await db.batch(batch);
        }

        // Return updated stages
        const updated = await db.execute({
          sql: `SELECT * FROM pipeline_stages WHERE organization_id = ? ORDER BY position ASC`,
          args: [tenant.orgId],
        });
        return sendSuccess(res, 200, updated.rows);
      }

      default:
        res.setHeader("Allow", "GET, PUT");
        return sendError(res, 405, "METHOD_NOT_ALLOWED", "Método no permitido");
    }
  } catch (err) {
    return sendError(res, err.status || 500, err.code || "INTERNAL_ERROR", err.message);
  }
}
