import { api } from "encore.dev/api";
import { taskDB } from "./db";
import { rowToRecurringTask } from "./mappers";
import type { CreateRecurringTaskRequest, RecurringTask } from "./types";

/**
 * Creates a new recurring task template.
 *
 * @param req - Template configuration.
 * @returns The created recurring task.
 */
export const createRecurringTask = api<
  CreateRecurringTaskRequest,
  RecurringTask
>({ expose: true, method: "POST", path: "/recurring-tasks" }, async (req) => {
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
    max_occurrences_per_cycle: number;
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

  return rowToRecurringTask(row);
});
