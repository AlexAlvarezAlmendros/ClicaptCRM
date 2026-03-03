// LeadFlow CRM — Database — Turso client connection (lazy init)
import { createClient } from "@libsql/client";

let _db = null;

function getDb() {
  if (_db) return _db;

  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url) {
    throw {
      status: 500,
      code: "DB_CONFIG_ERROR",
      message: "TURSO_DATABASE_URL no está configurada. Revisa las variables de entorno.",
    };
  }

  _db = createClient({ url, authToken });
  return _db;
}

// Proxy: db.execute(...) → getDb().execute(...)
const db = new Proxy(
  {},
  {
    get(_target, prop) {
      return (...args) => getDb()[prop](...args);
    },
  }
);

export default db;
