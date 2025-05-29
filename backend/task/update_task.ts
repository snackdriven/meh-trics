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
    if (req.completed !== undefined) {
      updates.push(`completed = $${paramIndex++}`);
      values.push(req.completed);
    }
    if (req.priority !== undefined) {
      updates.push(`priority = $${paramIndex++}`);
      values.push(req.priority);
    }
    if (req.dueDate !== undefined) {
      updates.push(`due_date = $${paramIndex++}`);
      values.push(req.dueDate);
    }

    updates.push(`updated_at = NOW()`);
    values.push(req.id);

    const query = `
      UPDATE tasks 
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING id, title, description, completed, priority, due_date, created_at, updated_at
    `;

    const row = await taskDB.rawQueryRow<{
      id: number;
      title: string;
      description: string | null;
      completed: boolean;
      priority: number;
      due_date: Date | null;
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
      completed: row.completed,
      priority: row.priority as any,
      dueDate: row.due_date || undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
);
