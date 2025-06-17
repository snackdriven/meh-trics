-- Remove task filtering indexes
DROP INDEX IF EXISTS idx_tasks_status;
DROP INDEX IF EXISTS idx_tasks_energy_level;
DROP INDEX IF EXISTS idx_tasks_tags;