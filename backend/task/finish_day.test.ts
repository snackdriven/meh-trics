import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("encore.dev/api", () => ({ api: (_opts: unknown, fn: unknown) => fn }));
vi.mock("./db", () => ({ taskDB: { query: vi.fn(), queryRow: vi.fn() } }));

import { taskDB } from "./db";
import { finishDay } from "./finish_day";

describe("finishDay", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("inserts missing entries and returns summary", async () => {
    (taskDB.query as ReturnType<typeof vi.fn>).mockResolvedValueOnce(null);
    (taskDB.queryRow as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      total: 3,
      completed: 2,
      incomplete: 1,
    });

    const result = await finishDay({ date: new Date("2025-06-10") });

    expect(taskDB.query).toHaveBeenCalled();
    expect(taskDB.queryRow).toHaveBeenCalled();
    expect(result).toEqual({ totalItems: 3, completed: 2, incomplete: 1 });
  });
});
