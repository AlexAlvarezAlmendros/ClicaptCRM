// LeadFlow CRM — Services — Task business logic

import db from "../db/client.js";

/**
 * List tasks for an organization with filters.
 */
export async function listTasks(orgId, options = {}) {
  const { filter, contact_id, deal_id, assigned_to } = options;

  const conditions = ["t.organization_id = ?"];
  const args = [orgId];
  const today = new Date().toISOString().split("T")[0];

  switch (filter) {
    case "today":
      conditions.push("t.due_date = ? AND t.is_completed = 0");
      args.push(today);
      break;
    case "overdue":
      conditions.push("t.due_date < ? AND t.is_completed = 0");
      args.push(today);
      break;
    case "upcoming":
      conditions.push("t.due_date > ? AND t.is_completed = 0");
      args.push(today);
      break;
    case "completed":
      conditions.push("t.is_completed = 1");
      break;
    default:
      conditions.push("t.is_completed = 0");
  }

  if (contact_id) {
    conditions.push("t.contact_id = ?");
    args.push(contact_id);
  }

  if (deal_id) {
    conditions.push("t.deal_id = ?");
    args.push(deal_id);
  }

  if (assigned_to) {
    conditions.push("t.assigned_to = ?");
    args.push(assigned_to);
  }

  const whereClause = conditions.join(" AND ");

  const result = await db.execute({
    sql: `SELECT t.*,
                 c.name as contact_name, c.surname as contact_surname, c.company as contact_company,
                 d.title as deal_title
          FROM tasks t
          LEFT JOIN contacts c ON t.contact_id = c.id
          LEFT JOIN deals d ON t.deal_id = d.id
          WHERE ${whereClause}
          ORDER BY t.due_date ASC NULLS LAST, t.priority DESC, t.created_at DESC`,
    args,
  });

  return result.rows;
}

/**
 * Get a single task by ID.
 */
export async function getTask(orgId, taskId) {
  const result = await db.execute({
    sql: `SELECT t.*,
                 c.name as contact_name, c.surname as contact_surname,
                 d.title as deal_title
          FROM tasks t
          LEFT JOIN contacts c ON t.contact_id = c.id
          LEFT JOIN deals d ON t.deal_id = d.id
          WHERE t.id = ? AND t.organization_id = ?`,
    args: [taskId, orgId],
  });

  if (result.rows.length === 0) {
    throw { status: 404, code: "NOT_FOUND", message: "Tarea no encontrada" };
  }

  return result.rows[0];
}

/**
 * Create a new task.
 */
export async function createTask(orgId, userId, data) {
  const id = crypto.randomUUID().replace(/-/g, "");

  await db.execute({
    sql: `INSERT INTO tasks (id, organization_id, contact_id, deal_id, title, description, due_date, priority, assigned_to, created_by)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      id, orgId, data.contact_id || null, data.deal_id || null,
      data.title, data.description || null, data.due_date || null,
      data.priority || "medium", data.assigned_to || userId, userId,
    ],
  });

  return getTask(orgId, id);
}

/**
 * Update a task.
 */
export async function updateTask(orgId, taskId, data) {
  await getTask(orgId, taskId);

  const fields = [];
  const args = [];

  const updatableFields = [
    "title", "description", "due_date", "priority", "contact_id", "deal_id", "assigned_to",
  ];

  for (const field of updatableFields) {
    if (data[field] !== undefined) {
      fields.push(`${field} = ?`);
      args.push(data[field]);
    }
  }

  if (fields.length > 0) {
    fields.push("updated_at = datetime('now')");
    args.push(taskId, orgId);

    await db.execute({
      sql: `UPDATE tasks SET ${fields.join(", ")} WHERE id = ? AND organization_id = ?`,
      args,
    });
  }

  return getTask(orgId, taskId);
}

/**
 * Mark a task as completed.
 */
export async function completeTask(orgId, userId, taskId) {
  await getTask(orgId, taskId);

  await db.execute({
    sql: `UPDATE tasks SET is_completed = 1, completed_at = datetime('now'), updated_at = datetime('now')
          WHERE id = ? AND organization_id = ?`,
    args: [taskId, orgId],
  });

  // Create activity for task completion
  const task = await getTask(orgId, taskId);

  await db.execute({
    sql: `INSERT INTO activities (id, organization_id, contact_id, deal_id, type, description, created_by)
          VALUES (?, ?, ?, ?, 'task_completed', ?, ?)`,
    args: [
      crypto.randomUUID().replace(/-/g, ""), orgId,
      task.contact_id, task.deal_id,
      `Tarea completada: ${task.title}`, userId,
    ],
  });

  return task;
}

/**
 * Delete a task.
 */
export async function deleteTask(orgId, taskId) {
  await getTask(orgId, taskId);

  await db.execute({
    sql: `DELETE FROM tasks WHERE id = ? AND organization_id = ?`,
    args: [taskId, orgId],
  });

  return { id: taskId, deleted: true };
}
