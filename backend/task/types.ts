export type Priority = 1 | 2 | 3 | 4 | 5;
export type HabitFrequency = "daily" | "weekly" | "monthly";
export type TaskStatus = "todo" | "in_progress" | "done";
export type MoodTier = "uplifted" | "neutral" | "heavy";
export type EnergyLevel = "high" | "medium" | "low";

export interface Task {
  id: number;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: Priority;
  dueDate?: Date;
  tags: string[];
  energyLevel?: EnergyLevel;
  isHardDeadline: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  priority?: Priority;
  dueDate?: Date;
  tags?: string[];
  energyLevel?: EnergyLevel;
  isHardDeadline?: boolean;
}

export interface UpdateTaskRequest {
  id: number;
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: Priority;
  dueDate?: Date;
  tags?: string[];
  energyLevel?: EnergyLevel;
  isHardDeadline?: boolean;
}

export interface Habit {
  id: number;
  name: string;
  description?: string;
  frequency: HabitFrequency;
  targetCount: number;
  startDate: Date;
  endDate?: Date;
  createdAt: Date;
}

export interface CreateHabitRequest {
  name: string;
  description?: string;
  frequency: HabitFrequency;
  targetCount?: number;
  startDate: Date;
  endDate?: Date;
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

export interface MoodEntry {
  id: number;
  date: Date;
  tier: MoodTier;
  emoji: string;
  label: string;
  notes?: string;
  createdAt: Date;
}

export interface CreateMoodEntryRequest {
  date: Date;
  tier: MoodTier;
  emoji: string;
  label: string;
  notes?: string;
}

export interface JournalEntry {
  id: number;
  date: Date;
  whatHappened?: string;
  whatINeed?: string;
  smallWin?: string;
  whatFeltHard?: string;
  thoughtToRelease?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateJournalEntryRequest {
  date: Date;
  whatHappened?: string;
  whatINeed?: string;
  smallWin?: string;
  whatFeltHard?: string;
  thoughtToRelease?: string;
}

export interface UpdateJournalEntryRequest {
  id: number;
  whatHappened?: string;
  whatINeed?: string;
  smallWin?: string;
  whatFeltHard?: string;
  thoughtToRelease?: string;
}

export interface RoutineItem {
  id: number;
  name: string;
  emoji: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
}

export interface CreateRoutineItemRequest {
  name: string;
  emoji: string;
  sortOrder?: number;
}

export interface UpdateRoutineItemRequest {
  id: number;
  name?: string;
  emoji?: string;
  isActive?: boolean;
  sortOrder?: number;
}

export interface RoutineEntry {
  id: number;
  routineItemId: number;
  date: Date;
  completed: boolean;
  createdAt: Date;
}

export interface CreateRoutineEntryRequest {
  routineItemId: number;
  date: Date;
  completed: boolean;
}
