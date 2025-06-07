import { beforeEach, describe, expect, it, vi } from "vitest";

// biome-ignore lint/suspicious/noExplicitAny: test helper
vi.mock("encore.dev/api", () => ({ api: (_opts: any, fn: any) => fn }));

const exec = vi.fn();
const commit = vi.fn();
const rollback = vi.fn();

vi.mock("./db", () => ({
  taskDB: {
    begin: vi.fn(() => Promise.resolve({ exec, commit, rollback })),
  },
}));

import { taskDB } from "./db";
import { reorderTasks } from "./reorder_tasks";

import type { ReorderTasksRequest } from "./types";

describe("reorderTasks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("updates sort order starting from 1", async () => {
    const req: ReorderTasksRequest = { taskIds: [10, 20, 30] };

    await reorderTasks(req);

    expect(taskDB.begin).toHaveBeenCalled();
    expect(exec.mock.calls.length).toBe(3);
    expect(exec.mock.calls[0][1]).toBe(1);
    expect(exec.mock.calls[1][1]).toBe(2);
    expect(exec.mock.calls[2][1]).toBe(3);
    expect(commit).toHaveBeenCalled();
  });
});
