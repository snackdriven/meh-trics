import { api } from "encore.dev/api";
import { taskDB } from "./db";
import type { CreateRoutineItemRequest, RoutineItem } from "./types";

/**
 * Creates a new routine item template.
 *
 * @param req - Routine item details.
 * @returns The created routine item.
 */
export const createRoutineItem = api<CreateRoutineItemRequest, RoutineItem>(
  { expose: true, method: "POST", path: "/routine-items" },
  async (req) => {
    const sortRow = await taskDB.queryRow<{ max_sort_order: number | null }>`
      SELECT MAX(sort_order) AS max_sort_order FROM routine_items
    `;
    const nextSortOrder = (sortRow?.max_sort_order || 0) + 1;

    const row = await taskDB.queryRow<{
      id: number;
      name: string;
      emoji: string;
      group_name: string | null;
      is_active: boolean;
      sort_order: number;
      created_at: Date;
    }>`
      INSERT INTO routine_items (name, emoji, is_active, sort_order, group_name)
      VALUES (${req.name}, ${req.emoji}, ${req.isActive ?? true}, ${
        req.sortOrder ?? nextSortOrder
      }, ${req.groupName ?? null})
      RETURNING id, name, emoji, group_name, is_active, sort_order, created_at
    `;

    if (!row) {
      throw new Error("Failed to create routine item");
    }

    return {
      id: row.id,
      name: row.name,
      emoji: row.emoji,
      groupName: row.group_name || undefined,
      isActive: row.is_active,
      sortOrder: row.sort_order,
      createdAt: row.created_at,
    };
  },
);
