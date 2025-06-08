import { APIError, api } from "encore.dev/api";
import type { Primitive } from "../primitive";
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
    const existing =
      await taskDB.queryRow`SELECT id FROM journal_entries WHERE id = ${req.id}`;

    if (!existing) {
      throw APIError.notFound("journal entry not found");
    }

    const updates: string[] = [];
    const values: Primitive[] = [];
    let paramIndex = 1;

    if (req.text !== undefined) {
      updates.push(`text = $${paramIndex++}`);
      values.push(req.text);
    }
    if (req.tags !== undefined) {
      updates.push(`tags = $${paramIndex++}`);
      values.push(req.tags);
    }
    if (req.moodId !== undefined) {
      updates.push(`mood_id = $${paramIndex++}`);
      values.push(req.moodId);
    }

    updates.push(`updated_at = NOW()`);
    values.push(req.id);

    const query = `
      UPDATE journal_entries
      SET ${updates.join(", ")}
      WHERE id = $${paramIndex}
      RETURNING id, date, text, tags, mood_id, created_at, updated_at
    `;

    const row = await taskDB.rawQueryRow<{
      id: number;
      date: Date | null;
      text: string;
      tags: string[];
      mood_id: number | null;
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
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  },
);
