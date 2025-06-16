import { api } from "encore.dev/api";
import type { Query } from "encore.dev/api";
import { calendarDB } from "../calendar/db";
import { habitDB } from "../habits/db";
import { taskDB } from "./db";

interface SearchParams {
  query: Query<string>;
  types?: Query<string>;
  limit?: Query<number>;
}

interface SearchResult {
  type: "task" | "journal" | "habit" | "calendar_event";
  id: number;
  title: string;
  content: string;
  date?: Date;
  highlights: string[];
}

interface SearchResponse {
  results: SearchResult[];
  total: number;
}

/**
 * Searches across tasks, journal entries, habits, and calendar events.
 *
 * @param req - Query string and optional type filters.
 * @returns Matching search results up to the given limit.
 */
export const search = api<SearchParams, SearchResponse>(
  { expose: true, method: "GET", path: "/search" },
  async (req) => {
    const query = req.query.toLowerCase();
    const types = req.types ? req.types.split(",") : ["task", "journal", "habit", "calendar_event"];
    const limit = req.limit || 50;

    const results: SearchResult[] = [];

    // Search tasks
    if (types.includes("task")) {
      const tasks = await taskDB.queryAll<{
        id: number;
        title: string;
        description: string | null;
        status: string;
        due_date: Date | null;
        tags: string[];
      }>`
        SELECT id, title, description, status, due_date, tags
        FROM tasks
        WHERE LOWER(title) LIKE ${`%${query}%`} 
           OR LOWER(description) LIKE ${`%${query}%`}
           OR EXISTS (SELECT 1 FROM unnest(tags) AS tag WHERE LOWER(tag) LIKE ${`%${query}%`})
        ORDER BY 
          CASE WHEN LOWER(title) LIKE ${`%${query}%`} THEN 1 ELSE 2 END,
          created_at DESC
        LIMIT ${Math.floor(limit / types.length)}
      `;

      for (const task of tasks) {
        const highlights: string[] = [];
        if (task.title.toLowerCase().includes(query)) {
          highlights.push(task.title);
        }
        if (task.description?.toLowerCase().includes(query)) {
          highlights.push(task.description);
        }
        for (const tag of task.tags) {
          if (tag.toLowerCase().includes(query)) {
            highlights.push(tag);
          }
        }

        results.push({
          type: "task",
          id: task.id,
          title: task.title,
          content: task.description || "",
          date: task.due_date || undefined,
          highlights,
        });
      }
    }

    // Search journal entries
    if (types.includes("journal")) {
      const journals = await taskDB.queryAll<{
        id: number;
        date: Date | null;
        text: string;
        tags: string[];
        mood_id: number | null;
        task_id: number | null;
        habit_entry_id: number | null;
      }>`
        SELECT id, date, text, tags, mood_id, task_id, habit_entry_id
        FROM journal_entries
        WHERE LOWER(text) LIKE ${`%${query}%`}
           OR EXISTS (SELECT 1 FROM unnest(tags) tag WHERE LOWER(tag) LIKE ${`%${query}%`})
        ORDER BY date DESC NULLS LAST
        LIMIT ${Math.floor(limit / types.length)}
      `;

      for (const journal of journals) {
        const highlights: string[] = [];
        const content: string[] = [];

        // Check text content
        if (journal.text?.toLowerCase().includes(query)) {
          highlights.push(journal.text);
          content.push(journal.text);
        }

        // Check tags
        const matchingTags = journal.tags.filter((tag) => tag.toLowerCase().includes(query));
        if (matchingTags.length > 0) {
          highlights.push(...matchingTags);
          content.push(`Tags: ${matchingTags.join(", ")}`);
        }

        const dateStr = journal.date ? journal.date.toLocaleDateString() : "No date";
        let linkType = "";
        if (journal.mood_id) linkType = " (linked to mood)";
        else if (journal.task_id) linkType = " (linked to task)";
        else if (journal.habit_entry_id) linkType = " (linked to habit)";

        results.push({
          type: "journal",
          id: journal.id,
          title: `Journal Entry - ${dateStr}${linkType}`,
          content: content.join(" | "),
          date: journal.date || undefined,
          highlights,
        });
      }
    }

    // Search habits
    if (types.includes("habit")) {
      const habits = await habitDB.queryAll<{
        id: number;
        name: string;
        description: string | null;
        frequency: string;
        start_date: Date;
      }>`
        SELECT id, name, description, frequency, start_date
        FROM habits
        WHERE LOWER(name) LIKE ${`%${query}%`}
           OR LOWER(description) LIKE ${`%${query}%`}
        ORDER BY 
          CASE WHEN LOWER(name) LIKE ${`%${query}%`} THEN 1 ELSE 2 END,
          created_at DESC
        LIMIT ${Math.floor(limit / types.length)}
      `;

      for (const habit of habits) {
        const highlights: string[] = [];
        if (habit.name.toLowerCase().includes(query)) {
          highlights.push(habit.name);
        }
        if (habit.description?.toLowerCase().includes(query)) {
          highlights.push(habit.description);
        }

        results.push({
          type: "habit",
          id: habit.id,
          title: habit.name,
          content: habit.description || "",
          date: habit.start_date,
          highlights,
        });
      }
    }

    // Search calendar events
    if (types.includes("calendar_event")) {
      const events = await calendarDB.queryAll<{
        id: number;
        title: string;
        description: string | null;
        start_time: Date;
        location: string | null;
        tags: string[];
      }>`
        SELECT id, title, description, start_time, location, tags
        FROM calendar_events
        WHERE LOWER(title) LIKE ${`%${query}%`}
           OR LOWER(description) LIKE ${`%${query}%`}
           OR LOWER(location) LIKE ${`%${query}%`}
           OR EXISTS (SELECT 1 FROM unnest(tags) AS tag WHERE LOWER(tag) LIKE ${`%${query}%`})
        ORDER BY 
          CASE WHEN LOWER(title) LIKE ${`%${query}%`} THEN 1 ELSE 2 END,
          start_time DESC
        LIMIT ${Math.floor(limit / types.length)}
      `;

      for (const event of events) {
        const highlights: string[] = [];
        if (event.title.toLowerCase().includes(query)) {
          highlights.push(event.title);
        }
        if (event.description?.toLowerCase().includes(query)) {
          highlights.push(event.description);
        }
        if (event.location?.toLowerCase().includes(query)) {
          highlights.push(event.location);
        }
        for (const tag of event.tags) {
          if (tag.toLowerCase().includes(query)) {
            highlights.push(tag);
          }
        }

        results.push({
          type: "calendar_event",
          id: event.id,
          title: event.title,
          content: event.description || "",
          date: event.start_time,
          highlights,
        });
      }
    }

    // Sort results by relevance (title matches first, then by date)
    results.sort((a, b) => {
      const aHasTitle = a.highlights.some((h) => h === a.title);
      const bHasTitle = b.highlights.some((h) => h === b.title);

      if (aHasTitle && !bHasTitle) return -1;
      if (!aHasTitle && bHasTitle) return 1;

      if (a.date && b.date) {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      }

      return 0;
    });

    return {
      results: results.slice(0, limit),
      total: results.length,
    };
  }
);
