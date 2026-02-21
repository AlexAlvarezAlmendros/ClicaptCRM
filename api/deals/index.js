// LeadFlow CRM — API — Deals list & create

import { verifyAuth } from "../_lib/middleware/auth.js";
import { resolveTenant } from "../_lib/middleware/tenant.js";
import { listDeals, createDeal } from "../_lib/services/dealService.js";
import { dealCreateSchema } from "../_lib/validators/deal.js";
import { validate } from "../_lib/middleware/validate.js";
import { sendSuccess, sendError } from "../_lib/utils/response.js";

export default async function handler(req, res) {
  try {
    const authUser = await verifyAuth(req);
    const tenant = await resolveTenant(authUser.auth0Id);

    if (tenant.isExpired && req.method !== "GET") {
      return sendError(res, 403, "FORBIDDEN", "Tu suscripción ha expirado. Renueva para continuar.");
    }

    switch (req.method) {
      case "GET": {
        const deals = await listDeals(tenant.orgId, req.query);
        return sendSuccess(res, 200, deals);
      }

      case "POST": {
        const data = validate(dealCreateSchema, req.body);
        const deal = await createDeal(tenant.orgId, tenant.userId, data);
        return sendSuccess(res, 201, deal);
      }

      default:
        res.setHeader("Allow", "GET, POST");
        return sendError(res, 405, "METHOD_NOT_ALLOWED", "Método no permitido");
    }
  } catch (err) {
    return sendError(res, err.status || 500, err.code || "INTERNAL_ERROR", err.message);
  }
}
