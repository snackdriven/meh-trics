import { api } from "encore.dev/api";
import { habitDB } from "./db";
import type { HabitStats } from "./types";

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
    }>`
      SELECT id, frequency, target_count, start_date
      FROM habits
      WHERE id = ${req.habitId}
    `;

    if (!habit) {
      throw new Error("Habit not found");
    }

    // Normalize start_date which may be returned as a string
    const startDate =
      habit.start_date instanceof Date
        ? habit.start_date
        : new Date(habit.start_date);

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

    // Calculate streaks and stats
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    let totalCompletions = 0;

    // Create a map of entries for easier lookup
    const entryMap = new Map<string, number>();
    for (const entry of entries) {
      const dateStr = entry.date.toISOString().split("T")[0];
      if (dateStr) {
        entryMap.set(dateStr, entry.count);
      }
      if (entry.count >= habit.target_count) {
        totalCompletions++;
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

    // Calculate current streak
    while (checkDate >= startDate) {
      const dateStr = checkDate.toISOString().split("T")[0];
      const count = dateStr ? (entryMap.get(dateStr) || 0) : 0;

      if (count >= habit.target_count) {
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
      Math.floor(
        (today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
      ) + 1;
    let expectedCompletions = daysSinceStart;

    if (habit.frequency === "weekly") {
      expectedCompletions = Math.floor(daysSinceStart / 7) + 1;
    } else if (habit.frequency === "monthly") {
      expectedCompletions = Math.floor(daysSinceStart / 30) + 1;
    }

    const completionRate =
      expectedCompletions > 0
        ? (totalCompletions / expectedCompletions) * 100
        : 0;

    // Get recent entries (last 30 days worth)
    const recentEntries = entries.slice(0, 30).map((entry) => ({
      date: entry.date,
      completed: entry.count >= habit.target_count,
      count: entry.count,
    }));

    return {
      habitId: req.habitId,
      currentStreak,
      longestStreak,
      totalCompletions,
      completionRate: Math.round(completionRate * 100) / 100,
      recentEntries,
    };
  },
);
