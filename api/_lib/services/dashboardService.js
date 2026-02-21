// LeadFlow CRM — Services — Dashboard metrics

import db from "../db/client.js";

/**
 * Get dashboard statistics for an organization.
 */
export async function getDashboardStats(orgId, options = {}) {
  const { from, to } = options;

  // Date range defaults to current month
  const now = new Date();
  const defaultFrom = from || new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const defaultTo = to || now.toISOString();

  // New leads count
  const newLeadsResult = await db.execute({
    sql: `SELECT COUNT(*) as count FROM contacts
          WHERE organization_id = ? AND is_deleted = 0
          AND created_at >= ? AND created_at <= ?`,
    args: [orgId, defaultFrom, defaultTo],
  });

  // Open deals count
  const openDealsResult = await db.execute({
    sql: `SELECT COUNT(*) as count FROM deals d
          JOIN pipeline_stages ps ON d.stage_id = ps.id
          WHERE d.organization_id = ? AND d.is_archived = 0
          AND ps.is_won = 0 AND ps.is_lost = 0`,
    args: [orgId],
  });

  // Pipeline value
  const pipelineValueResult = await db.execute({
    sql: `SELECT COALESCE(SUM(d.value), 0) as total FROM deals d
          JOIN pipeline_stages ps ON d.stage_id = ps.id
          WHERE d.organization_id = ? AND d.is_archived = 0
          AND ps.is_won = 0 AND ps.is_lost = 0`,
    args: [orgId],
  });

  // Conversion rate
  const totalDealsResult = await db.execute({
    sql: `SELECT COUNT(*) as total,
                 SUM(CASE WHEN ps.is_won = 1 THEN 1 ELSE 0 END) as won
          FROM deals d
          JOIN pipeline_stages ps ON d.stage_id = ps.id
          WHERE d.organization_id = ?
          AND d.created_at >= ? AND d.created_at <= ?`,
    args: [orgId, defaultFrom, defaultTo],
  });

  const totalDeals = totalDealsResult.rows[0].total || 0;
  const wonDeals = totalDealsResult.rows[0].won || 0;
  const conversionRate = totalDeals > 0 ? Math.round((wonDeals / totalDeals) * 1000) / 10 : 0;

  // Deals by stage
  const dealsByStageResult = await db.execute({
    sql: `SELECT ps.id as stage_id, ps.name, ps.color, ps.position,
                 COUNT(d.id) as count, COALESCE(SUM(d.value), 0) as value
          FROM pipeline_stages ps
          LEFT JOIN deals d ON ps.id = d.stage_id AND d.is_archived = 0
          WHERE ps.organization_id = ?
          GROUP BY ps.id
          ORDER BY ps.position ASC`,
    args: [orgId],
  });

  // Recent activity
  const recentActivityResult = await db.execute({
    sql: `SELECT a.*, u.name as created_by_name, u.avatar_url as created_by_avatar
          FROM activities a
          JOIN users u ON a.created_by = u.id
          WHERE a.organization_id = ?
          ORDER BY a.created_at DESC
          LIMIT 15`,
    args: [orgId],
  });

  // Today's tasks
  const today = new Date().toISOString().split("T")[0];
  const todayTasksResult = await db.execute({
    sql: `SELECT t.*, c.name as contact_name, c.surname as contact_surname
          FROM tasks t
          LEFT JOIN contacts c ON t.contact_id = c.id
          WHERE t.organization_id = ? AND t.is_completed = 0
          AND (t.due_date = ? OR t.due_date < ?)
          ORDER BY t.due_date ASC, t.priority DESC`,
    args: [orgId, today, today],
  });

  return {
    newLeads: newLeadsResult.rows[0].count,
    openDeals: openDealsResult.rows[0].count,
    pipelineValue: pipelineValueResult.rows[0].total,
    conversionRate,
    dealsByStage: dealsByStageResult.rows,
    recentActivity: recentActivityResult.rows,
    todayTasks: todayTasksResult.rows,
  };
}
