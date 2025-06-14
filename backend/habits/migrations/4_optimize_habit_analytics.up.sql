-- Phase 1 Database Optimization: High-priority indexes for habit analytics queries
-- These indexes target habit completion rate calculations and dashboard performance

-- Composite index for habit completion statistics and dashboard queries
-- Optimizes queries that calculate completion rates and habit progress
CREATE INDEX idx_habit_entries_habit_count_date ON habit_entries(habit_id, count, date DESC);

-- Index for habit analytics date range queries
-- Improves performance when analyzing habit trends over time periods
CREATE INDEX idx_habit_entries_date_range ON habit_entries(date DESC, habit_id, count);

-- Index for habit dashboard completion rate calculations
-- Covers queries that aggregate habit entries by date ranges for statistics
CREATE INDEX idx_habit_entries_analytics ON habit_entries(date, habit_id) 
INCLUDE (count, created_at);