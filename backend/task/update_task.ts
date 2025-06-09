import { APIError, api } from "encore.dev/api";
import { buildUpdateQuery } from "../utils/buildUpdateQuery";
import { taskDB } from "./db";
import { rowToTask } from "./mappers";
import { getCycleEnd, getCycleStart, getNextCycleStart } from "./recurrence";
import type { Cycle } from "./recurrence";
import type { Task, UpdateTaskRequest } from "./types";

/**
 * Updates fields on an existing task.
 * Handles recurring task logic when marking tasks done.
 *
 * @param req - Partial task data including id.
 * @returns The updated task.
 */
export const updateTask = api<UpdateTaskRequest, Task>(
  { expose: true, method: "PUT", path: "/tasks/:id" },
  async (req) => {
    const existingTask = await taskDB.queryRow<{
      id: number;
      status: string;
      recurring_task_id: number | null;
    }>`
      SELECT id, status, recurring_task_id FROM tasks WHERE id = ${req.id}
    `;

    if (!existingTask) {
      throw APIError.notFound("task not found");
    }

    const { clause, values } = buildUpdateQuery({
      title: req.title,
      description: req.description,
      status: req.status,
      priority: req.priority,
      due_date: req.dueDate,
      tags: req.tags,
      energy_level: req.energyLevel,
      is_hard_deadline: req.isHardDeadline,
      sort_order: req.sortOrder,
      archived_at: req.archivedAt,
    });
    values.push(req.id);

    const query = `
      UPDATE tasks
      SET ${clause}
      WHERE id = $${values.length}
      RETURNING id, title, description, status, priority, due_date, tags, energy_level, is_hard_deadline, sort_order, archived_at, created_at, updated_at
    `;

    const row = await taskDB.rawQueryRow<{
      id: number;
      title: string;
      description: string | null;
      status: string;
      priority: number;
      due_date: Date | null;
      tags: string[];
      energy_level: string | null;
      is_hard_deadline: boolean;
      sort_order: number;
      archived_at: Date | null;
      created_at: Date;
      updated_at: Date;
    }>(query, ...values);

    if (!row) {
      throw new Error("Failed to update task");
    }

    if (
      req.status === "done" &&
      existingTask.status !== "done" &&
      existingTask.recurring_task_id
    ) {
      const rt = await taskDB.queryRow<{
        frequency: string;
        max_occurrences_per_cycle: number;
      }>`
        SELECT frequency, max_occurrences_per_cycle
        FROM recurring_tasks WHERE id = ${existingTask.recurring_task_id}
      `;
      if (rt) {
        const now = new Date();
        const start = getCycleStart(now, rt.frequency as Cycle);
        const end = getCycleEnd(now, rt.frequency as Cycle);
        const countRow = await taskDB.queryRow<{ count: number }>`
          SELECT COUNT(*) AS count FROM tasks
          WHERE recurring_task_id = ${existingTask.recurring_task_id}
            AND status = 'done'
            AND updated_at >= ${start}
            AND updated_at < ${end}
        `;
        const count = Number(countRow?.count || 0);
        if (count >= rt.max_occurrences_per_cycle) {
          const nextStart = getNextCycleStart(now, rt.frequency as Cycle);
          await taskDB.exec`
            UPDATE recurring_tasks SET next_due_date = ${nextStart}
            WHERE id = ${existingTask.recurring_task_id}
          `;
        }
      }
    }

    return rowToTask(row);
  },
);
