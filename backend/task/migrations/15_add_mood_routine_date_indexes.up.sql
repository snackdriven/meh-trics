-- Add indexes for faster date-based lookups
CREATE INDEX IF NOT EXISTS idx_mood_entries_date ON mood_entries(date);
CREATE INDEX IF NOT EXISTS idx_routine_entries_date ON routine_entries(date);
