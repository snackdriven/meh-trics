-- Remove color and tags columns from mood_entries (if they were added by this migration)
-- Note: This is a best-effort rollback since the original migration uses IF NOT EXISTS
ALTER TABLE mood_entries
  DROP COLUMN IF EXISTS color,
  DROP COLUMN IF EXISTS tags;