import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("encore.dev/api", () => ({ api: (_opts: unknown, fn: unknown) => fn }));
vi.mock("./db", () => ({
  taskDB: {
    queryRow: vi.fn(),
    rawQueryRow: vi.fn(),
    exec: vi.fn(),
  },
}));

import { taskDB } from "./db";
import type { Task, UpdateTaskRequest } from "./types";
import { updateTask } from "./update_task";

describe("updateTask", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("clears due date when null", async () => {
    const now = new Date();
    (taskDB.queryRow as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      id: 1,
      status: "todo",
      recurring_task_id: null,
    });
    (taskDB.rawQueryRow as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      id: 1,
      title: "t",
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

    const req: UpdateTaskRequest = { id: 1, dueDate: null };
    const task = await updateTask(req);

    expect(taskDB.rawQueryRow).toHaveBeenCalledWith(
      expect.any(String),
      null,
      1,
    );
    expect(task).toEqual<Task>({
      id: 1,
      title: "t",
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
  });
});
