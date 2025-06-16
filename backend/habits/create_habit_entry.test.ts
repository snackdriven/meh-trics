import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("encore.dev/api", () => ({ api: (_opts: unknown, fn: unknown) => fn }));
vi.mock("./db", () => ({
  habitDB: {
    queryRow: vi.fn(),
  },
}));

import { habitDB } from "./db";
import { createHabitEntry } from "./create_habit_entry";
import type { CreateHabitEntryRequest, HabitEntry } from "./types";

describe("createHabitEntry", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("successfully creates a habit entry with default count", async () => {
    const now = new Date();
    const mockDbResponse = {
      id: 1,
      habit_id: 5,
      date: now,
      count: 1,
      notes: null,
      created_at: now,
    };

    (habitDB.queryRow as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockDbResponse);

    const req: CreateHabitEntryRequest = {
      habitId: 5,
      date: now,
    };

    const result = await createHabitEntry(req);

    expect(habitDB.queryRow).toHaveBeenCalledWith(
      expect.stringContaining("INSERT INTO habit_entries (habit_id, date, count, notes)")
    );
    expect(habitDB.queryRow).toHaveBeenCalledWith(
      expect.stringContaining("ON CONFLICT (habit_id, date)")
    );
    expect(habitDB.queryRow).toHaveBeenCalledWith(
      expect.stringContaining("DO UPDATE SET count = EXCLUDED.count, notes = EXCLUDED.notes")
    );

    expect(result).toEqual<HabitEntry>({
      id: 1,
      habitId: 5,
      date: now,
      count: 1,
      createdAt: now,
    });
  });

  it("successfully creates a habit entry with custom count and notes", async () => {
    const now = new Date();
    const mockDbResponse = {
      id: 2,
      habit_id: 10,
      date: now,
      count: 3,
      notes: "Completed 3 sets of push-ups",
      created_at: now,
    };

    (habitDB.queryRow as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockDbResponse);

    const req: CreateHabitEntryRequest = {
      habitId: 10,
      date: now,
      count: 3,
      notes: "Completed 3 sets of push-ups",
    };

    const result = await createHabitEntry(req);

    expect(result).toEqual<HabitEntry>({
      id: 2,
      habitId: 10,
      date: now,
      count: 3,
      notes: "Completed 3 sets of push-ups",
      createdAt: now,
    });
  });

  it("updates existing habit entry on conflict", async () => {
    const today = new Date();
    const mockDbResponse = {
      id: 1,
      habit_id: 5,
      date: today,
      count: 2,
      notes: "Updated count",
      created_at: new Date(), // Different from today to simulate update
    };

    (habitDB.queryRow as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockDbResponse);

    const req: CreateHabitEntryRequest = {
      habitId: 5,
      date: today,
      count: 2,
      notes: "Updated count",
    };

    const result = await createHabitEntry(req);

    // The SQL should include UPSERT logic
    expect(habitDB.queryRow).toHaveBeenCalledWith(
      expect.stringContaining("ON CONFLICT (habit_id, date)")
    );
    expect(result.count).toBe(2);
    expect(result.notes).toBe("Updated count");
  });

  it("handles habit entry with no notes", async () => {
    const now = new Date();
    const mockDbResponse = {
      id: 3,
      habit_id: 15,
      date: now,
      count: 1,
      notes: null,
      created_at: now,
    };

    (habitDB.queryRow as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockDbResponse);

    const req: CreateHabitEntryRequest = {
      habitId: 15,
      date: now,
      count: 1,
    };

    const result = await createHabitEntry(req);

    expect(result.notes).toBeUndefined();
  });

  it("uses default count of 1 when not provided", async () => {
    const now = new Date();
    const mockDbResponse = {
      id: 4,
      habit_id: 20,
      date: now,
      count: 1,
      notes: null,
      created_at: now,
    };

    (habitDB.queryRow as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockDbResponse);

    const req: CreateHabitEntryRequest = {
      habitId: 20,
      date: now,
      // count not provided - should default to 1
    };

    await createHabitEntry(req);

    // Verify that the SQL call uses count of 1 when not provided
    expect(habitDB.queryRow).toHaveBeenCalledWith(
      expect.stringContaining(
        "VALUES (${req.habitId}, ${req.date}, ${req.count || 1}, ${req.notes || null})"
      )
    );
  });

  it("handles different habit IDs and dates", async () => {
    const dates = [new Date("2023-01-01"), new Date("2023-06-15"), new Date("2023-12-31")];
    const habitIds = [1, 100, 9999];

    for (let i = 0; i < dates.length; i++) {
      const mockDbResponse = {
        id: i + 1,
        habit_id: habitIds[i]!,
        date: dates[i]!,
        count: 1,
        notes: null,
        created_at: new Date(),
      };

      (habitDB.queryRow as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockDbResponse);

      const req: CreateHabitEntryRequest = {
        habitId: habitIds[i]!,
        date: dates[i]!,
      };

      const result = await createHabitEntry(req);
      expect(result.habitId).toBe(habitIds[i]!);
      expect(result.date).toBe(dates[i]!);
    }
  });

  it("throws error when database insertion fails", async () => {
    (habitDB.queryRow as ReturnType<typeof vi.fn>).mockResolvedValueOnce(null);

    const req: CreateHabitEntryRequest = {
      habitId: 1,
      date: new Date(),
    };

    await expect(createHabitEntry(req)).rejects.toThrow("Failed to create habit entry");
  });

  it("handles database errors", async () => {
    const dbError = new Error("Database connection failed");
    (habitDB.queryRow as ReturnType<typeof vi.fn>).mockRejectedValueOnce(dbError);

    const req: CreateHabitEntryRequest = {
      habitId: 1,
      date: new Date(),
    };

    await expect(createHabitEntry(req)).rejects.toThrow("Database connection failed");
  });

  it("converts null notes to undefined in response", async () => {
    const now = new Date();
    const mockDbResponse = {
      id: 1,
      habit_id: 5,
      date: now,
      count: 1,
      notes: null, // Database returns null
      created_at: now,
    };

    (habitDB.queryRow as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockDbResponse);

    const req: CreateHabitEntryRequest = {
      habitId: 5,
      date: now,
    };

    const result = await createHabitEntry(req);

    expect(result.notes).toBeUndefined(); // Should be undefined, not null
  });

  it("preserves non-null notes in response", async () => {
    const now = new Date();
    const notes = "Great workout today!";
    const mockDbResponse = {
      id: 1,
      habit_id: 5,
      date: now,
      count: 2,
      notes,
      created_at: now,
    };

    (habitDB.queryRow as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockDbResponse);

    const req: CreateHabitEntryRequest = {
      habitId: 5,
      date: now,
      count: 2,
      notes,
    };

    const result = await createHabitEntry(req);

    expect(result.notes).toBe(notes);
  });
});
