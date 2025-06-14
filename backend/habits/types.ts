export type HabitFrequency = "daily" | "weekly" | "monthly";

export interface Habit {
  id: number;
  name: string;
  emoji: string;
  description?: string;
  frequency: HabitFrequency;
  targetCount: number;
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
  startDate?: Date;
  endDate?: Date | null;
}

export interface HabitEntry {
  id: number;
  habitId: number;
  date: Date;
  count: number;
  notes?: string;
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
  completionRate: number;
  recentEntries: Array<{
    date: Date;
    completed: boolean;
    count: number;
  }>;
}
