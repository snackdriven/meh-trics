import { api } from "encore.dev/api";
import { Query } from "encore.dev/api";
import { taskDB } from "./db";
import type { RoutineEntry } from "./types";

interface ListRoutineEntriesParams {
  date?: Query<string>;
  startDate?: Query<string>;
  endDate?: Query<string>;
}

interface ListRoutineEntriesResponse {
  entries: RoutineEntry[];
}

/**
 * Retrieves routine entries with optional date filtering.
 *
 * @param req - Single date or date range parameters.
 * @returns Routine entries matching the filter.
 */
export const listRoutineEntries = api<
  ListRoutineEntriesParams,
  ListRoutineEntriesResponse
>({ expose: true, method: "GET", path: "/routine-entries" }, async (req) => {
  let query = `
      SELECT id, routine_item_id, date, completed, created_at
      FROM routine_entries
      WHERE 1=1
    `;
  const params: any[] = [];
  let paramIndex = 1;

  if (req.date) {
    query += ` AND date = $${paramIndex++}`;
    params.push(req.date);
  } else {
    if (req.startDate) {
      query += ` AND date >= $${paramIndex++}`;
      params.push(req.startDate);
    }

    if (req.endDate) {
      query += ` AND date <= $${paramIndex++}`;
      params.push(req.endDate);
    }
  }

  query += ` ORDER BY date DESC, routine_item_id ASC`;

  const entries: RoutineEntry[] = [];

  for await (const row of taskDB.rawQuery<{
    id: number;
    routine_item_id: number;
    date: Date;
    completed: boolean;
    created_at: Date;
  }>(query, ...params)) {
    entries.push({
      id: row.id,
      routineItemId: row.routine_item_id,
      date: row.date,
      completed: row.completed,
      createdAt: row.created_at,
    });
  }

  return { entries };
});
