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

        const { email, name, role } = req.body;

        if (!email || !name) {
          return sendError(res, 400, "VALIDATION_ERROR", "Email y nombre son obligatorios");
        }

        // Check plan allows more members
        const org = await db.execute({
          sql: `SELECT plan FROM organizations WHERE id = ?`,
          args: [tenant.orgId],
        });
        const plan = org.rows[0]?.plan;

        const memberCount = await db.execute({
          sql: `SELECT COUNT(*) as count FROM users WHERE organization_id = ? AND is_active = 1`,
          args: [tenant.orgId],
        });
        const count = Number(memberCount.rows[0].count);

        const maxMembers = plan === "pro" ? 10 : plan === "basic" ? 3 : 1;
        if (count >= maxMembers) {
          return sendError(res, 403, "PLAN_LIMIT", `Tu plan permite un máximo de ${maxMembers} miembros. Actualiza para añadir más.`);
        }

        // Check if email already exists in org
        const existingUser = await db.execute({
          sql: `SELECT id FROM users WHERE email = ? AND organization_id = ?`,
          args: [email, tenant.orgId],
        });
        if (existingUser.rows.length > 0) {
          return sendError(res, 409, "DUPLICATE", "Este email ya está registrado en tu organización");
        }

        // Create user (they'll link to Auth0 on first login)
        const userId = crypto.randomUUID().replace(/-/g, "");
        await db.execute({
          sql: `INSERT INTO users (id, auth0_id, organization_id, email, name, role)
                VALUES (?, ?, ?, ?, ?, ?)`,
          args: [userId, `pending|${userId}`, tenant.orgId, email, name, role || "user"],
        });

        return sendSuccess(res, 201, { id: userId, email, name, role: role || "user" });
      }

      default:
        res.setHeader("Allow", "GET, POST");
        return sendError(res, 405, "METHOD_NOT_ALLOWED", "Método no permitido");
    }
  } catch (err) {
    return sendError(res, err.status || 500, err.code || "INTERNAL_ERROR", err.message);
  }
}
