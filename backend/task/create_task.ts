import { api } from "encore.dev/api";
import { taskDB } from "./db";
import { slugify } from "./slugify";
import type { CreateTaskRequest, Task, EnergyLevel } from "./types";

/**
 * Persist a new task to the database.
 *
 * The sort order is determined by taking the current highest order
 * and incrementing it by one so new tasks appear last.
 */
export const createTask = api<CreateTaskRequest, Task>(
  { expose: true, method: "POST", path: "/tasks" },
  async (req) => {
    // Get the highest sort order and add 1
    const maxSortOrderRow = await taskDB.queryRow<{ max_sort_order: number | null }>`
      SELECT MAX(sort_order) as max_sort_order FROM tasks
    `;
    const nextSortOrder = (maxSortOrderRow?.max_sort_order || 0) + 1;
    const slug = slugify(req.title);

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
      created_at: Date;
      updated_at: Date;
    }>`
      INSERT INTO tasks (title, slug, description, priority, due_date, tags, energy_level, is_hard_deadline, sort_order)
      VALUES (${req.title}, ${slug}, ${req.description || null}, ${req.priority || 3}, ${req.dueDate || null}, ${req.tags || []}, ${req.energyLevel || null}, ${req.isHardDeadline || false}, ${nextSortOrder})
      RETURNING id, title, slug, description, status, priority, due_date, tags, energy_level, is_hard_deadline, sort_order, created_at, updated_at
    `;

    if (!row) {
      throw new Error("Failed to create task");
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
      energyLevel: (row.energy_level as EnergyLevel | null) ?? undefined,
      isHardDeadline: row.is_hard_deadline,
      sortOrder: row.sort_order,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
);
