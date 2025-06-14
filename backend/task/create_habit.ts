import { api } from "encore.dev/api";
import { taskDB } from "./db";
import type { CreateHabitRequest, Habit } from "./types";

// Creates a new habit.
export const createHabit = api<CreateHabitRequest, Habit>(
  { expose: true, method: "POST", path: "/habits" },
  async (req) => {
    const row = await taskDB.queryRow<{
      id: number;
      name: string;
      emoji: string;
      description: string | null;
      frequency: string;
      target_count: number;
      start_date: Date;
      end_date: Date | null;
      created_at: Date;
    }>`
      INSERT INTO habits (name, emoji, description, frequency, target_count, start_date, end_date)
      VALUES (${req.name}, ${req.emoji}, ${req.description || null}, ${req.frequency}, ${req.targetCount || 1}, ${req.startDate}, ${req.endDate || null})
      RETURNING id, name, emoji, description, frequency, target_count, start_date, end_date, created_at
    `;

    if (!row) {
      throw new Error("Failed to create habit");
    }

    return {
      id: row.id,
      name: row.name,
      emoji: row.emoji,
      description: row.description || undefined,
      frequency: row.frequency as any,
      targetCount: row.target_count,
      startDate: row.start_date,
      endDate: row.end_date || undefined,
      createdAt: row.created_at,
    };
  }
);
