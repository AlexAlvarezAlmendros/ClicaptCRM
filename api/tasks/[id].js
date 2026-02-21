// LeadFlow CRM — API — Task detail (get, update, complete, delete)

import { verifyAuth } from "../_lib/middleware/auth.js";
import { resolveTenant } from "../_lib/middleware/tenant.js";
import { getTask, updateTask, completeTask, deleteTask } from "../_lib/services/taskService.js";
import { taskUpdateSchema } from "../_lib/validators/task.js";
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
        const task = await getTask(tenant.orgId, id);
        return sendSuccess(res, 200, task);
      }

      case "PUT": {
        const data = validate(taskUpdateSchema, req.body);
        const task = await updateTask(tenant.orgId, id, data);
        return sendSuccess(res, 200, task);
      }

      case "PATCH": {
        // PATCH is used for completing a task
        const task = await completeTask(tenant.orgId, tenant.userId, id);
        return sendSuccess(res, 200, task);
      }

      case "DELETE": {
        const result = await deleteTask(tenant.orgId, id);
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
