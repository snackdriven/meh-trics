-- Convert start_time and end_time columns to TIMESTAMPTZ
ALTER TABLE calendar_events
  ALTER COLUMN start_time TYPE TIMESTAMPTZ USING start_time AT TIME ZONE 'UTC',
  ALTER COLUMN end_time TYPE TIMESTAMPTZ USING end_time AT TIME ZONE 'UTC';
