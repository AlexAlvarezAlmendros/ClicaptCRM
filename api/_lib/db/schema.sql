-- ============================================
-- LEADFLOW CRM — Database Schema (Turso/SQLite)
-- ============================================

-- Activar foreign keys (SQLite)
PRAGMA foreign_keys = ON;

-- ─────────────────────────────────────────────
-- ORGANIZACIONES (Tenants)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS organizations (
    id                TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    name              TEXT NOT NULL,
    logo_url          TEXT,
    fiscal_name       TEXT,
    fiscal_id         TEXT,
    address           TEXT,
    city              TEXT,
    postal_code       TEXT,
    country           TEXT DEFAULT 'España',

    -- Suscripción
    stripe_customer_id    TEXT UNIQUE,
    stripe_subscription_id TEXT UNIQUE,
    plan              TEXT DEFAULT 'trial' CHECK (plan IN ('trial', 'basic', 'pro', 'cancelled')),
    trial_ends_at     DATETIME,
    subscription_status TEXT DEFAULT 'trialing' CHECK (subscription_status IN ('trialing', 'active', 'past_due', 'cancelled', 'expired')),

    created_at        DATETIME DEFAULT (datetime('now')),
    updated_at        DATETIME DEFAULT (datetime('now'))
);

-- ─────────────────────────────────────────────
-- USUARIOS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id                TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    auth0_id          TEXT UNIQUE NOT NULL,
    organization_id   TEXT NOT NULL REFERENCES organizations(id),
    email             TEXT NOT NULL,
    name              TEXT NOT NULL,
    surname           TEXT,
    avatar_url        TEXT,
    role              TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user')),
    is_active         BOOLEAN DEFAULT 1,

    created_at        DATETIME DEFAULT (datetime('now')),
    updated_at        DATETIME DEFAULT (datetime('now')),

    UNIQUE(email, organization_id)
);

CREATE INDEX IF NOT EXISTS idx_users_auth0 ON users(auth0_id);
CREATE INDEX IF NOT EXISTS idx_users_org ON users(organization_id);

-- ─────────────────────────────────────────────
-- CONTACTOS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS contacts (
    id                TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    organization_id   TEXT NOT NULL REFERENCES organizations(id),
    name              TEXT NOT NULL,
    surname           TEXT,
    company           TEXT,
    job_title         TEXT,
    email             TEXT,
    phone             TEXT,
    website           TEXT,
    address           TEXT,
    city              TEXT,
    postal_code       TEXT,
    country           TEXT DEFAULT 'España',
    source            TEXT DEFAULT 'other' CHECK (source IN ('web', 'referral', 'cold_call', 'event', 'linkedin', 'import', 'other')),
    status            TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'customer', 'lost')),
    notes             TEXT,
    group_id          TEXT REFERENCES contact_groups(id) ON DELETE SET NULL,
    assigned_to       TEXT REFERENCES users(id),
    created_by        TEXT NOT NULL REFERENCES users(id),

    is_deleted        BOOLEAN DEFAULT 0,
    deleted_at        DATETIME,
    created_at        DATETIME DEFAULT (datetime('now')),
    updated_at        DATETIME DEFAULT (datetime('now')),

    UNIQUE(email, organization_id)
);

CREATE INDEX IF NOT EXISTS idx_contacts_org ON contacts(organization_id);
CREATE INDEX IF NOT EXISTS idx_contacts_status ON contacts(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_contacts_deleted ON contacts(organization_id, is_deleted);
CREATE INDEX IF NOT EXISTS idx_contacts_search ON contacts(organization_id, name, surname, company);

-- ─────────────────────────────────────────────
-- GRUPOS DE CONTACTOS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS contact_groups (
    id                TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    organization_id   TEXT NOT NULL REFERENCES organizations(id),
    name              TEXT NOT NULL,
    color             TEXT DEFAULT '#6B7280',
    description       TEXT,

    created_at        DATETIME DEFAULT (datetime('now')),

    UNIQUE(name, organization_id)
);

CREATE INDEX IF NOT EXISTS idx_contact_groups_org ON contact_groups(organization_id);

-- ─────────────────────────────────────────────
-- TAGS Y RELACIÓN CON CONTACTOS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tags (
    id                TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    organization_id   TEXT NOT NULL REFERENCES organizations(id),
    name              TEXT NOT NULL,
    color             TEXT DEFAULT '#6B7280',

    created_at        DATETIME DEFAULT (datetime('now')),

    UNIQUE(name, organization_id)
);

CREATE TABLE IF NOT EXISTS contact_tags (
    contact_id        TEXT NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    tag_id            TEXT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (contact_id, tag_id)
);

-- ─────────────────────────────────────────────
-- ETAPAS DEL PIPELINE
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS pipeline_stages (
    id                TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    organization_id   TEXT NOT NULL REFERENCES organizations(id),
    name              TEXT NOT NULL,
    color             TEXT NOT NULL DEFAULT '#3B82F6',
    probability       INTEGER DEFAULT 0 CHECK (probability >= 0 AND probability <= 100),
    position          INTEGER NOT NULL,
    is_won            BOOLEAN DEFAULT 0,
    is_lost           BOOLEAN DEFAULT 0,

    created_at        DATETIME DEFAULT (datetime('now')),

    UNIQUE(name, organization_id)
);

-- ─────────────────────────────────────────────
-- OPORTUNIDADES (DEALS)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS deals (
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
);

CREATE INDEX IF NOT EXISTS idx_deals_org ON deals(organization_id);
CREATE INDEX IF NOT EXISTS idx_deals_stage ON deals(organization_id, stage_id);
CREATE INDEX IF NOT EXISTS idx_deals_contact ON deals(contact_id);

-- ─────────────────────────────────────────────
-- ACTIVIDADES (Historial)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS activities (
    id                TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    organization_id   TEXT NOT NULL REFERENCES organizations(id),
    contact_id        TEXT REFERENCES contacts(id),
    deal_id           TEXT REFERENCES deals(id),
    type              TEXT NOT NULL CHECK (type IN ('call', 'email', 'meeting', 'note', 'task_completed', 'stage_change', 'deal_created', 'deal_won', 'deal_lost')),
    description       TEXT,
    metadata          TEXT,
    created_by        TEXT NOT NULL REFERENCES users(id),

    created_at        DATETIME DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_activities_contact ON activities(contact_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activities_deal ON activities(deal_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activities_org ON activities(organization_id, created_at DESC);

-- ─────────────────────────────────────────────
-- TAREAS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tasks (
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
);

CREATE INDEX IF NOT EXISTS idx_tasks_org ON tasks(organization_id, is_completed);
CREATE INDEX IF NOT EXISTS idx_tasks_user ON tasks(assigned_to, is_completed, due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_due ON tasks(organization_id, due_date);
