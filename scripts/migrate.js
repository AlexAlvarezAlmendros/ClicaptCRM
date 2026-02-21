/**
 * Migration script — executes schema.sql against Turso database.
 * Usage: node scripts/migrate.js
 */
import { createClient } from "@libsql/client";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

async function migrate() {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url) {
    console.error("❌  TURSO_DATABASE_URL is not set");
    process.exit(1);
  }

  const db = createClient({ url, authToken });

  const schemaPath = resolve(__dirname, "../api/_lib/db/schema.sql");
  const schema = readFileSync(schemaPath, "utf-8");

  // Split by semicolons but skip empty statements
  const statements = schema
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  console.log(`🔄  Running ${statements.length} statements...\n`);

  for (const stmt of statements) {
    try {
      await db.execute(stmt);
      const preview = stmt.substring(0, 60).replace(/\n/g, " ");
      console.log(`  ✅  ${preview}...`);
    } catch (err) {
      console.error(`  ❌  Failed: ${stmt.substring(0, 60)}...`);
      console.error(`      ${err.message}`);
    }
  }

  console.log("\n✅  Migration complete");
}

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
