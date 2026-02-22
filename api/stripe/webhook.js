// LeadFlow CRM — API — Stripe webhook handler
// Receives raw body, verifies signature, processes events.

import { handleWebhookEvent, constructWebhookEvent } from "../_lib/services/stripeService.js";
import { sendSuccess, sendError } from "../_lib/utils/response.js";

// Vercel: disable body parsing so we get the raw body for signature verification
export const config = { api: { bodyParser: false } };

/**
 * Collect raw body from the request stream.
 */
function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return sendError(res, 405, "METHOD_NOT_ALLOWED", "Método no permitido");
  }

  try {
    const rawBody = await getRawBody(req);
    const signature = req.headers["stripe-signature"];

    if (!signature) {
      return sendError(res, 400, "MISSING_SIGNATURE", "Falta cabecera stripe-signature");
    }

    let event;
    try {
      event = constructWebhookEvent(rawBody, signature);
    } catch (err) {
      console.error("[stripe/webhook] Signature verification failed:", err.message);
      return sendError(res, 400, "INVALID_SIGNATURE", "Firma de webhook inválida");
    }

    console.log(`[stripe/webhook] Received event: ${event.type} (${event.id})`);

    await handleWebhookEvent(event);

    return sendSuccess(res, 200, { received: true });
  } catch (err) {
    console.error("[stripe/webhook] Error:", err);
    return sendError(res, 500, "WEBHOOK_ERROR", err.message);
  }
}
