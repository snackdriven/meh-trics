import { api } from "encore.dev/api";
import { taskDB } from "./db";

// Generates tasks from recurring task templates that are due.
export const generateRecurringTasks = api<void, { generated: number }>(
  { expose: true, method: "POST", path: "/recurring-tasks/generate" },
  async () => {
    let generated = 0;
    
    // Get all active recurring tasks that are due
    const recurringTasks = await taskDB.queryAll<{
      id: number;
      title: string;
      description: string | null;
      frequency: string;
      priority: number;
      tags: string[];
      energy_level: string | null;
      next_due_date: Date;
    }>`
      SELECT id, title, description, frequency, priority, tags, energy_level, next_due_date
      FROM recurring_tasks
      WHERE is_active = true AND next_due_date <= NOW()::date
    `;

    for (const recurringTask of recurringTasks) {
      // Get the highest sort order and add 1
      const maxSortOrderRow = await taskDB.queryRow<{ max_sort_order: number | null }>`
        SELECT MAX(sort_order) as max_sort_order FROM tasks
      `;
      const nextSortOrder = (maxSortOrderRow?.max_sort_order || 0) + 1;

      // Create the task
      await taskDB.exec`
        INSERT INTO tasks (title, description, priority, due_date, tags, energy_level, sort_order, recurring_task_id)
        VALUES (${recurringTask.title}, ${recurringTask.description}, ${recurringTask.priority}, ${recurringTask.next_due_date}, ${recurringTask.tags}, ${recurringTask.energy_level}, ${nextSortOrder}, ${recurringTask.id})
      `;

      // Calculate next due date
      let nextDueDate = new Date(recurringTask.next_due_date);
      switch (recurringTask.frequency) {
        case 'daily':
          nextDueDate.setDate(nextDueDate.getDate() + 1);
          break;
        case 'weekly':
          nextDueDate.setDate(nextDueDate.getDate() + 7);
          break;
        case 'monthly':
          nextDueDate.setMonth(nextDueDate.getMonth() + 1);
          break;
      }

      // Update the recurring task's next due date
      await taskDB.exec`
        UPDATE recurring_tasks 
        SET next_due_date = ${nextDueDate}
        WHERE id = ${recurringTask.id}
      `;

      generated++;
    }

    return { generated };
  }
);
