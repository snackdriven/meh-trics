import { api } from "encore.dev/api";
import { taskDB } from "./db";
import type { CreateMoodEntryRequest, MoodEntry } from "./types";

// Creates or updates a mood entry for a specific date.
export const createMoodEntry = api<CreateMoodEntryRequest, MoodEntry>(
  { expose: true, method: "POST", path: "/mood-entries" },
  async (req) => {
    const row = await taskDB.queryRow<{
      id: number;
      date: Date;
      mood_score: number;
      notes: string | null;
      created_at: Date;
    }>`
      INSERT INTO mood_entries (date, mood_score, notes)
      VALUES (${req.date}, ${req.moodScore}, ${req.notes || null})
      ON CONFLICT (date)
      DO UPDATE SET mood_score = EXCLUDED.mood_score, notes = EXCLUDED.notes
      RETURNING id, date, mood_score, notes, created_at
    `;

    if (!row) {
      throw new Error("Failed to create mood entry");
    }

    return {
      id: row.id,
      date: row.date,
      moodScore: row.mood_score,
      notes: row.notes || undefined,
      createdAt: row.created_at,
    };
  }
);
