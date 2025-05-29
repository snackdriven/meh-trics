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
      date: Date;
      what_happened: string | null;
      what_i_need: string | null;
      small_win: string | null;
      what_felt_hard: string | null;
      thought_to_release: string | null;
      created_at: Date;
      updated_at: Date;
    }>`
      SELECT id, date, what_happened, what_i_need, small_win, what_felt_hard, thought_to_release, created_at, updated_at
      FROM journal_entries
      WHERE date = ${req.date}
    `;

    if (!row) {
      throw APIError.notFound("journal entry not found");
    }

    return {
      id: row.id,
      date: row.date,
      whatHappened: row.what_happened || undefined,
      whatINeed: row.what_i_need || undefined,
      smallWin: row.small_win || undefined,
      whatFeltHard: row.what_felt_hard || undefined,
      thoughtToRelease: row.thought_to_release || undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
);
