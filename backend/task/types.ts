export type Priority = 1 | 2 | 3 | 4 | 5;
export type HabitFrequency = "daily" | "weekly" | "monthly";

export interface Task {
  id: number;
  title: string;
  description?: string;
  completed: boolean;
  priority: Priority;
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  priority?: Priority;
  dueDate?: Date;
}

export interface UpdateTaskRequest {
  id: number;
  title?: string;
  description?: string;
  completed?: boolean;
  priority?: Priority;
  dueDate?: Date;
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
  moodScore: number;
  notes?: string;
  createdAt: Date;
}

export interface CreateMoodEntryRequest {
  date: Date;
  moodScore: number;
  notes?: string;
}
