-- Revert journal_entries table structure to old format
-- WARNING: This will lose data in the new text/tags fields

-- Remove new columns
ALTER TABLE journal_entries
  DROP COLUMN IF EXISTS text,
  DROP COLUMN IF EXISTS tags,
  DROP COLUMN IF EXISTS mood_id;

-- Restore old columns (data will be lost)
ALTER TABLE journal_entries
  ADD COLUMN what_happened TEXT,
  ADD COLUMN what_i_need TEXT,
  ADD COLUMN small_win TEXT,
  ADD COLUMN what_felt_hard TEXT,
  ADD COLUMN thought_to_release TEXT,
  ALTER COLUMN date SET NOT NULL;

-- Restore unique constraint on date
ALTER TABLE journal_entries ADD CONSTRAINT journal_entries_date_key UNIQUE (date);