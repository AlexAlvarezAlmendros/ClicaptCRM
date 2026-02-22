// LeadFlow CRM — Cron: Task reminder emails
// Runs daily at 08:00 UTC. Sends digest of overdue + today's tasks to each user.

import { sendSuccess, sendError } from "../_lib/utils/response.js";
import { sendTaskReminderEmail } from "../_lib/services/emailService.js";
import db from "../_lib/db/client.js";

export default async function handler(req, res) {
  // Verify Vercel Cron secret
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return sendError(res, 401, "UNAUTHORIZED", "Acceso no autorizado");
  }

  try {
    // Find all incomplete tasks due today or overdue, grouped by assigned user
    const result = await db.execute({
      sql: `SELECT t.id, t.title, t.due_date, t.priority, t.assigned_to,
                   u.email, u.name as user_name
            FROM tasks t
            JOIN users u ON t.assigned_to = u.id AND u.is_active = 1
            WHERE t.is_completed = 0
              AND t.due_date IS NOT NULL
              AND date(t.due_date) <= date('now')
            ORDER BY t.assigned_to, t.due_date ASC`,
      args: [],
    });

    // Group tasks by user
    const tasksByUser = {};
    for (const row of result.rows) {
      const key = row.assigned_to;
      if (!tasksByUser[key]) {
        tasksByUser[key] = {
          email: row.email,
          name: row.user_name || "Usuario",
          tasks: [],
        };
      }
      tasksByUser[key].tasks.push({
        title: row.title,
        due_date: row.due_date,
        priority: row.priority,
      });
    }

    let processed = 0;
    const errors = [];

    for (const [userId, userData] of Object.entries(tasksByUser)) {
      try {
        await sendTaskReminderEmail(userData.email, userData.name, userData.tasks);
        processed++;
        console.log(
          `[cron/task-reminders] Sent ${userData.tasks.length} task(s) reminder to ${userData.email}`
        );
      } catch (err) {
        console.error(`[cron/task-reminders] Failed to send to ${userData.email}:`, err.message);
        errors.push({ email: userData.email, error: err.message });
      }
    }

    return sendSuccess(res, 200, {
      processed,
      totalUsers: Object.keys(tasksByUser).length,
      totalTasks: result.rows.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (err) {
    console.error("[cron/task-reminders] Error:", err);
    return sendError(res, 500, "CRON_ERROR", err.message);
  }
}
