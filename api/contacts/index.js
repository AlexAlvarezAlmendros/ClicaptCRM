// LeadFlow CRM — API — Contacts list & create

import { verifyAuth } from "../_lib/middleware/auth.js";
import { resolveTenant } from "../_lib/middleware/tenant.js";
import { listContacts, createContact } from "../_lib/services/contactService.js";
import { contactCreateSchema } from "../_lib/validators/contact.js";
import { validate } from "../_lib/middleware/validate.js";
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
        const result = await listContacts(tenant.orgId, req.query);
        res.setHeader("X-Total-Count", result.pagination.total);
        return sendSuccess(res, 200, { contacts: result.data, pagination: result.pagination });
      }

      case "POST": {
        const data = validate(contactCreateSchema, req.body);
        const contact = await createContact(tenant.orgId, tenant.userId, data);
        return sendSuccess(res, 201, contact);
      }

      default:
        res.setHeader("Allow", "GET, POST");
        return sendError(res, 405, "METHOD_NOT_ALLOWED", "Método no permitido");
    }
  } catch (err) {
    return sendError(res, err.status || 500, err.code || "INTERNAL_ERROR", err.message);
  }
}
