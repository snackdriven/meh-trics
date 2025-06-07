import { api } from "encore.dev/api";
import { taskDB } from "./db";
import type { CreateJournalEntryRequest, JournalEntry } from "./types";

/**
 * Creates or updates a journal entry for a specific date.
 *
 * @param req - Entry text, tags, and optional mood.
 * @returns The persisted journal entry.
 */
export const createJournalEntry = api<CreateJournalEntryRequest, JournalEntry>(
  { expose: true, method: "POST", path: "/journal-entries" },
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
      INSERT INTO journal_entries (date, text, tags, mood_id)
      VALUES (${req.date || null}, ${req.text}, ${req.tags || []}, ${req.moodId || null})
      RETURNING id, date, text, tags, mood_id, created_at, updated_at
    `;

    if (!row) {
      throw new Error("Failed to create journal entry");
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
  },
);
