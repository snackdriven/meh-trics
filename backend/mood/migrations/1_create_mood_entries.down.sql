-- Drop mood_entries table and indexes
DROP INDEX IF EXISTS idx_mood_entries_date_created_at;
DROP INDEX IF EXISTS idx_mood_entries_date;
DROP TABLE IF EXISTS mood_entries;