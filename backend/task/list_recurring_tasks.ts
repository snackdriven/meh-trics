import { api } from "encore.dev/api";
import { taskDB } from "./db";
import { rowToRecurringTask } from "./mappers";
import type { RecurringTask } from "./types";

interface ListRecurringTasksResponse {
  recurringTasks: RecurringTask[];
}

/**
 * Retrieves all active recurring tasks.
 *
 * @returns Recurring task templates currently active.
 */
export const listRecurringTasks = api<void, ListRecurringTasksResponse>(
  { expose: true, method: "GET", path: "/recurring-tasks" },
  async () => {
    const recurringTasks: RecurringTask[] = [];

    for await (const row of taskDB.query<
      Parameters<typeof rowToRecurringTask>[0]
    >`
      SELECT id, title, description, frequency, max_occurrences_per_cycle, priority, tags, energy_level, is_active, next_due_date, created_at
      FROM recurring_tasks
      WHERE is_active = true
      ORDER BY created_at DESC
    `) {
      recurringTasks.push(rowToRecurringTask(row));
    }

    return { recurringTasks };
  },
);
