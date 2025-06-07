import { APIError, api } from "encore.dev/api";
import { taskDB } from "./db";
import type { RoutineItem, UpdateRoutineItemRequest } from "./types";

/**
 * Updates an existing routine item.
 *
 * @param req - Partial routine item fields including id.
 * @returns The updated routine item.
 */
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
    const values: unknown[] = [];
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
    if (req.groupName !== undefined) {
      updates.push(`group_name = $${paramIndex++}`);
      values.push(req.groupName);
    }

    values.push(req.id);

    const query = `
      UPDATE routine_items
      SET ${updates.join(", ")}
      WHERE id = $${paramIndex}
      RETURNING id, name, emoji, group_name, is_active, sort_order, created_at
    `;

    const row = await taskDB.rawQueryRow<{
      id: number;
      name: string;
      emoji: string;
      group_name: string | null;
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
      groupName: row.group_name || undefined,
      isActive: row.is_active,
      sortOrder: row.sort_order,
      createdAt: row.created_at,
    };
  },
);
