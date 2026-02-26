import { createClient } from '@libsql/client';
const db = createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN });

await db.execute("PRAGMA foreign_keys = OFF");

// Drop leftover temp table
await db.execute("DROP TABLE IF EXISTS deals_tmp_fix");
console.log('Dropped leftover temp table');

const info = await db.execute('PRAGMA table_info(deals)');
const cols = info.rows.map(r => r.name).join(', ');
console.log('Columns:', cols);

await db.execute(`CREATE TABLE deals_tmp_fix (
    id                TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    organization_id   TEXT NOT NULL REFERENCES organizations(id),
    contact_id        TEXT NOT NULL REFERENCES contacts(id),
    stage_id          TEXT NOT NULL REFERENCES pipeline_stages(id),
    title             TEXT NOT NULL,
    value             REAL DEFAULT 0,
    probability       INTEGER,
    expected_close    DATE,
    actual_close      DATE,
    loss_reason       TEXT,
    notes             TEXT,
    assigned_to       TEXT REFERENCES users(id),
    created_by        TEXT NOT NULL REFERENCES users(id),
    position          INTEGER DEFAULT 0,
    is_archived       BOOLEAN DEFAULT 0,
    created_at        DATETIME DEFAULT (datetime('now')),
    updated_at        DATETIME DEFAULT (datetime('now'))
)`);

const r = await db.execute(`INSERT INTO deals_tmp_fix (${cols}) SELECT ${cols} FROM deals`);
console.log('Copied', r.rowsAffected, 'rows');

await db.execute('DROP TABLE deals');
await db.execute('ALTER TABLE deals_tmp_fix RENAME TO deals');

await db.execute("CREATE INDEX IF NOT EXISTS idx_deals_org ON deals(organization_id)");
await db.execute("CREATE INDEX IF NOT EXISTS idx_deals_stage ON deals(stage_id)");
await db.execute("CREATE INDEX IF NOT EXISTS idx_deals_contact ON deals(contact_id)");

await db.execute("PRAGMA foreign_keys = ON");
console.log('✓ deals fixed');

// Final verification
const check = await db.execute("SELECT name, sql FROM sqlite_master WHERE type='table' AND sql LIKE '%contacts_old%'");
console.log('Tables still referencing contacts_old:', check.rows.length === 0 ? 'NONE ✓' : check.rows.map(r => r.name));

process.exit(0);
