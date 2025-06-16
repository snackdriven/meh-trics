import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useEffect, useState } from "react";
import { useAsyncOperation } from "../hooks/useAsyncOperation";
import { useToast } from "../hooks/useToast";
import { EditableCopy } from "./EditableCopy";
import { ErrorMessage } from "./ErrorMessage";

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

interface WeeklyInsight {
  weekStart: string;
  moodHabitCorr: number;
  moodTaskCorr: number;
}

interface DashboardData {
  moodTrends: MoodTrend[];
  habitCompletions: HabitCompletion[];
  taskMetrics: TaskMetrics;
  topMood?: string;
  bestHabit?: string;
  weeklyInsight?: WeeklyInsight;
}

type BlockKey = "insights" | "habits" | "moods";

export function Metrics() {
  const { showError } = useToast();
  const {
    data,
    loading,
    error,
    execute: loadMetrics,
  } = useAsyncOperation<DashboardData>(
    async () => {
      const resp = await fetch(`${import.meta.env.VITE_CLIENT_TARGET}/dashboard`, {
        credentials: "include",
      });
      if (!resp.ok) throw new Error(`Failed to load dashboard`);
      const dash = (await resp.json()) as DashboardData;

      const insightsResp = await fetch(`${import.meta.env.VITE_CLIENT_TARGET}/insights/weekly`, {
        credentials: "include",
      });
      if (insightsResp.ok) {
        const list = (await insightsResp.json()) as WeeklyInsight[];
        dash.weeklyInsight = list[0];
      }

      return dash;
    },
    undefined,
    (e) => showError(e)
  );
  const [order, setOrder] = useState<BlockKey[]>(() => {
    const stored = localStorage.getItem("dashboardOrder");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          return parsed as BlockKey[];
        }
      } catch (error) {
        console.warn("Failed to parse dashboardOrder from localStorage:", error);
        localStorage.removeItem("dashboardOrder");
      }
    }
    return ["insights", "habits", "moods"];
  });
  const [dragBlock, setDragBlock] = useState<BlockKey | null>(null);

  const handleDragStart = (key: BlockKey) => {
    setDragBlock(key);
  };

  const handleDrop = (key: BlockKey) => {
    if (!dragBlock) return;
    const from = order.indexOf(dragBlock);
    const to = order.indexOf(key);
    if (from === to) return;
    const newOrder = [...order];
    newOrder.splice(from, 1);
    newOrder.splice(to, 0, dragBlock);
    setOrder(newOrder);
    localStorage.setItem("dashboardOrder", JSON.stringify(newOrder));
    setDragBlock(null);
  };

  const handleDragOver = (e: React.DragEvent) => e.preventDefault();
  const handleDragEnd = () => setDragBlock(null);

  useEffect(() => {
    loadMetrics();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">Loading dashboard...</CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return <ErrorMessage message={error || "Failed to load"} onRetry={loadMetrics} />;
  }

  const renderBlock = (key: BlockKey) => {
    switch (key) {
      case "insights":
        return (
          <Card
            key="insights"
            className="cursor-move"
            draggable
            onDragStart={() => handleDragStart("insights")}
            onDragOver={handleDragOver}
            onDrop={() => handleDrop("insights")}
            onDragEnd={handleDragEnd}
          >
            <CardHeader>
              <CardTitle className="text-2xl">Personal Insights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {data!.topMood && (
                <p>
                  Most frequent mood: <strong>{data!.topMood}</strong>
                </p>
              )}
              {data!.bestHabit && (
                <p>
                  Best habit: <strong>{data!.bestHabit}</strong>
                </p>
              )}
              <p>
                Task completion rate: {data!.taskMetrics.completionRate.toFixed(2)}% (
                {data!.taskMetrics.completed}/{data!.taskMetrics.total})
              </p>
              {data!.weeklyInsight && (
                <>
                  <p>Habit vs mood correlation: {data!.weeklyInsight.moodHabitCorr.toFixed(2)}</p>
                  {data!.weeklyInsight.moodHabitCorr < -0.5 && (
                    <p className="text-sm text-red-500">Low habits may be dragging down mood.</p>
                  )}
                  <p>Task vs mood correlation: {data!.weeklyInsight.moodTaskCorr.toFixed(2)}</p>
                  {Math.abs(data!.weeklyInsight.moodTaskCorr) > 0.7 && (
                    <p className="text-sm text-red-500">
                      High correlation between tasks and mood. Consider adjusting workload.
                    </p>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        );
      case "habits":
        return (
          <Card
            key="habits"
            className="cursor-move"
            draggable
            onDragStart={() => handleDragStart("habits")}
            onDragOver={handleDragOver}
            onDrop={() => handleDrop("habits")}
            onDragEnd={handleDragEnd}
          >
            <CardHeader>
              <CardTitle className="text-xl">Habit Completion Rates</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {data!.habitCompletions.length === 0 && <p>No habits yet.</p>}
              {data!.habitCompletions.map((habit) => (
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
        );
      case "moods":
        return (
          <Card
            key="moods"
            className="cursor-move"
            draggable
            onDragStart={() => handleDragStart("moods")}
            onDragOver={handleDragOver}
            onDrop={() => handleDrop("moods")}
            onDragEnd={handleDragEnd}
          >
            <CardHeader>
              <CardTitle className="text-xl">Mood Trends (last 30 days)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              {data!.moodTrends.length === 0 && <p>No mood entries.</p>}
              {data!.moodTrends.map((m, idx) => (
                <p key={idx}>
                  {m.date.split("T")[0]} - {m.tier} ({m.count})
                </p>
              ))}
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className="space-y-6">
      <EditableCopy
        defaultText="Your progress at a glance"
        as="h2"
        className="text-2xl font-bold text-center"
      />
      {order.map(renderBlock)}
    </div>
  );
}
