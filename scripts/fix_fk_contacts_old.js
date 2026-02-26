import { createClient } from '@libsql/client';
const db = createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN });

// Disable FK checks for the migration
await db.execute("PRAGMA foreign_keys = OFF");
console.log('Foreign keys disabled');

async function recreateTable(name, newCreateSQL, indexSQLs = []) {
  const tmpName = `${name}_tmp_fix`;
  
  const info = await db.execute(`PRAGMA table_info("${name}")`);
  const cols = info.rows.map(r => r.name).join(', ');
  
  console.log(`\n--- Fixing ${name} (${info.rows.length} cols) ---`);
  
  const createWithTmp = newCreateSQL.replace(`CREATE TABLE ${name}`, `CREATE TABLE ${tmpName}`);
  await db.execute(createWithTmp);
  
  const copyResult = await db.execute(`INSERT INTO "${tmpName}" (${cols}) SELECT ${cols} FROM "${name}"`);
  console.log(`  Copied ${copyResult.rowsAffected} rows`);
  
  await db.execute(`DROP TABLE "${name}"`);
  await db.execute(`ALTER TABLE "${tmpName}" RENAME TO "${name}"`);
  
  for (const idx of indexSQLs) {
    await db.execute(idx);
  }
  console.log(`  ✓ ${name} fixed`);
}

try {
  // 1. contact_tags
  await recreateTable('contact_tags', `CREATE TABLE contact_tags (
    contact_id        TEXT NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    tag_id            TEXT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (contact_id, tag_id)
  )`);

  // 2. activities (before deals since activities refs deals)
  await recreateTable('activities', `CREATE TABLE activities (
    id                TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    organization_id   TEXT NOT NULL REFERENCES organizations(id),
    contact_id        TEXT REFERENCES contacts(id),
    deal_id           TEXT REFERENCES deals(id),
    type              TEXT NOT NULL CHECK (type IN ('call', 'email', 'meeting', 'note', 'task_completed', 'stage_change', 'deal_created', 'deal_won', 'deal_lost')),
    description       TEXT,
    metadata          TEXT,
    created_by        TEXT NOT NULL REFERENCES users(id),
    created_at        DATETIME DEFAULT (datetime('now'))
  )`, [
    "CREATE INDEX IF NOT EXISTS idx_activities_contact ON activities(contact_id, created_at DESC)",
    "CREATE INDEX IF NOT EXISTS idx_activities_deal ON activities(deal_id, created_at DESC)",
    "CREATE INDEX IF NOT EXISTS idx_activities_org ON activities(organization_id, created_at DESC)",
  ]);

  // 3. tasks
  await recreateTable('tasks', `CREATE TABLE tasks (
    id                TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    organization_id   TEXT NOT NULL REFERENCES organizations(id),
    contact_id        TEXT REFERENCES contacts(id),
    deal_id           TEXT REFERENCES deals(id),
    title             TEXT NOT NULL,
    description       TEXT,
    due_date          DATE,
    priority          TEXT DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
    is_completed      BOOLEAN DEFAULT 0,
    completed_at      DATETIME,
    assigned_to       TEXT REFERENCES users(id),
    created_by        TEXT NOT NULL REFERENCES users(id),
    created_at        DATETIME DEFAULT (datetime('now')),
    updated_at        DATETIME DEFAULT (datetime('now'))
  )`, [
    "CREATE INDEX IF NOT EXISTS idx_tasks_org ON tasks(organization_id)",
    "CREATE INDEX IF NOT EXISTS idx_tasks_assigned ON tasks(assigned_to, is_completed)",
    "CREATE INDEX IF NOT EXISTS idx_tasks_due ON tasks(due_date, is_completed)",
  ]);

  // 4. deals
  await recreateTable('deals', `CREATE TABLE deals (
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
  )`, [
    "CREATE INDEX IF NOT EXISTS idx_deals_org ON deals(organization_id)",
    "CREATE INDEX IF NOT EXISTS idx_deals_stage ON deals(stage_id)",
    "CREATE INDEX IF NOT EXISTS idx_deals_contact ON deals(contact_id)",
  ]);

  // Re-enable FK checks
  await db.execute("PRAGMA foreign_keys = ON");
  console.log('\n=== All 4 tables fixed! Foreign keys re-enabled. ===');

  // Verify
  const check = await db.execute("SELECT name, sql FROM sqlite_master WHERE type='table' AND sql LIKE '%contacts_old%'");
  console.log('Tables still referencing contacts_old:', check.rows.length === 0 ? 'NONE ✓' : check.rows.map(r => r.name));
} catch (e) {
  console.error('MIGRATION ERROR:', e.message);
  await db.execute("PRAGMA foreign_keys = ON").catch(() => {});
}

process.exit(0);
