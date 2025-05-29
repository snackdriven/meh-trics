import { api } from "encore.dev/api";
import { taskDB } from "./db";
import type { RecurringTask } from "./types";

interface ListRecurringTasksResponse {
  recurringTasks: RecurringTask[];
}

// Retrieves all active recurring tasks.
export const listRecurringTasks = api<void, ListRecurringTasksResponse>(
  { expose: true, method: "GET", path: "/recurring-tasks" },
  async () => {
    const recurringTasks: RecurringTask[] = [];
    
    for await (const row of taskDB.query<{
      id: number;
      title: string;
      description: string | null;
      frequency: string;
      priority: number;
      tags: string[];
      energy_level: string | null;
      is_active: boolean;
      next_due_date: Date;
      created_at: Date;
    }>`
      SELECT id, title, description, frequency, priority, tags, energy_level, is_active, next_due_date, created_at
      FROM recurring_tasks
      WHERE is_active = true
      ORDER BY created_at DESC
    `) {
      recurringTasks.push({
        id: row.id,
        title: row.title,
        description: row.description || undefined,
        frequency: row.frequency as any,
        priority: row.priority as any,
        tags: row.tags,
        energyLevel: row.energy_level as any,
        isActive: row.is_active,
        nextDueDate: row.next_due_date,
        createdAt: row.created_at,
      });
    }

    return { recurringTasks };
  }
);
