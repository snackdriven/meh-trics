-- Support quotas for recurring tasks
ALTER TABLE recurring_tasks
  ADD COLUMN max_occurrences_per_cycle INTEGER NOT NULL DEFAULT 1;
