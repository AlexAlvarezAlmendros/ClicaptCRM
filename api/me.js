// LeadFlow CRM — API — User profile (get current user, update)

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
          sql: `SELECT id, auth0_id, email, name, surname, avatar_url, role, created_at
                FROM users WHERE id = ? AND organization_id = ?`,
          args: [tenant.userId, tenant.orgId],
        });
        return sendSuccess(res, 200, result.rows[0]);
      }

      case "PUT": {
        const { name, surname, avatar_url } = req.body;
        await db.execute({
          sql: `UPDATE users SET name = COALESCE(?, name), surname = COALESCE(?, surname),
                avatar_url = COALESCE(?, avatar_url), updated_at = datetime('now')
                WHERE id = ? AND organization_id = ?`,
          args: [name, surname, avatar_url, tenant.userId, tenant.orgId],
        });
        const updated = await db.execute({
          sql: `SELECT id, auth0_id, email, name, surname, avatar_url, role, created_at
                FROM users WHERE id = ?`,
          args: [tenant.userId],
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
