-- Replace old journaling schema with flexible format
ALTER TABLE journal_entries DROP CONSTRAINT IF EXISTS journal_entries_date_key;
ALTER TABLE journal_entries
  ALTER COLUMN date DROP NOT NULL,
  DROP COLUMN IF EXISTS what_happened,
  DROP COLUMN IF EXISTS what_i_need,
  DROP COLUMN IF EXISTS small_win,
  DROP COLUMN IF EXISTS what_felt_hard,
  DROP COLUMN IF EXISTS thought_to_release,
  ADD COLUMN text TEXT NOT NULL DEFAULT '',
  ADD COLUMN tags TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN mood_id BIGINT REFERENCES mood_entries(id);
