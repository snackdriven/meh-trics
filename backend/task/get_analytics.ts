import { api } from "encore.dev/api";
import { taskDB } from "./db";

interface Analytics {
  totalTasks: number;
  completedTasks: number;
  habits: number;
  moodEntries: number;
}

/**
 * Returns simple aggregate counts for the dashboard.
 */
export const getAnalytics = api<void, Analytics>(
  { expose: true, method: "GET", path: "/analytics" },
  async () => {
    const totalTasks = await taskDB.queryRow<{ count: number }>`SELECT COUNT(*) AS count FROM tasks`;
    const completedTasks = await taskDB.queryRow<{ count: number }>`SELECT COUNT(*) AS count FROM tasks WHERE status = 'done'`;
    const habits = await taskDB.queryRow<{ count: number }>`SELECT COUNT(*) AS count FROM habits`;
    const moodEntries = await taskDB.queryRow<{ count: number }>`SELECT COUNT(*) AS count FROM mood_entries`;
    return {
      totalTasks: totalTasks?.count || 0,
      completedTasks: completedTasks?.count || 0,
      habits: habits?.count || 0,
      moodEntries: moodEntries?.count || 0,
    };
  }
);
