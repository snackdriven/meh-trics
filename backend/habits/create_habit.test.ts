import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("encore.dev/api", () => ({ api: (_opts: unknown, fn: unknown) => fn }));
vi.mock("./db", () => ({
  habitDB: {
    queryRow: vi.fn(),
  },
}));
vi.mock("../utils/errors", () => ({
  createAppError: vi.fn((_code: string, message: string) => new Error(message)),
  ErrorCode: {
    INVALID_INPUT: "INVALID_INPUT",
    DATABASE_TRANSACTION_FAILED: "DATABASE_TRANSACTION_FAILED",
  },
  validateRequiredFields: vi.fn(),
  validateDateRange: vi.fn(),
  withErrorHandling: vi.fn((fn: () => unknown) => fn()),
}));

import { habitDB } from "./db";
import { createHabit } from "./create_habit";
import type { CreateHabitRequest, Habit } from "./types";
import { createAppError, ErrorCode, validateRequiredFields, validateDateRange } from "../utils/errors";

describe("createHabit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("successfully creates a habit with required fields", async () => {
    const now = new Date();
    const mockDbResponse = {
      id: 1,
      name: "Exercise",
      emoji: "🏋️",
      description: null,
      frequency: "daily",
      target_count: 1,
      start_date: now,
      end_date: null,
      created_at: now,
    };

    (habitDB.queryRow as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockDbResponse);

    const req: CreateHabitRequest = {
      name: "Exercise",
      emoji: "🏋️",
      frequency: "daily",
      startDate: now,
    };

    const result = await createHabit(req);

    expect(validateRequiredFields).toHaveBeenCalledWith(req, ["name", "emoji", "frequency", "startDate"]);
    expect(habitDB.queryRow).toHaveBeenCalledWith(expect.stringContaining("INSERT INTO habits"));
    expect(result).toEqual<Habit>({
      id: 1,
      name: "Exercise",
      emoji: "🏋️",
      frequency: "daily",
      targetCount: 1,
      startDate: now,
      createdAt: now,
    });
  });

  it("successfully creates a habit with all optional fields", async () => {
    const now = new Date();
    const endDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days later
    const mockDbResponse = {
      id: 2,
      name: "Read Books",
      emoji: "📚",
      description: "Read for 30 minutes daily",
      frequency: "daily",
      target_count: 2,
      start_date: now,
      end_date: endDate,
      created_at: now,
    };

    (habitDB.queryRow as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockDbResponse);

    const req: CreateHabitRequest = {
      name: "Read Books",
      emoji: "📚",
      description: "Read for 30 minutes daily",
      frequency: "daily",
      targetCount: 2,
      startDate: now,
      endDate,
    };

    const result = await createHabit(req);

    expect(result).toEqual<Habit>({
      id: 2,
      name: "Read Books",
      emoji: "📚",
      description: "Read for 30 minutes daily",
      frequency: "daily",
      targetCount: 2,
      startDate: now,
      endDate,
      createdAt: now,
    });
  });

  it("throws error for empty habit name", async () => {
    const req: CreateHabitRequest = {
      name: "",
      emoji: "🏋️",
      frequency: "daily",
      startDate: new Date(),
    };

    await expect(createHabit(req)).rejects.toThrow("Habit name cannot be empty");
    expect(createAppError).toHaveBeenCalledWith(ErrorCode.INVALID_INPUT, "Habit name cannot be empty");
  });

  it("throws error for habit name that's too long", async () => {
    const req: CreateHabitRequest = {
      name: "a".repeat(101), // 101 characters
      emoji: "🏋️",
      frequency: "daily",
      startDate: new Date(),
    };

    await expect(createHabit(req)).rejects.toThrow("Habit name cannot exceed 100 characters");
    expect(createAppError).toHaveBeenCalledWith(ErrorCode.INVALID_INPUT, "Habit name cannot exceed 100 characters");
  });

  it("throws error for empty emoji", async () => {
    const req: CreateHabitRequest = {
      name: "Exercise",
      emoji: "",
      frequency: "daily",
      startDate: new Date(),
    };

    await expect(createHabit(req)).rejects.toThrow("Habit emoji cannot be empty");
    expect(createAppError).toHaveBeenCalledWith(ErrorCode.INVALID_INPUT, "Habit emoji cannot be empty");
  });

  it("throws error for invalid frequency", async () => {
    const req: CreateHabitRequest = {
      name: "Exercise",
      emoji: "🏋️",
      frequency: "invalid" as any,
      startDate: new Date(),
    };

    await expect(createHabit(req)).rejects.toThrow("Frequency must be daily, weekly, or monthly");
    expect(createAppError).toHaveBeenCalledWith(ErrorCode.INVALID_INPUT, "Frequency must be daily, weekly, or monthly");
  });

  it("throws error for target count out of range", async () => {
    const req: CreateHabitRequest = {
      name: "Exercise",
      emoji: "🏋️",
      frequency: "daily",
      targetCount: 101,
      startDate: new Date(),
    };

    await expect(createHabit(req)).rejects.toThrow("Target count must be between 1 and 100");
    expect(createAppError).toHaveBeenCalledWith(ErrorCode.INVALID_INPUT, "Target count must be between 1 and 100");
  });

  it("throws error for start date too far in the past", async () => {
    const twoMonthsAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
    const req: CreateHabitRequest = {
      name: "Exercise",
      emoji: "🏋️",
      frequency: "daily",
      startDate: twoMonthsAgo,
    };

    await expect(createHabit(req)).rejects.toThrow("Start date cannot be more than 30 days in the past");
    expect(createAppError).toHaveBeenCalledWith(ErrorCode.INVALID_INPUT, "Start date cannot be more than 30 days in the past");
  });

  it("validates date range when end date is provided", async () => {
    const now = new Date();
    const endDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const req: CreateHabitRequest = {
      name: "Exercise",
      emoji: "🏋️",
      frequency: "daily",
      startDate: now,
      endDate,
    };

    const mockDbResponse = {
      id: 1,
      name: "Exercise",
      emoji: "🏋️",
      description: null,
      frequency: "daily",
      target_count: 1,
      start_date: now,
      end_date: endDate,
      created_at: now,
    };

    (habitDB.queryRow as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockDbResponse);

    await createHabit(req);

    expect(validateDateRange).toHaveBeenCalledWith(now, endDate);
  });

  it("throws error when database insertion fails", async () => {
    (habitDB.queryRow as ReturnType<typeof vi.fn>).mockResolvedValueOnce(null);

    const req: CreateHabitRequest = {
      name: "Exercise",
      emoji: "🏋️",
      frequency: "daily",
      startDate: new Date(),
    };

    await expect(createHabit(req)).rejects.toThrow("Failed to insert habit record");
    expect(createAppError).toHaveBeenCalledWith(ErrorCode.DATABASE_TRANSACTION_FAILED, "Failed to insert habit record");
  });

  it("trims whitespace from name and emoji", async () => {
    const now = new Date();
    const mockDbResponse = {
      id: 1,
      name: "Exercise",
      emoji: "🏋️",
      description: null,
      frequency: "daily",
      target_count: 1,
      start_date: now,
      end_date: null,
      created_at: now,
    };

    (habitDB.queryRow as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockDbResponse);

    const req: CreateHabitRequest = {
      name: "  Exercise  ",
      emoji: "  🏋️  ",
      frequency: "daily",
      startDate: now,
    };

    await createHabit(req);

    expect(habitDB.queryRow).toHaveBeenCalledWith(
      expect.stringContaining("VALUES (${req.name.trim()}, ${req.emoji.trim()}")
    );
  });
});