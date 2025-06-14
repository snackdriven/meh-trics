import { api } from "encore.dev/api";
import { habitDB } from "../habits/db";
import type { CreateHabitEntryRequest, HabitEntry } from "../habits/types";

// Creates or updates a habit entry for a specific date.
export const createHabitEntry = api<CreateHabitEntryRequest, HabitEntry>(
  { expose: true, method: "POST", path: "/habit-entries" },
  async (req) => {
    const row = await habitDB.queryRow<{
      id: number;
      habit_id: number;
      date: Date;
      count: number;
      notes: string | null;
      created_at: Date;
    }>`
      INSERT INTO habit_entries (habit_id, date, count, notes)
      VALUES (${req.habitId}, ${req.date}, ${req.count || 1}, ${req.notes || null})
      ON CONFLICT (habit_id, date)
      DO UPDATE SET count = EXCLUDED.count, notes = EXCLUDED.notes
      RETURNING id, habit_id, date, count, notes, created_at
    `;

    if (!row) {
      throw new Error("Failed to create habit entry");
    }

    return {
      id: row.id,
      habitId: row.habit_id,
      date: row.date,
      count: row.count,
      notes: row.notes || undefined,
      createdAt: row.created_at,
    };
  }
);
