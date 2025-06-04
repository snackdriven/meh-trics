import { api } from "encore.dev/api";
import { taskDB } from "./db";

interface MoodTrend {
  date: Date;
  tier: string;
  count: number;
}

interface HabitSummary {
  habitId: number;
  name: string;
  completionRate: number;
}

interface TaskMetrics {
  total: number;
  completed: number;
}

interface DashboardStats {
  moodTrends: MoodTrend[];
  habitStats: HabitSummary[];
  taskMetrics: TaskMetrics;
  insight: string;
}

export const getDashboardStats = api<void, DashboardStats>(
  { expose: true, method: "GET", path: "/dashboard" },
  async () => {
    const moodTrends: MoodTrend[] = [];
    for await (const row of taskDB.query<{
      date: Date;
      tier: string;
      count: number;
    }>`
      SELECT date, tier, COUNT(*) as count
      FROM mood_entries
      WHERE date >= CURRENT_DATE - INTERVAL '30 days'
      GROUP BY date, tier
      ORDER BY date ASC
    `) {
      moodTrends.push({
        date: row.date,
        tier: row.tier,
        count: Number(row.count),
      });
    }

    let totalMoodScore = 0;
    let moodCount = 0;
    for (const m of moodTrends) {
      const score = m.tier === 'uplifted' ? 3 : m.tier === 'neutral' ? 2 : 1;
      totalMoodScore += score * m.count;
      moodCount += m.count;
    }
    const avgMood = moodCount > 0 ? totalMoodScore / moodCount : 0;

    const habitStats: HabitSummary[] = [];
    for await (const habit of taskDB.query<{
      id: number;
      name: string;
      frequency: string;
      target_count: number;
      start_date: Date;
    }>`
      SELECT id, name, frequency, target_count, start_date
      FROM habits
    `) {
      const row = await taskDB.queryRow<{ total: number }>`
        SELECT COUNT(*) as total
        FROM habit_entries
        WHERE habit_id = ${habit.id} AND count >= ${habit.target_count}
      `;
      const totalCompletions = Number(row?.total || 0);
      const today = new Date();
      const daysSinceStart = Math.floor((today.getTime() - habit.start_date.getTime()) / (1000*60*60*24)) + 1;
      let expected = daysSinceStart;
      if (habit.frequency === 'weekly') expected = Math.floor(daysSinceStart / 7) + 1;
      if (habit.frequency === 'monthly') expected = Math.floor(daysSinceStart / 30) + 1;
      const rate = expected > 0 ? (totalCompletions / expected) * 100 : 0;
      habitStats.push({
        habitId: habit.id,
        name: habit.name,
        completionRate: Math.round(rate * 100) / 100,
      });
    }

    const tasksRow = await taskDB.queryRow<{ total: number; done: number }>`
      SELECT COUNT(*) as total,
             COUNT(*) FILTER (WHERE status = 'done') as done
      FROM tasks
    `;
    const taskMetrics = {
      total: Number(tasksRow?.total || 0),
      completed: Number(tasksRow?.done || 0),
    };

    const completionRate = taskMetrics.total > 0 ? taskMetrics.completed / taskMetrics.total : 0;
    let insight = '';
    if (avgMood >= 2.5 && completionRate >= 0.5) {
      insight = 'Great job! Mood and productivity are looking good.';
    } else if (avgMood < 1.5) {
      insight = 'Mood seems low recently. Remember to take breaks and care for yourself.';
    } else if (completionRate < 0.3) {
      insight = 'Try focusing on finishing tasks to boost your productivity.';
    } else {
      insight = 'Keep tracking your habits and mood to gain more insights.';
    }

    return { moodTrends, habitStats, taskMetrics, insight };
  }
);
