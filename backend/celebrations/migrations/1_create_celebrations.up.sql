-- Create celebrations table for tracking achievement moments
CREATE TABLE celebrations (
    id BIGSERIAL PRIMARY KEY,
    user_id TEXT, -- Optional: for multi-user support later
    trigger_type TEXT NOT NULL CHECK (trigger_type IN (
        'first_completion',
        'streak_milestone', 
        'weekly_goal',
        'monthly_goal',
        'comeback',
        'consistency_boost'
    )),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    entity_id BIGINT, -- Associated habit or task ID
    entity_type TEXT NOT NULL CHECK (entity_type IN ('habit', 'task')),
    milestone TEXT, -- e.g., "7 day streak"
    celebration_type TEXT NOT NULL CHECK (celebration_type IN (
        'confetti',
        'sparkles', 
        'badges',
        'gentle'
    )),
    acknowledged BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for efficient querying
CREATE INDEX idx_celebrations_entity ON celebrations(entity_type, entity_id);
CREATE INDEX idx_celebrations_created_at ON celebrations(created_at DESC);
CREATE INDEX idx_celebrations_trigger ON celebrations(trigger_type);

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_celebrations_updated_at
    BEFORE UPDATE ON celebrations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();