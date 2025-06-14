-- Add color and tags to mood_entries
ALTER TABLE mood_entries
  ADD COLUMN color TEXT,
  ADD COLUMN tags TEXT[] DEFAULT '{}';
