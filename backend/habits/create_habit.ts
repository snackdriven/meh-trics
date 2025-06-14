import { api } from "encore.dev/api";
import { habitDB } from "./db";
import type { CreateHabitRequest, Habit, HabitFrequency } from "./types";
import { createAppError, ErrorCode, validateRequiredFields, validateDateRange, withErrorHandling } from "../utils/errors";

/**
 * Creates a new habit definition.
 *
 * @param req - Habit attributes to store.
 * @returns The created habit.
 */
export const createHabit = api<CreateHabitRequest, Habit>(
  { expose: true, method: "POST", path: "/habits" },
  async (req) => {
    return withErrorHandling(async () => {
      // Validate required fields
      validateRequiredFields(req, ["name", "emoji", "frequency", "startDate"]);

      // Validate name
      if (req.name.trim().length === 0) {
        throw createAppError(ErrorCode.INVALID_INPUT, "Habit name cannot be empty");
      }
      if (req.name.length > 100) {
        throw createAppError(ErrorCode.INVALID_INPUT, "Habit name cannot exceed 100 characters");
      }

      // Validate emoji
      if (req.emoji.trim().length === 0) {
        throw createAppError(ErrorCode.INVALID_INPUT, "Habit emoji cannot be empty");
      }

      // Validate frequency
      const validFrequencies = ["daily", "weekly", "monthly"];
      if (!validFrequencies.includes(req.frequency)) {
        throw createAppError(ErrorCode.INVALID_INPUT, "Frequency must be daily, weekly, or monthly");
      }

      // Validate target count
      if (req.targetCount !== undefined && (req.targetCount < 1 || req.targetCount > 100)) {
        throw createAppError(ErrorCode.INVALID_INPUT, "Target count must be between 1 and 100");
      }

      // Validate date range
      if (req.endDate) {
        validateDateRange(req.startDate, req.endDate);
      }

      // Validate start date is not too far in the past
      const oneMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      if (req.startDate < oneMonthAgo) {
        throw createAppError(ErrorCode.INVALID_INPUT, "Start date cannot be more than 30 days in the past");
      }

      const row = await habitDB.queryRow<{
        id: number;
        name: string;
        emoji: string;
        description: string | null;
        frequency: string;
        target_count: number;
        start_date: Date;
        end_date: Date | null;
        created_at: Date;
      }>`
        INSERT INTO habits (name, emoji, description, frequency, target_count, start_date, end_date)
        VALUES (${req.name.trim()}, ${req.emoji.trim()}, ${req.description?.trim() || null}, ${req.frequency}, ${req.targetCount || 1}, ${req.startDate}, ${req.endDate || null})
        RETURNING id, name, emoji, description, frequency, target_count, start_date, end_date, created_at
      `;

      if (!row) {
        throw createAppError(ErrorCode.DATABASE_TRANSACTION_FAILED, "Failed to insert habit record");
      }

      return {
        id: row.id,
        name: row.name,
        emoji: row.emoji,
        description: row.description || undefined,
        frequency: row.frequency as HabitFrequency,
        targetCount: row.target_count,
        startDate: row.start_date,
        endDate: row.end_date || undefined,
        createdAt: row.created_at,
      };
    }, "create habit");
  },
);
