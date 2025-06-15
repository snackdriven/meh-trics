// Note: Using mock implementation until PubSub import is resolved

// Generic message interface for queued operations
export interface QueueMessage<T = unknown> {
  id: string;
  type: string;
  payload: T;
  priority: 'low' | 'medium' | 'high';
  timestamp: Date;
  retryCount: number;
  maxRetries: number;
  delayUntil?: Date;
}

// Task processing queue
export interface TaskProcessingMessage {
  userId: string;
  taskId: string;
  operation: 'create' | 'update' | 'complete' | 'delete';
  data: Record<string, unknown>;
}

// Mock queue implementation
interface MockQueue<T> {
  publish(message: T): Promise<void>;
  subscription(name: string, config: { handler: (message: T) => Promise<void> }): void;
}

class MockPubSubQueue<T> implements MockQueue<T> {
  private handlers: Array<(message: T) => Promise<void>> = [];

  async publish(message: T): Promise<void> {
    console.log(`Publishing message to queue:`, message);
    // Process all handlers immediately (in production, this would be async)
    await Promise.all(this.handlers.map(handler => handler(message)));
  }

  subscription(name: string, config: { handler: (message: T) => Promise<void> }): void {
    this.handlers.push(config.handler);
    console.log(`Queue subscription created: ${name}`);
  }
}

export const taskProcessingQueue = new MockPubSubQueue<QueueMessage<TaskProcessingMessage>>();

// Analytics processing queue
export interface AnalyticsMessage {
  userId: string;
  eventType: string;
  properties: Record<string, unknown>;
  sessionId?: string;
}

export const analyticsQueue = new MockPubSubQueue<QueueMessage<AnalyticsMessage>>();

// Notification queue
export interface NotificationMessage {
  userId: string;
  type: 'push' | 'email' | 'in-app';
  title: string;
  message: string;
  metadata?: Record<string, unknown>;
  scheduledFor?: Date;
}

export const notificationQueue = new MockPubSubQueue<QueueMessage<NotificationMessage>>();

// Insights computation queue (for heavy analytics)
export interface InsightsMessage {
  userId: string;
  computationType: 'weekly' | 'monthly' | 'trends' | 'patterns';
  dateRange: {
    start: Date;
    end: Date;
  };
  force?: boolean; // Force recomputation
}

export const insightsQueue = new MockPubSubQueue<QueueMessage<InsightsMessage>>();

// Utility function to create a queue message
export function createQueueMessage<T>(
  type: string,
  payload: T,
  priority: 'low' | 'medium' | 'high' = 'medium',
  maxRetries: number = 3,
  delayUntil?: Date
): QueueMessage<T> {
  return {
    id: crypto.randomUUID(),
    type,
    payload,
    priority,
    timestamp: new Date(),
    retryCount: 0,
    maxRetries,
    delayUntil,
  };
}

// Queue processor base class
export abstract class QueueProcessor<T> {
  abstract process(message: QueueMessage<T>): Promise<void>;
  
  protected async handleWithRetry(message: QueueMessage<T>): Promise<void> {
    try {
      await this.process(message);
    } catch (error) {
      console.error(`Queue processing failed for message ${message.id}:`, error);
      
      if (message.retryCount < message.maxRetries) {
        // Exponential backoff retry
        const delay = Math.pow(2, message.retryCount) * 1000;
        const retryMessage = {
          ...message,
          retryCount: message.retryCount + 1,
          delayUntil: new Date(Date.now() + delay),
        };
        
        // Re-queue with delay (would need proper delayed queue implementation)
        console.log(`Retrying message ${message.id} in ${delay}ms (attempt ${retryMessage.retryCount}/${message.maxRetries})`);
      } else {
        console.error(`Message ${message.id} failed after ${message.maxRetries} retries, moving to DLQ`);
        await this.handleDeadLetter(message, error);
      }
    }
  }
  
  protected async handleDeadLetter(message: QueueMessage<T>, error: unknown): Promise<void> {
    // Log to dead letter queue or error tracking service
    console.error('Dead letter:', { message, error });
  }
}