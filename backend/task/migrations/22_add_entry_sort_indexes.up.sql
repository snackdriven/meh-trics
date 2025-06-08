-- Improve retrieval speed when sorting by date and creation time
CREATE INDEX IF NOT EXISTS idx_mood_entries_date_created_at ON mood_entries(date DESC, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_journal_entries_date_created_at ON journal_entries(date DESC, created_at DESC);
