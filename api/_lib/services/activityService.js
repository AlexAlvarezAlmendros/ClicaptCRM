// LeadFlow CRM — Services — Activity business logic

import db from "../db/client.js";

/**
 * List activities for an organization, optionally filtered by contact or deal.
 */
export async function listActivities(orgId, options = {}) {
  const { contact_id, deal_id, limit = 20 } = options;

  const conditions = ["a.organization_id = ?"];
  const args = [orgId];

  if (contact_id) {
    conditions.push("a.contact_id = ?");
    args.push(contact_id);
  }

  if (deal_id) {
    conditions.push("a.deal_id = ?");
    args.push(deal_id);
  }

  const whereClause = conditions.join(" AND ");

  const result = await db.execute({
    sql: `SELECT a.*,
                 u.name as created_by_name, u.avatar_url as created_by_avatar
          FROM activities a
          JOIN users u ON a.created_by = u.id
          WHERE ${whereClause}
          ORDER BY a.created_at DESC
          LIMIT ?`,
    args: [...args, Math.min(limit, 50)],
  });

  return result.rows;
}

/**
 * Create a new activity.
 */
export async function createActivity(orgId, userId, data) {
  const id = crypto.randomUUID().replace(/-/g, "");

  await db.execute({
    sql: `INSERT INTO activities (id, organization_id, contact_id, deal_id, type, description, metadata, created_by)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      id, orgId, data.contact_id || null, data.deal_id || null,
      data.type, data.description || null, data.metadata ? JSON.stringify(data.metadata) : null,
      userId,
    ],
  });

  const result = await db.execute({
    sql: `SELECT a.*, u.name as created_by_name, u.avatar_url as created_by_avatar
          FROM activities a JOIN users u ON a.created_by = u.id
          WHERE a.id = ?`,
    args: [id],
  });

  return result.rows[0];
}
