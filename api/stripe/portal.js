// LeadFlow CRM — API — Stripe customer portal session

import { verifyAuth } from "../_lib/middleware/auth.js";
import { resolveTenant } from "../_lib/middleware/tenant.js";
import { createPortalSession } from "../_lib/services/stripeService.js";
import { sendSuccess, sendError } from "../_lib/utils/response.js";

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

    const origin = req.headers.origin || req.headers.referer?.replace(/\/$/, "") || "https://clicapt-crm.vercel.app";
    const result = await createPortalSession({
      orgId: tenant.orgId,
      returnUrl: `${origin}/configuracion?tab=subscription`,
    });

    return sendSuccess(res, 200, result);
  } catch (err) {
    console.error("[stripe/portal]", err);
    return sendError(res, err.status || 500, err.code || "STRIPE_ERROR", err.message);
  }
}
