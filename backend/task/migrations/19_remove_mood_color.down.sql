-- Re-add color column to mood_entries (note: this will restore the column but data will be lost)
ALTER TABLE mood_entries ADD COLUMN IF NOT EXISTS color TEXT;