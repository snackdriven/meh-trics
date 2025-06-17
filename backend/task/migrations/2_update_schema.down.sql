-- Revert schema updates (WARNING: This will lose significant data)

-- Drop tables created in this migration
DROP TABLE IF EXISTS routine_entries;
DROP TABLE IF EXISTS routine_items;
DROP TABLE IF EXISTS journal_entries;

-- Revert mood_entries table structure
ALTER TABLE mood_entries 
  DROP COLUMN IF EXISTS tier,
  DROP COLUMN IF EXISTS emoji,
  DROP COLUMN IF EXISTS label,
  ADD COLUMN mood_score INTEGER;

-- Revert tasks table structure
-- First add back completed column
ALTER TABLE tasks ADD COLUMN completed BOOLEAN NOT NULL DEFAULT false;

-- Update completed column based on status
UPDATE tasks SET completed = (status = 'done');

-- Remove new columns
ALTER TABLE tasks 
  DROP COLUMN IF EXISTS status,
  DROP COLUMN IF EXISTS tags,
  DROP COLUMN IF EXISTS energy_level,
  DROP COLUMN IF EXISTS is_hard_deadline;