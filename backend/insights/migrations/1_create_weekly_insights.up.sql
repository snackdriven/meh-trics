CREATE TABLE weekly_insights (
  week_start DATE PRIMARY KEY,
  mood_habit_corr DOUBLE PRECISION NOT NULL,
  mood_task_corr DOUBLE PRECISION NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
