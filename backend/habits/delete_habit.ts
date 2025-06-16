import { APIError, api } from "encore.dev/api";
import { habitDB } from "./db";

/**
 * Deletes a habit and its entries.
 *
 * @param req - Contains the habit id.
 * @returns Nothing if deletion succeeds.
 */
export const deleteHabit = api<{ id: number }, void>(
  { expose: true, method: "DELETE", path: "/habits/:id" },
  async (req) => {
    const result = await habitDB.exec`
      DELETE FROM habits WHERE id = ${req.id}
    `;

    // Note: PostgreSQL doesn't return affected rows count in this context
    // We'll assume the delete was successful if no error was thrown
  }
);
