import { api } from "encore.dev/api";
import { taskDB } from "./db";
import type { CreateMoodEntryRequest, MoodEntry, MoodTier } from "./types";

// Creates a mood entry for a specific date.
export const createMoodEntry = api<CreateMoodEntryRequest, MoodEntry>(
  { expose: true, method: "POST", path: "/mood-entries" },
  async (req) => {
    const row = await taskDB.queryRow<{
      id: number;
      date: Date;
      tier: string;
      emoji: string;
      label: string;
      color: string | null;
      tags: string[] | null;
      notes: string | null;
      created_at: Date;
    }>`
      INSERT INTO mood_entries (date, tier, emoji, label, color, tags, notes)
      VALUES (
        ${req.date},
        ${req.tier},
        ${req.emoji},
        ${req.label},
        ${req.color || null},
        ${req.tags || []},
        ${req.notes || null}
      )
      RETURNING id, date, tier, emoji, label, color, tags, notes, created_at
    `;

    if (!row) {
      throw new Error("Failed to create mood entry");
    }

    return {
      id: row.id,
      date: row.date,
      tier: row.tier as MoodTier,
      emoji: row.emoji,
      label: row.label,
      color: row.color || undefined,
      tags: row.tags || [],
      notes: row.notes || undefined,
      createdAt: row.created_at,
    };
  },
);
