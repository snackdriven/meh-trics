import { describe, it, expect, vi, beforeEach } from "vitest";
import { createQueueMessage, QueueProcessor, QueueMessage } from "./queue";

interface TestMessage {
  data: string;
  value: number;
}

class TestProcessor extends QueueProcessor<TestMessage> {
  public processedMessages: QueueMessage<TestMessage>[] = [];
  public shouldFail = false;

  async process(message: QueueMessage<TestMessage>): Promise<void> {
    if (this.shouldFail) {
      throw new Error("Processing failed");
    }
    this.processedMessages.push(message);
  }
}

describe("Message Queue", () => {
  let processor: TestProcessor;

  beforeEach(() => {
    processor = new TestProcessor();
  });

  it("should create queue messages with proper structure", () => {
    const message = createQueueMessage("test.message", { data: "test", value: 42 }, "high", 5);

    expect(message).toMatchObject({
      id: expect.any(String),
      type: "test.message",
      payload: { data: "test", value: 42 },
      priority: "high",
      timestamp: expect.any(Date),
      retryCount: 0,
      maxRetries: 5,
    });
  });

  it("should process messages successfully", async () => {
    const message = createQueueMessage("test.message", { data: "test", value: 42 });

    await processor.handleWithRetry(message);

    expect(processor.processedMessages).toHaveLength(1);
    expect(processor.processedMessages[0]).toBe(message);
  });

  it("should handle processing failures with retries", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    processor.shouldFail = true;
    const message = createQueueMessage("test.message", { data: "test", value: 42 }, "medium", 2);

    await processor.handleWithRetry(message);

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("Queue processing failed"),
      expect.any(Error)
    );
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining("Retrying message"));

    consoleSpy.mockRestore();
    consoleLogSpy.mockRestore();
  });

  it("should move messages to dead letter queue after max retries", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    processor.shouldFail = true;
    const message = createQueueMessage("test.message", { data: "test", value: 42 }, "medium", 0);

    await processor.handleWithRetry(message);

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("failed after 0 retries"));

    consoleSpy.mockRestore();
  });

  it("should create messages with default values", () => {
    const message = createQueueMessage("test.message", { data: "test", value: 42 });

    expect(message.priority).toBe("medium");
    expect(message.maxRetries).toBe(3);
    expect(message.retryCount).toBe(0);
    expect(message.delayUntil).toBeUndefined();
  });

  it("should create messages with delayed processing", () => {
    const delayUntil = new Date(Date.now() + 60000);
    const message = createQueueMessage(
      "test.message",
      { data: "test", value: 42 },
      "low",
      3,
      delayUntil
    );

    expect(message.delayUntil).toBe(delayUntil);
  });
});
