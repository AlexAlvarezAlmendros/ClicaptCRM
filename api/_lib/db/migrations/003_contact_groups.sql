-- ============================================
-- LEADFLOW CRM — Migration 003: Contact Groups
-- ============================================

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

ALTER TABLE contacts ADD COLUMN group_id TEXT REFERENCES contact_groups(id) ON DELETE SET NULL;
