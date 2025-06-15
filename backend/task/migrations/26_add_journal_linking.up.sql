-- Add foreign key fields to journal_entries for linking to tasks and habit entries
ALTER TABLE journal_entries 
ADD COLUMN task_id BIGINT REFERENCES tasks(id) ON DELETE SET NULL,
ADD COLUMN habit_entry_id BIGINT REFERENCES habit_entries(id) ON DELETE SET NULL;

-- Create indexes for the new foreign keys to improve query performance
CREATE INDEX idx_journal_entries_task_id ON journal_entries(task_id);
CREATE INDEX idx_journal_entries_habit_entry_id ON journal_entries(habit_entry_id);

-- Add constraint to ensure a journal entry can only link to one entity at a time (optional - remove if you want multiple links)
-- ALTER TABLE journal_entries ADD CONSTRAINT check_single_link 
-- CHECK (
--   (mood_id IS NOT NULL)::int + 
--   (task_id IS NOT NULL)::int + 
--   (habit_entry_id IS NOT NULL)::int + 
--   (date IS NOT NULL AND mood_id IS NULL AND task_id IS NULL AND habit_entry_id IS NULL)::int <= 1
-- );