/**
 * Seed script — inserts sample data for development.
 * Usage: node scripts/seed.js
 */
import { createClient } from "@libsql/client";

async function seed() {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url) {
    console.error("❌  TURSO_DATABASE_URL is not set");
    process.exit(1);
  }

  const db = createClient({ url, authToken });

  console.log("🌱  Seeding database...\n");

  // 1. Organization
  await db.execute({
    sql: `INSERT OR IGNORE INTO organizations (id, name, plan, trial_ends_at)
          VALUES (?, ?, ?, datetime('now', '+14 days'))`,
    args: ["org_demo_001", "Demo Company S.L.", "trial"],
  });
  console.log("  ✅  Organization created");

  // 2. User
  await db.execute({
    sql: `INSERT OR IGNORE INTO users (id, organization_id, auth0_id, email, name, role)
          VALUES (?, ?, ?, ?, ?, ?)`,
    args: [
      "usr_demo_001",
      "org_demo_001",
      "auth0|demo_user",
      "demo@leadflow.es",
      "Demo User",
      "admin",
    ],
  });
  console.log("  ✅  User created");

  // 3. Pipeline stages
  const stages = [
    ["stg_001", "Nuevo Lead", 0, "#3B82F6"],
    ["stg_002", "Contactado", 1, "#8B5CF6"],
    ["stg_003", "Propuesta", 2, "#F59E0B"],
    ["stg_004", "Negociación", 3, "#F97316"],
    ["stg_005", "Ganado", 4, "#10B981"],
    ["stg_006", "Perdido", 5, "#EF4444"],
  ];

  for (const [id, name, pos, color] of stages) {
    await db.execute({
      sql: `INSERT OR IGNORE INTO pipeline_stages (id, organization_id, name, position, color)
            VALUES (?, ?, ?, ?, ?)`,
      args: [id, "org_demo_001", name, pos, color],
    });
  }
  console.log("  ✅  Pipeline stages created");

  // 4. Contacts
  const contacts = [
    ["cnt_001", "María", "García López", "maria@ejemplo.com", "+34 612 345 678", "Directora Marketing", "Empresa ABC", "web", "new"],
    ["cnt_002", "Carlos", "Martínez", "carlos@ejemplo.com", "+34 623 456 789", "CEO", "StartupXYZ", "referral", "qualified"],
    ["cnt_003", "Ana", "Rodríguez", "ana@ejemplo.com", "+34 634 567 890", "CTO", "TechCorp", "linkedin", "customer"],
    ["cnt_004", "Pedro", "Sánchez", "pedro@ejemplo.com", "+34 645 678 901", "Director Ventas", "Retail Plus", "cold_call", "new"],
    ["cnt_005", "Laura", "Fernández", "laura@ejemplo.com", "+34 656 789 012", "Fundadora", "Digital Agency", "web", "qualified"],
  ];

  for (const [id, name, surname, email, phone, jobTitle, company, source, status] of contacts) {
    await db.execute({
      sql: `INSERT OR IGNORE INTO contacts (id, organization_id, name, surname, email, phone, job_title, company, source, status, created_by)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [id, "org_demo_001", name, surname, email, phone, jobTitle, company, source, status, "usr_demo_001"],
    });
  }
  console.log("  ✅  Contacts created");

  // 5. Tags
  const tags = [
    ["tag_001", "VIP", "#EF4444"],
    ["tag_002", "Tech", "#3B82F6"],
    ["tag_003", "Enterprise", "#8B5CF6"],
  ];

  for (const [id, name, color] of tags) {
    await db.execute({
      sql: `INSERT OR IGNORE INTO tags (id, organization_id, name, color)
            VALUES (?, ?, ?, ?)`,
      args: [id, "org_demo_001", name, color],
    });
  }
  console.log("  ✅  Tags created");

  // 6. Deals
  const deals = [
    ["deal_001", "cnt_001", "stg_002", "Proyecto Web ABC", 15000, 0],
    ["deal_002", "cnt_002", "stg_003", "Consultoría StartupXYZ", 8500, 0],
    ["deal_003", "cnt_003", "stg_005", "Desarrollo App TechCorp", 45000, 0],
    ["deal_004", "cnt_005", "stg_001", "Campaña Digital Agency", 12000, 0],
  ];

  for (const [id, contactId, stageId, title, value, pos] of deals) {
    await db.execute({
      sql: `INSERT OR IGNORE INTO deals (id, organization_id, contact_id, stage_id, title, value, position, created_by)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [id, "org_demo_001", contactId, stageId, title, value, pos, "usr_demo_001"],
    });
  }
  console.log("  ✅  Deals created");

  // 7. Tasks
  const tasks = [
    ["task_001", "cnt_001", "deal_001", "usr_demo_001", "Llamar a María para seguimiento", "high"],
    ["task_002", "cnt_002", "deal_002", "usr_demo_001", "Enviar propuesta a Carlos", "medium"],
    ["task_003", "cnt_004", null, "usr_demo_001", "Preparar presentación para Pedro", "low"],
  ];

  for (const [id, contactId, dealId, userId, title, priority] of tasks) {
    await db.execute({
      sql: `INSERT OR IGNORE INTO tasks (id, organization_id, contact_id, deal_id, assigned_to, created_by, title, priority, due_date)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, date('now', '+1 day'))`,
      args: [id, "org_demo_001", contactId, dealId, userId, userId, title, priority],
    });
  }
  console.log("  ✅  Tasks created");

  // 8. Activities
  await db.execute({
    sql: `INSERT OR IGNORE INTO activities (id, organization_id, contact_id, created_by, type, description)
          VALUES (?, ?, ?, ?, ?, ?)`,
    args: [
      "act_001",
      "org_demo_001",
      "cnt_001",
      "usr_demo_001",
      "note",
      "Primera reunión con María — interesada en proyecto web.",
    ],
  });
  console.log("  ✅  Activities created");

  console.log("\n✅  Seed complete");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
