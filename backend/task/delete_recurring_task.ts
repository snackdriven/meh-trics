import { api, APIError } from "encore.dev/api";
import { taskDB } from "./db";

// Deletes a recurring task template.
export const deleteRecurringTask = api<{ id: number }, void>(
  { expose: true, method: "DELETE", path: "/recurring-tasks/:id" },
  async (req) => {
    const result = await taskDB.exec`
      DELETE FROM recurring_tasks WHERE id = ${req.id}
    `;
    
    // Note: PostgreSQL doesn't return affected rows count in this context
    // We'll assume the delete was successful if no error was thrown
  }
);
