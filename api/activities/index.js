// LeadFlow CRM — API — Activities list & create

import { verifyAuth } from "../_lib/middleware/auth.js";
import { resolveTenant } from "../_lib/middleware/tenant.js";
import { listActivities, createActivity } from "../_lib/services/activityService.js";
import { sendSuccess, sendError } from "../_lib/utils/response.js";

export default async function handler(req, res) {
  try {
    const authUser = await verifyAuth(req);
    const tenant = await resolveTenant(authUser);

    if (tenant.isExpired && req.method !== "GET") {
      return sendError(res, 403, "FORBIDDEN", "Tu suscripción ha expirado. Renueva para continuar.");
    }

    switch (req.method) {
      case "GET": {
        const activities = await listActivities(tenant.orgId, req.query);
        return sendSuccess(res, 200, activities);
      }

      case "POST": {
        const activity = await createActivity(tenant.orgId, tenant.userId, req.body);
        return sendSuccess(res, 201, activity);
      }

      default:
        res.setHeader("Allow", "GET, POST");
        return sendError(res, 405, "METHOD_NOT_ALLOWED", "Método no permitido");
    }
  } catch (err) {
    return sendError(res, err.status || 500, err.code || "INTERNAL_ERROR", err.message);
  }
}
