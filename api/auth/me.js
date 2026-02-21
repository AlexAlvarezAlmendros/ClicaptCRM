// LeadFlow CRM — API — Auth me (current user profile)
// Owned by Agente 3 — Integration Engineer

import { verifyAuth } from "../_lib/middleware/auth.js";
import { resolveTenant } from "../_lib/middleware/tenant.js";
import { sendSuccess, sendError } from "../_lib/utils/response.js";
import db from "../_lib/db/client.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return sendError(res, 405, "METHOD_NOT_ALLOWED", "Método no permitido");
  }

  try {
    const authUser = await verifyAuth(req);
    const tenant = await resolveTenant(authUser.auth0Id);

    const userResult = await db.execute({
      sql: `SELECT id, name, surname, email, avatar_url, role, created_at
            FROM users WHERE id = ?`,
      args: [tenant.userId],
    });

    const orgResult = await db.execute({
      sql: `SELECT id, name, logo_url, plan, subscription_status, trial_ends_at
            FROM organizations WHERE id = ?`,
      args: [tenant.orgId],
    });

    return sendSuccess(res, 200, {
      user: userResult.rows[0],
      organization: orgResult.rows[0],
    });
  } catch (err) {
    return sendError(res, err.status || 500, err.code || "INTERNAL_ERROR", err.message);
  }
}
