import { api } from "encore.dev/api";
import type { Query } from "encore.dev/api";
import { taskDB } from "./db";
import { rowToTask } from "./mappers";
import type { Task } from "./types";

interface ListTasksParams {
  status?: Query<string>;
  tags?: Query<string>;
  energyLevel?: Query<string>;
  startDate?: Query<string>;
  endDate?: Query<string>;
  archived?: Query<string>;
}

interface ListTasksResponse {
  tasks: Task[];
}

/**
 * Retrieves tasks with optional filtering by status, tags, energy level, and
 * due date range.
 *
 * @param req - Optional status, tag, energy, and date filter values.
 * @returns List of matching tasks.
 */
export const listTasks = api<ListTasksParams, ListTasksResponse>(
  { expose: true, method: "GET", path: "/tasks" },
  async (req) => {
    let query = `
      SELECT id, title, description, status, priority, due_date, tags, energy_level, is_hard_deadline, sort_order, archived_at, created_at, updated_at
      FROM tasks
      WHERE 1=1
    `;
    const params: Array<string | Date> = [];
    let paramIndex = 1;

    if (req.status) {
      query += ` AND status = $${paramIndex++}`;
      params.push(req.status);
    }

    if (req.tags) {
      query += ` AND $${paramIndex++} = ANY(tags)`;
      params.push(req.tags);
    }

    if (req.energyLevel) {
      query += ` AND energy_level = $${paramIndex++}`;
      params.push(req.energyLevel);
    }

    if (req.startDate) {
      const parsed = new Date(req.startDate);
      if (!Number.isNaN(parsed.getTime())) {
        query += ` AND due_date >= $${paramIndex++}`;
        params.push(parsed);
      }
    }

    if (req.endDate) {
      const parsed = new Date(req.endDate);
      if (!Number.isNaN(parsed.getTime())) {
        query += ` AND due_date <= $${paramIndex++}`;
        params.push(parsed);
      }
    }

    if (req.archived === "true") {
      query += " AND archived_at IS NOT NULL";
    } else {
      query += " AND archived_at IS NULL";
    }

    query += " ORDER BY sort_order ASC, created_at DESC";

    const tasks: Task[] = [];

    for await (const row of taskDB.rawQuery<Parameters<typeof rowToTask>[0]>(
      query,
      ...params,
    )) {
      tasks.push(rowToTask(row));
    }

    return { tasks };
  },
);
