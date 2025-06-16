-- Migration to populate unified tracking from existing habits and routine_items
-- This migrates data from the habits and task databases to the unified tracking system
-- Note: This migration assumes cross-database access or that tables are in the same database

-- Migrate habits to unified tracking items (if habits table exists and is accessible)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'habits') THEN
    INSERT INTO unified_tracking_items 
      (name, emoji, description, type, frequency, target_count, group_name, start_date, end_date, is_active, created_at, updated_at)
    SELECT 
      h.name,
      COALESCE(h.emoji, '📝') as emoji,  -- Default emoji for habits without one
      h.description,
      'habit' as type,
      h.frequency,
      h.target_count,
      NULL as group_name,  -- Habits don't have groups currently
      h.start_date,
      h.end_date,
      CASE 
        WHEN h.end_date IS NULL OR h.end_date >= CURRENT_DATE THEN true 
        ELSE false 
      END as is_active,
      h.created_at,
      h.created_at as updated_at
    FROM habits h
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- Store the mapping between old habit IDs and new unified tracking IDs
-- We'll use a temporary table for this mapping
CREATE TEMP TABLE habit_id_mapping AS
SELECT 
  h.id as old_habit_id,
  ut.id as new_tracking_id
FROM habits h
JOIN unified_tracking_items ut ON (
  ut.name = h.name 
  AND ut.type = 'habit'
  AND ut.created_at = h.created_at
);

-- Migrate routine_items to unified tracking items
INSERT INTO unified_tracking_items 
  (name, emoji, description, type, frequency, target_count, group_name, start_date, end_date, is_active, created_at, updated_at)
SELECT 
  ri.name,
  ri.emoji,
  NULL as description,  -- Routine items don't have descriptions
  'routine' as type,
  'daily' as frequency,  -- Routines are daily by default
  1 as target_count,     -- Routines are binary (completed/not completed)
  ri.group_name,
  CURRENT_DATE as start_date,  -- Use current date as start for existing routines
  NULL as end_date,
  ri.is_active,
  ri.created_at,
  ri.created_at as updated_at
FROM routine_items ri
ON CONFLICT DO NOTHING;

-- Store the mapping between old routine_item IDs and new unified tracking IDs
CREATE TEMP TABLE routine_id_mapping AS
SELECT 
  ri.id as old_routine_id,
  ut.id as new_tracking_id
FROM routine_items ri
JOIN unified_tracking_items ut ON (
  ut.name = ri.name 
  AND ut.emoji = ri.emoji
  AND ut.type = 'routine'
  AND ut.created_at = ri.created_at
);

-- Migrate habit entries to unified tracking entries
INSERT INTO unified_tracking_entries 
  (tracking_item_id, date, count, completed, notes, created_at)
SELECT 
  mapping.new_tracking_id,
  he.date,
  he.count,
  -- For habits, completed is based on whether count meets target
  (he.count >= (SELECT target_count FROM unified_tracking_items WHERE id = mapping.new_tracking_id)) as completed,
  he.notes,
  he.created_at
FROM habit_entries he
JOIN habit_id_mapping mapping ON he.habit_id = mapping.old_habit_id
ON CONFLICT (tracking_item_id, date) DO NOTHING;

-- Migrate routine entries to unified tracking entries
INSERT INTO unified_tracking_entries 
  (tracking_item_id, date, count, completed, notes, created_at)
SELECT 
  mapping.new_tracking_id,
  re.date,
  CASE WHEN re.completed THEN 1 ELSE 0 END as count,  -- Convert boolean to count
  re.completed,
  NULL as notes,  -- Routine entries don't have notes currently
  re.created_at
FROM routine_entries re
JOIN routine_id_mapping mapping ON re.routine_item_id = mapping.old_routine_id
ON CONFLICT (tracking_item_id, date) DO NOTHING;

-- Clean up temporary tables
DROP TABLE habit_id_mapping;
DROP TABLE routine_id_mapping;
