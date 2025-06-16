import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("encore.dev/api", () => ({ api: (_opts: unknown, fn: unknown) => fn }));
vi.mock("./db", () => ({ taskDB: { queryRow: vi.fn() } }));

import { createTask } from "./create_task";
import { taskDB } from "./db";
import type { CreateTaskRequest, Task } from "./types";

describe("createTask", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates task with incremented sort order", async () => {
    const now = new Date();
    (taskDB.queryRow as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({ max_sort_order: 0 })
      .mockResolvedValueOnce({
        id: 1,
        title: "hello",
        description: null,
        status: "todo",
        priority: 3,
        due_date: null,
        tags: [],
        energy_level: null,
        is_hard_deadline: false,
        sort_order: 1,
        created_at: now,
        updated_at: now,
      });

    const req: CreateTaskRequest = { title: "hello" };
    const task = await createTask(req);
    expect(task).toEqual<Task>({
      id: 1,
      title: "hello",
      description: undefined,
      status: "todo",
      priority: 3,
      dueDate: undefined,
      tags: [],
      energyLevel: undefined,
      isHardDeadline: false,
      sortOrder: 1,
      createdAt: now,
      updatedAt: now,
      archivedAt: undefined,
    });
    expect((taskDB.queryRow as ReturnType<typeof vi.fn>).mock.calls.length).toBe(2);
  });
});
