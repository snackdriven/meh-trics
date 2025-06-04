import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ErrorMessage } from "./ErrorMessage";
import { useToast } from "../hooks/useToast";
import { useAsyncOperation } from "../hooks/useAsyncOperation";

interface MoodTrend {
  date: string;
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

export function Dashboard() {
  const { showError } = useToast();
  const {
    data,
    loading,
    error,
    execute: loadDashboard,
  } = useAsyncOperation<DashboardData>(async () => {
    const resp = await fetch(`${import.meta.env.VITE_CLIENT_TARGET}/dashboard`, {
      credentials: "include",
    });
    if (!resp.ok) throw new Error(`Failed to load dashboard`);
    return resp.json() as Promise<DashboardData>;
  }, undefined, (e) => showError(e));

  useEffect(() => {
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
        <CardContent className="p-8 text-center">Loading dashboard...</CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <ErrorMessage
        message={error || "Failed to load"}
        onRetry={loadDashboard}
      />
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Personal Insights</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {data.topMood && <p>Most frequent mood: <strong>{data.topMood}</strong></p>}
          {data.bestHabit && <p>Best habit: <strong>{data.bestHabit}</strong></p>}
          <p>
            Task completion rate: {data.taskMetrics.completionRate.toFixed(2)}%
            ({data.taskMetrics.completed}/{data.taskMetrics.total})
          </p>
        </CardContent>
      </Card>

      <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl">Habit Completion Rates</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {data.habitCompletions.length === 0 && <p>No habits yet.</p>}
          {data.habitCompletions.map(habit => (
            <div key={habit.habitId} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>{habit.name}</span>
                <span>{habit.completionRate.toFixed(2)}%</span>
              </div>
              <Progress value={habit.completionRate} />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl">Mood Trends (last 30 days)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          {data.moodTrends.length === 0 && <p>No mood entries.</p>}
          {data.moodTrends.map((m, idx) => (
            <p key={idx}>{m.date.split("T")[0]} - {m.tier} ({m.count})</p>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
