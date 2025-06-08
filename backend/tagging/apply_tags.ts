import { api } from "encore.dev/api";
import { calendarDB } from "../calendar/db";
import { habitDB } from "../habits/db";
import { taskDB } from "../task/db";

interface SuggestedTagsResponse {
  tags: string[];
}

/**
 * Generates suggested tags based on the current time and nearby
 * tasks, calendar events and habit activity.
 */
export const getAutoTags = api<void, SuggestedTagsResponse>(
  { expose: true, method: "GET", path: "/tags/auto" },
  async () => {
    const now = new Date();
    const tags = new Set<string>();

    // Time of day context
    const hour = now.getHours();
    if (hour < 12) tags.add("morning");
    else if (hour < 18) tags.add("afternoon");
    else tags.add("evening");

    const dateStr = now.toISOString().split("T")[0];

    // Collect tags from tasks due today
    for await (const row of taskDB.rawQuery<{ tags: string[] }>(
      `SELECT tags FROM tasks WHERE due_date >= $1::date AND due_date < ($1::date + INTERVAL '1 day')`,
      dateStr,
    )) {
      for (const tag of row.tags) tags.add(tag);
    }

    // Collect tags from today's calendar events
    for await (const row of calendarDB.rawQuery<{ tags: string[] }>(
      `SELECT tags FROM calendar_events WHERE start_time::date = $1::date`,
      dateStr,
    )) {
      for (const tag of row.tags) tags.add(tag);
    }

    // Collect tags from habits logged today
    for await (const row of habitDB.rawQuery<{ name: string }>(
      `SELECT h.name FROM habits h
         JOIN habit_entries he ON he.habit_id = h.id
         WHERE he.date = $1::date`,
      dateStr,
    )) {
      tags.add(row.name.toLowerCase());
    }

    return { tags: Array.from(tags) };
  },
);
