-- Drop indexes
DROP INDEX IF EXISTS idx_calendar_events_start_time;
DROP INDEX IF EXISTS idx_calendar_events_end_time;
DROP INDEX IF EXISTS idx_calendar_events_recurrence;

-- Drop calendar_events table
DROP TABLE IF EXISTS calendar_events;