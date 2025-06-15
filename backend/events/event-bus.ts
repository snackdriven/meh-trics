import { AppEvent, EventHandler, EventBus } from "./types";

// Simple event topic interface for compatibility
interface EventTopic<T> {
  publish(event: T): Promise<void>;
  subscription(name: string, config: { handler: (event: T) => Promise<void> }): void;
}

// Mock event topic implementation (will be replaced with actual Encore PubSub when available)
class MockEventTopic<T> implements EventTopic<T> {
  private handlers: Array<(event: T) => Promise<void>> = [];

  async publish(event: T): Promise<void> {
    // Process all handlers
    await Promise.all(this.handlers.map(handler => handler(event)));
  }

  subscription(name: string, config: { handler: (event: T) => Promise<void> }): void {
    this.handlers.push(config.handler);
    console.log(`Event subscription created: ${name}`);
  }
}

// Create a pub/sub topic for events
export const eventTopic = new MockEventTopic<AppEvent>();

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