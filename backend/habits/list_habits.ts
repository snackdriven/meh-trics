import { APIError, api } from "encore.dev/api";
import { habitDB } from "./db";
import type { Habit, HabitFrequency } from "./types";

interface ListHabitsResponse {
  habits: Habit[];
}

/**
 * Retrieves all habits, ordered by creation date.
 *
 * @returns List of habit definitions.
 */
export const listHabits = api<void, ListHabitsResponse>(
  { expose: true, method: "GET", path: "/habits" },
  async () => {
    const habits: Habit[] = [];

    try {
      for await (const row of habitDB.query<{
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
        SELECT id, name, emoji, description, frequency, target_count, start_date, end_date, created_at
        FROM habits
        ORDER BY created_at DESC
      `) {
        habits.push({
          id: row.id,
          name: row.name,
          emoji: row.emoji,
          description: row.description || undefined,
          frequency: row.frequency as HabitFrequency,
          targetCount: row.target_count,
          startDate: row.start_date,
          endDate: row.end_date || undefined,
          createdAt: row.created_at,
        });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("timeout establishing connection")) {
        throw APIError.internal(
          "database connection failed: ensure Postgres is running",
        );
      }
      throw err;
    }

    return { habits };
  },
);
