import { APIError, api } from "encore.dev/api";
import { buildUpdateQuery } from "../utils/buildUpdateQuery";
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

    const { clause, values } = buildUpdateQuery({
      name: req.name,
      emoji: req.emoji,
      is_active: req.isActive,
      sort_order: req.sortOrder,
      group_name: req.groupName,
    });
    values.push(req.id);

    const query = `
      UPDATE routine_items
      SET ${clause}
      WHERE id = $${values.length}
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
