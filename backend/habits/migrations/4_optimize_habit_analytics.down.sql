-- Remove habit analytics optimization indexes
DROP INDEX IF EXISTS idx_habit_entries_habit_count_date;
DROP INDEX IF EXISTS idx_habit_entries_date_range;
DROP INDEX IF EXISTS idx_habit_entries_analytics;