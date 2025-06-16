-- Remove composite indexes for task queries optimization
DROP INDEX IF EXISTS idx_tasks_status_archived_priority;
DROP INDEX IF EXISTS idx_tasks_due_date_status_priority;
DROP INDEX IF EXISTS idx_tasks_sort_order_created_at;
DROP INDEX IF EXISTS idx_tasks_recurring_task_id_status;