import { api } from "encore.dev/api";
import { taskDB } from "./db";
import type { RoutineItem } from "./types";

interface ListRoutineItemsResponse {
  items: RoutineItem[];
}

/**
 * Retrieves all routine items, ordered by sort order.
 *
 * @returns Routine item definitions.
 */
export const listRoutineItems = api<void, ListRoutineItemsResponse>(
  { expose: true, method: "GET", path: "/routine-items" },
  async () => {
    const items: RoutineItem[] = [];

    for await (const row of taskDB.query<{
      id: number;
      name: string;
      emoji: string;
      group_name: string | null;
      is_active: boolean;
      sort_order: number;
      created_at: Date;
    }>`
      SELECT id, name, emoji, group_name, is_active, sort_order, created_at
      FROM routine_items
      WHERE is_active = true
      ORDER BY sort_order ASC, created_at ASC
    `) {
      items.push({
        id: row.id,
        name: row.name,
        emoji: row.emoji,
        groupName: row.group_name || undefined,
        isActive: row.is_active,
        sortOrder: row.sort_order,
        createdAt: row.created_at,
      });
    }

    return { items };
  },
);
