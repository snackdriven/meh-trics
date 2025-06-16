import { AnalyticsProcessor } from "./processors/analytics-processor";
import { TaskProcessor } from "./processors/task-processor";
// Setup message queue processors and subscriptions
import { analyticsQueue, insightsQueue, notificationQueue, taskProcessingQueue } from "./queue";

// Initialize queue processors
export function setupQueueProcessors(): void {
  console.log("Setting up queue processors...");

  // Task processing queue
  const taskProcessor = new TaskProcessor();
  const taskSubscription = taskProcessingQueue.subscription("task-processor", {
    handler: async (message) => {
      await taskProcessor.handleWithRetry(message);
    },
  });

  // Analytics processing queue
  const analyticsProcessor = new AnalyticsProcessor();
  const analyticsSubscription = analyticsQueue.subscription("analytics-processor", {
    handler: async (message) => {
      await analyticsProcessor.handleWithRetry(message);
    },
  });

  // Notification queue (simple handler for now)
  const notificationSubscription = notificationQueue.subscription("notification-processor", {
    handler: async (message) => {
      console.log("Processing notification:", {
        userId: message.payload.userId,
        type: message.payload.type,
        title: message.payload.title,
        scheduledFor: message.payload.scheduledFor,
      });

      // Here would integrate with actual notification services
      // (push notifications, email, SMS, etc.)
    },
  });

  // Insights computation queue
  const insightsSubscription = insightsQueue.subscription("insights-processor", {
    handler: async (message) => {
      console.log("Processing insights computation:", {
        userId: message.payload.userId,
        computationType: message.payload.computationType,
        dateRange: message.payload.dateRange,
      });

      // Here would trigger actual insights computation
      // Could call the insights service or run heavy analytics
    },
  });

  console.log("Queue processors setup complete");
}

// Call this during application startup
setupQueueProcessors();
