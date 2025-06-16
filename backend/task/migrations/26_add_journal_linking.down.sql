-- Remove indexes for journal entry foreign keys
DROP INDEX IF EXISTS idx_journal_entries_task_id;
DROP INDEX IF EXISTS idx_journal_entries_habit_entry_id;

-- Remove foreign key fields from journal_entries
ALTER TABLE journal_entries 
DROP COLUMN IF EXISTS task_id,
DROP COLUMN IF EXISTS habit_entry_id;