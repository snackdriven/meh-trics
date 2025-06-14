import { beforeEach, describe, expect, it, vi } from "vitest";

// biome-ignore lint/suspicious/noExplicitAny: test helper
vi.mock("encore.dev/api", () => ({ api: (_opts: any, fn: any) => fn }));
vi.mock("./db", () => ({ taskDB: { rawQuery: vi.fn() } }));

import { taskDB } from "./db";
import { listTasks } from "./list_tasks";

describe("listTasks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("parses valid date params", async () => {
    const now = new Date();
    const row = {
      id: 1,
      title: "Task",
      description: null,
      status: "todo",
      priority: 3,
      due_date: now,
      tags: ["a"],
      energy_level: "high",
      is_hard_deadline: false,
      sort_order: 1,
      archived_at: null,
      created_at: now,
      updated_at: now,
    };
    // biome-ignore lint/suspicious/noExplicitAny: mocking
    (taskDB.rawQuery as any).mockReturnValueOnce(
      (async function* () {
        yield row;
      })(),
    );

    const start = now.toISOString();
    const res = await listTasks({ startDate: start, endDate: start });

    expect(taskDB.rawQuery).toHaveBeenCalledWith(
      expect.any(String),
      new Date(start),
      new Date(start),
    );
    expect(res.tasks[0].archivedAt).toBeUndefined();
  });

  it("ignores invalid dates", async () => {
    // biome-ignore lint/suspicious/noExplicitAny: mocking
    (taskDB.rawQuery as any).mockReturnValueOnce((async function* () {})());

    await listTasks({ startDate: "bad-date" });

    // biome-ignore lint/suspicious/noExplicitAny: mocking
    expect((taskDB.rawQuery as any).mock.calls[0].length).toBe(1);
  });
});
