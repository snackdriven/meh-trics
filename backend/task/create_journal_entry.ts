import { api } from "encore.dev/api";
import { taskDB } from "./db";
import type { CreateJournalEntryRequest, JournalEntry } from "./types";

// Creates or updates a journal entry for a specific date.
export const createJournalEntry = api<CreateJournalEntryRequest, JournalEntry>(
  { expose: true, method: "POST", path: "/journal-entries" },
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
      INSERT INTO journal_entries (date, what_happened, what_i_need, small_win, what_felt_hard, thought_to_release)
      VALUES (${req.date}, ${req.whatHappened || null}, ${req.whatINeed || null}, ${req.smallWin || null}, ${req.whatFeltHard || null}, ${req.thoughtToRelease || null})
      ON CONFLICT (date)
      DO UPDATE SET 
        what_happened = EXCLUDED.what_happened,
        what_i_need = EXCLUDED.what_i_need,
        small_win = EXCLUDED.small_win,
        what_felt_hard = EXCLUDED.what_felt_hard,
        thought_to_release = EXCLUDED.thought_to_release,
        updated_at = NOW()
      RETURNING id, date, what_happened, what_i_need, small_win, what_felt_hard, thought_to_release, created_at, updated_at
    `;

    if (!row) {
      throw new Error("Failed to create journal entry");
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
