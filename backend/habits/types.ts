export type HabitFrequency = "daily" | "weekly" | "monthly";

/**
 * Success criteria types for flexible habit completion
 */
export type SuccessCriteria = "exact" | "minimum" | "flexible";

export interface FlexibleSuccess {
  /** Type of success criteria */
  criteria: SuccessCriteria;
  /** Target count for the habit */
  targetCount: number;
  /** Minimum count that still counts as "partial success" */
  minimumCount?: number;
  /** Whether partial success should count towards streaks */
  allowPartialStreaks: boolean;
}

export interface Habit {
  id: number;
  name: string;
  emoji: string;
  description?: string;
  frequency: HabitFrequency;
  targetCount: number;
  /** Enhanced success criteria for flexible definitions */
  successCriteria?: FlexibleSuccess;
  startDate: Date;
  endDate?: Date;
  createdAt: Date;
}

export interface CreateHabitRequest {
  name: string;
  emoji: string;
  description?: string;
  frequency: HabitFrequency;
  targetCount?: number;
  /** Enhanced success criteria for flexible definitions */
  successCriteria?: FlexibleSuccess;
  startDate: Date;
  endDate?: Date;
}

export interface UpdateHabitRequest {
  id: number;
  name?: string;
  emoji?: string;
  description?: string;
  frequency?: HabitFrequency;
  targetCount?: number;
  /** Enhanced success criteria for flexible definitions */
  successCriteria?: FlexibleSuccess;
  startDate?: Date;
  endDate?: Date | null;
}

export interface HabitEntry {
  id: number;
  habitId: number;
  date: Date;
  count: number;
  notes?: string;
  /** Indicates if this entry meets success criteria */
  isSuccess?: boolean;
  /** Indicates if this entry meets partial success criteria */
  isPartialSuccess?: boolean;
  createdAt: Date;
}

export interface CreateHabitEntryRequest {
  habitId: number;
  date: Date;
  count?: number;
  notes?: string;
}

export interface HabitStats {
  habitId: number;
  currentStreak: number;
  longestStreak: number;
  totalCompletions: number;
  /** Completions that met partial success criteria */
  partialCompletions: number;
  completionRate: number;
  /** Rate including partial successes */
  flexibleCompletionRate: number;
  recentEntries: Array<{
    date: Date;
    completed: boolean;
    partiallyCompleted: boolean;
    count: number;
  }>;
}

/**
 * Celebration trigger types
 */
export type CelebrationTrigger = 
  | "first_completion"
  | "streak_milestone" 
  | "weekly_goal"
  | "monthly_goal"
  | "comeback"
  | "consistency_boost";

export interface CelebrationMoment {
  id: number;
  userId?: number;
  trigger: CelebrationTrigger;
  title: string;
  message: string;
  /** Associated habit or task ID */
  entityId?: number;
  entityType: "habit" | "task";
  /** Milestone achieved (e.g., "7 day streak") */
  milestone?: string;
  /** Visual celebration style */
  celebrationType: "confetti" | "sparkles" | "badges" | "gentle";
  createdAt: Date;
  /** Whether user has acknowledged this celebration */
  acknowledged?: boolean;
}
