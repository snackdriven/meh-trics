import { PubSub } from "encore.dev/pubsub";
import { AppEvent, EventHandler, EventBus } from "./types";

// Create a pub/sub topic for events
export const eventTopic = new PubSub<AppEvent>("app-events", {
  // Configure message ordering by user ID for consistency
  orderingKey: (event) => event.data.userId || event.source,
});

// In-memory event bus implementation for local development
class InMemoryEventBus implements EventBus {
  private handlers = new Map<string, EventHandler[]>();

  async publish<T extends AppEvent>(event: T): Promise<void> {
    // Publish to Encore pub/sub for distributed processing
    await eventTopic.publish(event);
    
    // Also handle locally for immediate processing
    const handlers = this.handlers.get(event.type) || [];
    await Promise.all(handlers.map(handler => handler.handle(event as any)));
  }

  subscribe<T extends AppEvent>(eventType: T['type'], handler: EventHandler<T>): void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }
    this.handlers.get(eventType)!.push(handler as EventHandler);
  }

  unsubscribe(eventType: string, handler: EventHandler): void {
    const handlers = this.handlers.get(eventType);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }
}

// Global event bus instance
export const eventBus = new InMemoryEventBus();

// Subscription handler for distributed events
export const eventSubscription = eventTopic.subscription("main-handler", {
  handler: async (event: AppEvent) => {
    // Route event to appropriate handlers
    const handlers = (eventBus as any).handlers.get(event.type) || [];
    await Promise.all(handlers.map((handler: EventHandler) => handler.handle(event)));
  },
});

// Utility function to create an event with metadata
export function createEvent<T extends AppEvent>(
  type: T['type'],
  source: string,
  data: T['data']
): T {
  return {
    id: crypto.randomUUID(),
    timestamp: new Date(),
    source,
    version: "1.0.0",
    type,
    data,
  } as T;
}