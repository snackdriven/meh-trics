import { api } from "encore.dev/api";
import type { Query } from "encore.dev/api";
import { taskDB } from "./db";
import { hasSecondaryMoodColumns } from "./mood_schema";
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
  const includeSecondary = await hasSecondaryMoodColumns();
  let query = `
      SELECT id, date, tier, emoji, label${includeSecondary ? ",\n        secondary_tier, secondary_emoji, secondary_label" : ""},
        tags, notes, created_at
      FROM mood_entries
      WHERE 1=1
    `;
  const params: Array<Date> = [];
  let paramIndex = 1;

  if (req.startDate) {
    const parsed = new Date(req.startDate);
    if (!Number.isNaN(parsed.getTime())) {
      query += ` AND date >= $${paramIndex++}`;
      params.push(parsed);
    }
  }

  if (req.endDate) {
    const parsed = new Date(req.endDate);
    if (!Number.isNaN(parsed.getTime())) {
      query += ` AND date <= $${paramIndex++}`;
      params.push(parsed);
    }
  }

  query += " ORDER BY date DESC, created_at DESC";

  const entries: MoodEntry[] = [];

  for await (const row of taskDB.rawQuery<{
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
  }>(query, ...params)) {
    entries.push({
      id: row.id,
      date: row.date,
      tier: row.tier as MoodTier,
      emoji: row.emoji,
      label: row.label,
      secondaryTier: (row.secondary_tier as MoodTier | null) ?? undefined,
      secondaryEmoji: row.secondary_emoji || undefined,
      secondaryLabel: row.secondary_label || undefined,
      tags: row.tags || [],
      notes: row.notes || undefined,
      createdAt: row.created_at,
    });
  }

  return { entries };
});
