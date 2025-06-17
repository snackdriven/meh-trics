-- Remove group_name column from routine_items
ALTER TABLE routine_items DROP COLUMN IF EXISTS group_name;