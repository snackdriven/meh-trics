-- Allow multiple mood entries per day
ALTER TABLE mood_entries DROP CONSTRAINT IF EXISTS mood_entries_date_key;
