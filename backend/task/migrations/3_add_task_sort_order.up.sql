-- Add sort_order column to tasks table
ALTER TABLE tasks ADD COLUMN sort_order INTEGER NOT NULL DEFAULT 0;

-- Set initial sort order based on creation date (newest first)
UPDATE tasks SET sort_order = (
  SELECT ROW_NUMBER() OVER (ORDER BY created_at DESC) - 1
  FROM (SELECT id, created_at FROM tasks) AS ordered_tasks
  WHERE ordered_tasks.id = tasks.id
);
