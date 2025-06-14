-- Allow archiving tasks
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP;

-- Index for quick retrieval of archived tasks
CREATE INDEX IF NOT EXISTS idx_tasks_archived_at ON tasks(archived_at);
