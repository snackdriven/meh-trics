-- Add slug column to tasks for URL-friendly identifiers
ALTER TABLE tasks ADD COLUMN slug TEXT;

-- Populate slugs based on current titles
UPDATE tasks
SET slug = lower(regexp_replace(regexp_replace(title, '[^a-zA-Z0-9]+', '-', 'g'), '^-|-$', '', 'g'));

ALTER TABLE tasks ALTER COLUMN slug SET NOT NULL;
CREATE UNIQUE INDEX idx_tasks_slug ON tasks(slug);
