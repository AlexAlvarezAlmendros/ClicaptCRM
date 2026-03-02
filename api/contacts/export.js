// LeadFlow CRM — API — CSV Export contacts
// GET /api/contacts/export?columns=name,surname,email,...

import { verifyAuth } from "../_lib/middleware/auth.js";
import { resolveTenant } from "../_lib/middleware/tenant.js";
import db from "../_lib/db/client.js";

// All exportable columns in their canonical order
const ALL_COLUMNS = [
  { key: "name",       label: "Nombre" },
  { key: "surname",    label: "Apellido" },
  { key: "email",      label: "Email" },
  { key: "phone",      label: "Teléfono" },
  { key: "company",    label: "Empresa" },
  { key: "job_title",  label: "Cargo" },
  { key: "website",    label: "Página web" },
  { key: "status",     label: "Estado" },
  { key: "source",     label: "Origen" },
  { key: "notes",      label: "Notas" },
  { key: "created_at", label: "Fecha creación" },
];

const VALID_KEYS = new Set(ALL_COLUMNS.map((c) => c.key));

function csvEscape(val) {
  const str = String(val ?? "");
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: { code: "METHOD_NOT_ALLOWED", message: "Método no permitido" } });
  }

  try {
    const authUser = await verifyAuth(req);
    const tenant = await resolveTenant(authUser);

    // Parse requested columns; default to all
    const requested = req.query.columns
      ? req.query.columns.split(",").map((k) => k.trim()).filter((k) => VALID_KEYS.has(k))
      : ALL_COLUMNS.map((c) => c.key);

    const columns = requested.length > 0
      ? ALL_COLUMNS.filter((c) => requested.includes(c.key))
      : ALL_COLUMNS;

    const result = await db.execute({
      sql: `SELECT ${columns.map((c) => `c.${c.key}`).join(", ")}
            FROM contacts c
            WHERE c.organization_id = ? AND c.is_deleted = 0
            ORDER BY c.created_at DESC`,
      args: [tenant.orgId],
    });

    const csvRows = [columns.map((c) => c.label).join(",")];
    for (const row of result.rows) {
      csvRows.push(columns.map((c) => csvEscape(row[c.key])).join(","));
    }

    const csv = "\uFEFF" + csvRows.join("\n"); // BOM for Excel UTF-8

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="contactos_${new Date().toISOString().slice(0, 10)}.csv"`);
    return res.status(200).send(csv);
  } catch (err) {
    console.error("[contacts/export]", err);
    return res.status(err.status || 500).json({
      error: { code: err.code || "INTERNAL_ERROR", message: err.message },
    });
  }
}
