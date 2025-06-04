import { api, APIError } from "encore.dev/api";
import { taskDB } from "./db";
import type { UpdateRoutineItemRequest, RoutineItem } from "./types";

// Updates an existing routine item.
export const updateRoutineItem = api<UpdateRoutineItemRequest, RoutineItem>(
  { expose: true, method: "PUT", path: "/routine-items/:id" },
  async (req) => {
    const existingItem = await taskDB.queryRow`
      SELECT id FROM routine_items WHERE id = ${req.id}
    `;

    if (!existingItem) {
      throw APIError.notFound("routine item not found");
    }

    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (req.name !== undefined) {
      updates.push(`name = $${paramIndex++}`);
      values.push(req.name);
    }
    if (req.emoji !== undefined) {
      updates.push(`emoji = $${paramIndex++}`);
      values.push(req.emoji);
    }
    if (req.isActive !== undefined) {
      updates.push(`is_active = $${paramIndex++}`);
      values.push(req.isActive);
    }
    if (req.sortOrder !== undefined) {
      updates.push(`sort_order = $${paramIndex++}`);
      values.push(req.sortOrder);
    }

    values.push(req.id);

    const query = `
      UPDATE routine_items
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING id, name, emoji, is_active, sort_order, created_at
    `;

    const row = await taskDB.rawQueryRow<{
      id: number;
      name: string;
      emoji: string;
      is_active: boolean;
      sort_order: number;
      created_at: Date;
    }>(query, ...values);

    if (!row) {
      throw new Error("Failed to update routine item");
    }

    return {
      id: row.id,
      name: row.name,
      emoji: row.emoji,
      isActive: row.is_active,
      sortOrder: row.sort_order,
      createdAt: row.created_at,
    };
  }
);
