-- Rollback migration for migrating existing data
-- This removes the migrated data from unified tracking

-- Remove migrated habit entries
DELETE FROM unified_tracking_entries 
WHERE tracking_item_id IN (
  SELECT id FROM unified_tracking_items WHERE type = 'habit'
);

-- Remove migrated routine entries  
DELETE FROM unified_tracking_entries 
WHERE tracking_item_id IN (
  SELECT id FROM unified_tracking_items WHERE type = 'routine'
);

-- Remove migrated habit items
DELETE FROM unified_tracking_items WHERE type = 'habit';

-- Remove migrated routine items
DELETE FROM unified_tracking_items WHERE type = 'routine';
