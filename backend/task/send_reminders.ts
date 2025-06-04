import { api } from "encore.dev/api";
import { taskDB } from "./db";

/**
 * Send reminders for tasks that are due today.
 * This example implementation merely logs to the console.
 */
export const sendReminders = api<void, { tasks: number }>(
  { expose: true, method: "POST", path: "/reminders/send" },
  async () => {
    const rows = await taskDB.queryAll<{ id: number; title: string }>`
      SELECT id, title FROM tasks
      WHERE status = 'todo' AND due_date <= NOW()
    `;
    rows.forEach(r => console.log("Reminder:", r.title));
    return { tasks: rows.length };
  }
);
