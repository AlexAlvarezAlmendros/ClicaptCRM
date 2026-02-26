import { createClient } from '@libsql/client';

const db = createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN });

await db.execute(`CREATE TABLE IF NOT EXISTS contact_groups (
    id                TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    organization_id   TEXT NOT NULL REFERENCES organizations(id),
    name              TEXT NOT NULL,
    color             TEXT DEFAULT '#6B7280',
    description       TEXT,
    created_at        DATETIME DEFAULT (datetime('now')),
    UNIQUE(name, organization_id)
)`);
console.log('contact_groups table created');

await db.execute('CREATE INDEX IF NOT EXISTS idx_contact_groups_org ON contact_groups(organization_id)');
console.log('index created');

try {
  await db.execute('ALTER TABLE contacts ADD COLUMN group_id TEXT REFERENCES contact_groups(id) ON DELETE SET NULL');
  console.log('group_id column added');
} catch (e) {
  if (e.message.includes('duplicate column')) console.log('group_id column already exists');
  else throw e;
}
console.log('Migration 003 complete');
process.exit(0);
