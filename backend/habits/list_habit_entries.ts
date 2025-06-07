import { api } from "encore.dev/api";
import { Query } from "encore.dev/api";
import { habitDB } from "./db";
import type { HabitEntry } from "../task/types";

interface ListHabitEntriesParams {
  habitId?: Query<number>;
  startDate?: Query<string>;
  endDate?: Query<string>;
}

interface ListHabitEntriesResponse {
  entries: HabitEntry[];
}

/**
 * Retrieves habit entries with optional filtering by habit ID and date range.
 *
 * @param req - Filters for habit id and date range.
 * @returns Matching habit entries.
 */
export const listHabitEntries = api<
  ListHabitEntriesParams,
  ListHabitEntriesResponse
>({ expose: true, method: "GET", path: "/habit-entries" }, async (req) => {
  let query = `
      SELECT id, habit_id, date, count, notes, created_at
      FROM habit_entries
      WHERE 1=1
    `;
  const params: any[] = [];
  let paramIndex = 1;

  if (req.habitId) {
    query += ` AND habit_id = $${paramIndex++}`;
    params.push(req.habitId);
  }

  if (req.startDate) {
    query += ` AND date >= $${paramIndex++}`;
    params.push(req.startDate);
  }

  if (req.endDate) {
    query += ` AND date <= $${paramIndex++}`;
    params.push(req.endDate);
  }

  query += ` ORDER BY date DESC`;

  const entries: HabitEntry[] = [];

  for await (const row of habitDB.rawQuery<{
    id: number;
    habit_id: number;
    date: Date;
    count: number;
    notes: string | null;
    created_at: Date;
  }>(query, ...params)) {
    entries.push({
      id: row.id,
      habitId: row.habit_id,
      date: row.date,
      count: row.count,
      notes: row.notes || undefined,
      createdAt: row.created_at,
    });
  }

  return { entries };
});
