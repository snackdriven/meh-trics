-- Remove sort indexes for mood and journal entries
DROP INDEX IF EXISTS idx_mood_entries_date_created_at;
DROP INDEX IF EXISTS idx_journal_entries_date_created_at;