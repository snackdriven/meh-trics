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
      tier: string;
      emoji: string;
      label: string;
      notes: string | null;
      created_at: Date;
    }>`
      INSERT INTO mood_entries (date, tier, emoji, label, notes)
      VALUES (${req.date}, ${req.tier}, ${req.emoji}, ${req.label}, ${req.notes || null})
      ON CONFLICT (date)
      DO UPDATE SET tier = EXCLUDED.tier, emoji = EXCLUDED.emoji, label = EXCLUDED.label, notes = EXCLUDED.notes
      RETURNING id, date, tier, emoji, label, notes, created_at
    `;

    if (!row) {
      throw new Error("Failed to create mood entry");
    }

    return {
      id: row.id,
      date: row.date,
      tier: row.tier as any,
      emoji: row.emoji,
      label: row.label,
      notes: row.notes || undefined,
      createdAt: row.created_at,
    };
  }
);
