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

// Retrieves journal entries with optional date range filtering.
export const listJournalEntries = api<ListJournalEntriesParams, ListJournalEntriesResponse>(
  { expose: true, method: "GET", path: "/journal-entries" },
  async (req) => {
    let query = `
      SELECT id, date, what_happened, what_i_need, small_win, what_felt_hard, thought_to_release, created_at, updated_at
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
      date: Date;
      what_happened: string | null;
      what_i_need: string | null;
      small_win: string | null;
      what_felt_hard: string | null;
      thought_to_release: string | null;
      created_at: Date;
      updated_at: Date;
    }>(query, ...params)) {
      entries.push({
        id: row.id,
        date: row.date,
        whatHappened: row.what_happened || undefined,
        whatINeed: row.what_i_need || undefined,
        smallWin: row.small_win || undefined,
        whatFeltHard: row.what_felt_hard || undefined,
        thoughtToRelease: row.thought_to_release || undefined,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      });
    }

    return { entries };
  }
);
