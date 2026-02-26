import { createClient } from '@libsql/client';
const db = createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN });

// Check all tables that reference contacts_old
const r = await db.execute("SELECT name, sql FROM sqlite_master WHERE type='table' AND sql LIKE '%contacts_old%'");
for (const row of r.rows) {
  console.log('TABLE:', row.name);
  console.log('SQL:', row.sql);
  console.log('---');
}

// Also check if contacts_old still exists
const old = await db.execute("SELECT name FROM sqlite_master WHERE name = 'contacts_old'");
console.log('contacts_old exists:', old.rows.length > 0);

process.exit(0);
