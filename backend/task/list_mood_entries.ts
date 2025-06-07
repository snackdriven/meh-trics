import { api } from "encore.dev/api";
import type { Query } from "encore.dev/api";
import { taskDB } from "./db";
import type { MoodEntry, MoodTier } from "./types";

interface ListMoodEntriesParams {
  startDate?: Query<string>;
  endDate?: Query<string>;
}

interface ListMoodEntriesResponse {
  entries: MoodEntry[];
}

/**
 * Retrieves mood entries with optional date range filtering.
 *
 * @param req - Optional start and end dates.
 * @returns Mood entries in the specified range.
 */
export const listMoodEntries = api<
  ListMoodEntriesParams,
  ListMoodEntriesResponse
>({ expose: true, method: "GET", path: "/mood-entries" }, async (req) => {
  let query = `
      SELECT id, date, tier, emoji, label, color, tags, notes, created_at
      FROM mood_entries
      WHERE 1=1
    `;
  const params: unknown[] = [];
  let paramIndex = 1;

  if (req.startDate) {
    query += ` AND date >= $${paramIndex++}`;
    params.push(req.startDate);
  }

  if (req.endDate) {
    query += ` AND date <= $${paramIndex++}`;
    params.push(req.endDate);
  }

  query += " ORDER BY date DESC, created_at DESC";

  const entries: MoodEntry[] = [];

  for await (const row of taskDB.rawQuery<{
    id: number;
    date: Date;
    tier: string;
    emoji: string;
    label: string;
    color: string | null;
    tags: string[] | null;
    notes: string | null;
    created_at: Date;
  }>(query, ...params)) {
    entries.push({
      id: row.id,
      date: row.date,
      tier: row.tier as MoodTier,
      emoji: row.emoji,
      label: row.label,
      color: row.color || undefined,
      tags: row.tags || [],
      notes: row.notes || undefined,
      createdAt: row.created_at,
    });
  }

  return { entries };
});
