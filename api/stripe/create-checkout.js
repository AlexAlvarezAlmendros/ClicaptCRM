// LeadFlow CRM — API — Stripe create checkout session
// Owned by Agente 3 — Integration Engineer
// TODO-AGENTE-3: Implement full Stripe checkout logic

import { sendError } from "../_lib/utils/response.js";

export default async function handler(req, res) {
  return sendError(res, 501, "NOT_IMPLEMENTED", "Stripe checkout pendiente de implementación");
}
