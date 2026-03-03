/**
 * Migration 005: Drop the CHECK constraint on contacts.status
 *
 * We can't do a table rebuild in Turso remote mode because:
 *  - PRAGMA foreign_keys = OFF is a no-op inside transactions
 *  - DROP TABLE contacts fails (child tables reference it with FKs ON)
 *
 * Solution using ALTER TABLE RENAME COLUMN (SQLite 3.25+):
 *  1. ADD COLUMN status_new TEXT  (no constraint)
 *  2. UPDATE contacts SET status_new = status  (copy data)
 *  3. DROP INDEX idx_contacts_status  (references old column)
 *  4. RENAME COLUMN status   -> status_legacy  (move old CHECK-constrained col away)
 *  5. RENAME COLUMN status_new -> status         (promote new col as the real status)
 *  6. Recreate index on new status column
 */
import { createClient } from "@libsql/client";

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const steps = [
  "ALTER TABLE contacts ADD COLUMN status_new TEXT DEFAULT 'new'",
  "UPDATE contacts SET status_new = status",
  "DROP INDEX IF EXISTS idx_contacts_status",
  "ALTER TABLE contacts RENAME COLUMN status TO status_legacy",
  "ALTER TABLE contacts RENAME COLUMN status_new TO status",
  "CREATE INDEX IF NOT EXISTS idx_contacts_status ON contacts(organization_id, status)",
];

for (const sql of steps) {
  try {
    await db.execute(sql);
    console.log("✅", sql.slice(0, 80));
  } catch (e) {
    console.error("❌", e.message);
    console.error("   Statement:", sql.slice(0, 80));
    process.exit(1);
  }
}

console.log("\n🎉 Migration 005 complete — contacts.status has no CHECK constraint.");
