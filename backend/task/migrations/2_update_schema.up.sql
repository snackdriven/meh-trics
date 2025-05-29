-- Update tasks table
ALTER TABLE tasks 
  ADD COLUMN status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'done')),
  ADD COLUMN tags TEXT[] DEFAULT '{}',
  ADD COLUMN energy_level TEXT CHECK (energy_level IN ('high', 'medium', 'low')),
  ADD COLUMN is_hard_deadline BOOLEAN NOT NULL DEFAULT false;

-- Update completed column to be derived from status
UPDATE tasks SET status = CASE WHEN completed THEN 'done' ELSE 'todo' END;
ALTER TABLE tasks DROP COLUMN completed;

-- Update mood_entries table - first add columns as nullable, then populate, then make NOT NULL
ALTER TABLE mood_entries 
  DROP COLUMN mood_score,
  ADD COLUMN tier TEXT CHECK (tier IN ('uplifted', 'neutral', 'heavy')),
  ADD COLUMN emoji TEXT,
  ADD COLUMN label TEXT;

-- Set default values for existing rows
UPDATE mood_entries SET 
  tier = 'neutral',
  emoji = '😐',
  label = 'Neutral'
WHERE tier IS NULL OR emoji IS NULL OR label IS NULL;

-- Now make the columns NOT NULL
ALTER TABLE mood_entries 
  ALTER COLUMN tier SET NOT NULL,
  ALTER COLUMN emoji SET NOT NULL,
  ALTER COLUMN label SET NOT NULL;

-- Create journal_entries table
CREATE TABLE journal_entries (
  id BIGSERIAL PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  what_happened TEXT,
  what_i_need TEXT,
  small_win TEXT,
  what_felt_hard TEXT,
  thought_to_release TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create routine_items table
CREATE TABLE routine_items (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  emoji TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create routine_entries table
CREATE TABLE routine_entries (
  id BIGSERIAL PRIMARY KEY,
  routine_item_id BIGINT NOT NULL REFERENCES routine_items(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(routine_item_id, date)
);

-- Insert default routine items
INSERT INTO routine_items (name, emoji, sort_order) VALUES
  ('Drink water', '💧', 1),
  ('Move body', '🚶', 2),
  ('Take meds', '💊', 3),
  ('Fresh air', '🌬️', 4),
  ('Connect with someone', '💬', 5),
  ('Creative time', '🎨', 6);
