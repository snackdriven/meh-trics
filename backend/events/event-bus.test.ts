import { beforeEach, describe, expect, it, vi } from "vitest";
import { createEvent, eventBus } from "./event-bus";
import type { EventHandler, TaskCreatedEvent } from "./types";

describe("Event Bus", () => {
  beforeEach(() => {
    // Clear all handlers before each test
    eventBus.handlers.clear();
  });

  it("should publish and handle events", async () => {
    const mockHandler: EventHandler<TaskCreatedEvent> = {
      eventType: "task.created",
      handle: vi.fn(),
    };

    // Subscribe to event
    eventBus.subscribe("task.created", mockHandler);

    // Create and publish event
    const event = createEvent<TaskCreatedEvent>("task.created", "test", {
      taskId: "123",
      userId: "user1",
      title: "Test Task",
      priority: "high",
      tags: ["test"],
    });

    await eventBus.publish(event);

    // Verify handler was called
    expect(mockHandler.handle).toHaveBeenCalledWith(event);
  });

  it("should handle multiple subscribers for the same event", async () => {
    const handler1: EventHandler<TaskCreatedEvent> = {
      eventType: "task.created",
      handle: vi.fn(),
    };

    const handler2: EventHandler<TaskCreatedEvent> = {
      eventType: "task.created",
      handle: vi.fn(),
    };

    eventBus.subscribe("task.created", handler1);
    eventBus.subscribe("task.created", handler2);

    const event = createEvent<TaskCreatedEvent>("task.created", "test", {
      taskId: "123",
      userId: "user1",
      title: "Test Task",
      priority: "high",
      tags: ["test"],
    });

    await eventBus.publish(event);

    expect(handler1.handle).toHaveBeenCalledWith(event);
    expect(handler2.handle).toHaveBeenCalledWith(event);
  });

  it("should unsubscribe handlers", async () => {
    const mockHandler: EventHandler<TaskCreatedEvent> = {
      eventType: "task.created",
      handle: vi.fn(),
    };

    eventBus.subscribe("task.created", mockHandler);
    eventBus.unsubscribe("task.created", mockHandler);

    const event = createEvent<TaskCreatedEvent>("task.created", "test", {
      taskId: "123",
      userId: "user1",
      title: "Test Task",
      priority: "high",
      tags: ["test"],
    });

    await eventBus.publish(event);

    expect(mockHandler.handle).not.toHaveBeenCalled();
  });

  it("should create events with proper metadata", () => {
    const event = createEvent<TaskCreatedEvent>("task.created", "test-service", {
      taskId: "123",
      userId: "user1",
      title: "Test Task",
      priority: "high",
      tags: ["test"],
    });

    expect(event.id).toBeDefined();
    expect(event.timestamp).toBeInstanceOf(Date);
    expect(event.source).toBe("test-service");
    expect(event.version).toBe("1.0.0");
    expect(event.type).toBe("task.created");
    expect(event.data).toEqual({
      taskId: "123",
      userId: "user1",
      title: "Test Task",
      priority: "high",
      tags: ["test"],
    });
  });

  it("should handle event processing errors gracefully", async () => {
    const failingHandler: EventHandler<TaskCreatedEvent> = {
      eventType: "task.created",
      handle: vi.fn().mockRejectedValue(new Error("Handler failed")),
    };

    const workingHandler: EventHandler<TaskCreatedEvent> = {
      eventType: "task.created",
      handle: vi.fn(),
    };

    eventBus.subscribe("task.created", failingHandler);
    eventBus.subscribe("task.created", workingHandler);

    const event = createEvent<TaskCreatedEvent>("task.created", "test", {
      taskId: "123",
      userId: "user1",
      title: "Test Task",
      priority: "high",
      tags: ["test"],
    });

    // Should not throw even if one handler fails
    await expect(eventBus.publish(event)).resolves.not.toThrow();

    expect(failingHandler.handle).toHaveBeenCalled();
    expect(workingHandler.handle).toHaveBeenCalled();
  });
});
