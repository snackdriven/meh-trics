-- Add emoji column to habits
ALTER TABLE habits ADD COLUMN emoji TEXT NOT NULL DEFAULT '🎯';
