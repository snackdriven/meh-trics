import { APIError } from "encore.dev/api";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("encore.dev/api", () => ({
  api: (_opts: unknown, fn: unknown) => fn,
  APIError: {
    internal: vi.fn((message: string) => new Error(message)),
  },
}));
vi.mock("./db", () => ({
  habitDB: {
    query: vi.fn(),
  },
}));

import { habitDB } from "./db";
import { listHabits } from "./list_habits";
import type { Habit } from "./types";

describe("listHabits", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns empty list when no habits exist", async () => {
    const mockAsyncIterator = {
      async *[Symbol.asyncIterator]() {
        // Empty iterator
      },
    };
    (habitDB.query as ReturnType<typeof vi.fn>).mockReturnValueOnce(mockAsyncIterator);

    const result = await listHabits();

    expect(result).toEqual({ habits: [] });
    expect(habitDB.query).toHaveBeenCalledWith(
      expect.stringContaining(
        "SELECT id, name, emoji, description, frequency, target_count, start_date, end_date, created_at"
      )
    );
    expect(habitDB.query).toHaveBeenCalledWith(expect.stringContaining("ORDER BY created_at DESC"));
  });

  it("returns list of habits ordered by creation date", async () => {
    const now = new Date();
    const earlier = new Date(now.getTime() - 60 * 60 * 1000); // 1 hour earlier

    const mockHabits = [
      {
        id: 2,
        name: "Read Books",
        emoji: "📚",
        description: "Daily reading habit",
        frequency: "daily",
        target_count: 1,
        start_date: now,
        end_date: null,
        created_at: now,
      },
      {
        id: 1,
        name: "Exercise",
        emoji: "🏋️",
        description: null,
        frequency: "weekly",
        target_count: 3,
        start_date: earlier,
        end_date: null,
        created_at: earlier,
      },
    ];

    const mockAsyncIterator = {
      async *[Symbol.asyncIterator]() {
        for (const habit of mockHabits) {
          yield habit;
        }
      },
    };
    (habitDB.query as ReturnType<typeof vi.fn>).mockReturnValueOnce(mockAsyncIterator);

    const result = await listHabits();

    expect(result.habits).toHaveLength(2);
    expect(result.habits[0]).toEqual<Habit>({
      id: 2,
      name: "Read Books",
      emoji: "📚",
      description: "Daily reading habit",
      frequency: "daily",
      targetCount: 1,
      startDate: now,
      createdAt: now,
    });
    expect(result.habits[1]).toEqual<Habit>({
      id: 1,
      name: "Exercise",
      emoji: "🏋️",
      frequency: "weekly",
      targetCount: 3,
      startDate: earlier,
      createdAt: earlier,
    });
  });

  it("handles habits with end dates", async () => {
    const now = new Date();
    const endDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days later

    const mockHabits = [
      {
        id: 1,
        name: "30-Day Challenge",
        emoji: "💪",
        description: "Monthly fitness challenge",
        frequency: "daily",
        target_count: 1,
        start_date: now,
        end_date: endDate,
        created_at: now,
      },
    ];

    const mockAsyncIterator = {
      async *[Symbol.asyncIterator]() {
        for (const habit of mockHabits) {
          yield habit;
        }
      },
    };
    (habitDB.query as ReturnType<typeof vi.fn>).mockReturnValueOnce(mockAsyncIterator);

    const result = await listHabits();

    expect(result.habits).toHaveLength(1);
    expect(result.habits[0]).toEqual<Habit>({
      id: 1,
      name: "30-Day Challenge",
      emoji: "💪",
      description: "Monthly fitness challenge",
      frequency: "daily",
      targetCount: 1,
      startDate: now,
      endDate,
      createdAt: now,
    });
  });

  it("handles all frequency types", async () => {
    const now = new Date();
    const mockHabits = [
      {
        id: 1,
        name: "Daily Habit",
        emoji: "📅",
        description: null,
        frequency: "daily",
        target_count: 1,
        start_date: now,
        end_date: null,
        created_at: now,
      },
      {
        id: 2,
        name: "Weekly Habit",
        emoji: "📊",
        description: null,
        frequency: "weekly",
        target_count: 2,
        start_date: now,
        end_date: null,
        created_at: now,
      },
      {
        id: 3,
        name: "Monthly Habit",
        emoji: "📆",
        description: null,
        frequency: "monthly",
        target_count: 5,
        start_date: now,
        end_date: null,
        created_at: now,
      },
    ];

    const mockAsyncIterator = {
      async *[Symbol.asyncIterator]() {
        for (const habit of mockHabits) {
          yield habit;
        }
      },
    };
    (habitDB.query as ReturnType<typeof vi.fn>).mockReturnValueOnce(mockAsyncIterator);

    const result = await listHabits();

    expect(result.habits).toHaveLength(3);
    expect(result.habits[0].frequency).toBe("daily");
    expect(result.habits[1].frequency).toBe("weekly");
    expect(result.habits[2].frequency).toBe("monthly");
  });

  it("throws APIError for database connection timeout", async () => {
    const connectionError = new Error("timeout establishing connection");
    (habitDB.query as ReturnType<typeof vi.fn>).mockImplementationOnce(() => {
      throw connectionError;
    });

    await expect(listHabits()).rejects.toThrow(
      "database connection failed: ensure Postgres is running"
    );
    expect(APIError.internal).toHaveBeenCalledWith(
      "database connection failed: ensure Postgres is running"
    );
  });

  it("re-throws other database errors", async () => {
    const otherError = new Error("Some other database error");
    (habitDB.query as ReturnType<typeof vi.fn>).mockImplementationOnce(() => {
      throw otherError;
    });

    await expect(listHabits()).rejects.toThrow("Some other database error");
  });

  it("handles non-Error exceptions", async () => {
    const stringError = "String error message";
    (habitDB.query as ReturnType<typeof vi.fn>).mockImplementationOnce(() => {
      throw stringError;
    });

    await expect(listHabits()).rejects.toThrow(stringError);
  });

  it("converts null descriptions to undefined", async () => {
    const mockHabits = [
      {
        id: 1,
        name: "Habit with null description",
        emoji: "🎯",
        description: null,
        frequency: "daily",
        target_count: 1,
        start_date: new Date(),
        end_date: null,
        created_at: new Date(),
      },
    ];

    const mockAsyncIterator = {
      async *[Symbol.asyncIterator]() {
        for (const habit of mockHabits) {
          yield habit;
        }
      },
    };
    (habitDB.query as ReturnType<typeof vi.fn>).mockReturnValueOnce(mockAsyncIterator);

    const result = await listHabits();

    expect(result.habits[0].description).toBeUndefined();
  });
});
