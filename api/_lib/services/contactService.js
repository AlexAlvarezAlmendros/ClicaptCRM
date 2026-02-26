// LeadFlow CRM — Services — Contact business logic

import db from "../db/client.js";
import { parsePagination, buildPagination } from "../utils/pagination.js";

/**
 * List contacts for an organization with search, filters, and pagination.
 */
export async function listContacts(orgId, options = {}) {
  const { page, limit, offset } = parsePagination(options);
  const { search, status, source, tag, group_id, sort = "created_at", order = "desc" } = options;

  const conditions = ["c.organization_id = ?", "c.is_deleted = 0"];
  const args = [orgId];

  if (search) {
    conditions.push("(c.name LIKE ? OR c.surname LIKE ? OR c.company LIKE ? OR c.email LIKE ?)");
    const searchTerm = `%${search}%`;
    args.push(searchTerm, searchTerm, searchTerm, searchTerm);
  }

  if (status) {
    conditions.push("c.status = ?");
    args.push(status);
  }

  if (source) {
    conditions.push("c.source = ?");
    args.push(source);
  }

  if (tag) {
    conditions.push("EXISTS (SELECT 1 FROM contact_tags ct JOIN tags t ON ct.tag_id = t.id WHERE ct.contact_id = c.id AND t.name = ?)");
    args.push(tag);
  }

  if (group_id) {
    conditions.push("c.group_id = ?");
    args.push(group_id);
  }

  const whereClause = conditions.join(" AND ");
  const allowedSorts = ["created_at", "updated_at", "name", "company", "status"];
  const sortCol = allowedSorts.includes(sort) ? sort : "created_at";
  const sortOrder = order === "asc" ? "ASC" : "DESC";

  // Count total
  const countResult = await db.execute({
    sql: `SELECT COUNT(*) as total FROM contacts c WHERE ${whereClause}`,
    args,
  });
  const total = countResult.rows[0].total;

  // Fetch page
  const result = await db.execute({
    sql: `SELECT c.* FROM contacts c WHERE ${whereClause} ORDER BY c.${sortCol} ${sortOrder} LIMIT ? OFFSET ?`,
    args: [...args, limit, offset],
  });

  return {
    data: result.rows,
    pagination: buildPagination(page, limit, total),
  };
}

/**
 * Get a single contact by ID.
 */
export async function getContact(orgId, contactId) {
  const result = await db.execute({
    sql: `SELECT * FROM contacts WHERE id = ? AND organization_id = ? AND is_deleted = 0`,
    args: [contactId, orgId],
  });

  if (result.rows.length === 0) {
    throw { status: 404, code: "NOT_FOUND", message: "Contacto no encontrado" };
  }

  return result.rows[0];
}

/**
 * Create a new contact.
 */
export async function createContact(orgId, userId, data) {
  const id = crypto.randomUUID().replace(/-/g, "");

  await db.execute({
    sql: `INSERT INTO contacts (id, organization_id, name, surname, company, job_title, email, phone, address, city, postal_code, country, source, notes, group_id, assigned_to, created_by)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      id, orgId, data.name, data.surname || null, data.company || null,
      data.job_title || null, data.email || null, data.phone || null,
      data.address || null, data.city || null, data.postal_code || null,
      data.country || "España", data.source || "other", data.notes || null,
      data.group_id || null, data.assigned_to || null, userId,
    ],
  });

  // Handle tags if provided
  if (data.tags && data.tags.length > 0) {
    for (const tagName of data.tags) {
      // Create tag if it doesn't exist
      await db.execute({
        sql: `INSERT OR IGNORE INTO tags (id, organization_id, name) VALUES (?, ?, ?)`,
        args: [crypto.randomUUID().replace(/-/g, ""), orgId, tagName],
      });

      // Get tag ID
      const tagResult = await db.execute({
        sql: `SELECT id FROM tags WHERE organization_id = ? AND name = ?`,
        args: [orgId, tagName],
      });

      if (tagResult.rows.length > 0) {
        await db.execute({
          sql: `INSERT OR IGNORE INTO contact_tags (contact_id, tag_id) VALUES (?, ?)`,
          args: [id, tagResult.rows[0].id],
        });
      }
    }
  }

  return getContact(orgId, id);
}

/**
 * Update an existing contact.
 */
export async function updateContact(orgId, contactId, data) {
  // Verify contact exists
  await getContact(orgId, contactId);

  const fields = [];
  const args = [];

  const updatableFields = [
    "name", "surname", "company", "job_title", "email", "phone",
    "address", "city", "postal_code", "country", "source", "status", "notes", "group_id", "assigned_to",
  ];

  for (const field of updatableFields) {
    if (data[field] !== undefined) {
      fields.push(`${field} = ?`);
      args.push(data[field]);
    }
  }

  if (fields.length > 0) {
    fields.push("updated_at = datetime('now')");
    args.push(contactId, orgId);

    await db.execute({
      sql: `UPDATE contacts SET ${fields.join(", ")} WHERE id = ? AND organization_id = ?`,
      args,
    });
  }

  return getContact(orgId, contactId);
}

/**
 * Soft delete a contact.
 */
export async function deleteContact(orgId, contactId) {
  await getContact(orgId, contactId);

  await db.execute({
    sql: `UPDATE contacts SET is_deleted = 1, deleted_at = datetime('now'), updated_at = datetime('now')
          WHERE id = ? AND organization_id = ?`,
    args: [contactId, orgId],
  });

  return { id: contactId, deleted: true };
}
