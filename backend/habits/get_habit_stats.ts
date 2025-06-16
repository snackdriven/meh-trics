import { api } from "encore.dev/api";
import { type SuccessEvaluation, evaluateHabitSuccess } from "../utils/success-criteria";
import { habitDB } from "./db";
import type { FlexibleSuccess, HabitStats } from "./types";

interface GetHabitStatsParams {
  habitId: number;
}

/**
 * Retrieves habit statistics including streaks and completion rates.
 *
 * @param req - Habit identifier.
 * @returns Calculated statistics for the habit.
 */
export const getHabitStats = api<GetHabitStatsParams, HabitStats>(
  { expose: true, method: "GET", path: "/habits/:habitId/stats" },
  async (req) => {
    // Get habit details
    const habit = await habitDB.queryRow<{
      id: number;
      frequency: string;
      target_count: number;
      start_date: Date | string;
      success_criteria: string | null;
    }>`
      SELECT id, frequency, target_count, start_date, success_criteria
      FROM habits
      WHERE id = ${req.habitId}
    `;

    if (!habit) {
      throw new Error("Habit not found");
    }

    // Normalize start_date which may be returned as a string
    const startDate =
      habit.start_date instanceof Date ? habit.start_date : new Date(habit.start_date);

    // Parse success criteria if present
    let successCriteria: FlexibleSuccess | undefined;
    if (habit.success_criteria) {
      try {
        successCriteria = JSON.parse(habit.success_criteria);
      } catch {
        // If parsing fails, use default criteria
        successCriteria = undefined;
      }
    }

    // Get all entries for this habit, ordered by date desc
    const rawEntries = await habitDB.queryAll<{
      date: Date | string;
      count: number;
    }>`
      SELECT date, count
      FROM habit_entries
      WHERE habit_id = ${req.habitId}
      ORDER BY date DESC
    `;

    // Ensure dates are proper Date objects
    const entries = rawEntries.map((e) => ({
      date: e.date instanceof Date ? e.date : new Date(e.date),
      count: e.count,
    }));

    // Calculate streaks and stats with flexible criteria
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    let totalCompletions = 0;
    let partialCompletions = 0;

    // Create a map of entries for easier lookup with success evaluation
    const entryMap = new Map<string, { count: number; evaluation: SuccessEvaluation }>();
    for (const entry of entries) {
      const dateStr = entry.date.toISOString().split("T")[0];
      if (dateStr) {
        const evaluation = evaluateHabitSuccess(entry.count, habit.target_count, successCriteria);

        entryMap.set(dateStr, {
          count: entry.count,
          evaluation,
        });

        if (evaluation.isFullSuccess) {
          totalCompletions++;
        } else if (evaluation.isPartialSuccess || evaluation.isMinimumSuccess) {
          partialCompletions++;
        }
      }
    }

    // Calculate streaks by checking consecutive days from today backwards
    const today = new Date();
    let checkDate = new Date(today);
    let streakActive = true;

    // For weekly/monthly habits, we need to check different intervals
    const getNextCheckDate = (date: Date, frequency: string): Date => {
      const next = new Date(date);
      switch (frequency) {
        case "daily":
          next.setDate(next.getDate() - 1);
          break;
        case "weekly":
          next.setDate(next.getDate() - 7);
          break;
        case "monthly":
          next.setMonth(next.getMonth() - 1);
          break;
      }
      return next;
    };

    // Calculate current streak using flexible criteria
    while (checkDate >= startDate) {
      const dateStr = checkDate.toISOString().split("T")[0];
      const entryData = dateStr ? entryMap.get(dateStr) : undefined;
      const countsForStreak = entryData?.evaluation?.countsForStreak || false;

      if (countsForStreak) {
        if (streakActive) {
          currentStreak++;
        }
        tempStreak++;
      } else {
        if (streakActive) {
          streakActive = false;
        }
        if (tempStreak > longestStreak) {
          longestStreak = tempStreak;
        }
        tempStreak = 0;
      }

      checkDate = getNextCheckDate(checkDate, habit.frequency);
    }

    // Check if temp streak is the longest
    if (tempStreak > longestStreak) {
      longestStreak = tempStreak;
    }

    // Calculate completion rate
    const daysSinceStart =
      Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    let expectedCompletions = daysSinceStart;

    if (habit.frequency === "weekly") {
      expectedCompletions = Math.floor(daysSinceStart / 7) + 1;
    } else if (habit.frequency === "monthly") {
      expectedCompletions = Math.floor(daysSinceStart / 30) + 1;
    }

    const completionRate =
      expectedCompletions > 0 ? (totalCompletions / expectedCompletions) * 100 : 0;

    const flexibleCompletionRate =
      expectedCompletions > 0
        ? ((totalCompletions + partialCompletions) / expectedCompletions) * 100
        : 0;

    // Get recent entries (last 30 days worth) with flexible success evaluation
    const recentEntries = entries.slice(0, 30).map((entry) => {
      const evaluation = evaluateHabitSuccess(entry.count, habit.target_count, successCriteria);

      return {
        date: entry.date,
        completed: evaluation.isFullSuccess,
        partiallyCompleted: evaluation.isPartialSuccess || evaluation.isMinimumSuccess,
        count: entry.count,
      };
    });

    return {
      habitId: req.habitId,
      currentStreak,
      longestStreak,
      totalCompletions,
      partialCompletions,
      completionRate: Math.round(completionRate * 100) / 100,
      flexibleCompletionRate: Math.round(flexibleCompletionRate * 100) / 100,
      recentEntries,
    };
  }
);
