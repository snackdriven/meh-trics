-- Remove habit indexes
DROP INDEX IF EXISTS idx_habits_frequency;
DROP INDEX IF EXISTS idx_habits_date_range;
DROP INDEX IF EXISTS idx_habit_entries_date;
DROP INDEX IF EXISTS idx_habit_entries_habit_date;