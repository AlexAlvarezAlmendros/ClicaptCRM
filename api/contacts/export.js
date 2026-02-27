// LeadFlow CRM — API — CSV Export contacts
// GET /api/contacts/export — Returns CSV file

import { verifyAuth } from "../_lib/middleware/auth.js";
import { resolveTenant } from "../_lib/middleware/tenant.js";
import db from "../_lib/db/client.js";
import { listContacts } from "../_lib/services/contactService.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: { code: "METHOD_NOT_ALLOWED", message: "Método no permitido" } });
  }

  try {
    const authUser = await verifyAuth(req);
    const tenant = await resolveTenant(authUser);

    // Parse filters and columns from query
    const { search, status, source, tag, group_id } = req.query;
    let columns = req.query.columns;
    if (columns && typeof columns === "string") {
      columns = columns.split(",").map((c) => c.trim()).filter(Boolean);
    }
    // Default columns if not specified
    const defaultFields = ["first_name", "last_name", "email", "phone", "company", "position", "status", "source", "notes", "created_at"];
    const defaultHeaders = ["Nombre", "Apellido", "Email", "Teléfono", "Empresa", "Cargo", "Estado", "Origen", "Notas", "Fecha creación"];
    const fields = columns && columns.length ? columns : defaultFields;
    const headers = fields.map((f) => {
      const idx = defaultFields.indexOf(f);
      return idx !== -1 ? defaultHeaders[idx] : f;
    });

    // Get filtered contacts
    const result = await listContacts(tenant.orgId, { search, status, source, tag, group_id, limit: 10000, page: 1 });
    const csvRows = [headers.join(",")];
    for (const row of result.data) {
      const values = fields.map((f) => {
        const val = row[f] ?? "";
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
