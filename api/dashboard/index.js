// LeadFlow CRM — API — Dashboard stats

import { verifyAuth } from "../_lib/middleware/auth.js";
import { resolveTenant } from "../_lib/middleware/tenant.js";
import { getDashboardStats } from "../_lib/services/dashboardService.js";
import { sendSuccess, sendError } from "../_lib/utils/response.js";

export default async function handler(req, res) {
  try {
    const authUser = await verifyAuth(req);
    const tenant = await resolveTenant(authUser);

    if (req.method !== "GET") {
      res.setHeader("Allow", "GET");
      return sendError(res, 405, "METHOD_NOT_ALLOWED", "Método no permitido");
    }

    const stats = await getDashboardStats(tenant.orgId, req.query);
    return sendSuccess(res, 200, stats);
  } catch (err) {
    return sendError(res, err.status || 500, err.code || "INTERNAL_ERROR", err.message);
  }
}
