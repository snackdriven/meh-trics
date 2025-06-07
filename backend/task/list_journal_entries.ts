import { api } from "encore.dev/api";
import { Query } from "encore.dev/api";
import { taskDB } from "./db";
import type { JournalEntry } from "./types";

interface ListJournalEntriesParams {
  startDate?: Query<string>;
  endDate?: Query<string>;
  limit?: Query<number>;
}

interface ListJournalEntriesResponse {
  entries: JournalEntry[];
}

/**
 * Retrieves journal entries with optional date range filtering.
 *
 * @param req - Start/end dates and limit.
 * @returns Matching journal entries.
 */
export const listJournalEntries = api<
  ListJournalEntriesParams,
  ListJournalEntriesResponse
>({ expose: true, method: "GET", path: "/journal-entries" }, async (req) => {
  let query = `
      SELECT id, date, text, tags, mood_id, created_at, updated_at
      FROM journal_entries
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

  if (req.limit) {
    query += ` LIMIT $${paramIndex++}`;
    params.push(req.limit);
  }

  const entries: JournalEntry[] = [];

  for await (const row of taskDB.rawQuery<{
    id: number;
    date: Date | null;
    text: string;
    tags: string[];
    mood_id: number | null;
    created_at: Date;
    updated_at: Date;
  }>(query, ...params)) {
    entries.push({
      id: row.id,
      date: row.date || undefined,
      text: row.text,
      tags: row.tags,
      moodId: row.mood_id || undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    });
  }

  return { entries };
});
