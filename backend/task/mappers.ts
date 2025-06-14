/**
 * Transforms a database row into a Task object for API responses.
 * 
 * This mapper handles the conversion between PostgreSQL naming conventions
 * (snake_case) and JavaScript/TypeScript conventions (camelCase). It also
 * manages null/undefined transformations and type casting for enum values.
 * 
 * Key transformations:
 * - Converts snake_case column names to camelCase property names
 * - Transforms null values to undefined for optional fields
 * - Casts string columns to typed enum values
 * - Handles PostgreSQL array types (tags)
 * - Manages date/timestamp conversions
 * 
 * @param row - Raw database row with PostgreSQL column names and types
 * @returns Task object with camelCase properties and proper TypeScript types
 * 
 * @example
 * ```typescript
 * const dbRow = {
 *   id: 1,
 *   title: "Buy groceries",
 *   due_date: new Date("2024-01-15"),
 *   energy_level: "high",
 *   // ... other columns
 * };
 * 
 * const task = rowToTask(dbRow);
 * // Result: { id: 1, title: "Buy groceries", dueDate: Date, energyLevel: "high", ... }
 * ```
 */
export function rowToTask(row: {
  id: number;
  title: string;
  description: string | null;
  status: string;
  priority: number;
  due_date: Date | null;
  tags: string[];
  energy_level: string | null;
  is_hard_deadline: boolean;
  sort_order: number;
  archived_at: Date | null;
  created_at: Date;
  updated_at: Date;
  recurring_task_id?: number | null;
}): import("./types").Task {
  return {
    id: row.id,
    title: row.title,
    // Convert null to undefined for optional fields (cleaner JSON serialization)
    description: row.description || undefined,
    // Type-safe casting to enum values
    status: row.status as import("./types").TaskStatus,
    priority: row.priority as import("./types").Priority,
    // Date handling with null-to-undefined conversion
    dueDate: row.due_date || undefined,
    // PostgreSQL arrays are directly compatible with TypeScript arrays
    tags: row.tags,
    // Handle nullable enum fields with nullish coalescing
    energyLevel:
      (row.energy_level as import("./types").EnergyLevel | null) ?? undefined,
    // Boolean fields are directly compatible
    isHardDeadline: row.is_hard_deadline,
    sortOrder: row.sort_order,
    // Optional foreign key reference handling
    recurringTaskId: row.recurring_task_id || undefined,
    // Timestamp fields are automatically converted by the database driver
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    // Soft delete timestamp handling
    archivedAt: row.archived_at || undefined,
  };
}

export function rowToRecurringTask(row: {
  id: number;
  title: string;
  description: string | null;
  frequency: string;
  priority: number;
  tags: string[];
  energy_level: string | null;
  is_active: boolean;
  next_due_date: Date;
  max_occurrences_per_cycle: number;
  created_at: Date;
}): import("./types").RecurringTask {
  return {
    id: row.id,
    title: row.title,
    description: row.description || undefined,
    frequency: row.frequency as import("./types").RecurringFrequency,
    priority: row.priority as import("./types").Priority,
    tags: row.tags,
    energyLevel:
      (row.energy_level as import("./types").EnergyLevel | null) ?? undefined,
    isActive: row.is_active,
    nextDueDate: row.next_due_date,
    maxOccurrencesPerCycle: row.max_occurrences_per_cycle,
    createdAt: row.created_at,
  };
}
