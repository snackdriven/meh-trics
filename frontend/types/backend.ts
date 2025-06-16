// Re-export backend types for easier imports
import { calendar, habits, mood, task } from "~backend/client";

// Task types
export type Task = task.Task;
export type TaskStatus = task.TaskStatus;
export type EnergyLevel = task.EnergyLevel;
export type Priority = task.Priority;
export type CalendarEvent = task.CalendarEvent;
export type JournalEntry = task.JournalEntry;
export type JournalTemplate = task.JournalTemplate;
export type MoodEntry = task.MoodEntry;
export type MoodTier = task.MoodTier;
export type RecurringTask = task.RecurringTask;
export type RecurringFrequency = task.RecurringFrequency;
export type RoutineEntry = task.RoutineEntry;
export type RoutineItem = task.RoutineItem;
export type CreateTaskRequest = task.CreateTaskRequest;
export type UpdateTaskRequest = task.UpdateTaskRequest;
export type CreateCalendarEventRequest = task.CreateCalendarEventRequest;
export type UpdateCalendarEventRequest = task.UpdateCalendarEventRequest;
export type CreateJournalEntryRequest = task.CreateJournalEntryRequest;
export type UpdateJournalEntryRequest = task.UpdateJournalEntryRequest;
export type CreateMoodEntryRequest = task.CreateMoodEntryRequest;
export type CreateRecurringTaskRequest = task.CreateRecurringTaskRequest;
export type UpdateRecurringTaskRequest = task.UpdateRecurringTaskRequest;
export type CreateRoutineEntryRequest = task.CreateRoutineEntryRequest;
export type CreateRoutineItemRequest = task.CreateRoutineItemRequest;
export type UpdateRoutineItemRequest = task.UpdateRoutineItemRequest;
export type ListTasksParams = task.ListTasksParams;
export type ListDueTasksParams = task.ListDueTasksParams;
export type ListJournalEntriesParams = task.ListJournalEntriesParams;
export type ListRoutineEntriesParams = task.ListRoutineEntriesParams;
export type DashboardData = task.DashboardData;
export type EventRecurrence = task.EventRecurrence;
export type SearchResult = task.SearchResult;

// Habit types
export type Habit = habits.Habit;
export type HabitEntry = habits.HabitEntry;
export type HabitStats = habits.HabitStats;
export type HabitFrequency = habits.HabitFrequency;
export type CreateHabitRequest = habits.CreateHabitRequest;
export type CreateHabitEntryRequest = habits.CreateHabitEntryRequest;
export type UpdateHabitRequest = habits.UpdateHabitRequest;
export type ListHabitEntriesParams = habits.ListHabitEntriesParams;
export type FlexibleSuccess = habits.FlexibleSuccess;
export type SuccessCriteria = habits.SuccessCriteria;

// Namespace re-exports for compatibility
export { task, habits, mood, calendar };
