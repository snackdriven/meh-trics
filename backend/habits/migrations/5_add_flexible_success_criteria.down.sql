-- Remove flexible success criteria from habits table
DROP INDEX IF EXISTS idx_habits_success_criteria;
ALTER TABLE habits DROP COLUMN IF EXISTS success_criteria;