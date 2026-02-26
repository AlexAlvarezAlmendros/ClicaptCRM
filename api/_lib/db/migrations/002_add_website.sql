-- ============================================
-- LEADFLOW CRM — Migration 002: Add website to contacts
-- ============================================

ALTER TABLE contacts ADD COLUMN website TEXT;
