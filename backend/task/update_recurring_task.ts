import { APIError, api } from "encore.dev/api";
import { buildUpdateQuery } from "../utils/buildUpdateQuery";
import { taskDB } from "./db";
import { rowToRecurringTask } from "./mappers";
import type { RecurringTask, UpdateRecurringTaskRequest } from "./types";

/**
 * Updates an existing recurring task template.
 *
 * @param req - Partial fields for the template including id.
 * @returns The updated recurring task.
 */
export const updateRecurringTask = api<UpdateRecurringTaskRequest, RecurringTask>(
  { expose: true, method: "PUT", path: "/recurring-tasks/:id" },
  async (req) => {
    const existingTask = await taskDB.queryRow`
      SELECT id FROM recurring_tasks WHERE id = ${req.id}
    `;

    if (!existingTask) {
      throw APIError.notFound("recurring task not found");
    }

    const { clause, values } = buildUpdateQuery({
      title: req.title,
      description: req.description,
      frequency: req.frequency,
      priority: req.priority,
      max_occurrences_per_cycle: req.maxOccurrencesPerCycle,
      tags: req.tags,
      energy_level: req.energyLevel,
      is_active: req.isActive,
      next_due_date: req.nextDueDate,
    });
    values.push(req.id);

    const query = `
      UPDATE recurring_tasks
      SET ${clause}
      WHERE id = $${values.length}
      RETURNING id, title, description, frequency, priority, tags, energy_level,
        is_active, next_due_date, max_occurrences_per_cycle, created_at
    `;

    const row = await taskDB.rawQueryRow<{
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
    }>(query, ...values);

    if (!row) {
      throw new Error("Failed to update recurring task");
    }

    return rowToRecurringTask(row);
  }
);
