import { useCallback, useEffect, useState } from "react";
import backend from "~backend/client";
import { reviveDates } from "../lib/date";

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

export interface DashboardData {
  moodTrends: MoodTrend[];
  habitCompletions: HabitCompletion[];
  taskMetrics: TaskMetrics;
  topMood?: string;
  bestHabit?: string;
}

const STORAGE_KEY = "dashboardData";

export function useCachedTodayView() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const fresh = await backend.task.getDashboardData();
      setData(fresh);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
      setError(null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to load";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const cached = localStorage.getItem(STORAGE_KEY);
    if (cached) {
      setData(JSON.parse(cached, reviveDates));
      setLoading(false);
    }
    void fetchData();
  }, [fetchData]);

  const refresh = useCallback(() => {
    setLoading(true);
    return fetchData();
  }, [fetchData]);

  return { data, loading, error, refresh };
}
