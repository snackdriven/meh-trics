import { APIError, api } from "encore.dev/api";
import { buildUpdateQuery } from "../utils/buildUpdateQuery";
import { taskDB } from "./db";
import type { JournalEntry, UpdateJournalEntryRequest } from "./types";

/**
 * Updates fields on an existing journal entry.
 *
 * @param req - Entry id with new text, tags, or mood.
 * @returns The updated journal entry.
 */
export const updateJournalEntry = api<UpdateJournalEntryRequest, JournalEntry>(
  { expose: true, method: "PUT", path: "/journal-entries/:id" },
  async (req) => {
    const existing = await taskDB.queryRow`SELECT id FROM journal_entries WHERE id = ${req.id}`;

    if (!existing) {
      throw APIError.notFound("journal entry not found");
    }

    const { clause, values } = buildUpdateQuery({
      text: req.text,
      tags: req.tags,
      mood_id: req.moodId,
      task_id: req.taskId,
      habit_entry_id: req.habitEntryId,
    });
    values.push(req.id);

    const query = `
      UPDATE journal_entries
      SET ${clause}
      WHERE id = $${values.length}
      RETURNING id, date, text, tags, mood_id, task_id, habit_entry_id, created_at, updated_at
    `;

    const row = await taskDB.rawQueryRow<{
      id: number;
      date: Date | null;
      text: string;
      tags: string[];
      mood_id: number | null;
      task_id: number | null;
      habit_entry_id: number | null;
      created_at: Date;
      updated_at: Date;
    }>(query, ...values);

    if (!row) {
      throw new Error("Failed to update journal entry");
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
