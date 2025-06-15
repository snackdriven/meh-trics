// Event system types for cross-service communication

export interface BaseEvent {
  id: string;
  timestamp: Date;
  source: string;
  version: string;
}

// Task Events
export interface TaskCreatedEvent extends BaseEvent {
  type: 'task.created';
  data: {
    taskId: string;
    userId: string;
    title: string;
    dueDate?: Date;
    priority?: 'low' | 'medium' | 'high';
    tags?: string[];
  };
}

export interface TaskCompletedEvent extends BaseEvent {
  type: 'task.completed';
  data: {
    taskId: string;
    userId: string;
    completedAt: Date;
    duration?: number;
  };
}

export interface TaskUpdatedEvent extends BaseEvent {
  type: 'task.updated';
  data: {
    taskId: string;
    userId: string;
    changes: Record<string, unknown>;
  };
}

// Habit Events
export interface HabitCreatedEvent extends BaseEvent {
  type: 'habit.created';
  data: {
    habitId: string;
    userId: string;
    name: string;
    frequency: string;
  };
}

export interface HabitCompletedEvent extends BaseEvent {
  type: 'habit.completed';
  data: {
    habitId: string;
    userId: string;
    entryId: string;
    completedAt: Date;
    success: boolean;
  };
}

// Mood Events
export interface MoodEntryCreatedEvent extends BaseEvent {
  type: 'mood.created';
  data: {
    moodId: string;
    userId: string;
    mood: number;
    energy?: number;
    notes?: string;
  };
}

// Journal Events
export interface JournalEntryCreatedEvent extends BaseEvent {
  type: 'journal.created';
  data: {
    entryId: string;
    userId: string;
    type: 'quick' | 'freeform';
    content: string;
    linkedEntries?: string[];
  };
}

// Calendar Events
export interface CalendarEventCreatedEvent extends BaseEvent {
  type: 'calendar.created';
  data: {
    eventId: string;
    userId: string;
    title: string;
    startTime: Date;
    endTime: Date;
  };
}

// Analytics Events
export interface AnalyticsEvent extends BaseEvent {
  type: 'analytics.tracked';
  data: {
    userId: string;
    eventType: string;
    properties: Record<string, unknown>;
  };
}

// Union type for all events
export type AppEvent = 
  | TaskCreatedEvent
  | TaskCompletedEvent
  | TaskUpdatedEvent
  | HabitCreatedEvent
  | HabitCompletedEvent
  | MoodEntryCreatedEvent
  | JournalEntryCreatedEvent
  | CalendarEventCreatedEvent
  | AnalyticsEvent;

// Event handler interface
export interface EventHandler<T extends AppEvent = AppEvent> {
  eventType: T['type'];
  handle(event: T): Promise<void>;
}

// Event bus interface
export interface EventBus {
  publish<T extends AppEvent>(event: T): Promise<void>;
  subscribe<T extends AppEvent>(eventType: T['type'], handler: EventHandler<T>): void;
  unsubscribe(eventType: string, handler: EventHandler): void;
}