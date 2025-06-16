import { api } from "encore.dev/api";
import { CronJob } from "encore.dev/cron";
import { habitDB } from "../habits/db";
import { taskDB } from "../task/db";
import { insightsDB } from "./db";

function correlation(xs: number[], ys: number[]): number {
  const n = Math.min(xs.length, ys.length);
  if (n === 0) return 0;
  const xMean = xs.reduce((a, b) => a + b, 0) / n;
  const yMean = ys.reduce((a, b) => a + b, 0) / n;
  let numerator = 0;
  let dxSum = 0;
  let dySum = 0;
  for (let i = 0; i < n; i++) {
    const dx = xs[i] - xMean;
    const dy = ys[i] - yMean;
    numerator += dx * dy;
    dxSum += dx * dx;
    dySum += dy * dy;
  }
  if (numerator === 0 || dxSum === 0 || dySum === 0) {
    return 0;
  }
  return numerator / Math.sqrt(dxSum * dySum);
}

export const compute = api<void, void>({}, async () => {
  const now = new Date();
  const day = now.getUTCDay();
  const end = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - ((day + 6) % 7))
  );
  const start = new Date(end);
  start.setUTCDate(end.getUTCDate() - 7);

  const moodRows = await taskDB.queryAll<{
    date: Date;
    score: number;
  }>`
    SELECT date,
      AVG(CASE tier WHEN 'uplifted' THEN 1 WHEN 'heavy' THEN -1 ELSE 0 END) AS score
    FROM mood_entries
    WHERE date >= ${start} AND date < ${end}
    GROUP BY date
  `;
  const moodMap = new Map<string, number>();
  for (const row of moodRows) {
    moodMap.set(row.date.toISOString().split("T")[0], Number(row.score));
  }

  const habitRows = await habitDB.queryAll<{
    date: Date;
    completed: number;
  }>`
    SELECT he.date,
      SUM(CASE WHEN he.count >= h.target_count THEN 1 ELSE 0 END) AS completed
    FROM habit_entries he
    JOIN habits h ON he.habit_id = h.id
    WHERE he.date >= ${start} AND he.date < ${end}
    GROUP BY he.date
  `;
  const habitMap = new Map<string, number>();
  for (const row of habitRows) {
    habitMap.set(row.date.toISOString().split("T")[0], Number(row.completed));
  }

  const taskRows = await taskDB.queryAll<{
    date: Date;
    completed: number;
  }>`
    SELECT DATE(updated_at) AS date, COUNT(*) AS completed
    FROM tasks
    WHERE status = 'done' AND updated_at >= ${start} AND updated_at < ${end}
    GROUP BY DATE(updated_at)
  `;
  const taskMap = new Map<string, number>();
  for (const row of taskRows) {
    taskMap.set(row.date.toISOString().split("T")[0], Number(row.completed));
  }

  const moodHabitCorr = correlation(
    Array.from(moodMap.keys()).map((d) => moodMap.get(d) ?? 0),
    Array.from(moodMap.keys()).map((d) => habitMap.get(d) ?? 0)
  );
  const moodTaskCorr = correlation(
    Array.from(moodMap.keys()).map((d) => moodMap.get(d) ?? 0),
    Array.from(moodMap.keys()).map((d) => taskMap.get(d) ?? 0)
  );

  await insightsDB.exec`
    INSERT INTO weekly_insights (week_start, mood_habit_corr, mood_task_corr)
    VALUES (${start}, ${moodHabitCorr}, ${moodTaskCorr})
    ON CONFLICT (week_start) DO UPDATE
      SET mood_habit_corr = EXCLUDED.mood_habit_corr,
          mood_task_corr = EXCLUDED.mood_task_corr
  `;
});

export const computeWeeklyInsights = new CronJob("compute-weekly-insights", {
  schedule: "0 0 * * 1",
  endpoint: compute,
});
