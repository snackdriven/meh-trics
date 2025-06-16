import { api } from "encore.dev/api";
import { moodDB } from "./db";

/**
 * Deletes a mood entry.
 *
 * @param req - Object containing the entry id.
 * @returns Nothing on success.
 */
export const deleteMoodEntry = api<{ id: number }, void>(
  { expose: true, method: "DELETE", path: "/mood-entries/:id" },
  async (req) => {
    await moodDB.exec`
      DELETE FROM mood_entries WHERE id = ${req.id}
    `;
  }
);
