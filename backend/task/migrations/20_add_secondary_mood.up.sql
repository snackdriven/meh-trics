-- Add optional secondary mood fields
ALTER TABLE mood_entries
  ADD COLUMN IF NOT EXISTS secondary_tier TEXT CHECK (secondary_tier IN ('uplifted','neutral','heavy')),
  ADD COLUMN IF NOT EXISTS secondary_emoji TEXT,
  ADD COLUMN IF NOT EXISTS secondary_label TEXT;
