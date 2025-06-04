import { api, APIError } from "encore.dev/api";
import { taskDB } from "./db";
import type { UpdateRecurringTaskRequest, RecurringTask } from "./types";

// Updates an existing recurring task.
export const updateRecurringTask = api<UpdateRecurringTaskRequest, RecurringTask>(
  { expose: true, method: "PUT", path: "/recurring-tasks/:id" },
  async (req) => {
    const existingTask = await taskDB.queryRow`
      SELECT id FROM recurring_tasks WHERE id = ${req.id}
    `;

    if (!existingTask) {
      throw APIError.notFound("recurring task not found");
    }

    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (req.title !== undefined) {
      updates.push(`title = $${paramIndex++}`);
      values.push(req.title);
    }
    if (req.description !== undefined) {
      updates.push(`description = $${paramIndex++}`);
      values.push(req.description);
    }
    if (req.frequency !== undefined) {
      updates.push(`frequency = $${paramIndex++}`);
      values.push(req.frequency);
    }
    if (req.priority !== undefined) {
      updates.push(`priority = $${paramIndex++}`);
      values.push(req.priority);
    }
    if (req.tags !== undefined) {
      updates.push(`tags = $${paramIndex++}`);
      values.push(req.tags);
    }
    if (req.energyLevel !== undefined) {
      updates.push(`energy_level = $${paramIndex++}`);
      values.push(req.energyLevel);
    }
    if (req.isActive !== undefined) {
      updates.push(`is_active = $${paramIndex++}`);
      values.push(req.isActive);
    }
    if (req.nextDueDate !== undefined) {
      updates.push(`next_due_date = $${paramIndex++}`);
      values.push(req.nextDueDate);
    }

    values.push(req.id);

    const query = `
      UPDATE recurring_tasks 
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING id, title, description, frequency, priority, tags, energy_level, is_active, next_due_date, created_at
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
      created_at: Date;
    }>(query, ...values);

    if (!row) {
      throw new Error("Failed to update recurring task");
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
      createdAt: row.created_at,
    };
  }
);
