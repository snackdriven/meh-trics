import { api, APIError } from "encore.dev/api";
import { taskDB } from "./db";
import { getCycleStart, getCycleEnd, getNextCycleStart } from "./recurrence";
import type { UpdateTaskRequest, Task } from "./types";

// Updates an existing task.
export const updateTask = api<UpdateTaskRequest, Task>(
  { expose: true, method: "PUT", path: "/tasks/:id" },
  async (req) => {
    const existingTask = await taskDB.queryRow<{
      id: number;
      status: string;
      recurring_task_id: number | null;
    }>`
      SELECT id, status, recurring_task_id FROM tasks WHERE id = ${req.id}
    `;

    if (!existingTask) {
      throw APIError.notFound("task not found");
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
    if (req.status !== undefined) {
      updates.push(`status = $${paramIndex++}`);
      values.push(req.status);
    }
    if (req.priority !== undefined) {
      updates.push(`priority = $${paramIndex++}`);
      values.push(req.priority);
    }
    if (req.dueDate !== undefined) {
      updates.push(`due_date = $${paramIndex++}`);
      values.push(req.dueDate);
    }
    if (req.tags !== undefined) {
      updates.push(`tags = $${paramIndex++}`);
      values.push(req.tags);
    }
    if (req.energyLevel !== undefined) {
      updates.push(`energy_level = $${paramIndex++}`);
      values.push(req.energyLevel);
    }
    if (req.isHardDeadline !== undefined) {
      updates.push(`is_hard_deadline = $${paramIndex++}`);
      values.push(req.isHardDeadline);
    }
    if (req.sortOrder !== undefined) {
      updates.push(`sort_order = $${paramIndex++}`);
      values.push(req.sortOrder);
    }

    updates.push(`updated_at = NOW()`);
    values.push(req.id);

    const query = `
      UPDATE tasks 
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING id, title, description, status, priority, due_date, tags, energy_level, is_hard_deadline, sort_order, created_at, updated_at
    `;

    const row = await taskDB.rawQueryRow<{
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
      created_at: Date;
      updated_at: Date;
    }>(query, ...values);

    if (!row) {
      throw new Error("Failed to update task");
    }

    if (
      req.status === 'done' &&
      existingTask.status !== 'done' &&
      existingTask.recurring_task_id
    ) {
      const rt = await taskDB.queryRow<{
        frequency: string;
        max_occurrences_per_cycle: number;
      }>`
        SELECT frequency, max_occurrences_per_cycle
        FROM recurring_tasks WHERE id = ${existingTask.recurring_task_id}
      `;
      if (rt) {
        const now = new Date();
        const start = getCycleStart(now, rt.frequency as any);
        const end = getCycleEnd(now, rt.frequency as any);
        const countRow = await taskDB.queryRow<{ count: number }>`
          SELECT COUNT(*) AS count FROM tasks
          WHERE recurring_task_id = ${existingTask.recurring_task_id}
            AND status = 'done'
            AND updated_at >= ${start}
            AND updated_at < ${end}
        `;
        const count = Number(countRow?.count || 0);
        if (count >= rt.max_occurrences_per_cycle) {
          const nextStart = getNextCycleStart(now, rt.frequency as any);
          await taskDB.exec`
            UPDATE recurring_tasks SET next_due_date = ${nextStart}
            WHERE id = ${existingTask.recurring_task_id}
          `;
        }
      }
    }

    return {
      id: row.id,
      title: row.title,
      description: row.description || undefined,
      status: row.status as any,
      priority: row.priority as any,
      dueDate: row.due_date || undefined,
      tags: row.tags,
      energyLevel: row.energy_level as any,
      isHardDeadline: row.is_hard_deadline,
      sortOrder: row.sort_order,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
);
