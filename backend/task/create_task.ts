import { api } from "encore.dev/api";
import { taskDB } from "./db";
import type { CreateTaskRequest, Task } from "./types";

// Creates a new task.
export const createTask = api<CreateTaskRequest, Task>(
  { expose: true, method: "POST", path: "/tasks" },
  async (req) => {
    // Get the highest sort order and add 1
    const maxSortOrderRow = await taskDB.queryRow<{ max_sort_order: number | null }>`
      SELECT MAX(sort_order) as max_sort_order FROM tasks
    `;
    const nextSortOrder = (maxSortOrderRow?.max_sort_order || 0) + 1;

    const row = await taskDB.queryRow<{
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
    }>`
      INSERT INTO tasks (title, description, priority, due_date, tags, energy_level, is_hard_deadline, sort_order)
      VALUES (${req.title}, ${req.description || null}, ${req.priority || 3}, ${req.dueDate || null}, ${req.tags || []}, ${req.energyLevel || null}, ${req.isHardDeadline || false}, ${nextSortOrder})
      RETURNING id, title, description, status, priority, due_date, tags, energy_level, is_hard_deadline, sort_order, created_at, updated_at
    `;

    if (!row) {
      throw new Error("Failed to create task");
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
