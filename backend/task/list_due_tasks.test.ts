import { type MockInstance, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("encore.dev/api", () => ({
  api: (_opts: unknown, fn: (...args: unknown[]) => unknown) => fn,
}));
vi.mock("./db", () => ({ taskDB: { rawQuery: vi.fn() } }));

import { taskDB } from "./db";
import { listDueTasks } from "./list_due_tasks";

describe("listDueTasks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns tasks due on date", async () => {
    const now = new Date();
    const mockRow = {
      id: 1,
      title: "Task",
      description: null,
      status: "todo",
      priority: 5,
      due_date: now,
      tags: ["a"],
      energy_level: "high",
      is_hard_deadline: false,
      sort_order: 1,
      archived_at: null,
      created_at: now,
      updated_at: now,
    };
    (taskDB.rawQuery as unknown as MockInstance).mockReturnValueOnce(
      (async function* () {
        yield mockRow;
      })()
    );

    const result = await listDueTasks({ date: "2025-01-01" });

    expect(taskDB.rawQuery).toHaveBeenCalled();
    expect(result.tasks[0]).toEqual({
      id: 1,
      title: "Task",
      description: undefined,
      status: "todo",
      priority: 5,
      dueDate: now,
      tags: ["a"],
      energyLevel: "high",
      isHardDeadline: false,
      sortOrder: 1,
      createdAt: now,
      updatedAt: now,
      archivedAt: undefined,
    });
  });

  it("includes tasks without a due date when requested", async () => {
    const now = new Date();
    const mockRow = {
      id: 2,
      title: "No due",
      description: null,
      status: "todo",
      priority: 3,
      due_date: null,
      tags: [],
      energy_level: null,
      is_hard_deadline: false,
      sort_order: 1,
      archived_at: null,
      created_at: now,
      updated_at: now,
    };

    (taskDB.rawQuery as unknown as MockInstance).mockReturnValueOnce(
      (async function* () {
        yield mockRow;
      })()
    );

    const result = await listDueTasks({
      date: "2025-01-01",
      includeNoDue: "true",
    });

    expect(taskDB.rawQuery).toHaveBeenCalled();
    expect(result.tasks[0]?.title).toBe("No due");
  });
});
