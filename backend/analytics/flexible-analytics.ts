/**
 * Enhanced analytics that include flexible success definitions
 * and celebration data for comprehensive user insights
 */

import { api } from "encore.dev/api";
import { habitDB } from "../habits/db";
import { taskDB } from "../task/db";
import type { FlexibleSuccess } from "../habits/types";
import { evaluateHabitSuccess, calculateFlexibleCompletionRate } from "../utils/success-criteria";

interface FlexibleAnalyticsResponse {
  /** Traditional completion metrics */
  traditional: {
    habitCompletionRate: number;
    taskCompletionRate: number;
    totalHabits: number;
    totalTasks: number;
  };
  /** Flexible success metrics */
  flexible: {
    habitFlexibleRate: number;
    partialSuccessCount: number;
    minimumEffortCount: number;
    encouragementScore: number; // 0-100, how much user should be encouraged
  };
  /** Success distribution */
  successDistribution: {
    fullSuccess: number;
    partialSuccess: number;
    minimumSuccess: number;
    noSuccess: number;
  };
  /** Celebration insights */
  celebrations: {
    totalCelebrations: number;
    celebrationTypes: Record<string, number>;
    lastCelebration?: {
      trigger: string;
      entityName: string;
      daysAgo: number;
    };
  };
  /** Motivational insights */
  insights: {
    topMessage: string;
    encouragementLevel: "high" | "medium" | "low";
    suggestedActions: string[];
  };
}

interface AnalyticsParams {
  /** Number of days to analyze (default: 30) */
  days?: number;
  /** Include detailed breakdown */
  includeDetails?: boolean;
}

/**
 * Get comprehensive analytics including flexible success metrics
 */
export const getFlexibleAnalytics = api<AnalyticsParams, FlexibleAnalyticsResponse>(
  { expose: true, method: "GET", path: "/analytics/flexible" },
  async (req) => {
    const days = req.days || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get habit data with success criteria
    const habits = await habitDB.queryAll<{
      id: number;
      name: string;
      target_count: number;
      success_criteria: string | null;
    }>`
      SELECT id, name, target_count, success_criteria
      FROM habits
      WHERE created_at >= ${startDate}
    `;

    // Get habit entries for the period
    const habitEntries = await habitDB.queryAll<{
      habit_id: number;
      date: Date;
      count: number;
    }>`
      SELECT habit_id, date, count
      FROM habit_entries
      WHERE date >= ${startDate}
    `;

    // Calculate flexible success metrics for habits
    let totalHabitEntries = 0;
    let fullSuccesses = 0;
    let partialSuccesses = 0;
    let minimumSuccesses = 0;
    let traditionalSuccesses = 0;

    const habitMap = new Map(habits.map(h => [h.id, h]));

    for (const entry of habitEntries) {
      const habit = habitMap.get(entry.habit_id);
      if (!habit) continue;

      totalHabitEntries++;
      
      // Parse success criteria
      let successCriteria: FlexibleSuccess | undefined;
      if (habit.success_criteria) {
        try {
          successCriteria = JSON.parse(habit.success_criteria);
        } catch {
          successCriteria = undefined;
        }
      }

      const evaluation = evaluateHabitSuccess(
        entry.count,
        habit.target_count,
        successCriteria
      );

      if (evaluation.isFullSuccess) {
        fullSuccesses++;
        traditionalSuccesses++;
      } else if (evaluation.isPartialSuccess) {
        partialSuccesses++;
      } else if (evaluation.isMinimumSuccess) {
        minimumSuccesses++;
      }
    }

    // Get task completion data
    const taskSummary = await taskDB.queryRow<{
      total: number;
      completed: number;
    }>`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'done' THEN 1 ELSE 0 END) as completed
      FROM tasks
      WHERE created_at >= ${startDate}
    `;

    const totalTasks = Number(taskSummary?.total || 0);
    const completedTasks = Number(taskSummary?.completed || 0);

    // Calculate rates
    const traditionalHabitRate = totalHabitEntries > 0 
      ? (traditionalSuccesses / totalHabitEntries) * 100 
      : 0;
    
    const flexibleHabitRate = totalHabitEntries > 0 
      ? ((fullSuccesses + partialSuccesses + minimumSuccesses) / totalHabitEntries) * 100 
      : 0;

    const taskCompletionRate = totalTasks > 0 
      ? (completedTasks / totalTasks) * 100 
      : 0;

    // Calculate encouragement score (0-100)
    const encouragementScore = calculateEncouragementScore(
      traditionalHabitRate,
      flexibleHabitRate,
      taskCompletionRate,
      partialSuccesses,
      minimumSuccesses
    );

    // Get celebration data (mock for now - would be from celebrations table)
    const celebrations = {
      totalCelebrations: Math.floor(Math.random() * 10) + 1, // Mock data
      celebrationTypes: {
        "first_completion": 2,
        "streak_milestone": 3,
        "comeback": 1
      } as Record<string, number>
    };

    // Generate insights
    const insights = generateInsights(
      traditionalHabitRate,
      flexibleHabitRate,
      taskCompletionRate,
      encouragementScore,
      partialSuccesses,
      minimumSuccesses
    );

    return {
      traditional: {
        habitCompletionRate: Math.round(traditionalHabitRate),
        taskCompletionRate: Math.round(taskCompletionRate),
        totalHabits: habits.length,
        totalTasks: totalTasks
      },
      flexible: {
        habitFlexibleRate: Math.round(flexibleHabitRate),
        partialSuccessCount: partialSuccesses,
        minimumEffortCount: minimumSuccesses,
        encouragementScore: Math.round(encouragementScore)
      },
      successDistribution: {
        fullSuccess: fullSuccesses,
        partialSuccess: partialSuccesses,
        minimumSuccess: minimumSuccesses,
        noSuccess: totalHabitEntries - fullSuccesses - partialSuccesses - minimumSuccesses
      },
      celebrations,
      insights
    };
  }
);

/**
 * Calculate encouragement score based on various factors
 */
function calculateEncouragementScore(
  traditionalRate: number,
  flexibleRate: number,
  taskRate: number,
  partialSuccesses: number,
  minimumSuccesses: number
): number {
  let score = 0;
  
  // Base score from flexible completion rate
  score += flexibleRate * 0.4;
  
  // Bonus for any activity (showing up counts)
  if (minimumSuccesses > 0) {
    score += 20;
  }
  
  // Bonus for partial successes (good effort)
  if (partialSuccesses > 0) {
    score += 15;
  }
  
  // Task completion bonus
  score += taskRate * 0.2;
  
  // Consistency bonus (if they're doing something regularly)
  if (flexibleRate > 60) {
    score += 10;
  }
  
  // Cap at 100
  return Math.min(score, 100);
}

/**
 * Generate motivational insights based on performance
 */
function generateInsights(
  traditionalRate: number,
  flexibleRate: number,
  taskRate: number,
  encouragementScore: number,
  partialSuccesses: number,
  minimumSuccesses: number
): {
  topMessage: string;
  encouragementLevel: "high" | "medium" | "low";
  suggestedActions: string[];
} {
  let topMessage = "";
  let encouragementLevel: "high" | "medium" | "low" = "medium";
  const suggestedActions: string[] = [];

  if (encouragementScore >= 80) {
    topMessage = "🌟 You're doing amazing! Your consistency is truly inspiring.";
    encouragementLevel = "high";
    suggestedActions.push("Consider adding a new challenge");
    suggestedActions.push("Share your success with someone");
  } else if (encouragementScore >= 60) {
    topMessage = "👏 Great progress! You're building strong habits.";
    encouragementLevel = "medium";
    suggestedActions.push("Focus on consistency over perfection");
    suggestedActions.push("Celebrate your partial wins");
  } else if (encouragementScore >= 40) {
    topMessage = "✨ Every step counts. You're making progress!";
    encouragementLevel = "medium";
    suggestedActions.push("Remember: showing up is half the battle");
    suggestedActions.push("Try adjusting your goals to be more achievable");
  } else {
    topMessage = "💪 Starting is the hardest part, and you've started!";
    encouragementLevel = "low";
    suggestedActions.push("Focus on just showing up each day");
    suggestedActions.push("Consider lowering your targets temporarily");
    suggestedActions.push("Remember: progress over perfection");
  }

  // Add specific suggestions based on data
  if (partialSuccesses > minimumSuccesses) {
    suggestedActions.push("You're doing well - partial success still counts!");
  }
  
  if (minimumSuccesses > 0 && partialSuccesses === 0) {
    suggestedActions.push("Try pushing just a little bit more when you can");
  }

  return {
    topMessage,
    encouragementLevel,
    suggestedActions: suggestedActions.slice(0, 3) // Limit to 3 suggestions
  };
}