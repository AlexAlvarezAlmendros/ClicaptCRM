// LeadFlow CRM — Cron: Trial warning emails
// Runs daily at 09:00 UTC. Sends warning emails at 7 days and 1 day before trial end.

import { sendSuccess, sendError } from "../_lib/utils/response.js";
import { sendTrialWarningEmail } from "../_lib/services/emailService.js";
import db from "../_lib/db/client.js";

export default async function handler(req, res) {
  // Verify Vercel Cron secret
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return sendError(res, 401, "UNAUTHORIZED", "Acceso no autorizado");
  }

  try {
    // Find organizations with trial ending in exactly 7 days or 1 day
    const result = await db.execute({
      sql: `SELECT o.id, o.trial_ends_at,
                   u.email, u.name
            FROM organizations o
            JOIN users u ON u.organization_id = o.id AND u.role = 'admin' AND u.is_active = 1
            WHERE o.subscription_status = 'trialing'
              AND o.trial_ends_at IS NOT NULL
              AND (
                -- 7 days warning: trial_ends_at is between 6.5 and 7.5 days from now
                (julianday(o.trial_ends_at) - julianday('now') BETWEEN 6.5 AND 7.5)
                OR
                -- 1 day warning: trial_ends_at is between 0.5 and 1.5 days from now
                (julianday(o.trial_ends_at) - julianday('now') BETWEEN 0.5 AND 1.5)
              )`,
      args: [],
    });

    let processed = 0;
    const errors = [];

    for (const row of result.rows) {
      const daysLeft = Math.round(
        (new Date(row.trial_ends_at) - new Date()) / (1000 * 60 * 60 * 24)
      );

      try {
        await sendTrialWarningEmail(row.email, row.name || "Usuario", daysLeft);
        processed++;
        console.log(`[cron/trial-warnings] Sent warning to ${row.email} (${daysLeft} days left)`);
      } catch (err) {
        console.error(`[cron/trial-warnings] Failed to send to ${row.email}:`, err.message);
        errors.push({ email: row.email, error: err.message });
      }
    }

    return sendSuccess(res, 200, {
      processed,
      total: result.rows.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (err) {
    console.error("[cron/trial-warnings] Error:", err);
    return sendError(res, 500, "CRON_ERROR", err.message);
  }
}
