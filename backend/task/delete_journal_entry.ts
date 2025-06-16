import { api } from "encore.dev/api";
import { taskDB } from "./db";

/**
 * Deletes a journal entry.
 *
 * @param req - Object containing the entry id.
 * @returns Nothing on success.
 */
export const deleteJournalEntry = api<{ id: number }, void>(
  { expose: true, method: "DELETE", path: "/journal-entries/:id" },
  async (req) => {
    await taskDB.exec`
      DELETE FROM journal_entries WHERE id = ${req.id}
    `;
  }
);
