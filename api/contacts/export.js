// LeadFlow CRM — API — CSV Export contacts
// GET /api/contacts/export — Returns CSV file

import { verifyAuth } from "../_lib/middleware/auth.js";
import { resolveTenant } from "../_lib/middleware/tenant.js";
import db from "../_lib/db/client.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: { code: "METHOD_NOT_ALLOWED", message: "Método no permitido" } });
  }

  try {
    const authUser = await verifyAuth(req);
    const tenant = await resolveTenant(authUser);

    const result = await db.execute({
      sql: `SELECT c.first_name, c.last_name, c.email, c.phone, c.company,
                   c.position, c.status, c.source, c.notes, c.created_at
            FROM contacts c
            WHERE c.organization_id = ?
            ORDER BY c.created_at DESC`,
      args: [tenant.orgId],
    });

    const headers = ["Nombre", "Apellido", "Email", "Teléfono", "Empresa", "Cargo", "Estado", "Origen", "Notas", "Fecha creación"];
    const fields = ["first_name", "last_name", "email", "phone", "company", "position", "status", "source", "notes", "created_at"];

    const csvRows = [headers.join(",")];
    for (const row of result.rows) {
      const values = fields.map((f) => {
        const val = row[f] ?? "";
        // Escape CSV: wrap in quotes if contains comma, quote, or newline
        const str = String(val);
        if (str.includes(",") || str.includes('"') || str.includes("\n")) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      });
      csvRows.push(values.join(","));
    }

    const csv = csvRows.join("\n");

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
