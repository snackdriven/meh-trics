import { api } from "encore.dev/api";
import { taskDB } from "./db";
import type { CreateRoutineEntryRequest, RoutineEntry } from "./types";

/**
 * Creates or updates a routine entry for a specific date.
 *
 * @param req - Routine item id, date and completion state.
 * @returns The upserted routine entry.
 */
export const createRoutineEntry = api<CreateRoutineEntryRequest, RoutineEntry>(
  { expose: true, method: "POST", path: "/routine-entries" },
  async (req) => {
    const row = await taskDB.queryRow<{
      id: number;
      routine_item_id: number;
      date: Date;
      completed: boolean;
      created_at: Date;
    }>`
      INSERT INTO routine_entries (routine_item_id, date, completed)
      VALUES (${req.routineItemId}, ${req.date}, ${req.completed})
      ON CONFLICT (routine_item_id, date)
      DO UPDATE SET completed = EXCLUDED.completed
      RETURNING id, routine_item_id, date, completed, created_at
    `;

    if (!row) {
      throw new Error("Failed to create routine entry");
    }

    return {
      id: row.id,
      routineItemId: row.routine_item_id,
      date: row.date,
      completed: row.completed,
      createdAt: row.created_at,
    };
  }
);
