// LeadFlow CRM — API — Organization (get, update)

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
          sql: `SELECT * FROM organizations WHERE id = ?`,
          args: [tenant.orgId],
        });
        return sendSuccess(res, 200, result.rows[0]);
      }

      case "PUT": {
        if (tenant.role !== "admin") {
          return sendError(res, 403, "FORBIDDEN", "Solo el administrador puede modificar la organización");
        }

        const { name, fiscal_name, fiscal_id, address, city, postal_code, country } = req.body;
        await db.execute({
          sql: `UPDATE organizations SET name = COALESCE(?, name), fiscal_name = COALESCE(?, fiscal_name),
                fiscal_id = COALESCE(?, fiscal_id), address = COALESCE(?, address),
                city = COALESCE(?, city), postal_code = COALESCE(?, postal_code),
                country = COALESCE(?, country), updated_at = datetime('now')
                WHERE id = ?`,
          args: [name, fiscal_name, fiscal_id, address, city, postal_code, country, tenant.orgId],
        });

        const updated = await db.execute({
          sql: `SELECT * FROM organizations WHERE id = ?`,
          args: [tenant.orgId],
        });
        return sendSuccess(res, 200, updated.rows[0]);
      }

      default:
        res.setHeader("Allow", "GET, PUT");
        return sendError(res, 405, "METHOD_NOT_ALLOWED", "Método no permitido");
    }
  } catch (err) {
    return sendError(res, err.status || 500, err.code || "INTERNAL_ERROR", err.message);
  }
}
