import { api } from "encore.dev/api";
import { taskDB } from "./db";
import { rowToTask } from "./mappers";
import type { CreateTaskRequest, Task } from "./types";
import { createAppError, ErrorCode, handleDatabaseError, validateRequiredFields, withErrorHandling } from "../utils/errors";

/**
 * Persists a new task to the database.
 *
 * Sort order is assigned based on the highest current order so
 * new tasks appear last.
 *
 * @param req - Task details to store.
 * @returns The newly created task.
 */
export const createTask = api<CreateTaskRequest, Task>(
  { expose: true, method: "POST", path: "/tasks" },
  async (req) => {
    return withErrorHandling(async () => {
      // Validate required fields
      validateRequiredFields(req, ["title"]);

      // Validate title length
      if (req.title.trim().length === 0) {
        throw createAppError(ErrorCode.INVALID_INPUT, "Task title cannot be empty");
      }

      if (req.title.length > 255) {
        throw createAppError(ErrorCode.INVALID_INPUT, "Task title cannot exceed 255 characters");
      }

      // Validate priority range
      if (req.priority !== undefined && (req.priority < 1 || req.priority > 5)) {
        throw createAppError(ErrorCode.INVALID_INPUT, "Priority must be between 1 and 5");
      }

      // Validate due date
      if (req.dueDate && req.dueDate < new Date(Date.now() - 24 * 60 * 60 * 1000)) {
        throw createAppError(ErrorCode.INVALID_INPUT, "Due date cannot be more than 1 day in the past");
      }

      // Get the highest sort order and add 1
      const maxSortOrderRow = await taskDB.queryRow<{
        max_sort_order: number | null;
      }>`
        SELECT MAX(sort_order) as max_sort_order FROM tasks
      `;
      const nextSortOrder = (maxSortOrderRow?.max_sort_order || 0) + 1;

      const row = await taskDB.queryRow<{
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
        created_at: Date;
        updated_at: Date;
      }>`
        INSERT INTO tasks (title, description, priority, due_date, tags, energy_level, is_hard_deadline, sort_order)
        VALUES (${req.title.trim()}, ${req.description?.trim() || null}, ${req.priority || 3}, ${req.dueDate || null}, ${req.tags || []}, ${req.energyLevel || null}, ${req.isHardDeadline || false}, ${nextSortOrder})
        RETURNING id, title, description, status, priority, due_date, tags, energy_level, is_hard_deadline, sort_order, archived_at, created_at, updated_at
      `;

      if (!row) {
        throw createAppError(ErrorCode.DATABASE_TRANSACTION_FAILED, "Failed to insert task record");
      }

      return rowToTask(row);
    }, "create task");
  },
);
