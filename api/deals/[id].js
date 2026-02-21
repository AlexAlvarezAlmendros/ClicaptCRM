// LeadFlow CRM — API — Deal detail (get, update, delete/archive)

import { verifyAuth } from "../_lib/middleware/auth.js";
import { resolveTenant } from "../_lib/middleware/tenant.js";
import { getDeal, updateDeal, archiveDeal, updateDealStage } from "../_lib/services/dealService.js";
import { dealUpdateSchema, dealStageUpdateSchema } from "../_lib/validators/deal.js";
import { validate } from "../_lib/middleware/validate.js";
import { sendSuccess, sendError } from "../_lib/utils/response.js";

export default async function handler(req, res) {
  try {
    const authUser = await verifyAuth(req);
    const tenant = await resolveTenant(authUser.auth0Id);
    const { id } = req.query;

    if (tenant.isExpired && req.method !== "GET") {
      return sendError(res, 403, "FORBIDDEN", "Tu suscripción ha expirado. Renueva para continuar.");
    }

    switch (req.method) {
      case "GET": {
        const deal = await getDeal(tenant.orgId, id);
        return sendSuccess(res, 200, deal);
      }

      case "PUT": {
        const data = validate(dealUpdateSchema, req.body);
        const deal = await updateDeal(tenant.orgId, id, data);
        return sendSuccess(res, 200, deal);
      }

      case "PATCH": {
        // PATCH is used for stage changes (drag & drop)
        const data = validate(dealStageUpdateSchema, req.body);
        const deal = await updateDealStage(tenant.orgId, tenant.userId, id, data.stage_id, data.position || 0);
        return sendSuccess(res, 200, deal);
      }

      case "DELETE": {
        const result = await archiveDeal(tenant.orgId, id);
        return sendSuccess(res, 200, result);
      }

      default:
        res.setHeader("Allow", "GET, PUT, PATCH, DELETE");
        return sendError(res, 405, "METHOD_NOT_ALLOWED", "Método no permitido");
    }
  } catch (err) {
    return sendError(res, err.status || 500, err.code || "INTERNAL_ERROR", err.message);
  }
}
