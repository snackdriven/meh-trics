/**
 * Success criteria evaluation utilities for flexible habit and task completion
 * 
 * This module provides functions to evaluate different types of success criteria,
 * enabling users to define flexible definitions of what counts as "success" for
 * their habits and tasks.
 */

import type { FlexibleSuccess, SuccessCriteria } from "../habits/types";

export interface SuccessEvaluation {
  /** Whether the entry meets full success criteria */
  isFullSuccess: boolean;
  /** Whether the entry meets partial success criteria */
  isPartialSuccess: boolean;
  /** Whether the entry meets minimum effort criteria */
  isMinimumSuccess: boolean;
  /** Success percentage (0-100) */
  successPercentage: number;
  /** Human-readable success description */
  successDescription: string;
  /** Whether this should count towards streaks */
  countsForStreak: boolean;
}

/**
 * Evaluates success criteria for a habit entry
 */
export function evaluateHabitSuccess(
  count: number,
  targetCount: number,
  successCriteria?: FlexibleSuccess
): SuccessEvaluation {
  // Default criteria if none specified
  const criteria = successCriteria || {
    criteria: "exact",
    targetCount,
    allowPartialStreaks: false
  };

  const percentage = Math.min((count / criteria.targetCount) * 100, 100);
  
  switch (criteria.criteria) {
    case "exact":
      return evaluateExactSuccess(count, criteria.targetCount);
    
    case "minimum":
      return evaluateMinimumSuccess(count, criteria.targetCount, criteria.minimumCount);
    
    case "flexible":
      return evaluateFlexibleSuccess(count, criteria.targetCount, criteria.minimumCount, criteria.allowPartialStreaks);
    
    default:
      return evaluateExactSuccess(count, criteria.targetCount);
  }
}

/**
 * Exact success: must meet or exceed target exactly
 */
function evaluateExactSuccess(count: number, targetCount: number): SuccessEvaluation {
  const isSuccess = count >= targetCount;
  const percentage = Math.min((count / targetCount) * 100, 100);
  
  return {
    isFullSuccess: isSuccess,
    isPartialSuccess: false,
    isMinimumSuccess: isSuccess,
    successPercentage: percentage,
    successDescription: isSuccess 
      ? `Completed ${count}/${targetCount}` 
      : `Progress: ${count}/${targetCount}`,
    countsForStreak: isSuccess
  };
}

/**
 * Minimum success: partial completion counts
 */
function evaluateMinimumSuccess(
  count: number, 
  targetCount: number, 
  minimumCount?: number
): SuccessEvaluation {
  const minimum = minimumCount || Math.ceil(targetCount * 0.5); // Default to 50% if not specified
  const isFullSuccess = count >= targetCount;
  const isPartialSuccess = count >= minimum && count < targetCount;
  const isMinimumSuccess = count >= minimum;
  const percentage = Math.min((count / targetCount) * 100, 100);
  
  let description: string;
  if (isFullSuccess) {
    description = `Completed ${count}/${targetCount} ✨`;
  } else if (isPartialSuccess) {
    description = `Good effort: ${count}/${targetCount} 👏`;
  } else {
    description = `Progress: ${count}/${targetCount}`;
  }
  
  return {
    isFullSuccess,
    isPartialSuccess,
    isMinimumSuccess,
    successPercentage: percentage,
    successDescription: description,
    countsForStreak: isMinimumSuccess
  };
}

/**
 * Flexible success: both full and partial success count, with different weights
 */
function evaluateFlexibleSuccess(
  count: number,
  targetCount: number,
  minimumCount?: number,
  allowPartialStreaks: boolean = true
): SuccessEvaluation {
  const minimum = minimumCount || Math.ceil(targetCount * 0.3); // Default to 30% for flexible
  const partial = minimumCount || Math.ceil(targetCount * 0.7); // 70% for partial
  
  const isFullSuccess = count >= targetCount;
  const isPartialSuccess = count >= partial && count < targetCount;
  const isMinimumSuccess = count >= minimum;
  const percentage = Math.min((count / targetCount) * 100, 100);
  
  let description: string;
  if (isFullSuccess) {
    description = `Excellent! ${count}/${targetCount} 🎯`;
  } else if (isPartialSuccess) {
    description = `Great progress: ${count}/${targetCount} 👏`;
  } else if (isMinimumSuccess) {
    description = `Good start: ${count}/${targetCount} ✨`;
  } else {
    description = `Keep going: ${count}/${targetCount}`;
  }
  
  return {
    isFullSuccess,
    isPartialSuccess,
    isMinimumSuccess,
    successPercentage: percentage,
    successDescription: description,
    countsForStreak: allowPartialStreaks ? isMinimumSuccess : isFullSuccess
  };
}

/**
 * Evaluates task completion with flexible criteria
 */
export function evaluateTaskSuccess(
  isCompleted: boolean,
  partialCompletion?: number // 0-100 percentage
): SuccessEvaluation {
  if (isCompleted) {
    return {
      isFullSuccess: true,
      isPartialSuccess: false,
      isMinimumSuccess: true,
      successPercentage: 100,
      successDescription: "Task completed! 🎯",
      countsForStreak: true
    };
  }
  
  if (partialCompletion && partialCompletion > 0) {
    const isPartial = partialCompletion >= 70;
    const isMinimum = partialCompletion >= 30;
    
    let description: string;
    if (isPartial) {
      description = `Almost there: ${partialCompletion}% complete 👏`;
    } else if (isMinimum) {
      description = `Good start: ${partialCompletion}% complete ✨`;
    } else {
      description = `In progress: ${partialCompletion}% complete`;
    }
    
    return {
      isFullSuccess: false,
      isPartialSuccess: isPartial,
      isMinimumSuccess: isMinimum,
      successPercentage: partialCompletion,
      successDescription: description,
      countsForStreak: isMinimum
    };
  }
  
  return {
    isFullSuccess: false,
    isPartialSuccess: false,
    isMinimumSuccess: false,
    successPercentage: 0,
    successDescription: "Not started",
    countsForStreak: false
  };
}

/**
 * Calculates flexible completion rate including partial successes
 */
export function calculateFlexibleCompletionRate(
  entries: Array<{ count: number; targetCount: number; successCriteria?: FlexibleSuccess }>
): { 
  fullCompletionRate: number;
  flexibleCompletionRate: number;
  partialCompletions: number;
  totalCompletions: number;
} {
  if (entries.length === 0) {
    return {
      fullCompletionRate: 0,
      flexibleCompletionRate: 0,
      partialCompletions: 0,
      totalCompletions: 0
    };
  }
  
  let fullSuccesses = 0;
  let partialSuccesses = 0;
  let flexibleSuccesses = 0;
  
  for (const entry of entries) {
    const evaluation = evaluateHabitSuccess(
      entry.count,
      entry.targetCount,
      entry.successCriteria
    );
    
    if (evaluation.isFullSuccess) {
      fullSuccesses++;
      flexibleSuccesses++;
    } else if (evaluation.isPartialSuccess || evaluation.isMinimumSuccess) {
      partialSuccesses++;
      flexibleSuccesses++;
    }
  }
  
  return {
    fullCompletionRate: Math.round((fullSuccesses / entries.length) * 100),
    flexibleCompletionRate: Math.round((flexibleSuccesses / entries.length) * 100),
    partialCompletions: partialSuccesses,
    totalCompletions: fullSuccesses
  };
}

/**
 * Determines celebration trigger based on success evaluation
 */
export function determineCelebrationTrigger(
  evaluation: SuccessEvaluation,
  streakCount: number,
  isFirstEver: boolean,
  isComeback: boolean
): {
  shouldCelebrate: boolean;
  trigger?: "first_completion" | "streak_milestone" | "comeback" | "consistency_boost";
  successType: "full" | "partial" | "minimum";
} {
  let successType: "full" | "partial" | "minimum";
  if (evaluation.isFullSuccess) {
    successType = "full";
  } else if (evaluation.isPartialSuccess) {
    successType = "partial";
  } else {
    successType = "minimum";
  }
  
  // First completion ever
  if (isFirstEver && evaluation.isMinimumSuccess) {
    return {
      shouldCelebrate: true,
      trigger: "first_completion",
      successType
    };
  }
  
  // Comeback after a break
  if (isComeback && evaluation.isMinimumSuccess) {
    return {
      shouldCelebrate: true,
      trigger: "comeback",
      successType
    };
  }
  
  // Streak milestones (only for full or partial success)
  if (evaluation.countsForStreak && (streakCount === 3 || streakCount === 7 || streakCount === 14 || streakCount === 30 || streakCount % 50 === 0)) {
    return {
      shouldCelebrate: true,
      trigger: "streak_milestone",
      successType
    };
  }
  
  // Consistency boost (regular encouragement)
  if (evaluation.isMinimumSuccess && streakCount > 1) {
    return {
      shouldCelebrate: false, // Don't celebrate every success, just acknowledge
      trigger: "consistency_boost",
      successType
    };
  }
  
  return {
    shouldCelebrate: false,
    successType
  };
}