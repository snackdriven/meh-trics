// Setup and initialization for event-driven architecture
import { eventBus } from "./event-bus";
import {
  AnalyticsEventHandler,
  CrossServiceAnalyticsHandler,
  HabitAnalyticsHandler,
  MoodAnalyticsHandler,
} from "./handlers/analytics-handler";
import {
  HabitStreakNotificationHandler,
  MoodReminderHandler,
  TaskDeadlineNotificationHandler,
} from "./handlers/notification-handler";
import { JournalTaggingHandler, TaskTaggingHandler } from "./handlers/tagging-handler";

// Initialize all event handlers
export function setupEventHandlers(): void {
  console.log("Setting up event handlers...");

  // Analytics handlers
  eventBus.subscribe("analytics.tracked", new AnalyticsEventHandler());
  eventBus.subscribe("task.completed", new CrossServiceAnalyticsHandler());
  eventBus.subscribe("mood.created", new MoodAnalyticsHandler());
  eventBus.subscribe("habit.completed", new HabitAnalyticsHandler());

  // Tagging handlers
  eventBus.subscribe("task.created", new TaskTaggingHandler());
  eventBus.subscribe("journal.created", new JournalTaggingHandler());

  // Notification handlers
  eventBus.subscribe("task.created", new TaskDeadlineNotificationHandler());
  eventBus.subscribe("habit.completed", new HabitStreakNotificationHandler());
  eventBus.subscribe("mood.created", new MoodReminderHandler());

  console.log("Event handlers setup complete");
}

// Call this during application startup
setupEventHandlers();
