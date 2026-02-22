// LeadFlow CRM — API — Stripe create checkout session

import { verifyAuth } from "../_lib/middleware/auth.js";
import { resolveTenant } from "../_lib/middleware/tenant.js";
import { createCheckoutSession } from "../_lib/services/stripeService.js";
import { sendSuccess, sendError } from "../_lib/utils/response.js";
import db from "../_lib/db/client.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return sendError(res, 405, "METHOD_NOT_ALLOWED", "Método no permitido");
  }

  try {
    const authUser = await verifyAuth(req);
    const tenant = await resolveTenant(authUser.auth0Id);

    if (tenant.role !== "admin") {
      return sendError(res, 403, "FORBIDDEN", "Solo el administrador puede gestionar la suscripción");
    }

    const { plan } = req.body;
    if (!plan || !["basic", "pro"].includes(plan)) {
      return sendError(res, 400, "INVALID_PLAN", "Plan debe ser 'basic' o 'pro'");
    }

    // Get org name for Stripe customer
    const orgResult = await db.execute({
      sql: "SELECT name FROM organizations WHERE id = ?",
      args: [tenant.orgId],
    });
    const orgName = orgResult.rows[0]?.name || "LeadFlow Organization";

    const origin = req.headers.origin || req.headers.referer?.replace(/\/$/, "") || "https://clicapt-crm.vercel.app";
    const result = await createCheckoutSession({
      orgId: tenant.orgId,
      plan,
      email: tenant.userEmail,
      orgName,
      successUrl: `${origin}/configuracion?tab=subscription&checkout=success`,
      cancelUrl: `${origin}/configuracion?tab=subscription&checkout=cancelled`,
    });

    return sendSuccess(res, 200, result);
  } catch (err) {
    console.error("[stripe/create-checkout]", err);
    return sendError(res, err.status || 500, err.code || "STRIPE_ERROR", err.message);
  }
}
