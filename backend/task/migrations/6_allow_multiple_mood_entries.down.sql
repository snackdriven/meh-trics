-- Restore unique constraint on mood_entries date (will fail if multiple entries exist for same date)
-- WARNING: This migration may fail if there are multiple mood entries for the same date
ALTER TABLE mood_entries ADD CONSTRAINT mood_entries_date_key UNIQUE (date);