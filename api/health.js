// LeadFlow CRM — API — Health check endpoint

import { sendSuccess } from "./_lib/utils/response.js";

export default async function handler(req, res) {
  return sendSuccess(res, 200, { status: "ok", timestamp: new Date().toISOString() });
}
