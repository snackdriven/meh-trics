import { api } from "encore.dev/api";
import { taskDB } from "./db";
import type { ReorderTasksRequest } from "./types";

/**
 * Update the sort order of tasks.
 *
 * The provided array of taskIds defines the new order; tasks are
 * updated inside a single transaction to ensure consistency.
 */
export const reorderTasks = api<ReorderTasksRequest, void>(
  { expose: true, method: "PUT", path: "/tasks/reorder" },
  async (req) => {
    // Use a transaction to ensure all updates happen atomically
    await taskDB.begin().then(async (tx) => {
      try {
        for (let i = 0; i < req.taskIds.length; i++) {
          await tx.exec`
            UPDATE tasks
            SET sort_order = ${i + 1}, updated_at = NOW()
            WHERE id = ${req.taskIds[i]}
          `;
        }
        await tx.commit();
      } catch (error) {
        await tx.rollback();
        throw error;
      }
    });
  }
);
