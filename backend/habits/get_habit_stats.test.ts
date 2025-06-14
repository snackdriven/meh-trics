import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("encore.dev/api", () => ({ api: (_opts: unknown, fn: unknown) => fn }));
vi.mock("./db", () => ({
  habitDB: {
    queryRow: vi.fn(),
    queryAll: vi.fn(),
  },
}));

import { habitDB } from "./db";
import { getHabitStats } from "./get_habit_stats";
import type { HabitStats } from "./types";

describe("getHabitStats", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock current date to be consistent
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2023-06-15T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("calculates stats for a daily habit with perfect streak", async () => {
    const startDate = new Date('2023-06-10');
    const mockHabit = {
      id: 1,
      frequency: "daily",
      target_count: 1,
      start_date: startDate,
    };

    const mockEntries = [
      { date: new Date('2023-06-15'), count: 1 }, // today
      { date: new Date('2023-06-14'), count: 1 },
      { date: new Date('2023-06-13'), count: 1 },
      { date: new Date('2023-06-12'), count: 1 },
      { date: new Date('2023-06-11'), count: 1 },
      { date: new Date('2023-06-10'), count: 1 }, // start date
    ];

    (habitDB.queryRow as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockHabit);
    (habitDB.queryAll as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockEntries);

    const result = await getHabitStats({ habitId: 1 });

    expect(result).toEqual<HabitStats>({
      habitId: 1,
      currentStreak: 6,
      longestStreak: 6,
      totalCompletions: 6,
      completionRate: 100,
      recentEntries: mockEntries.map(e => ({
        date: e.date,
        completed: true,
        count: e.count,
      })),
    });
  });

  it("calculates stats for a daily habit with broken streak", async () => {
    const startDate = new Date('2023-06-10');
    const mockHabit = {
      id: 1,
      frequency: "daily",
      target_count: 1,
      start_date: startDate,
    };

    const mockEntries = [
      { date: new Date('2023-06-15'), count: 1 }, // today
      { date: new Date('2023-06-14'), count: 1 },
      // missing 2023-06-13 - breaks current streak
      { date: new Date('2023-06-12'), count: 1 },
      { date: new Date('2023-06-11'), count: 1 },
      { date: new Date('2023-06-10'), count: 1 }, // start date
    ];

    (habitDB.queryRow as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockHabit);
    (habitDB.queryAll as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockEntries);

    const result = await getHabitStats({ habitId: 1 });

    expect(result.currentStreak).toBe(2); // Only 14th and 15th
    expect(result.longestStreak).toBe(3); // 10th, 11th, 12th
    expect(result.totalCompletions).toBe(5);
    expect(result.completionRate).toBe(83.33); // 5/6 days = 83.33%
  });

  it("calculates stats for a weekly habit", async () => {
    const startDate = new Date('2023-06-01');
    const mockHabit = {
      id: 2,
      frequency: "weekly",
      target_count: 1,
      start_date: startDate,
    };

    const mockEntries = [
      { date: new Date('2023-06-15'), count: 1 }, // week 3
      { date: new Date('2023-06-08'), count: 1 }, // week 2
      { date: new Date('2023-06-01'), count: 1 }, // week 1
    ];

    (habitDB.queryRow as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockHabit);
    (habitDB.queryAll as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockEntries);

    const result = await getHabitStats({ habitId: 2 });

    expect(result.currentStreak).toBe(3);
    expect(result.longestStreak).toBe(3);
    expect(result.totalCompletions).toBe(3);
    // For weekly habits, expected completions = Math.floor(daysSinceStart / 7) + 1
    // 15 days since start = Math.floor(15/7) + 1 = 3 weeks
    expect(result.completionRate).toBe(100);
  });

  it("calculates stats for a monthly habit", async () => {
    const startDate = new Date('2023-04-15');
    const mockHabit = {
      id: 3,
      frequency: "monthly",
      target_count: 2,
      start_date: startDate,
    };

    const mockEntries = [
      { date: new Date('2023-06-10'), count: 3 }, // month 2, exceeds target
      { date: new Date('2023-05-20'), count: 1 }, // month 2, below target
      { date: new Date('2023-04-20'), count: 2 }, // month 1, meets target
    ];

    (habitDB.queryRow as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockHabit);
    (habitDB.queryAll as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockEntries);

    const result = await getHabitStats({ habitId: 3 });

    expect(result.totalCompletions).toBe(2); // Only entries with count >= target_count
    expect(result.recentEntries).toEqual([
      { date: new Date('2023-06-10'), completed: true, count: 3 },
      { date: new Date('2023-05-20'), completed: false, count: 1 },
      { date: new Date('2023-04-20'), completed: true, count: 2 },
    ]);
  });

  it("handles habit with no entries", async () => {
    const startDate = new Date('2023-06-10');
    const mockHabit = {
      id: 4,
      frequency: "daily",
      target_count: 1,
      start_date: startDate,
    };

    (habitDB.queryRow as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockHabit);
    (habitDB.queryAll as ReturnType<typeof vi.fn>).mockResolvedValueOnce([]);

    const result = await getHabitStats({ habitId: 4 });

    expect(result).toEqual<HabitStats>({
      habitId: 4,
      currentStreak: 0,
      longestStreak: 0,
      totalCompletions: 0,
      completionRate: 0,
      recentEntries: [],
    });
  });

  it("handles habit not found", async () => {
    (habitDB.queryRow as ReturnType<typeof vi.fn>).mockResolvedValueOnce(null);

    await expect(getHabitStats({ habitId: 999 })).rejects.toThrow("Habit not found");
  });

  it("handles string dates from database", async () => {
    const startDate = "2023-06-10";
    const mockHabit = {
      id: 1,
      frequency: "daily",
      target_count: 1,
      start_date: startDate, // String date
    };

    const mockEntries = [
      { date: "2023-06-15", count: 1 }, // String date
      { date: "2023-06-14", count: 1 },
    ];

    (habitDB.queryRow as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockHabit);
    (habitDB.queryAll as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockEntries);

    const result = await getHabitStats({ habitId: 1 });

    expect(result.currentStreak).toBe(2);
    expect(result.recentEntries[0]?.date).toEqual(new Date("2023-06-15"));
    expect(result.recentEntries[1]?.date).toEqual(new Date("2023-06-14"));
  });

  it("limits recent entries to 30", async () => {
    const startDate = new Date('2023-01-01');
    const mockHabit = {
      id: 1,
      frequency: "daily",
      target_count: 1,
      start_date: startDate,
    };

    // Create 50 entries
    const mockEntries = [];
    for (let i = 0; i < 50; i++) {
      const date = new Date('2023-06-15');
      date.setDate(date.getDate() - i);
      mockEntries.push({ date, count: 1 });
    }

    (habitDB.queryRow as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockHabit);
    (habitDB.queryAll as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockEntries);

    const result = await getHabitStats({ habitId: 1 });

    expect(result.recentEntries).toHaveLength(30);
  });

  it("handles habits with target count > 1", async () => {
    const startDate = new Date('2023-06-10');
    const mockHabit = {
      id: 1,
      frequency: "daily",
      target_count: 3,
      start_date: startDate,
    };

    const mockEntries = [
      { date: new Date('2023-06-15'), count: 5 }, // exceeds target
      { date: new Date('2023-06-14'), count: 3 }, // meets target
      { date: new Date('2023-06-13'), count: 2 }, // below target
      { date: new Date('2023-06-12'), count: 3 }, // meets target
    ];

    (habitDB.queryRow as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockHabit);
    (habitDB.queryAll as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockEntries);

    const result = await getHabitStats({ habitId: 1 });

    expect(result.currentStreak).toBe(2); // 14th and 15th meet/exceed target
    expect(result.totalCompletions).toBe(3); // 15th, 14th, and 12th
    expect(result.recentEntries).toEqual([
      { date: new Date('2023-06-15'), completed: true, count: 5 },
      { date: new Date('2023-06-14'), completed: true, count: 3 },
      { date: new Date('2023-06-13'), completed: false, count: 2 },
      { date: new Date('2023-06-12'), completed: true, count: 3 },
    ]);
  });

  it("calculates completion rate correctly", async () => {
    const startDate = new Date('2023-06-10'); // 6 days ago including today
    const mockHabit = {
      id: 1,
      frequency: "daily",
      target_count: 1,
      start_date: startDate,
    };

    const mockEntries = [
      { date: new Date('2023-06-15'), count: 1 },
      { date: new Date('2023-06-13'), count: 1 },
      { date: new Date('2023-06-11'), count: 1 },
      // 3 completions out of 6 expected days
    ];

    (habitDB.queryRow as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockHabit);
    (habitDB.queryAll as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockEntries);

    const result = await getHabitStats({ habitId: 1 });

    expect(result.totalCompletions).toBe(3);
    expect(result.completionRate).toBe(50); // 3/6 = 50%
  });

  it("handles database errors", async () => {
    const dbError = new Error("Database connection failed");
    (habitDB.queryRow as ReturnType<typeof vi.fn>).mockRejectedValueOnce(dbError);

    await expect(getHabitStats({ habitId: 1 })).rejects.toThrow("Database connection failed");
  });
});