-- Remove calendar_events table and its indexes
DROP INDEX IF EXISTS idx_calendar_events_start_time;
DROP INDEX IF EXISTS idx_calendar_events_end_time;
DROP INDEX IF EXISTS idx_calendar_events_recurrence;
DROP TABLE IF EXISTS calendar_events;