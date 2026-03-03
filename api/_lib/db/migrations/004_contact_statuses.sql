-- ============================================
-- LEADFLOW CRM — Migration 004: Contact Statuses
-- ============================================

CREATE TABLE IF NOT EXISTS contact_statuses (
    id                TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    organization_id   TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    value             TEXT NOT NULL,   -- slug stored in contacts.status
    name              TEXT NOT NULL,   -- editable display label
    color             TEXT NOT NULL DEFAULT '#6B7280',
    position          INTEGER NOT NULL DEFAULT 0,
    UNIQUE(organization_id, value)
);

CREATE INDEX IF NOT EXISTS idx_contact_statuses_org ON contact_statuses(organization_id);
