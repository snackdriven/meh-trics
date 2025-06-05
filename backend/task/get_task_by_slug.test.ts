import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('encore.dev/api', () => ({ api: (_opts: any, fn: any) => fn }));
vi.mock('./db', () => ({ taskDB: { queryRow: vi.fn() } }));

import { getTaskBySlug } from './get_task_by_slug';
import { taskDB } from './db';
import type { Task } from './types';

describe('getTaskBySlug', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns the task matching slug', async () => {
    const now = new Date();
    (taskDB.queryRow as any).mockResolvedValue({
      id: 1,
      title: 'Test Task',
      slug: 'test-task',
      description: null,
      status: 'todo',
      priority: 3,
      due_date: null,
      tags: [],
      energy_level: null,
      is_hard_deadline: false,
      sort_order: 1,
      recurring_task_id: null,
      created_at: now,
      updated_at: now,
    });

    const task = await getTaskBySlug({ slug: 'test-task' });
    expect(task).toEqual<Task>({
      id: 1,
      title: 'Test Task',
      slug: 'test-task',
      description: undefined,
      status: 'todo',
      priority: 3,
      dueDate: undefined,
      tags: [],
      energyLevel: undefined,
      isHardDeadline: false,
      sortOrder: 1,
      recurringTaskId: undefined,
      createdAt: now,
      updatedAt: now,
    });
  });
});
