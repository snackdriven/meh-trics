import { vi, describe, it, expect, beforeEach } from "vitest";

vi.mock("encore.dev/api", () => ({ api: (_opts: any, fn: any) => fn }));
vi.mock("./db", () => ({ taskDB: { rawQuery: vi.fn() } }));

import { listTasks } from "./list_tasks";
import { taskDB } from "./db";

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
      created_at: now,
      updated_at: now,
    };
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
    expect(res.tasks[0].id).toBe(1);
  });

  it("ignores invalid dates", async () => {
    (taskDB.rawQuery as any).mockReturnValueOnce((async function* () {})());

    await listTasks({ startDate: "bad-date" });

    expect((taskDB.rawQuery as any).mock.calls[0].length).toBe(1);
  });
});
