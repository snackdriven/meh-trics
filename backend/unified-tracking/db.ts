import { SQLDatabase } from "encore.dev/storage/sqldb";

export const UnifiedTrackingDB = new SQLDatabase("unified_tracking", {
  migrations: "./migrations",
});

// Create the unified tracking items table
export const createUnifiedTrackingItemsTable = `
CREATE TABLE IF NOT EXISTS unified_tracking_items (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  emoji VARCHAR(10) NOT NULL,
  description TEXT,
  type VARCHAR(10) NOT NULL CHECK (type IN ('habit', 'routine')),
  frequency VARCHAR(10) NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly', 'routine')),
  target_count INTEGER NOT NULL DEFAULT 1,
  group_name VARCHAR(100),
  is_active BOOLEAN NOT NULL DEFAULT true,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_unified_tracking_items_type ON unified_tracking_items(type);
CREATE INDEX IF NOT EXISTS idx_unified_tracking_items_frequency ON unified_tracking_items(frequency);
CREATE INDEX IF NOT EXISTS idx_unified_tracking_items_active ON unified_tracking_items(is_active);
CREATE INDEX IF NOT EXISTS idx_unified_tracking_items_group ON unified_tracking_items(group_name);
`;

// Create the unified tracking entries table
export const createUnifiedTrackingEntriesTable = `
CREATE TABLE IF NOT EXISTS unified_tracking_entries (
  id SERIAL PRIMARY KEY,
  tracking_item_id INTEGER NOT NULL REFERENCES unified_tracking_items(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  count INTEGER NOT NULL DEFAULT 1,
  completed BOOLEAN NOT NULL DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  UNIQUE(tracking_item_id, date)
);

CREATE INDEX IF NOT EXISTS idx_unified_tracking_entries_item_date ON unified_tracking_entries(tracking_item_id, date);
CREATE INDEX IF NOT EXISTS idx_unified_tracking_entries_date ON unified_tracking_entries(date);
CREATE INDEX IF NOT EXISTS idx_unified_tracking_entries_completed ON unified_tracking_entries(completed);
`;

// Trigger to update updated_at timestamp
export const createUpdatedAtTrigger = `
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE TRIGGER update_unified_tracking_items_updated_at 
BEFORE UPDATE ON unified_tracking_items 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
`;

// Migration to populate from existing habits and routines
export const migrateExistingDataQuery = `
-- Migrate existing habits
INSERT INTO unified_tracking_items (name, emoji, description, type, frequency, target_count, is_active, start_date, end_date, created_at)
SELECT 
  name, 
  emoji, 
  description, 
  'habit' as type,
  frequency::varchar as frequency,
  target_count,
  true as is_active,
  start_date,
  end_date,
  created_at
FROM habits
WHERE NOT EXISTS (
  SELECT 1 FROM unified_tracking_items uti 
  WHERE uti.name = habits.name AND uti.type = 'habit'
);

-- Migrate existing routine items
INSERT INTO unified_tracking_items (name, emoji, description, type, frequency, target_count, group_name, is_active, created_at)
SELECT 
  name, 
  emoji, 
  null as description,
  'routine' as type,
  'routine' as frequency,
  1 as target_count,
  group_name,
  is_active,
  created_at
FROM routine_items
WHERE NOT EXISTS (
  SELECT 1 FROM unified_tracking_items uti 
  WHERE uti.name = routine_items.name AND uti.type = 'routine'
);
`;
