// LeadFlow CRM — Services — Deal business logic

import db from "../db/client.js";

/**
 * List deals for an organization, optionally filtered.
 */
export async function listDeals(orgId, options = {}) {
  const { stage_id, assigned_to, contact_id } = options;

  const conditions = ["d.organization_id = ?", "d.is_archived = 0"];
  const args = [orgId];

  if (stage_id) {
    conditions.push("d.stage_id = ?");
    args.push(stage_id);
  }

  if (assigned_to) {
    conditions.push("d.assigned_to = ?");
    args.push(assigned_to);
  }

  if (contact_id) {
    conditions.push("d.contact_id = ?");
    args.push(contact_id);
  }

  const whereClause = conditions.join(" AND ");

  const result = await db.execute({
    sql: `SELECT d.*, ps.name as stage_name, ps.color as stage_color, ps.probability as stage_probability,
                 c.name as contact_name, c.surname as contact_surname, c.company as contact_company
          FROM deals d
          JOIN pipeline_stages ps ON d.stage_id = ps.id
          JOIN contacts c ON d.contact_id = c.id
          WHERE ${whereClause}
          ORDER BY d.position ASC, d.created_at DESC`,
    args,
  });

  return result.rows;
}

/**
 * Get a single deal by ID.
 */
export async function getDeal(orgId, dealId) {
  const result = await db.execute({
    sql: `SELECT d.*, ps.name as stage_name, ps.color as stage_color, ps.probability as stage_probability,
                 c.name as contact_name, c.surname as contact_surname, c.company as contact_company
          FROM deals d
          JOIN pipeline_stages ps ON d.stage_id = ps.id
          JOIN contacts c ON d.contact_id = c.id
          WHERE d.id = ? AND d.organization_id = ?`,
    args: [dealId, orgId],
  });

  if (result.rows.length === 0) {
    throw { status: 404, code: "NOT_FOUND", message: "Oportunidad no encontrada" };
  }

  return result.rows[0];
}

/**
 * Create a new deal.
 */
export async function createDeal(orgId, userId, data) {
  const id = crypto.randomUUID().replace(/-/g, "");

  // Get max position for the stage
  const posResult = await db.execute({
    sql: `SELECT COALESCE(MAX(position), -1) + 1 as next_pos FROM deals WHERE stage_id = ? AND organization_id = ?`,
    args: [data.stage_id, orgId],
  });
  const position = posResult.rows[0].next_pos;

  await db.execute({
    sql: `INSERT INTO deals (id, organization_id, contact_id, stage_id, title, value, expected_close, notes, assigned_to, created_by, position)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      id, orgId, data.contact_id, data.stage_id, data.title,
      data.value || 0, data.expected_close || null, data.notes || null,
      data.assigned_to || null, userId, position,
    ],
  });

  return getDeal(orgId, id);
}

/**
 * Update a deal's stage (for drag & drop).
 */
export async function updateDealStage(orgId, userId, dealId, stageId, position = 0) {
  const deal = await getDeal(orgId, dealId);

  // Get stage info
  const stageResult = await db.execute({
    sql: `SELECT * FROM pipeline_stages WHERE id = ? AND organization_id = ?`,
    args: [stageId, orgId],
  });

  if (stageResult.rows.length === 0) {
    throw { status: 404, code: "NOT_FOUND", message: "Etapa no encontrada" };
  }

  const stage = stageResult.rows[0];

  const updates = {
    stage_id: stageId,
    position,
    probability: stage.probability,
    updated_at: new Date().toISOString(),
  };

  // Side effects for won/lost stages
  if (stage.is_won) {
    updates.actual_close = new Date().toISOString().split("T")[0];
    // Update contact status to 'customer'
    await db.execute({
      sql: `UPDATE contacts SET status = 'customer', updated_at = datetime('now') WHERE id = ?`,
      args: [deal.contact_id],
    });
  }

  if (stage.is_lost) {
    updates.actual_close = new Date().toISOString().split("T")[0];
    // Update contact status to 'lost'
    await db.execute({
      sql: `UPDATE contacts SET status = 'lost', updated_at = datetime('now') WHERE id = ?`,
      args: [deal.contact_id],
    });
  }

  await db.execute({
    sql: `UPDATE deals SET stage_id = ?, position = ?, probability = ?, updated_at = datetime('now')
          ${stage.is_won || stage.is_lost ? ", actual_close = ?" : ""}
          WHERE id = ? AND organization_id = ?`,
    args: [
      stageId, position, stage.probability,
      ...(stage.is_won || stage.is_lost ? [updates.actual_close] : []),
      dealId, orgId,
    ],
  });

  return getDeal(orgId, dealId);
}

/**
 * Update a deal.
 */
export async function updateDeal(orgId, dealId, data) {
  await getDeal(orgId, dealId);

  const fields = [];
  const args = [];

  const updatableFields = [
    "title", "contact_id", "stage_id", "value", "expected_close",
    "loss_reason", "notes", "assigned_to",
  ];

  for (const field of updatableFields) {
    if (data[field] !== undefined) {
      fields.push(`${field} = ?`);
      args.push(data[field]);
    }
  }

  if (fields.length > 0) {
    fields.push("updated_at = datetime('now')");
    args.push(dealId, orgId);

    await db.execute({
      sql: `UPDATE deals SET ${fields.join(", ")} WHERE id = ? AND organization_id = ?`,
      args,
    });
  }

  return getDeal(orgId, dealId);
}

/**
 * Archive a deal (soft delete).
 */
export async function archiveDeal(orgId, dealId) {
  await getDeal(orgId, dealId);

  await db.execute({
    sql: `UPDATE deals SET is_archived = 1, updated_at = datetime('now') WHERE id = ? AND organization_id = ?`,
    args: [dealId, orgId],
  });

  return { id: dealId, archived: true };
}
