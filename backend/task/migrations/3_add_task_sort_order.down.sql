-- Remove sort_order column from tasks table
ALTER TABLE tasks DROP COLUMN IF EXISTS sort_order;