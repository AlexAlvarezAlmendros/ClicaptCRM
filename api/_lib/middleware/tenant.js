// LeadFlow CRM — Middleware — Tenant resolution with auto-provisioning

import db from "../db/client.js";

/**
 * Resolves the tenant (organization) from the authenticated user.
 * Accepts either a string (auth0Id — legacy) or an object { auth0Id, email }.
 * If the user doesn't exist in the DB, auto-provisions org + user + pipeline stages.
 */
export async function resolveTenant(authUserOrId) {
  // Support both legacy string and new object format
  const auth0Id = typeof authUserOrId === "string" ? authUserOrId : authUserOrId.auth0Id;
  const email = typeof authUserOrId === "string" ? null : authUserOrId.email;

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

      // ── Auto-provision: create org + user + default pipeline stages ──
      const provisionEmail = email || `${auth0Id.replace(/\|/g, "_")}@unknown.local`;
      console.info(`[tenant] Auto-provisioning user ${auth0Id} (${provisionEmail})`);
      return await autoProvision(auth0Id, provisionEmail);
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
 * Creates a new organization, user and default pipeline stages.
 * Called when a user authenticates via Auth0 but doesn't exist in the DB yet.
 */
async function autoProvision(auth0Id, email) {
  const orgId = crypto.randomUUID().replace(/-/g, "");
  const userId = crypto.randomUUID().replace(/-/g, "");
  const trialEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  const userName = email.split("@")[0];

  const batch = [
    {
      sql: `INSERT INTO organizations (id, name, plan, trial_ends_at, subscription_status)
            VALUES (?, ?, 'trial', ?, 'trialing')`,
      args: [orgId, `Empresa de ${email}`, trialEnd],
    },
    {
      sql: `INSERT INTO users (id, auth0_id, organization_id, email, name, role)
            VALUES (?, ?, ?, ?, ?, 'admin')`,
      args: [userId, auth0Id, orgId, email, userName],
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

  return {
    userId,
    orgId,
    role: "admin",
    userName,
    userEmail: email,
    plan: "trial",
    subscriptionStatus: "trialing",
    isExpired: false,
  };
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
