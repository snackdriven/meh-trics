import { api, APIError } from "encore.dev/api";
import { taskDB } from "./db";

/**
 * Remove a task by id.
 *
 * PostgreSQL does not easily return the number of affected rows here so
 * errors are relied upon to indicate failure.
 */
export const deleteTask = api<{ id: number }, void>(
  { expose: true, method: "DELETE", path: "/tasks/:id" },
  async (req) => {
    const result = await taskDB.exec`
      DELETE FROM tasks WHERE id = ${req.id}
    `;
    
    // Note: PostgreSQL doesn't return affected rows count in this context
    // We'll assume the delete was successful if no error was thrown
  }
);
