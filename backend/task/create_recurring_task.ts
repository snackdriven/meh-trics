import { api } from "encore.dev/api";
import { taskDB } from "./db";
import type { CreateRecurringTaskRequest, RecurringTask } from "./types";

// Creates a new recurring task.
export const createRecurringTask = api<CreateRecurringTaskRequest, RecurringTask>(
  { expose: true, method: "POST", path: "/recurring-tasks" },
  async (req) => {
    const row = await taskDB.queryRow<{
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
      INSERT INTO recurring_tasks (
        title, description, frequency, priority, tags, energy_level, next_due_date, max_occurrences_per_cycle
      )
      VALUES (
        ${req.title}, ${req.description || null}, ${req.frequency},
        ${req.priority || 3}, ${req.tags || []}, ${req.energyLevel || null},
        ${req.nextDueDate}, ${req.maxOccurrencesPerCycle || 1}
      )
      RETURNING id, title, description, frequency, priority, tags, energy_level,
        is_active, next_due_date, max_occurrences_per_cycle, created_at
    `;

    if (!row) {
      throw new Error("Failed to create recurring task");
    }

    return {
      id: row.id,
      title: row.title,
      description: row.description || undefined,
      frequency: row.frequency as any,
      priority: row.priority as any,
      tags: row.tags,
      energyLevel: row.energy_level as any,
      isActive: row.is_active,
      nextDueDate: row.next_due_date,
      maxOccurrencesPerCycle: row.max_occurrences_per_cycle,
      createdAt: row.created_at,
    };
  }
);
