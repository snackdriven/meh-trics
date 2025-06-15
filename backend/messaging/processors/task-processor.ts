import { QueueProcessor, QueueMessage, TaskProcessingMessage } from "../queue";
import { eventBus, createEvent } from "../../events/event-bus";
import { TaskCreatedEvent, TaskCompletedEvent, TaskUpdatedEvent } from "../../events/types";

export class TaskProcessor extends QueueProcessor<TaskProcessingMessage> {
  async process(message: QueueMessage<TaskProcessingMessage>): Promise<void> {
    const { userId, taskId, operation, data } = message.payload;
    
    console.log(`Processing task operation: ${operation} for task ${taskId}`);
    
    switch (operation) {
      case 'create':
        await this.handleTaskCreation(userId, taskId, data);
        break;
      case 'update':
        await this.handleTaskUpdate(userId, taskId, data);
        break;
      case 'complete':
        await this.handleTaskCompletion(userId, taskId, data);
        break;
      case 'delete':
        await this.handleTaskDeletion(userId, taskId);
        break;
      default:
        throw new Error(`Unknown task operation: ${operation}`);
    }
  }

  private async handleTaskCreation(userId: string, taskId: string, data: Record<string, unknown>): Promise<void> {
    // Simulate task creation processing
    await this.simulateProcessing();
    
    // Emit task created event
    const event = createEvent<TaskCreatedEvent>('task.created', 'task-processor', {
      taskId,
      userId,
      title: data.title as string,
      dueDate: data.dueDate ? new Date(data.dueDate as string) : undefined,
      priority: data.priority as 'low' | 'medium' | 'high',
      tags: data.tags as string[],
    });
    
    await eventBus.publish(event);
    console.log(`Task ${taskId} creation processed and event emitted`);
  }

  private async handleTaskUpdate(userId: string, taskId: string, data: Record<string, unknown>): Promise<void> {
    await this.simulateProcessing();
    
    // Emit task updated event
    const event = createEvent<TaskUpdatedEvent>('task.updated', 'task-processor', {
      taskId,
      userId,
      changes: data,
    });
    
    await eventBus.publish(event);
    console.log(`Task ${taskId} update processed and event emitted`);
  }

  private async handleTaskCompletion(userId: string, taskId: string, data: Record<string, unknown>): Promise<void> {
    await this.simulateProcessing();
    
    // Emit task completed event
    const event = createEvent<TaskCompletedEvent>('task.completed', 'task-processor', {
      taskId,
      userId,
      completedAt: new Date(),
      duration: data.duration as number,
    });
    
    await eventBus.publish(event);
    console.log(`Task ${taskId} completion processed and event emitted`);
  }

  private async handleTaskDeletion(userId: string, taskId: string): Promise<void> {
    await this.simulateProcessing();
    
    // Could emit a task deleted event if needed
    console.log(`Task ${taskId} deletion processed`);
  }

  private async simulateProcessing(): Promise<void> {
    // Simulate async processing time
    await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));
  }
}

// Create subscription for task processing queue
export const taskProcessorSubscription = TaskProcessor.prototype.constructor.name;