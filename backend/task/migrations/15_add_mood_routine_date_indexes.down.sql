-- Remove date-based indexes for mood and routine entries
DROP INDEX IF EXISTS idx_mood_entries_date;
DROP INDEX IF EXISTS idx_routine_entries_date;