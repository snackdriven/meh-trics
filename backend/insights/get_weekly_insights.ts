import { api } from "encore.dev/api";
import { insightsDB } from "./db";
import type { WeeklyInsight } from "./types";

interface ListWeeklyInsightsResponse {
  insights: WeeklyInsight[];
}

export const getWeeklyInsights = api<void, ListWeeklyInsightsResponse>(
  { expose: true, method: "GET", path: "/insights/weekly" },
  async () => {
    const rows = await insightsDB.queryAll<{
      week_start: Date;
      mood_habit_corr: number;
      mood_task_corr: number;
    }>`
      SELECT week_start, mood_habit_corr, mood_task_corr
      FROM weekly_insights
      ORDER BY week_start DESC
    `;
    const insights = rows.map((r) => ({
      weekStart: r.week_start,
      moodHabitCorr: Number(r.mood_habit_corr),
      moodTaskCorr: Number(r.mood_task_corr),
    }));
    return { insights };
  },
);
