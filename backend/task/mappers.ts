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
    description: row.description || undefined,
    status: row.status as import("./types").TaskStatus,
    priority: row.priority as import("./types").Priority,
    dueDate: row.due_date || undefined,
    tags: row.tags,
    energyLevel:
      (row.energy_level as import("./types").EnergyLevel | null) ?? undefined,
    isHardDeadline: row.is_hard_deadline,
    sortOrder: row.sort_order,
    recurringTaskId: row.recurring_task_id || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
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
