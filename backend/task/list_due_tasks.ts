import { api } from 'encore.dev/api';
import { Query } from 'encore.dev/api';
import { taskDB } from './db';
import type { Task } from './types';

interface ListDueTasksParams {
  date?: Query<string>;
  includeOverdue?: Query<string>;
}

interface ListDueTasksResponse {
  tasks: Task[];
}

/**
 * Lists tasks due on a given date with optional overdue inclusion.
 *
 * @param req - Date and includeOverdue flag.
 * @returns Tasks matching the due filter.
 */
export const listDueTasks = api<ListDueTasksParams, ListDueTasksResponse>(
  { expose: true, method: 'GET', path: '/tasks/due' },
  async (req) => {
    const today = req.date ? new Date(req.date) : new Date();
    const dateStr = today.toISOString().split('T')[0];
    const includeOverdue = req.includeOverdue === 'true';

    let query = `
      SELECT id, title, description, status, priority, due_date, tags, energy_level, is_hard_deadline, sort_order, created_at, updated_at
      FROM tasks
      WHERE due_date IS NOT NULL
    `;
    const params: any[] = [];
    let paramIndex = 1;

    if (includeOverdue) {
      query += ` AND due_date < ($${paramIndex++}::date + INTERVAL '1 day')`;
    } else {
      query += ` AND due_date >= $${paramIndex}::date AND due_date < ($${paramIndex++}::date + INTERVAL '1 day')`;
    }
    params.push(dateStr);

    query += ` ORDER BY priority DESC, created_at ASC`;

    const tasks: Task[] = [];
    for await (const row of taskDB.rawQuery<{
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
    }>(query, ...params)) {
      tasks.push({
        id: row.id,
        title: row.title,
        description: row.description || undefined,
        status: row.status as any,
        priority: row.priority as any,
        dueDate: row.due_date || undefined,
        tags: row.tags,
        energyLevel: row.energy_level as any,
        isHardDeadline: row.is_hard_deadline,
        sortOrder: row.sort_order,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      });
    }

    return { tasks };
  },
);
