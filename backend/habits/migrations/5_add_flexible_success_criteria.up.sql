-- Add flexible success criteria to habits table
ALTER TABLE habits 
ADD COLUMN success_criteria JSONB;

-- Add a comment to document the structure
COMMENT ON COLUMN habits.success_criteria IS 
'JSON object storing flexible success criteria: {"criteria": "exact|minimum|flexible", "targetCount": number, "minimumCount": number, "allowPartialStreaks": boolean}';

-- Create index for querying habits by success criteria type
CREATE INDEX idx_habits_success_criteria ON habits USING GIN (success_criteria);

-- Add sample flexible success criteria for existing habits (optional)
-- Update existing habits to have default flexible criteria if they don't have any
UPDATE habits 
SET success_criteria = jsonb_build_object(
    'criteria', 'flexible',
    'targetCount', target_count,
    'minimumCount', GREATEST(1, target_count / 3),
    'allowPartialStreaks', true
)
WHERE success_criteria IS NULL;