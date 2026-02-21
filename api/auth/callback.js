// LeadFlow CRM — API — Auth callback (post-login sync)
// Owned by Agente 3 — Integration Engineer

import db from "../_lib/db/client.js";
import { verifyAuth } from "../_lib/middleware/auth.js";
import { sendSuccess, sendError } from "../_lib/utils/response.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return sendError(res, 405, "METHOD_NOT_ALLOWED", "Método no permitido");
  }

  try {
    const authUser = await verifyAuth(req);

    // Check if user already exists
    const existing = await db.execute({
      sql: "SELECT id, organization_id FROM users WHERE auth0_id = ?",
      args: [authUser.auth0Id],
    });

    if (existing.rows.length > 0) {
      return sendSuccess(res, 200, {
        user_id: existing.rows[0].id,
        org_id: existing.rows[0].organization_id,
        is_new: false,
      });
    }

    // New user → create organization + user + default pipeline stages
    const orgId = crypto.randomUUID().replace(/-/g, "");
    const userId = crypto.randomUUID().replace(/-/g, "");
    const trialEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    const batch = [
      {
        sql: `INSERT INTO organizations (id, name, plan, trial_ends_at, subscription_status)
              VALUES (?, ?, 'trial', ?, 'trialing')`,
        args: [orgId, `Empresa de ${authUser.email}`, trialEnd],
      },
      {
        sql: `INSERT INTO users (id, auth0_id, organization_id, email, name, role)
              VALUES (?, ?, ?, ?, ?, 'admin')`,
        args: [userId, authUser.auth0Id, orgId, authUser.email, authUser.email.split("@")[0]],
      },
      {
        sql: `INSERT INTO pipeline_stages (id, organization_id, name, color, probability, position, is_won, is_lost) VALUES
              (lower(hex(randomblob(16))), ?, 'Nuevo Lead',        '#3B82F6', 10,  1, 0, 0),
              (lower(hex(randomblob(16))), ?, 'Contactado',        '#8B5CF6', 25,  2, 0, 0),
              (lower(hex(randomblob(16))), ?, 'Propuesta Enviada', '#F59E0B', 50,  3, 0, 0),
              (lower(hex(randomblob(16))), ?, 'Negociación',       '#F97316', 75,  4, 0, 0),
              (lower(hex(randomblob(16))), ?, 'Ganado',            '#10B981', 100, 5, 1, 0),
              (lower(hex(randomblob(16))), ?, 'Perdido',           '#EF4444', 0,   6, 0, 1)`,
        args: [orgId, orgId, orgId, orgId, orgId, orgId],
      },
    ];

    await db.batch(batch);

    return sendSuccess(res, 201, { user_id: userId, org_id: orgId, is_new: true });
  } catch (err) {
    return sendError(res, err.status || 500, err.code || "INTERNAL_ERROR", err.message);
  }
}
