/**
 * Success criteria evaluation utilities for flexible habit and task completion
 * 
 * This module provides functions to evaluate different types of success criteria,
 * enabling users to define flexible definitions of what counts as "success" for
 * their habits and tasks.
 */

import type { FlexibleSuccess, SuccessCriteria, CelebrationTrigger } from "../habits/types";

export interface SuccessEvaluation {
  /** Full success - meets or exceeds target */
  isFullSuccess: boolean;
  /** Partial success - meaningful progress but below target */
  isPartialSuccess: boolean;
  /** Minimum success - some effort made */
  isMinimumSuccess: boolean;
  /** Whether this should count towards streaks */
  countsForStreak: boolean;
  /** Success percentage (0-100) */
  successPercentage: number;
}

/**
 * Evaluates habit completion against flexible success criteria
 */
export function evaluateHabitSuccess(
  actualCount: number,
  targetCount: number,
  flexibleCriteria?: FlexibleSuccess
): SuccessEvaluation {
  const successPercentage = targetCount > 0 ? (actualCount / targetCount) * 100 : 0;
  
  // Default criteria if none provided
  const criteria: FlexibleSuccess = flexibleCriteria || {
    criteria: "exact",
    targetCount,
    allowPartialStreaks: false
  };

  let isFullSuccess = false;
  let isPartialSuccess = false;
  let isMinimumSuccess = false;

  switch (criteria.criteria) {
    case "exact":
      isFullSuccess = actualCount >= targetCount;
      break;
      
    case "minimum":
      const minCount = criteria.minimumCount || Math.max(1, Math.floor(targetCount * 0.5));
      isFullSuccess = actualCount >= targetCount;
      isPartialSuccess = actualCount >= minCount && actualCount < targetCount;
      break;
      
    case "flexible":
      const flexMinCount = criteria.minimumCount || Math.max(1, Math.floor(targetCount * 0.3));
      const partialThreshold = Math.floor(targetCount * 0.7);
      
      isFullSuccess = actualCount >= targetCount;
      isPartialSuccess = actualCount >= partialThreshold && actualCount < targetCount;
      isMinimumSuccess = actualCount >= flexMinCount && actualCount < partialThreshold;
      break;
  }

  // Determine if this counts for streaks
  const countsForStreak = isFullSuccess || 
    (criteria.allowPartialStreaks && (isPartialSuccess || isMinimumSuccess));

  return {
    isFullSuccess,
    isPartialSuccess,
    isMinimumSuccess,
    countsForStreak,
    successPercentage: Math.round(successPercentage)
  };
}

/**
 * Calculate flexible completion rate including partial successes
 */
export function calculateFlexibleCompletionRate(
  entries: Array<{ count: number; targetCount: number; successCriteria?: FlexibleSuccess }>,
  includePartialSuccess: boolean = true
): number {
  if (entries.length === 0) return 0;

  let successfulEntries = 0;

  for (const entry of entries) {
    const evaluation = evaluateHabitSuccess(
      entry.count,
      entry.targetCount,
      entry.successCriteria
    );

    if (evaluation.isFullSuccess) {
      successfulEntries++;
    } else if (includePartialSuccess && (evaluation.isPartialSuccess || evaluation.isMinimumSuccess)) {
      // Weight partial/minimum successes less than full successes
      successfulEntries += evaluation.isPartialSuccess ? 0.7 : 0.4;
    }
  }

  return Math.round((successfulEntries / entries.length) * 100);
}

/**
 * Determine if a celebration should be triggered
 */
export function determineCelebrationTrigger(
  evaluation: SuccessEvaluation,
  currentStreak: number,
  isFirstEver: boolean,
  isComeback: boolean
): { shouldCelebrate: boolean; trigger?: CelebrationTrigger } {
  // First completion ever
  if (isFirstEver && evaluation.isMinimumSuccess) {
    return { shouldCelebrate: true, trigger: "first_completion" };
  }

  // Comeback after a break
  if (isComeback && evaluation.isMinimumSuccess) {
    return { shouldCelebrate: true, trigger: "comeback" };
  }

  // Streak milestones (only for full successes)
  if (evaluation.isFullSuccess) {
    const streakMilestones = [3, 7, 14, 21, 30, 60, 100];
    if (streakMilestones.includes(currentStreak)) {
      return { shouldCelebrate: true, trigger: "streak_milestone" };
    }
  }

  // Weekly consistency (7 days with any success)
  if (currentStreak >= 7 && evaluation.countsForStreak) {
    const weeklyMilestone = currentStreak % 7 === 0;
    if (weeklyMilestone) {
      return { shouldCelebrate: true, trigger: "weekly_goal" };
    }
  }

  // Monthly consistency (30 days)
  if (currentStreak >= 30 && evaluation.countsForStreak) {
    const monthlyMilestone = currentStreak % 30 === 0;
    if (monthlyMilestone) {
      return { shouldCelebrate: true, trigger: "monthly_goal" };
    }
  }

  // Consistency boost for regular partial successes
  if (evaluation.isPartialSuccess && currentStreak >= 3) {
    return { shouldCelebrate: true, trigger: "consistency_boost" };
  }

  return { shouldCelebrate: false };
}

/**
 * Get success criteria recommendations based on user performance
 */
export function getSuccessCriteriaRecommendations(
  recentPerformance: Array<{ 
    actualCount: number; 
    targetCount: number; 
    date: Date; 
  }>,
  currentCriteria?: FlexibleSuccess
): {
  recommendation: SuccessCriteria;
  reasoning: string;
  suggestedMinimum?: number;
} {
  if (recentPerformance.length === 0) {
    return {
      recommendation: "flexible",
      reasoning: "Starting with flexible criteria to build momentum"
    };
  }

  const last14Days = recentPerformance.slice(-14);
  const successRate = last14Days.filter(p => p.actualCount >= p.targetCount).length / last14Days.length;
  const avgPerformance = last14Days.reduce((sum, p) => sum + (p.actualCount / p.targetCount), 0) / last14Days.length;

  if (successRate >= 0.8) {
    return {
      recommendation: "exact",
      reasoning: "High success rate - ready for exact target matching"
    };
  } else if (successRate >= 0.5 || avgPerformance >= 0.7) {
    return {
      recommendation: "minimum",
      reasoning: "Good progress - minimum criteria will help maintain momentum",
      suggestedMinimum: Math.max(1, Math.floor(last14Days[0]?.targetCount * 0.6))
    };
  } else {
    return {
      recommendation: "flexible",
      reasoning: "Building consistency - flexible criteria will encourage progress",
      suggestedMinimum: Math.max(1, Math.floor(last14Days[0]?.targetCount * 0.3))
    };
  }
}

/**
 * Calculate habit momentum score (0-100)
 */
export function calculateMomentumScore(
  recentEntries: Array<{
    date: Date;
    evaluation: SuccessEvaluation;
  }>
): number {
  if (recentEntries.length === 0) return 0;

  const weights = recentEntries.map((_, index) => {
    // More recent entries have higher weight
    return Math.pow(0.9, recentEntries.length - 1 - index);
  });

  const weightedSum = recentEntries.reduce((sum, entry, index) => {
    let score = 0;
    if (entry.evaluation.isFullSuccess) score = 100;
    else if (entry.evaluation.isPartialSuccess) score = 70;
    else if (entry.evaluation.isMinimumSuccess) score = 40;

    return sum + (score * weights[index]!);
  }, 0);

  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  
  return Math.round(weightedSum / totalWeight);
}