import { api } from "encore.dev/api";
import { taskDB } from "./db";
import type { CreateTaskRequest, Task } from "./types";

// Creates a new task.
export const createTask = api<CreateTaskRequest, Task>(
  { expose: true, method: "POST", path: "/tasks" },
  async (req) => {
    const row = await taskDB.queryRow<{
      id: number;
      title: string;
      description: string | null;
      completed: boolean;
      priority: number;
      due_date: Date | null;
      created_at: Date;
      updated_at: Date;
    }>`
      INSERT INTO tasks (title, description, priority, due_date)
      VALUES (${req.title}, ${req.description || null}, ${req.priority || 1}, ${req.dueDate || null})
      RETURNING id, title, description, completed, priority, due_date, created_at, updated_at
    `;

    if (!row) {
      throw new Error("Failed to create task");
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
