import type { AppEvent, EventBus, EventHandler } from "./types";

// Simple event topic interface for compatibility
interface EventTopic<T> {
  publish(event: T): Promise<void>;
  subscription(name: string, config: { handler: (event: T) => Promise<void> }): void;
  unsubscribe(name: string): void;
}

// Mock event topic implementation (will be replaced with actual Encore PubSub when available)
class MockEventTopic<T> implements EventTopic<T> {
  private handlers: Array<(event: T) => Promise<void>> = [];
  private handlerNames: Map<string, (event: T) => Promise<void>> = new Map();

  async publish(event: T): Promise<void> {
    // Process all handlers with individual error handling
    const results = await Promise.allSettled(this.handlers.map((handler) => handler(event)));

    // Log any handler errors but don't fail the entire publish operation
    const errors = results
      .filter((result): result is PromiseRejectedResult => result.status === "rejected")
      .map((result) => result.reason);

    if (errors.length > 0) {
      console.error(`${errors.length} event handlers failed during publish:`, errors);
    }
  }

  subscription(name: string, config: { handler: (event: T) => Promise<void> }): void {
    // Remove existing handler if name already exists to prevent duplicates
    this.unsubscribe(name);

    this.handlers.push(config.handler);
    this.handlerNames.set(name, config.handler);
    console.log(`Event subscription created: ${name}`);
  }

  unsubscribe(name: string): void {
    const handler = this.handlerNames.get(name);
    if (handler) {
      const index = this.handlers.indexOf(handler);
      if (index > -1) {
        this.handlers.splice(index, 1);
      }
      this.handlerNames.delete(name);
      console.log(`Event subscription removed: ${name}`);
    }
  }
}

// Create a pub/sub topic for events
export const eventTopic = new MockEventTopic<AppEvent>();

// In-memory event bus implementation for local development
class InMemoryEventBus implements EventBus {
  public handlers = new Map<string, EventHandler[]>();

  async publish<T extends AppEvent>(event: T): Promise<void> {
    // Publish to Encore pub/sub for distributed processing
    await eventTopic.publish(event);

    // Also handle locally for immediate processing with individual error handling
    const handlers = this.handlers.get(event.type) || [];
    const results = await Promise.allSettled(handlers.map((handler) => handler.handle(event)));

    // Log any handler errors but don't fail the entire publish operation
    const errors = results
      .filter((result): result is PromiseRejectedResult => result.status === "rejected")
      .map((result) => result.reason);

    if (errors.length > 0) {
      console.error(`${errors.length} local event handlers failed for ${event.type}:`, errors);
    }
  }

  subscribe<T extends AppEvent>(eventType: T["type"], handler: EventHandler<T>): void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }
    this.handlers.get(eventType)?.push(handler as EventHandler);
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
    // Route event to appropriate handlers with individual error handling
    const handlers = eventBus.handlers.get(event.type) || [];
    const results = await Promise.allSettled(
      handlers.map((handler: EventHandler) => handler.handle(event))
    );

    // Log any handler errors but don't fail the entire subscription
    const errors = results
      .filter((result): result is PromiseRejectedResult => result.status === "rejected")
      .map((result) => result.reason);

    if (errors.length > 0) {
      console.error(`${errors.length} subscription handlers failed for ${event.type}:`, errors);
    }
  },
});

// Utility function to create an event with metadata
export function createEvent<T extends AppEvent>(
  type: T["type"],
  source: string,
  data: T["data"]
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
