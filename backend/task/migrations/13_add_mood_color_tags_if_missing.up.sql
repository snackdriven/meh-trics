-- Ensure color and tags columns exist on mood_entries
ALTER TABLE mood_entries
  ADD COLUMN IF NOT EXISTS color TEXT,
  ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
