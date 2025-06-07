import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("encore.dev/api", () => ({ api: (_opts: unknown, fn: unknown) => fn }));
vi.mock("./db", () => ({ taskDB: { queryRow: vi.fn() } }));

import { taskDB } from "./db";
import { getAnalytics } from "./get_analytics";

describe("getAnalytics", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns aggregated counts", async () => {
    (taskDB.queryRow as ReturnType<typeof vi.fn>)
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
