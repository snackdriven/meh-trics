import { api } from "encore.dev/api";
import { taskDB } from "./db";
import type { Habit } from "./types";

interface ListHabitsResponse {
  habits: Habit[];
}

// Retrieves all habits, ordered by creation date (latest first).
export const listHabits = api<void, ListHabitsResponse>(
  { expose: true, method: "GET", path: "/habits" },
  async () => {
    const habits: Habit[] = [];
    
    for await (const row of taskDB.query<{
      id: number;
      name: string;
      description: string | null;
      frequency: string;
      target_count: number;
      start_date: Date;
      end_date: Date | null;
      created_at: Date;
    }>`
      SELECT id, name, description, frequency, target_count, start_date, end_date, created_at
      FROM habits
      ORDER BY created_at DESC
    `) {
      habits.push({
        id: row.id,
        name: row.name,
        description: row.description || undefined,
        frequency: row.frequency as any,
        targetCount: row.target_count,
        startDate: row.start_date,
        endDate: row.end_date || undefined,
        createdAt: row.created_at,
      });
    }

    return { habits };
  }
);
