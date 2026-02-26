import { createClient } from '@libsql/client';
const db = createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN });

// Check activities table schema
const r = await db.execute("SELECT sql FROM sqlite_master WHERE name = 'activities'");
console.log('SCHEMA:', r.rows[0]?.sql || 'TABLE NOT FOUND');

// Try inserting a test activity to see the exact error
try {
  const id = 'test_' + Date.now();
  // First get a valid org and user
  const orgs = await db.execute("SELECT id FROM organizations LIMIT 1");
  const users = await db.execute("SELECT id FROM users LIMIT 1");
  
  if (!orgs.rows[0] || !users.rows[0]) {
    console.log('No orgs or users found');
    process.exit(0);
  }
  
  const orgId = orgs.rows[0].id;
  const userId = users.rows[0].id;
  
  console.log('orgId:', orgId, 'userId:', userId);
  
  await db.execute({
    sql: `INSERT INTO activities (id, organization_id, contact_id, deal_id, type, description, metadata, created_by)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [id, orgId, null, null, 'note', 'test activity', null, userId],
  });
  console.log('INSERT succeeded');
  
  // Clean up test
  await db.execute({ sql: "DELETE FROM activities WHERE id = ?", args: [id] });
  console.log('Cleanup done');
} catch (e) {
  console.error('INSERT ERROR:', e.message);
}

process.exit(0);
