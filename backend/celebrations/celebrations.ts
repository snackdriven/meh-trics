import { api } from "encore.dev/api";
import { habitDB } from "../habits/db";
import type { CelebrationMoment, CelebrationTrigger } from "../habits/types";
import { taskDB } from "../task/db";
import { determineCelebrationTrigger, evaluateHabitSuccess } from "../utils/success-criteria";

/**
 * Service for detecting and managing celebration moments
 */

interface TriggerCelebrationRequest {
  entityType: "habit" | "task";
  entityId: number;
  actionType: "complete" | "update";
  count?: number; // For habits
  isCompleted?: boolean; // For tasks
}

interface CelebrationResponse {
  shouldCelebrate: boolean;
  celebration?: CelebrationMoment;
}

/**
 * Analyzes a habit or task completion and determines if a celebration should be triggered
 */
export const checkForCelebration = api<TriggerCelebrationRequest, CelebrationResponse>(
  { expose: true, method: "POST", path: "/celebrations/check" },
  async (req) => {
    if (req.entityType === "habit") {
      return await checkHabitCelebration(req.entityId, req.count || 0);
    } else {
      return await checkTaskCelebration(req.entityId, req.isCompleted || false);
    }
  }
);

/**
 * Checks if a habit completion should trigger a celebration
 */
async function checkHabitCelebration(habitId: number, count: number): Promise<CelebrationResponse> {
  // Get habit details
  const habit = await habitDB.queryRow<{
    id: number;
    name: string;
    target_count: number;
    success_criteria: string | null;
    created_at: Date;
  }>`
    SELECT id, name, target_count, success_criteria, created_at
    FROM habits
    WHERE id = ${habitId}
  `;

  if (!habit) {
    return { shouldCelebrate: false };
  }

  // Parse success criteria
  let successCriteria;
  if (habit.success_criteria) {
    try {
      successCriteria = JSON.parse(habit.success_criteria);
    } catch {
      successCriteria = undefined;
    }
  }

  // Evaluate the current completion
  const evaluation = evaluateHabitSuccess(count, habit.target_count, successCriteria);

  // Get recent entries to calculate streak and determine if this is first/comeback
  const recentEntries = await habitDB.queryAll<{
    date: Date;
    count: number;
  }>`
    SELECT date, count
    FROM habit_entries
    WHERE habit_id = ${habitId}
    ORDER BY date DESC
    LIMIT 30
  `;

  // Check if this is the first completion ever
  const isFirstEver =
    recentEntries.length === 0 ||
    recentEntries.every(
      (entry) =>
        !evaluateHabitSuccess(entry.count, habit.target_count, successCriteria).isMinimumSuccess
    );

  // Check if this is a comeback (no successful entries in last 7 days but had success before)
  const last7Days = recentEntries.slice(0, 7);
  const hasRecentSuccess = last7Days.some(
    (entry) =>
      evaluateHabitSuccess(entry.count, habit.target_count, successCriteria).isMinimumSuccess
  );
  const hasHistoricalSuccess = recentEntries
    .slice(7)
    .some(
      (entry) =>
        evaluateHabitSuccess(entry.count, habit.target_count, successCriteria).isMinimumSuccess
    );
  const isComeback = !hasRecentSuccess && hasHistoricalSuccess;

  // Calculate current streak
  let streakCount = 0;
  const today = new Date();
  for (const entry of recentEntries) {
    const entryEval = evaluateHabitSuccess(entry.count, habit.target_count, successCriteria);
    if (entryEval.countsForStreak) {
      streakCount++;
    } else {
      break;
    }
  }

  // Include today's completion in streak if it counts
  if (evaluation.countsForStreak) {
    streakCount++;
  }

  // Determine if we should celebrate
  const celebrationCheck = determineCelebrationTrigger(
    evaluation,
    streakCount,
    isFirstEver,
    isComeback
  );

  if (!celebrationCheck.shouldCelebrate || !celebrationCheck.trigger) {
    return { shouldCelebrate: false };
  }

  // Create celebration moment
  const celebration: CelebrationMoment = {
    id: Date.now(), // In real implementation, this would be from database
    trigger: celebrationCheck.trigger,
    title: getCelebrationTitle(celebrationCheck.trigger, habit.name),
    message: getCelebrationMessage(celebrationCheck.trigger, habit.name, streakCount),
    entityId: habitId,
    entityType: "habit",
    milestone: getMilestone(celebrationCheck.trigger, streakCount),
    celebrationType: getCelebrationType(celebrationCheck.trigger),
    createdAt: new Date(),
  };

  return {
    shouldCelebrate: true,
    celebration,
  };
}

/**
 * Checks if a task completion should trigger a celebration
 */
async function checkTaskCelebration(
  taskId: number,
  isCompleted: boolean
): Promise<CelebrationResponse> {
  if (!isCompleted) {
    return { shouldCelebrate: false };
  }

  // Get task details
  const task = await taskDB.queryRow<{
    id: number;
    title: string;
    created_at: Date;
    priority: number;
  }>`
    SELECT id, title, created_at, priority
    FROM tasks
    WHERE id = ${taskId}
  `;

  if (!task) {
    return { shouldCelebrate: false };
  }

  // Simple celebration logic for tasks (can be enhanced)
  const isHighPriority = task.priority >= 8;
  const isFirstTask = await isFirstTaskCompletion();

  let trigger: CelebrationTrigger | undefined;

  if (isFirstTask) {
    trigger = "first_completion";
  } else if (isHighPriority) {
    trigger = "consistency_boost";
  }

  if (!trigger) {
    return { shouldCelebrate: false };
  }

  const celebration: CelebrationMoment = {
    id: Date.now(),
    trigger,
    title: getCelebrationTitle(trigger, task.title),
    message: getCelebrationMessage(trigger, task.title, 0),
    entityId: taskId,
    entityType: "task",
    celebrationType: getCelebrationType(trigger),
    createdAt: new Date(),
  };

  return {
    shouldCelebrate: true,
    celebration,
  };
}

/**
 * Helper functions for celebration content
 */
function getCelebrationTitle(trigger: CelebrationTrigger, entityName: string): string {
  const titles = {
    first_completion: "First Success! 🎉",
    streak_milestone: "Streak Achievement! 🔥",
    weekly_goal: "Weekly Champion! 📅",
    monthly_goal: "Monthly Hero! 🏆",
    comeback: "Welcome Back! 💪",
    consistency_boost: "Keep Going! ⭐",
  };
  return titles[trigger];
}

function getCelebrationMessage(
  trigger: CelebrationTrigger,
  entityName: string,
  streakCount: number
): string {
  const messages = {
    first_completion: `You completed "${entityName}" for the first time! Every journey starts with a single step.`,
    streak_milestone: `${streakCount} days in a row with "${entityName}"! You're building powerful habits.`,
    weekly_goal: `You've hit your weekly target for "${entityName}". Consistency is everything!`,
    monthly_goal: `Amazing! You've achieved your monthly goal for "${entityName}".`,
    comeback: `Great to see you back with "${entityName}". Progress isn't about perfection—it's about persistence.`,
    consistency_boost: `You're showing great consistency with "${entityName}". Small steps lead to big results!`,
  };
  return messages[trigger];
}

function getMilestone(trigger: CelebrationTrigger, streakCount: number): string | undefined {
  if (trigger === "streak_milestone") {
    return `${streakCount} day streak`;
  }
  return undefined;
}

function getCelebrationType(
  trigger: CelebrationTrigger
): "confetti" | "sparkles" | "badges" | "gentle" {
  const types = {
    first_completion: "confetti" as const,
    streak_milestone: "sparkles" as const,
    weekly_goal: "badges" as const,
    monthly_goal: "confetti" as const,
    comeback: "gentle" as const,
    consistency_boost: "gentle" as const,
  };
  return types[trigger];
}

/**
 * Check if this is the user's first task completion ever
 */
async function isFirstTaskCompletion(): Promise<boolean> {
  const completedTasks = await taskDB.queryRow<{ count: number }>`
    SELECT COUNT(*) as count
    FROM tasks
    WHERE status = 'done'
  `;

  return (completedTasks?.count || 0) <= 1; // Including the current completion
}
