import { useCachedData } from "./useCachedData";

export interface MoodTrend {
  date: string;
  tier: string;
  count: number;
}

export interface HabitCompletion {
  habitId: number;
  name: string;
  completionRate: number;
}

export interface TaskMetrics {
  total: number;
  completed: number;
  completionRate: number;
}

export interface DashboardData {
  moodTrends: MoodTrend[];
  habitCompletions: HabitCompletion[];
  taskMetrics: TaskMetrics;
  topMood?: string;
  bestHabit?: string;
}

const STORAGE_KEY = "dashboardData";

export function useCachedTodayView() {
  return useCachedData<DashboardData>(STORAGE_KEY, async () => {
    const resp = await fetch(
      `${import.meta.env.VITE_CLIENT_TARGET}/dashboard`,
      {
        credentials: "include",
      },
    );
    if (!resp.ok) throw new Error("Failed to load dashboard");
    return (await resp.json()) as DashboardData;
  });
}
