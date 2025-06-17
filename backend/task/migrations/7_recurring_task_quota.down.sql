-- Remove quota support for recurring tasks
ALTER TABLE recurring_tasks DROP COLUMN IF EXISTS max_occurrences_per_cycle;