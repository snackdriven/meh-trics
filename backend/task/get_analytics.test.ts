import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('encore.dev/api', () => ({ api: (_opts: any, fn: any) => fn }));
vi.mock('./db', () => ({ taskDB: { queryRow: vi.fn() } }));

import { getAnalytics } from './get_analytics';
import { taskDB } from './db';

describe('getAnalytics', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns aggregated counts', async () => {
    (taskDB.queryRow as any)
      .mockResolvedValueOnce({ count: 5 })
      .mockResolvedValueOnce({ count: 3 })
      .mockResolvedValueOnce({ count: 2 })
      .mockResolvedValueOnce({ count: 10 });

    const result = await getAnalytics();

    expect(taskDB.queryRow).toHaveBeenCalledTimes(4);
    expect(result).toEqual({
      totalTasks: 5,
      completedTasks: 3,
      habits: 2,
      moodEntries: 10,
    });
  });
});
