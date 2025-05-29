import { api } from "encore.dev/api";
import { Query } from "encore.dev/api";
import { taskDB } from "./db";
import type { Task } from "./types";

interface ListTasksParams {
  status?: Query<string>;
  tags?: Query<string>;
  energyLevel?: Query<string>;
}

interface ListTasksResponse {
  tasks: Task[];
}

// Retrieves tasks with optional filtering by status, tags, and energy level.
export const listTasks = api<ListTasksParams, ListTasksResponse>(
  { expose: true, method: "GET", path: "/tasks" },
  async (req) => {
    let query = `
      SELECT id, title, description, status, priority, due_date, tags, energy_level, is_hard_deadline, sort_order, created_at, updated_at
      FROM tasks
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramIndex = 1;

    if (req.status) {
      query += ` AND status = $${paramIndex++}`;
      params.push(req.status);
    }

    if (req.tags) {
      query += ` AND $${paramIndex++} = ANY(tags)`;
      params.push(req.tags);
    }

    if (req.energyLevel) {
      query += ` AND energy_level = $${paramIndex++}`;
      params.push(req.energyLevel);
    }

    query += ` ORDER BY sort_order ASC, created_at DESC`;

    const tasks: Task[] = [];
    
    for await (const row of taskDB.rawQuery<{
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
    }>(query, ...params)) {
      tasks.push({
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
      });
    }

    return { tasks };
  }
);
