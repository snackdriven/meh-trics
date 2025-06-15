-- Add success tracking fields to habit_entries table
ALTER TABLE habit_entries 
ADD COLUMN is_success BOOLEAN DEFAULT NULL,
ADD COLUMN is_partial_success BOOLEAN DEFAULT NULL,
ADD COLUMN success_percentage DECIMAL(5,2) DEFAULT NULL,
ADD COLUMN success_description TEXT DEFAULT NULL;

-- Add comments to document the fields
COMMENT ON COLUMN habit_entries.is_success IS 'Whether this entry meets full success criteria';
COMMENT ON COLUMN habit_entries.is_partial_success IS 'Whether this entry meets partial success criteria';
COMMENT ON COLUMN habit_entries.success_percentage IS 'Success percentage (0-100) based on flexible criteria';
COMMENT ON COLUMN habit_entries.success_description IS 'Human-readable description of success level';

-- Create index for querying by success status
CREATE INDEX idx_habit_entries_success ON habit_entries(habit_id, is_success, date DESC);
CREATE INDEX idx_habit_entries_partial ON habit_entries(habit_id, is_partial_success, date DESC);

-- Update existing entries to calculate success based on current logic
-- This will set is_success to true for entries that meet or exceed target count
UPDATE habit_entries 
SET is_success = (count >= (
    SELECT target_count 
    FROM habits 
    WHERE habits.id = habit_entries.habit_id
))
WHERE is_success IS NULL;