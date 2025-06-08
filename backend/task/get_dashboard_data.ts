import { api } from "encore.dev/api";
import { habitDB } from "../habits/db";
import { taskDB } from "./db";

// TODO(meh-trics): implement Try Level, Mood Volatility, Avoidance Tracker,
// Habit Drift, and Streak Fragility formulas once the exact calculations are
// defined.

interface MoodTrend {
  date: Date;
  tier: string;
  count: number;
}

interface HabitCompletion {
  habitId: number;
  name: string;
  completionRate: number;
}

interface TaskMetrics {
  total: number;
  completed: number;
  completionRate: number;
}

interface DashboardData {
  moodTrends: MoodTrend[];
  habitCompletions: HabitCompletion[];
  taskMetrics: TaskMetrics;
  topMood?: string;
  bestHabit?: string;
}

/**
 * Aggregates mood, habit, and task metrics for the dashboard.
 *
 * @returns Combined analytics for the last 30 days.
 */
export const getDashboardData = api<void, DashboardData>(
  { expose: true, method: "GET", path: "/dashboard" },
  async () => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 29);

    const moodTrends: MoodTrend[] = [];
    const moodCounts = new Map<string, number>();

    for await (const row of taskDB.query<{
      date: Date;
      tier: string;
      count: number;
    }>`
      SELECT date, tier, COUNT(*) as count
      FROM mood_entries
      WHERE date >= ${startDate}
      GROUP BY date, tier
      ORDER BY date ASC
    `) {
      moodTrends.push({
        date: row.date,
        tier: row.tier,
        count: Number(row.count),
      });
      moodCounts.set(
        row.tier,
        (moodCounts.get(row.tier) || 0) + Number(row.count),
      );
    }

    let topMood: string | undefined;
    let topMoodCount = 0;
    for (const [tier, count] of moodCounts.entries()) {
      if (count > topMoodCount) {
        topMood = tier;
        topMoodCount = count;
      }
    }

    const habitCompletions: HabitCompletion[] = [];
    for await (const row of habitDB.query<{
      id: number;
      name: string;
      completed: number;
      total: number;
    }>`
      SELECT h.id, h.name,
        SUM(CASE WHEN he.count >= h.target_count THEN 1 ELSE 0 END) AS completed,
        COUNT(he.id) AS total
      FROM habits h
      LEFT JOIN habit_entries he ON he.habit_id = h.id
      GROUP BY h.id
    `) {
      const completionRate =
        row.total > 0 ? (Number(row.completed) / Number(row.total)) * 100 : 0;
      habitCompletions.push({
        habitId: row.id,
        name: row.name,
        completionRate: Math.round(completionRate * 100) / 100,
      });
    }

    let bestHabit: string | undefined;
    let bestRate = 0;
    for (const hc of habitCompletions) {
      if (hc.completionRate > bestRate) {
        bestRate = hc.completionRate;
        bestHabit = hc.name;
      }
    }

    const taskSummary = await taskDB.queryRow<{
      total: number;
      completed: number;
    }>`
      SELECT COUNT(*) AS total,
             SUM(CASE WHEN status = 'done' THEN 1 ELSE 0 END) AS completed
      FROM tasks
    `;

    const taskMetrics: TaskMetrics = {
      total: Number(taskSummary?.total || 0),
      completed: Number(taskSummary?.completed || 0),
      completionRate:
        taskSummary && taskSummary.total > 0
          ? Math.round(
              (Number(taskSummary.completed) / Number(taskSummary.total)) *
                10000,
            ) / 100
          : 0,
    };

    return {
      moodTrends,
      habitCompletions,
      taskMetrics,
      topMood,
      bestHabit,
    };
  },
);
