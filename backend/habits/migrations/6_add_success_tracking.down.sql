-- Remove success tracking fields from habit_entries table
DROP INDEX IF EXISTS idx_habit_entries_partial;
DROP INDEX IF EXISTS idx_habit_entries_success;

ALTER TABLE habit_entries 
DROP COLUMN IF EXISTS success_description,
DROP COLUMN IF EXISTS success_percentage,
DROP COLUMN IF EXISTS is_partial_success,
DROP COLUMN IF EXISTS is_success;