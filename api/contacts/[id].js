// LeadFlow CRM — API — Contact detail (get, update, delete)

import { verifyAuth } from "../_lib/middleware/auth.js";
import { resolveTenant } from "../_lib/middleware/tenant.js";
import { getContact, updateContact, deleteContact } from "../_lib/services/contactService.js";
import { contactUpdateSchema } from "../_lib/validators/contact.js";
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
        const contact = await getContact(tenant.orgId, id);
        return sendSuccess(res, 200, contact);
      }

      case "PUT": {
        const data = validate(contactUpdateSchema, req.body);
        const contact = await updateContact(tenant.orgId, id, data);
        return sendSuccess(res, 200, contact);
      }

      case "DELETE": {
        const result = await deleteContact(tenant.orgId, id);
        return sendSuccess(res, 200, result);
      }

      default:
        res.setHeader("Allow", "GET, PUT, DELETE");
        return sendError(res, 405, "METHOD_NOT_ALLOWED", "Método no permitido");
    }
  } catch (err) {
    return sendError(res, err.status || 500, err.code || "INTERNAL_ERROR", err.message);
  }
}
