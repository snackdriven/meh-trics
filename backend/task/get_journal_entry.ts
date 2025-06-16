import { api } from "encore.dev/api";
import { createJournalEntry } from "./create_journal_entry";
import { taskDB } from "./db";
import type { JournalEntry } from "./types";

interface GetJournalEntryParams {
  date: string;
}

/**
 * Retrieves a journal entry for a specific date.
 * Automatically creates a blank entry if none exists.
 *
 * @param req - Contains the requested date.
 * @returns The journal entry for that date.
 */
export const getJournalEntry = api<GetJournalEntryParams, JournalEntry>(
  { expose: true, method: "GET", path: "/journal-entries/date/:date" },
  async (req) => {
    const row = await taskDB.queryRow<{
      id: number;
      date: Date | null;
      text: string;
      tags: string[];
      mood_id: number | null;
      task_id: number | null;
      habit_entry_id: number | null;
      created_at: Date;
      updated_at: Date;
    }>`
      SELECT id, date, text, tags, mood_id, task_id, habit_entry_id, created_at, updated_at
      FROM journal_entries
      WHERE date = ${req.date}
      ORDER BY created_at DESC
      LIMIT 1
    `;

    if (!row) {
      // Automatically create a blank entry when none exists
      return await createJournalEntry({
        date: new Date(req.date),
        text: "",
        tags: [],
      });
    }

    return {
      id: row.id,
      date: row.date || undefined,
      text: row.text,
      tags: row.tags,
      moodId: row.mood_id || undefined,
      taskId: row.task_id || undefined,
      habitEntryId: row.habit_entry_id || undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
);
