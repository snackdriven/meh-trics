import { api } from "encore.dev/api";
import { taskDB } from "./db";

interface ExportData {
  tasks: any[];
  habits: any[];
  moodEntries: any[];
}

/**
 * Exports all core data as JSON.
 */
export const exportData = api<void, ExportData>(
  { expose: true, method: "GET", path: "/export" },
  async () => {
    const tasks = await taskDB.queryAll<any>`SELECT * FROM tasks`;
    const habits = await taskDB.queryAll<any>`SELECT * FROM habits`;
    const moodEntries = await taskDB.queryAll<any>`SELECT * FROM mood_entries`;
    return { tasks, habits, moodEntries };
  }
);
