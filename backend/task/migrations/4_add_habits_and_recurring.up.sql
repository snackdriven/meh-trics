-- Create recurring_tasks table first
CREATE TABLE recurring_tasks (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly')),
  priority INTEGER NOT NULL DEFAULT 3,
  tags TEXT[] DEFAULT '{}',
  energy_level TEXT CHECK (energy_level IN ('high', 'medium', 'low')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  next_due_date DATE NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Add recurring_task_id to tasks table to link generated tasks to their recurring template
ALTER TABLE tasks ADD COLUMN recurring_task_id BIGINT REFERENCES recurring_tasks(id) ON DELETE SET NULL;

-- Add indexes for better performance
CREATE INDEX idx_recurring_tasks_next_due_date ON recurring_tasks(next_due_date) WHERE is_active = true;
CREATE INDEX idx_tasks_recurring_task_id ON tasks(recurring_task_id) WHERE recurring_task_id IS NOT NULL;
