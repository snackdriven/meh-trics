import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("encore.dev/api", () => ({ api: (_opts: unknown, fn: unknown) => fn }));
vi.mock("./db", () => ({ taskDB: { queryRow: vi.fn() } }));

import { createRoutineItem } from "./create_routine_item";
import { taskDB } from "./db";
import type { CreateRoutineItemRequest, RoutineItem } from "./types";

describe("createRoutineItem", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates routine item with next sort order", async () => {
    const now = new Date();
    (taskDB.queryRow as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({ max_sort_order: 1 })
      .mockResolvedValueOnce({
        id: 2,
        name: "Stretch",
        emoji: "🤸",
        is_active: true,
        sort_order: 2,
        created_at: now,
      });

    const req: CreateRoutineItemRequest = { name: "Stretch", emoji: "🤸" };
    const item = await createRoutineItem(req);

    expect(
      (taskDB.queryRow as ReturnType<typeof vi.fn>).mock.calls.length,
    ).toBe(2);
    expect(item).toEqual<RoutineItem>({
      id: 2,
      name: "Stretch",
      emoji: "🤸",
      isActive: true,
      sortOrder: 2,
      createdAt: now,
    });
  });
});
