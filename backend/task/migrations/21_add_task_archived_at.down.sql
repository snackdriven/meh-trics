-- Remove task archiving functionality

-- Drop index first
DROP INDEX IF EXISTS idx_tasks_archived_at;

-- Remove archived_at column
ALTER TABLE tasks DROP COLUMN IF EXISTS archived_at;