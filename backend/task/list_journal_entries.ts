import { api } from "encore.dev/api";
import type { Query } from "encore.dev/api";
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
export const listJournalEntries = api<ListJournalEntriesParams, ListJournalEntriesResponse>(
  { expose: true, method: "GET", path: "/journal-entries" },
  async (req) => {
    let query = `
      SELECT id, date, text, tags, mood_id, task_id, habit_entry_id, created_at, updated_at
      FROM journal_entries
      WHERE 1=1
    `;
    const params: Array<Date | number> = [];
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

    query += " ORDER BY date DESC";

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
      task_id: number | null;
      habit_entry_id: number | null;
      created_at: Date;
      updated_at: Date;
    }>(query, ...params)) {
      entries.push({
        id: row.id,
        date: row.date || undefined,
        text: row.text,
        tags: row.tags,
        moodId: row.mood_id || undefined,
        taskId: row.task_id || undefined,
        habitEntryId: row.habit_entry_id || undefined,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      });
    }

    return { entries };
  }
);
