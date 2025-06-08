import { api } from "encore.dev/api";
import { taskDB } from "./db";
import { hasSecondaryMoodColumns } from "./mood_schema";
import type { CreateMoodEntryRequest, MoodEntry, MoodTier } from "./types";

/**
 * Creates a mood entry for a specific date.
 *
 * @param req - Mood metadata including tier and notes.
 * @returns The saved mood entry.
 */
export const createMoodEntry = api<CreateMoodEntryRequest, MoodEntry>(
  { expose: true, method: "POST", path: "/mood-entries" },
  async (req) => {
    const includeSecondary = await hasSecondaryMoodColumns();
    const row = await taskDB.queryRow<{
      id: number;
      date: Date;
      tier: string;
      emoji: string;
      label: string;
      secondary_tier?: string | null;
      secondary_emoji?: string | null;
      secondary_label?: string | null;
      tags: string[] | null;
      notes: string | null;
      created_at: Date;
    }>(
      `INSERT INTO mood_entries (
        date,
        tier,
        emoji,
        label,
        tags,
        notes${includeSecondary ? ",\n        secondary_tier,\n        secondary_emoji,\n        secondary_label" : ""}
      ) VALUES (
        ${req.date},
        ${req.tier},
        ${req.emoji},
        ${req.label},
        ${req.tags || []},
        ${req.notes || null}${includeSecondary ? `,\n        ${req.secondaryTier || null},\n        ${req.secondaryEmoji || null},\n        ${req.secondaryLabel || null}` : ""}
      ) RETURNING
        id,
        date,
        tier,
        emoji,
        label${includeSecondary ? ",\n        secondary_tier,\n        secondary_emoji,\n        secondary_label" : ""},
        tags,
        notes,
        created_at`,
    );

    if (!row) {
      throw new Error("Failed to create mood entry");
    }

    return {
      id: row.id,
      date: row.date,
      tier: row.tier as MoodTier,
      emoji: row.emoji,
      label: row.label,
      tags: row.tags || [],
      secondaryTier: (row.secondary_tier as MoodTier | null) ?? undefined,
      secondaryEmoji: row.secondary_emoji || undefined,
      secondaryLabel: row.secondary_label || undefined,
      notes: row.notes || undefined,
      createdAt: row.created_at,
    };
  },
);
