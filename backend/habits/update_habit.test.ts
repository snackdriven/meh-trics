import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("encore.dev/api", () => ({ api: (_opts: unknown, fn: unknown) => fn }));
vi.mock("./db", () => ({
  habitDB: {
    queryRow: vi.fn(),
    rawQueryRow: vi.fn(),
  },
}));

import { habitDB } from "./db";
import type { Habit, UpdateHabitRequest } from "./types";
import { updateHabit } from "./update_habit";

describe("updateHabit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("clears end date when null", async () => {
    const now = new Date();
    (habitDB.queryRow as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      id: 1,
    });
    (habitDB.rawQueryRow as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      id: 1,
      name: "h",
      emoji: "🏋️",
      description: null,
      frequency: "daily",
      target_count: 1,
      start_date: now,
      end_date: null,
      created_at: now,
    });

    const req: UpdateHabitRequest = { id: 1, endDate: null };
    const habit = await updateHabit(req);

    expect(habitDB.rawQueryRow).toHaveBeenCalledWith(
      expect.any(String),
      null,
      1,
    );
    expect(habit).toEqual<Habit>({
      id: 1,
      name: "h",
      emoji: "🏋️",
      description: undefined,
      frequency: "daily",
      targetCount: 1,
      startDate: now,
      endDate: undefined,
      createdAt: now,
    });
  });
});
