# Database Migration Patterns and Guidelines

This document outlines the database schema design, migration patterns, and best practices used in the meh-trics application.

## Schema Overview

The meh-trics application uses PostgreSQL with a microservice-oriented schema design. Each service manages its own set of tables with clear boundaries and minimal cross-service dependencies.

### Service-Based Table Organization

#### Task Service Tables
- **`tasks`** - Core task management with status, priority, due dates, and drag-and-drop ordering
- **`recurring_tasks`** - Template definitions for automatically generated recurring tasks
- **`mood_entries`** - Mood tracking with primary/secondary emotions and contextual tags
- **`journal_entries`** - Freeform journal entries with optional mood associations
- **`journal_templates`** - Reusable journal prompts and templates
- **`routine_items`** - Reusable routine activity definitions
- **`routine_entries`** - Daily routine completion tracking

#### Habits Service Tables
- **`habits`** - Habit definitions with frequency and target tracking
- **`habit_entries`** - Daily habit completion logs with count tracking

#### Calendar Service Tables
- **`calendar_events`** - Calendar events with recurrence support and .ics import capability

#### Insights Service Tables
- **`weekly_insights`** - Computed analytics and trend data for dashboard display

## Migration Numbering Strategy

### Service-Scoped Numbering
Each service maintains its own migration numbering sequence:
- Task service: `1_create_tables.up.sql` through `25_optimize_task_queries.up.sql`
- Habits service: `1_create_tables.up.sql` through `4_optimize_habit_analytics.up.sql`
- Calendar service: `1_create_calendar_events.up.sql` through `2_convert_to_timestamptz.up.sql`

### Migration Naming Conventions
```
{number}_{descriptive_action}.up.sql
```

Examples:
- `1_create_tables.up.sql` - Initial table creation
- `14_add_task_filter_indexes.up.sql` - Performance optimization
- `19_remove_mood_color.up.sql` - Schema cleanup
- `25_optimize_task_queries.up.sql` - Database performance enhancement

## Core Schema Patterns

### Common Column Patterns

#### Timestamps
All tables include standardized timestamp columns:
```sql
created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
```

#### Soft Deletion
Many tables use soft deletion with nullable timestamp:
```sql
archived_at TIMESTAMPTZ NULL  -- NULL = active, timestamp = archived
```

#### Tagging System
Consistent array-based tagging across multiple tables:
```sql
tags TEXT[] NOT NULL DEFAULT '{}'  -- PostgreSQL array for flexible tagging
```

### Indexing Strategy

#### Performance-Critical Indexes
```sql
-- Query filtering indexes
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_tasks_tags ON tasks USING GIN(tags);

-- Composite indexes for complex queries
CREATE INDEX idx_tasks_status_archived_priority ON tasks(status, archived_at, priority) 
WHERE archived_at IS NULL;

-- Sort operation indexes
CREATE INDEX idx_tasks_sort_order_created_at ON tasks(sort_order ASC, created_at DESC) 
WHERE archived_at IS NULL;
```

#### Array and JSON Indexing
```sql
-- GIN indexes for array operations
CREATE INDEX idx_tasks_tags ON tasks USING GIN(tags);
CREATE INDEX idx_calendar_events_tags ON calendar_events USING GIN(tags);

-- Composite indexes for date-range queries
CREATE INDEX idx_mood_entries_date_tier ON mood_entries(date DESC, tier, created_at);
```

## Migration Best Practices

### 1. Iterative Development Approach
During development, update the latest migration file rather than creating new ones:
```sql
-- Instead of creating 15_add_new_column.up.sql
-- Update 14_add_task_filter_indexes.up.sql if not yet deployed
ALTER TABLE tasks ADD COLUMN new_column TEXT;
```

### 2. Data Integrity Constraints
Always include appropriate constraints with descriptive names:
```sql
-- Foreign key constraints
ALTER TABLE habit_entries 
ADD CONSTRAINT fk_habit_entries_habit_id 
FOREIGN KEY (habit_id) REFERENCES habits(id) ON DELETE CASCADE;

-- Check constraints for enums
ALTER TABLE tasks 
ADD CONSTRAINT check_tasks_status 
CHECK (status IN ('todo', 'in_progress', 'done', 'archived'));

-- Unique constraints
ALTER TABLE habits 
ADD CONSTRAINT unique_habits_name_user 
UNIQUE (name, user_id);
```

### 3. Performance Considerations
Include index creation with table creation when possible:
```sql
-- Create table with immediate indexing
CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'todo',
    -- ... other columns
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add indexes immediately
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_created_at ON tasks(created_at DESC);
```

### 4. Backward Compatibility
Structure migrations to be non-breaking when possible:
```sql
-- Add column with default value (non-breaking)
ALTER TABLE tasks ADD COLUMN energy_level TEXT DEFAULT 'medium';

-- Add NOT NULL constraint in separate step after data population
-- Step 1: Add nullable column
ALTER TABLE tasks ADD COLUMN required_field TEXT;

-- Step 2: Populate data
UPDATE tasks SET required_field = 'default_value' WHERE required_field IS NULL;

-- Step 3: Add NOT NULL constraint
ALTER TABLE tasks ALTER COLUMN required_field SET NOT NULL;
```

## Common Migration Patterns

### Adding Enum-Like Columns
```sql
-- Add column with check constraint for enum behavior
ALTER TABLE tasks ADD COLUMN energy_level TEXT;
ALTER TABLE tasks ADD CONSTRAINT check_energy_level 
CHECK (energy_level IN ('high', 'medium', 'low') OR energy_level IS NULL);

-- Set default value
ALTER TABLE tasks ALTER COLUMN energy_level SET DEFAULT 'medium';
```

### Adding Array Columns
```sql
-- Add array column with proper default
ALTER TABLE tasks ADD COLUMN tags TEXT[] NOT NULL DEFAULT '{}';

-- Create GIN index for array operations
CREATE INDEX idx_tasks_tags ON tasks USING GIN(tags);
```

### Date/Time Column Conversions
```sql
-- Convert DATE to TIMESTAMPTZ for timezone support
ALTER TABLE calendar_events 
ALTER COLUMN start_time TYPE TIMESTAMPTZ USING start_time::TIMESTAMPTZ;

ALTER TABLE calendar_events 
ALTER COLUMN end_time TYPE TIMESTAMPTZ USING end_time::TIMESTAMPTZ;
```

### Adding Soft Delete Support
```sql
-- Add archived_at column for soft deletion
ALTER TABLE tasks ADD COLUMN archived_at TIMESTAMPTZ NULL;

-- Update existing queries to filter out archived records
-- Add partial index excluding archived records
CREATE INDEX idx_tasks_active ON tasks(created_at DESC) 
WHERE archived_at IS NULL;
```

## Troubleshooting Common Issues

### Migration Number Conflicts
If migration numbers conflict between developers:
1. Check `bun run check:migrations` to identify conflicts
2. Renumber migrations in development branches
3. Ensure sequential numbering before merging

### Index Performance Issues
Monitor index usage and effectiveness:
```sql
-- Check index usage statistics
SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read, idx_tup_fetch 
FROM pg_stat_user_indexes 
ORDER BY idx_scan DESC;

-- Identify unused indexes
SELECT schemaname, tablename, indexname 
FROM pg_stat_user_indexes 
WHERE idx_scan = 0;
```

### Constraint Violations
Handle constraint violations gracefully in application code:
```typescript
// Example: Handle unique constraint violations
try {
  await database.query('INSERT INTO tasks (title) VALUES (?)', [title]);
} catch (error) {
  if (error.message.includes('unique constraint')) {
    throw createAppError(ErrorCode.RESOURCE_ALREADY_EXISTS, 'Task with this title already exists');
  }
  throw error;
}
```

## Schema Evolution Guidelines

### Adding New Tables
1. Create table with all necessary indexes
2. Add foreign key constraints with appropriate CASCADE rules
3. Include audit columns (created_at, updated_at)
4. Consider soft delete support if applicable

### Modifying Existing Tables
1. Plan for zero-downtime deployments
2. Use multiple migrations for breaking changes
3. Maintain backward compatibility during transition periods
4. Update API endpoints after schema changes

### Removing Deprecated Columns
1. Remove application dependencies first
2. Deploy application changes
3. Remove database columns in subsequent migration
4. Clean up unused indexes

This migration strategy ensures data integrity, performance, and maintainability while supporting the application's growth and evolution.