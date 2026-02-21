// LeadFlow CRM — API — Pipeline stages (get, update)

import { verifyAuth } from "../_lib/middleware/auth.js";
import { resolveTenant } from "../_lib/middleware/tenant.js";
import { sendSuccess, sendError } from "../_lib/utils/response.js";
import db from "../_lib/db/client.js";

export default async function handler(req, res) {
  try {
    const authUser = await verifyAuth(req);
    const tenant = await resolveTenant(authUser.auth0Id);

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
        // TODO: Implement stage update logic
        return sendError(res, 501, "NOT_IMPLEMENTED", "Funcionalidad pendiente de implementación");
      }

      default:
        res.setHeader("Allow", "GET, PUT");
        return sendError(res, 405, "METHOD_NOT_ALLOWED", "Método no permitido");
    }
  } catch (err) {
    return sendError(res, err.status || 500, err.code || "INTERNAL_ERROR", err.message);
  }
}
