import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { LoadingSpinner } from "./LoadingSpinner";
import { ErrorMessage } from "./ErrorMessage";
import { useAsyncOperation } from "../hooks/useAsyncOperation";
import { useToast } from "../hooks/useToast";
import backend from "~backend/client";

export function Dashboard() {
  const { showError } = useToast();

  const { data, loading, error, execute: loadStats } = useAsyncOperation(
    async () => await backend.task.getDashboardStats(),
    undefined,
    () => showError("Failed to load dashboard", "Loading Error")
  );

  useEffect(() => {
    loadStats();
  }, []);

  if (loading || !data) {
    return (
      <Card className="bg-white/70 backdrop-blur-sm">
        <CardContent className="p-8">
          <div className="flex items-center justify-center gap-2 text-gray-500">
            <LoadingSpinner />
            Loading dashboard...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-white/70 backdrop-blur-sm">
        <CardContent className="p-8">
          <ErrorMessage message={error} onRetry={loadStats} />
        </CardContent>
      </Card>
    );
  }

  const { moodTrends, habitStats, taskMetrics, insight } = data;
  const taskRate = taskMetrics.total > 0 ? (taskMetrics.completed / taskMetrics.total) * 100 : 0;

  return (
    <div className="space-y-6">
      <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Task Productivity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span>{taskMetrics.completed} of {taskMetrics.total} tasks done</span>
            <span>{Math.round(taskRate)}%</span>
          </div>
          <Progress value={taskRate} />
        </CardContent>
      </Card>

      <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Habit Completion Rates</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {habitStats.map(habit => (
            <div key={habit.habitId} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span>{habit.name}</span>
                <span>{habit.completionRate}%</span>
              </div>
              <Progress value={habit.completionRate} />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Mood Trends (30 days)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-2 text-sm">
            {moodTrends.map((m, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <span>{new Date(m.date).toLocaleDateString()}</span>
                <span>{m.tier} ({m.count})</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Insight</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{insight}</p>
        </CardContent>
      </Card>
    </div>
  );
}
