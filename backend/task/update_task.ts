import { api, APIError } from "encore.dev/api";
import { taskDB } from "./db";
import type { UpdateTaskRequest, Task } from "./types";

// Updates an existing task.
export const updateTask = api<UpdateTaskRequest, Task>(
  { expose: true, method: "PUT", path: "/tasks/:id" },
  async (req) => {
    const existingTask = await taskDB.queryRow`
      SELECT id FROM tasks WHERE id = ${req.id}
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

    updates.push(`updated_at = NOW()`);
    values.push(req.id);

    const query = `
      UPDATE tasks 
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING id, title, description, status, priority, due_date, tags, energy_level, is_hard_deadline, created_at, updated_at
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
      created_at: Date;
      updated_at: Date;
    }>(query, ...values);

    if (!row) {
      throw new Error("Failed to update task");
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
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
);
