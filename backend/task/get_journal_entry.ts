import { api, APIError } from "encore.dev/api";
import { taskDB } from "./db";
import type { JournalEntry } from "./types";

interface GetJournalEntryParams {
  date: string;
}

// Retrieves a journal entry for a specific date.
export const getJournalEntry = api<GetJournalEntryParams, JournalEntry>(
  { expose: true, method: "GET", path: "/journal-entries/:date" },
  async (req) => {
    const row = await taskDB.queryRow<{
      id: number;
      date: Date | null;
      text: string;
      tags: string[];
      mood_id: number | null;
      created_at: Date;
      updated_at: Date;
    }>`
      SELECT id, date, text, tags, mood_id, created_at, updated_at
      FROM journal_entries
      WHERE date = ${req.date}
      ORDER BY created_at DESC
      LIMIT 1
    `;

    if (!row) {
      throw APIError.notFound("journal entry not found");
    }

    return {
      id: row.id,
      date: row.date || undefined,
      text: row.text,
      tags: row.tags,
      moodId: row.mood_id || undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
);
