-- Remove color and tags columns from mood_entries
ALTER TABLE mood_entries
  DROP COLUMN IF EXISTS color,
  DROP COLUMN IF EXISTS tags;