import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('encore.dev/api', () => ({ api: (_opts: any, fn: any) => fn }));
vi.mock('./db', () => ({ taskDB: { queryAll: vi.fn() } }));

import { exportData } from './export_data';
import { taskDB } from './db';

describe('exportData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns tasks, habits and mood entries', async () => {
    (taskDB.queryAll as any)
      .mockResolvedValueOnce([{ id: 1 }])
      .mockResolvedValueOnce([{ id: 2 }])
      .mockResolvedValueOnce([{ id: 3 }]);

    const result = await exportData();

    expect(taskDB.queryAll).toHaveBeenCalledTimes(3);
    expect(result).toEqual({
      tasks: [{ id: 1 }],
      habits: [{ id: 2 }],
      moodEntries: [{ id: 3 }],
    });
  });
});
