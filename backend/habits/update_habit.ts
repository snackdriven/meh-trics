import { APIError, api } from "encore.dev/api";
import type { Primitive } from "../primitive";
import type { Habit, HabitFrequency, UpdateHabitRequest } from "../task/types";
import { habitDB } from "./db";

/**
 * Updates fields on an existing habit.
 *
 * @param req - Partial habit data including the id.
 * @returns The updated habit.
 */
export const updateHabit = api<UpdateHabitRequest, Habit>(
  { expose: true, method: "PUT", path: "/habits/:id" },
  async (req) => {
    const existingHabit = await habitDB.queryRow`
      SELECT id FROM habits WHERE id = ${req.id}
    `;

    if (!existingHabit) {
      throw APIError.notFound("habit not found");
    }

    const updates: string[] = [];
    const values: Primitive[] = [];
    let paramIndex = 1;

    if (req.name !== undefined) {
      updates.push(`name = $${paramIndex++}`);
      values.push(req.name);
    }
    if (req.emoji !== undefined) {
      updates.push(`emoji = $${paramIndex++}`);
      values.push(req.emoji);
    }
    if (req.description !== undefined) {
      updates.push(`description = $${paramIndex++}`);
      values.push(req.description);
    }
    if (req.frequency !== undefined) {
      updates.push(`frequency = $${paramIndex++}`);
      values.push(req.frequency);
    }
    if (req.targetCount !== undefined) {
      updates.push(`target_count = $${paramIndex++}`);
      values.push(req.targetCount);
    }
    if (req.startDate !== undefined) {
      updates.push(`start_date = $${paramIndex++}`);
      values.push(req.startDate);
    }
    if (req.endDate !== undefined) {
      updates.push(`end_date = $${paramIndex++}`);
      values.push(req.endDate);
    }

    values.push(req.id);

    const query = `
      UPDATE habits 
      SET ${updates.join(", ")}
      WHERE id = $${paramIndex}
      RETURNING id, name, emoji, description, frequency, target_count, start_date, end_date, created_at
    `;

    const row = await habitDB.rawQueryRow<{
      id: number;
      name: string;
      emoji: string;
      description: string | null;
      frequency: string;
      target_count: number;
      start_date: Date;
      end_date: Date | null;
      created_at: Date;
    }>(query, ...values);

    if (!row) {
      throw new Error("Failed to update habit");
    }

    return {
      id: row.id,
      name: row.name,
      emoji: row.emoji,
      description: row.description || undefined,
      frequency: row.frequency as HabitFrequency,
      targetCount: row.target_count,
      startDate: row.start_date,
      endDate: row.end_date || undefined,
      createdAt: row.created_at,
    };
  },
);
