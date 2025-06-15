-- Drop celebrations table and related objects
DROP TRIGGER IF EXISTS update_celebrations_updated_at ON celebrations;
DROP FUNCTION IF EXISTS update_updated_at_column();
DROP TABLE IF EXISTS celebrations;