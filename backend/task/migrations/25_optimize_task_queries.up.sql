-- Phase 1 Database Optimization: High-priority composite indexes for task queries
-- These indexes target the most common and performance-critical query patterns

-- Composite index for list_tasks filtering (status + archived + priority)
-- Covers common queries that filter by status and exclude archived tasks
CREATE INDEX idx_tasks_status_archived_priority ON tasks(status, archived_at, priority) 
WHERE archived_at IS NULL;

-- Composite index for due task queries with status filtering
-- Optimizes queries that look for tasks due by date with status conditions
CREATE INDEX idx_tasks_due_date_status_priority ON tasks(due_date, status, priority) 
WHERE archived_at IS NULL;

-- Index for task sort operations on active tasks
-- Improves performance of drag-to-reorder functionality
CREATE INDEX idx_tasks_sort_order_created_at ON tasks(sort_order ASC, created_at DESC) 
WHERE archived_at IS NULL;

-- Index for recurring task lookups
-- Optimizes queries that filter tasks by their recurring_task_id
CREATE INDEX idx_tasks_recurring_task_id_status ON tasks(recurring_task_id, status) 
WHERE recurring_task_id IS NOT NULL;