export type Priority = 1 | 2 | 3 | 4 | 5;
export type TaskStatus = "todo" | "in_progress" | "done" | "archived";
export type MoodTier = "uplifted" | "neutral" | "heavy";
export type EnergyLevel = "high" | "medium" | "low";
export type RecurringFrequency = "daily" | "weekly" | "monthly";
export type EventRecurrence =
  | "none"
  | "daily"
  | "weekly"
  | "monthly"
  | "yearly";

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
  sortOrder: number;
  recurringTaskId?: number;
  createdAt: Date;
  updatedAt: Date;
  archivedAt?: Date;
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
  dueDate?: Date | null;
  tags?: string[];
  energyLevel?: EnergyLevel;
  isHardDeadline?: boolean;
  sortOrder?: number;
  archivedAt?: Date | null;
}

export interface ReorderTasksRequest {
  taskIds: number[];
}

export interface RecurringTask {
  id: number;
  title: string;
  description?: string;
  frequency: RecurringFrequency;
  /** Maximum completions allowed within a cycle */
  maxOccurrencesPerCycle: number;
  priority: Priority;
  tags: string[];
  energyLevel?: EnergyLevel;
  isActive: boolean;
  nextDueDate: Date;
  createdAt: Date;
}

export interface CreateRecurringTaskRequest {
  title: string;
  description?: string;
  frequency: RecurringFrequency;
  /** How many times this task should occur per cycle */
  maxOccurrencesPerCycle?: number;
  priority?: Priority;
  tags?: string[];
  energyLevel?: EnergyLevel;
  nextDueDate: Date;
}

export interface UpdateRecurringTaskRequest {
  id: number;
  title?: string;
  description?: string;
  frequency?: RecurringFrequency;
  maxOccurrencesPerCycle?: number;
  priority?: Priority;
  tags?: string[];
  energyLevel?: EnergyLevel;
  isActive?: boolean;
  nextDueDate?: Date;
}

export interface MoodEntry {
  id: number;
  date: Date;
  tier: MoodTier;
  emoji: string;
  label: string;
  secondaryTier?: MoodTier;
  secondaryEmoji?: string;
  secondaryLabel?: string;
  tags?: string[];
  notes?: string;
  createdAt: Date;
}

export interface CreateMoodEntryRequest {
  date: Date;
  tier: MoodTier;
  emoji: string;
  label: string;
  secondaryTier?: MoodTier;
  secondaryEmoji?: string;
  secondaryLabel?: string;
  tags?: string[];
  notes?: string;
}

export interface JournalEntry {
  id: number;
  date?: Date;
  text: string;
  tags: string[];
  moodId?: number;
  taskId?: number;
  habitEntryId?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateJournalEntryRequest {
  date?: Date;
  text: string;
  tags?: string[];
  moodId?: number;
  taskId?: number;
  habitEntryId?: number;
}

export interface UpdateJournalEntryRequest {
  id: number;
  text?: string;
  tags?: string[];
  moodId?: number;
  taskId?: number;
  habitEntryId?: number;
}

export interface JournalTemplate {
  id: number;
  title: string;
  text: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateJournalTemplateRequest {
  title: string;
  text: string;
  tags?: string[];
}

export interface UpdateJournalTemplateRequest {
  id: number;
  title?: string;
  text?: string;
  tags?: string[];
}

export interface RoutineItem {
  id: number;
  name: string;
  emoji: string;
  groupName?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
}

export interface CreateRoutineItemRequest {
  name: string;
  emoji: string;
  isActive?: boolean;
  sortOrder?: number;
  groupName?: string;
}

export interface UpdateRoutineItemRequest {
  id: number;
  name?: string;
  emoji?: string;
  isActive?: boolean;
  sortOrder?: number;
  groupName?: string;
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

export interface CalendarEvent {
  id: number;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  isAllDay: boolean;
  location?: string;
  color?: string;
  recurrence: EventRecurrence;
  recurrenceEndDate?: Date;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCalendarEventRequest {
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  isAllDay?: boolean;
  location?: string;
  color?: string;
  recurrence?: EventRecurrence;
  recurrenceEndDate?: Date;
  tags?: string[];
}

export interface UpdateCalendarEventRequest {
  id: number;
  title?: string;
  description?: string;
  startTime?: Date;
  endTime?: Date;
  isAllDay?: boolean;
  location?: string;
  color?: string;
  recurrence?: EventRecurrence;
  recurrenceEndDate?: Date;
  tags?: string[];
}
