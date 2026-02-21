// LeadFlow CRM — API — Organization members

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
          sql: `SELECT id, name, surname, email, avatar_url, role, is_active, created_at
                FROM users WHERE organization_id = ?
                ORDER BY created_at ASC`,
          args: [tenant.orgId],
        });
        return sendSuccess(res, 200, result.rows);
      }

      case "POST": {
        if (tenant.role !== "admin") {
          return sendError(res, 403, "FORBIDDEN", "Solo el administrador puede invitar miembros");
        }
        // TODO: Implement member invitation logic
        return sendError(res, 501, "NOT_IMPLEMENTED", "Funcionalidad pendiente de implementación");
      }

      default:
        res.setHeader("Allow", "GET, POST");
        return sendError(res, 405, "METHOD_NOT_ALLOWED", "Método no permitido");
    }
  } catch (err) {
    return sendError(res, err.status || 500, err.code || "INTERNAL_ERROR", err.message);
  }
}
