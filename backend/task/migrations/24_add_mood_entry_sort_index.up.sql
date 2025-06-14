-- Optimize listing of mood entries by matching ORDER BY clause
CREATE INDEX IF NOT EXISTS idx_mood_entries_date_created ON mood_entries(date DESC, created_at DESC);
