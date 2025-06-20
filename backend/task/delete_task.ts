import { api } from "encore.dev/api";
import { taskDB } from "./db";

/**
 * Removes a task by id.
 *
 * PostgreSQL does not easily return the number of affected rows here so
 * errors are relied upon to indicate failure.
 *
 * @param req - Contains the task id.
 * @returns Nothing on success.
 */
export const deleteTask = api<{ id: number }, void>(
  { expose: true, method: "DELETE", path: "/tasks/:id" },
  async (req) => {
    const _result = await taskDB.exec`
      DELETE FROM tasks WHERE id = ${req.id}
    `;

    // Note: PostgreSQL doesn't return affected rows count in this context
    // We'll assume the delete was successful if no error was thrown
  }
);
