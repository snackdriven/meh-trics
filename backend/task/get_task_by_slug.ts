import { api, APIError } from "encore.dev/api";
import { taskDB } from "./db";
import type { Task, EnergyLevel } from "./types";

interface GetTaskBySlugParams {
  slug: string;
}

export const getTaskBySlug = api<GetTaskBySlugParams, Task>(
  { expose: true, method: "GET", path: "/tasks/slug/:slug" },
  async (req) => {
    const row = await taskDB.queryRow<{
      id: number;
      title: string;
      slug: string;
      description: string | null;
      status: string;
      priority: number;
      due_date: Date | null;
      tags: string[];
      energy_level: string | null;
      is_hard_deadline: boolean;
      sort_order: number;
      recurring_task_id: number | null;
      created_at: Date;
      updated_at: Date;
    }>`
      SELECT id, title, slug, description, status, priority, due_date, tags, energy_level, is_hard_deadline, sort_order, recurring_task_id, created_at, updated_at
      FROM tasks WHERE slug = ${req.slug}
    `;

    if (!row) {
      throw APIError.notFound("task not found");
    }

    return {
      id: row.id,
      title: row.title,
      slug: row.slug,
      description: row.description || undefined,
      status: row.status as any,
      priority: row.priority as any,
      dueDate: row.due_date || undefined,
      tags: row.tags,
      energyLevel: row.energy_level as EnergyLevel | null ?? undefined,
      isHardDeadline: row.is_hard_deadline,
      sortOrder: row.sort_order,
      recurringTaskId: row.recurring_task_id ?? undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
);
