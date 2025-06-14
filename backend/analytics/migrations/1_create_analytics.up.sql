-- Create analytics tables for flexible success tracking

-- Table for storing computed analytics snapshots
CREATE TABLE analytics_snapshots (
    id BIGSERIAL PRIMARY KEY,
    user_id TEXT, -- Optional: for multi-user support later
    snapshot_date DATE NOT NULL DEFAULT CURRENT_DATE,
    period_days INTEGER NOT NULL DEFAULT 30,
    
    -- Traditional metrics
    habit_completion_rate DECIMAL(5,2),
    task_completion_rate DECIMAL(5,2),
    total_habits INTEGER,
    total_tasks INTEGER,
    
    -- Flexible success metrics
    habit_flexible_rate DECIMAL(5,2),
    partial_success_count INTEGER,
    minimum_effort_count INTEGER,
    encouragement_score INTEGER,
    
    -- Success distribution
    full_success_count INTEGER,
    partial_success_count_dist INTEGER,
    minimum_success_count_dist INTEGER,
    no_success_count INTEGER,
    
    -- Celebration metrics
    total_celebrations INTEGER,
    celebration_types JSONB,
    
    -- Motivational insights
    top_message TEXT,
    encouragement_level TEXT CHECK (encouragement_level IN ('high', 'medium', 'low')),
    suggested_actions JSONB,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table for tracking success criteria changes over time
CREATE TABLE success_criteria_history (
    id BIGSERIAL PRIMARY KEY,
    entity_id BIGINT NOT NULL,
    entity_type TEXT NOT NULL CHECK (entity_type IN ('habit', 'task')),
    criteria_type TEXT NOT NULL CHECK (criteria_type IN ('exact', 'minimum', 'flexible')),
    target_count INTEGER,
    minimum_count INTEGER,
    allow_partial_streaks BOOLEAN,
    effective_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    effective_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for efficient querying
CREATE INDEX idx_analytics_snapshots_date ON analytics_snapshots(snapshot_date DESC);
CREATE INDEX idx_analytics_snapshots_user ON analytics_snapshots(user_id, snapshot_date DESC);
CREATE INDEX idx_success_criteria_entity ON success_criteria_history(entity_type, entity_id, effective_from DESC);
CREATE INDEX idx_success_criteria_effective ON success_criteria_history(effective_from, effective_until);