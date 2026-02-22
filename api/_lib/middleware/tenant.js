// LeadFlow CRM — Middleware — Tenant resolution (stub)
// TODO-AGENTE-3: Replace this stub with real tenant resolution

import db from "../db/client.js";

/**
 * Resolves the tenant (organization) from the authenticated user's auth0Id.
 * Returns the user's context including org, role, and subscription status.
 *
 * STUB MODE: If no user is found in DB, returns a fake tenant for development.
 */
export async function resolveTenant(auth0Id) {
  try {
    const result = await db.execute({
      sql: `SELECT u.id as user_id, u.role, u.organization_id, u.name, u.email,
                   o.plan, o.subscription_status, o.trial_ends_at
            FROM users u
            JOIN organizations o ON u.organization_id = o.id
            WHERE u.auth0_id = ? AND u.is_active = 1`,
      args: [auth0Id],
    });

    if (result.rows.length === 0) {
      // ── Stub mode for local development ──
      if (auth0Id === "auth0|dev_user_001") {
        console.warn("[tenant] Running in STUB mode — returning dev tenant");
        return {
          userId: "dev_user_001",
          orgId: "dev_org_001",
          role: "admin",
          userName: "Developer",
          userEmail: "dev@leadflow.app",
          plan: "trial",
          subscriptionStatus: "trialing",
          isExpired: false,
        };
      }

      throw { status: 404, code: "NOT_FOUND", message: "Usuario no registrado" };
    }

    const user = result.rows[0];

    // Check if trial has expired or subscription is cancelled
    const isExpired =
      user.subscription_status === "expired" ||
      (user.subscription_status === "trialing" &&
        new Date(user.trial_ends_at) < new Date());

    return {
      userId: user.user_id,
      orgId: user.organization_id,
      role: user.role,
      userName: user.name,
      userEmail: user.email,
      plan: user.plan,
      subscriptionStatus: user.subscription_status,
      isExpired,
    };
  } catch (err) {
    if (err.status) throw err;
    throw { status: 500, code: "INTERNAL_ERROR", message: "Error al resolver tenant" };
  }
}

/**
 * Guard for write operations (POST, PUT, PATCH, DELETE).
 * Throws 403 if the tenant's subscription is expired.
 * Call this after resolveTenant in any mutating endpoint.
 */
export function requireActiveSubscription(tenant) {
  if (tenant.isExpired) {
    throw {
      status: 403,
      code: "SUBSCRIPTION_EXPIRED",
      message: "Tu suscripción ha expirado. Elige un plan para continuar.",
    };
  }
}
