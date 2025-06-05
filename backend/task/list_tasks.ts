import { api } from "encore.dev/api";
import { Query } from "encore.dev/api";
import { taskDB } from "./db";
import type { Task } from "./types";

interface ListTasksParams {
  status?: Query<string>;
  tags?: Query<string>;
  energyLevel?: Query<string>;
  page?: Query<number>;
  pageSize?: Query<number>;
}

interface ListTasksResponse {
  tasks: Task[];
  total: number;
}

// Retrieves tasks with optional filtering by status, tags, and energy level.
export const listTasks = api<ListTasksParams, ListTasksResponse>(
  { expose: true, method: "GET", path: "/tasks" },
  async (req) => {
    const page = req.page ? Number(req.page) : 1;
    const pageSize = req.pageSize ? Number(req.pageSize) : 20;
    let query = `
      SELECT id, title, description, status, priority, due_date, tags, energy_level, is_hard_deadline, sort_order, created_at, updated_at,
             COUNT(*) OVER() AS total_count
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
    query += ` LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    params.push(pageSize, (page - 1) * pageSize);

    const tasks: Task[] = [];
    let total = 0;
    
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
      total_count: number;
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
      total = row.total_count;
    }

    return { tasks, total };
  }
);
