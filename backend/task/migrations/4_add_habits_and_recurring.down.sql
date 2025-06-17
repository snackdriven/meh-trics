-- Remove recurring tasks functionality

-- Drop indexes first
DROP INDEX IF EXISTS idx_recurring_tasks_next_due_date;
DROP INDEX IF EXISTS idx_tasks_recurring_task_id;

-- Remove recurring_task_id column from tasks table
ALTER TABLE tasks DROP COLUMN IF EXISTS recurring_task_id;

-- Drop recurring_tasks table
DROP TABLE IF EXISTS recurring_tasks;