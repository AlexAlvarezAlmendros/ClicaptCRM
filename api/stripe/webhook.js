// LeadFlow CRM — API — Stripe webhook handler
// Owned by Agente 3 — Integration Engineer
// TODO-AGENTE-3: Implement full Stripe webhook handling

import { sendError } from "../_lib/utils/response.js";

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  return sendError(res, 501, "NOT_IMPLEMENTED", "Stripe webhook pendiente de implementación");
}
