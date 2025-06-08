import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("encore.dev/api", () => ({ api: (_opts: unknown, fn: unknown) => fn }));
vi.mock("./db", () => ({ taskDB: { queryRow: vi.fn() } }));
vi.mock("../habits/db", () => ({ habitDB: { queryRow: vi.fn() } }));

import { habitDB } from "../habits/db";
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
      .mockResolvedValueOnce({ count: 10 });
    (habitDB.queryRow as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      count: 2,
    });

    const result = await getAnalytics();

    expect(taskDB.queryRow).toHaveBeenCalledTimes(3);
    expect(habitDB.queryRow).toHaveBeenCalledTimes(1);
    expect(result).toEqual({
      totalTasks: 5,
      completedTasks: 3,
      habits: 2,
      moodEntries: 10,
    });
  });
});
