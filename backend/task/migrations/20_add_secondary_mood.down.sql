-- Remove secondary mood fields
ALTER TABLE mood_entries
  DROP COLUMN IF EXISTS secondary_tier,
  DROP COLUMN IF EXISTS secondary_emoji,
  DROP COLUMN IF EXISTS secondary_label;