-- Create mood_entries table with complete schema
CREATE TABLE mood_entries (
  id BIGSERIAL PRIMARY KEY,
  date DATE NOT NULL,
  tier TEXT NOT NULL CHECK (tier IN ('uplifted', 'neutral', 'heavy')),
  emoji TEXT NOT NULL,
  label TEXT NOT NULL,
  notes TEXT,
  tags TEXT[] DEFAULT '{}',
  secondary_tier TEXT CHECK (secondary_tier IN ('uplifted','neutral','heavy')),
  secondary_emoji TEXT,
  secondary_label TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Add indexes for efficient date-based lookups
CREATE INDEX IF NOT EXISTS idx_mood_entries_date ON mood_entries(date);
CREATE INDEX IF NOT EXISTS idx_mood_entries_date_created_at ON mood_entries(date DESC, created_at DESC);