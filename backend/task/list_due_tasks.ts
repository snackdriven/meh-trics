import { api } from "encore.dev/api";
import type { Query } from "encore.dev/api";
import { taskDB } from "./db";
import { rowToTask } from "./mappers";
import type { Task } from "./types";

interface ListDueTasksParams {
  date?: Query<string>;
  includeOverdue?: Query<string>;
  includeNoDue?: Query<string>;
}

interface ListDueTasksResponse {
  tasks: Task[];
}

/**
 * Lists tasks due on a given date with optional overdue inclusion.
 * Can also include tasks that have no due date when `includeNoDue` is set.
 *
 * @param req - Date and filter flags.
 * @returns Tasks matching the due filter.
 */
export const listDueTasks = api<ListDueTasksParams, ListDueTasksResponse>(
  { expose: true, method: "GET", path: "/tasks/due" },
  async (req) => {
    const today = req.date ? new Date(req.date) : new Date();
    const dateStr = today.toISOString().split("T")[0];
    const includeOverdue = req.includeOverdue === "true";
    const includeNoDue = req.includeNoDue === "true";

    let query = `
      SELECT id, title, description, status, priority, due_date, tags, energy_level, is_hard_deadline, sort_order, archived_at, created_at, updated_at
      FROM tasks
      WHERE archived_at IS NULL
    `;
    const params: string[] = [];
    let paramIndex = 1;

    if (includeNoDue) {
      if (includeOverdue) {
        query += ` AND (due_date IS NULL OR due_date < ($${paramIndex++}::date + INTERVAL '1 day'))`;
      } else {
        query += ` AND (due_date IS NULL OR (due_date >= $${paramIndex}::date AND due_date < ($${paramIndex++}::date + INTERVAL '1 day')))`;
      }
      if (dateStr) {
        params.push(dateStr);
      }
    } else {
      query += ` AND due_date IS NOT NULL`;
      if (includeOverdue) {
        query += ` AND due_date < ($${paramIndex++}::date + INTERVAL '1 day')`;
      } else {
        query += ` AND due_date >= $${paramIndex}::date AND due_date < ($${paramIndex++}::date + INTERVAL '1 day')`;
      }
      if (dateStr) {
        params.push(dateStr);
      }
    }

    query += " ORDER BY priority DESC, created_at ASC";

    const tasks: Task[] = [];
    for await (const row of taskDB.rawQuery<Parameters<typeof rowToTask>[0]>(query, ...params)) {
      tasks.push(rowToTask(row));
    }

    return { tasks };
  }
);
