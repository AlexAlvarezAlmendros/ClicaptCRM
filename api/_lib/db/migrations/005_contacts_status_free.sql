-- ============================================
-- LEADFLOW CRM — Migration 005: Remove CHECK constraint on contacts.status
-- Needed to allow fully dynamic, user-defined statuses per organization.
-- SQLite requires a table rebuild to drop a CHECK constraint.
-- ============================================

PRAGMA foreign_keys = OFF;

CREATE TABLE contacts_new (
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
    status            TEXT DEFAULT 'new',
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

INSERT INTO contacts_new SELECT * FROM contacts;

DROP TABLE contacts;

ALTER TABLE contacts_new RENAME TO contacts;

CREATE INDEX IF NOT EXISTS idx_contacts_org ON contacts(organization_id);
CREATE INDEX IF NOT EXISTS idx_contacts_status ON contacts(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_contacts_deleted ON contacts(organization_id, is_deleted);
CREATE INDEX IF NOT EXISTS idx_contacts_search ON contacts(organization_id, name, surname, company);

PRAGMA foreign_keys = ON;
