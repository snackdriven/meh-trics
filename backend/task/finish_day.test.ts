import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('encore.dev/api', () => ({ api: (_opts: any, fn: any) => fn }));
vi.mock('./db', () => ({ taskDB: { query: vi.fn(), queryRow: vi.fn() } }));

import { finishDay } from './finish_day';
import { taskDB } from './db';

describe('finishDay', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('inserts missing entries and returns summary', async () => {
    (taskDB.query as any).mockResolvedValueOnce(null);
    (taskDB.queryRow as any).mockResolvedValueOnce({
      total: 3,
      completed: 2,
      incomplete: 1,
    });

    const result = await finishDay({ date: new Date('2025-06-10') });

    expect(taskDB.query).toHaveBeenCalled();
    expect(taskDB.queryRow).toHaveBeenCalled();
    expect(result).toEqual({ totalItems: 3, completed: 2, incomplete: 1 });
  });
});
