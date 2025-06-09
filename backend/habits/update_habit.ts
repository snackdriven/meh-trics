import { APIError, api } from "encore.dev/api";
import { habitDB } from "./db";
import type { Habit, HabitFrequency, UpdateHabitRequest } from "./types";
import { buildUpdateQuery } from "../utils/buildUpdateQuery";

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

    const { clause, values } = buildUpdateQuery({
      name: req.name,
      emoji: req.emoji,
      description: req.description,
      frequency: req.frequency,
      target_count: req.targetCount,
      start_date: req.startDate,
      end_date: req.endDate,
    });
    values.push(req.id);

    const query = `
      UPDATE habits
      SET ${clause}
      WHERE id = $${values.length}
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
