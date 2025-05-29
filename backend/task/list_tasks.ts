import { api } from "encore.dev/api";
import { taskDB } from "./db";
import type { Task } from "./types";

interface ListTasksResponse {
  tasks: Task[];
}

// Retrieves all tasks, ordered by creation date (latest first).
export const listTasks = api<void, ListTasksResponse>(
  { expose: true, method: "GET", path: "/tasks" },
  async () => {
    const tasks: Task[] = [];
    
    for await (const row of taskDB.query<{
      id: number;
      title: string;
      description: string | null;
      completed: boolean;
      priority: number;
      due_date: Date | null;
      created_at: Date;
      updated_at: Date;
    }>`
      SELECT id, title, description, completed, priority, due_date, created_at, updated_at
      FROM tasks
      ORDER BY created_at DESC
    `) {
      tasks.push({
        id: row.id,
        title: row.title,
        description: row.description || undefined,
        completed: row.completed,
        priority: row.priority as any,
        dueDate: row.due_date || undefined,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      });
    }

    return { tasks };
  }
);
