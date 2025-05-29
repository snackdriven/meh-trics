import { api } from "encore.dev/api";
import { Query } from "encore.dev/api";
import { taskDB } from "./db";
import type { MoodEntry } from "./types";

interface ListMoodEntriesParams {
  startDate?: Query<string>;
  endDate?: Query<string>;
}

interface ListMoodEntriesResponse {
  entries: MoodEntry[];
}

// Retrieves mood entries with optional date range filtering.
export const listMoodEntries = api<ListMoodEntriesParams, ListMoodEntriesResponse>(
  { expose: true, method: "GET", path: "/mood-entries" },
  async (req) => {
    let query = `
      SELECT id, date, tier, emoji, label, notes, created_at
      FROM mood_entries
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramIndex = 1;

    if (req.startDate) {
      query += ` AND date >= $${paramIndex++}`;
      params.push(req.startDate);
    }

    if (req.endDate) {
      query += ` AND date <= $${paramIndex++}`;
      params.push(req.endDate);
    }

    query += ` ORDER BY date DESC`;

    const entries: MoodEntry[] = [];
    
    for await (const row of taskDB.rawQuery<{
      id: number;
      date: Date;
      tier: string;
      emoji: string;
      label: string;
      notes: string | null;
      created_at: Date;
    }>(query, ...params)) {
      entries.push({
        id: row.id,
        date: row.date,
        tier: row.tier as any,
        emoji: row.emoji,
        label: row.label,
        notes: row.notes || undefined,
        createdAt: row.created_at,
      });
    }

    return { entries };
  }
);
