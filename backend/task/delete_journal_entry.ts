import { api } from "encore.dev/api";
import { taskDB } from "./db";

export const deleteJournalEntry = api<{ id: number }, void>(
  { expose: true, method: "DELETE", path: "/journal-entries/:id" },
  async (req) => {
    await taskDB.exec`
      DELETE FROM journal_entries WHERE id = ${req.id}
    `;
  }
);
