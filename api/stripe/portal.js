// LeadFlow CRM — API — Stripe customer portal
// Owned by Agente 3 — Integration Engineer
// TODO-AGENTE-3: Implement Stripe customer portal session

import { sendError } from "../_lib/utils/response.js";

export default async function handler(req, res) {
  return sendError(res, 501, "NOT_IMPLEMENTED", "Stripe portal pendiente de implementación");
}
