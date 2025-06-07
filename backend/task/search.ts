import { api } from "encore.dev/api";
import { Query } from "encore.dev/api";
import { taskDB } from "./db";
import { habitDB } from "../habits/db";
import { calendarDB } from "../calendar/db";

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
    const types = req.types
      ? req.types.split(",")
      : ["task", "journal", "habit", "calendar_event"];
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
        WHERE LOWER(title) LIKE ${"%" + query + "%"} 
           OR LOWER(description) LIKE ${"%" + query + "%"}
           OR EXISTS (SELECT 1 FROM unnest(tags) AS tag WHERE LOWER(tag) LIKE ${"%" + query + "%"})
        ORDER BY 
          CASE WHEN LOWER(title) LIKE ${"%" + query + "%"} THEN 1 ELSE 2 END,
          created_at DESC
        LIMIT ${Math.floor(limit / types.length)}
      `;

      tasks.forEach((task) => {
        const highlights: string[] = [];
        if (task.title.toLowerCase().includes(query)) {
          highlights.push(task.title);
        }
        if (
          task.description &&
          task.description.toLowerCase().includes(query)
        ) {
          highlights.push(task.description);
        }
        task.tags.forEach((tag) => {
          if (tag.toLowerCase().includes(query)) {
            highlights.push(tag);
          }
        });

        results.push({
          type: "task",
          id: task.id,
          title: task.title,
          content: task.description || "",
          date: task.due_date || undefined,
          highlights,
        });
      });
    }

    // Search journal entries
    if (types.includes("journal")) {
      const journals = await taskDB.queryAll<{
        id: number;
        date: Date;
        what_happened: string | null;
        what_i_need: string | null;
        small_win: string | null;
        what_felt_hard: string | null;
        thought_to_release: string | null;
      }>`
        SELECT id, date, what_happened, what_i_need, small_win, what_felt_hard, thought_to_release
        FROM journal_entries
        WHERE LOWER(what_happened) LIKE ${"%" + query + "%"}
           OR LOWER(what_i_need) LIKE ${"%" + query + "%"}
           OR LOWER(small_win) LIKE ${"%" + query + "%"}
           OR LOWER(what_felt_hard) LIKE ${"%" + query + "%"}
           OR LOWER(thought_to_release) LIKE ${"%" + query + "%"}
        ORDER BY date DESC
        LIMIT ${Math.floor(limit / types.length)}
      `;

      journals.forEach((journal) => {
        const highlights: string[] = [];
        const content: string[] = [];

        if (
          journal.what_happened &&
          journal.what_happened.toLowerCase().includes(query)
        ) {
          highlights.push(journal.what_happened);
          content.push(journal.what_happened);
        }
        if (
          journal.what_i_need &&
          journal.what_i_need.toLowerCase().includes(query)
        ) {
          highlights.push(journal.what_i_need);
          content.push(journal.what_i_need);
        }
        if (
          journal.small_win &&
          journal.small_win.toLowerCase().includes(query)
        ) {
          highlights.push(journal.small_win);
          content.push(journal.small_win);
        }
        if (
          journal.what_felt_hard &&
          journal.what_felt_hard.toLowerCase().includes(query)
        ) {
          highlights.push(journal.what_felt_hard);
          content.push(journal.what_felt_hard);
        }
        if (
          journal.thought_to_release &&
          journal.thought_to_release.toLowerCase().includes(query)
        ) {
          highlights.push(journal.thought_to_release);
          content.push(journal.thought_to_release);
        }

        results.push({
          type: "journal",
          id: journal.id,
          title: `Journal Entry - ${journal.date.toLocaleDateString()}`,
          content: content.join(" | "),
          date: journal.date,
          highlights,
        });
      });
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
        WHERE LOWER(name) LIKE ${"%" + query + "%"}
           OR LOWER(description) LIKE ${"%" + query + "%"}
        ORDER BY 
          CASE WHEN LOWER(name) LIKE ${"%" + query + "%"} THEN 1 ELSE 2 END,
          created_at DESC
        LIMIT ${Math.floor(limit / types.length)}
      `;

      habits.forEach((habit) => {
        const highlights: string[] = [];
        if (habit.name.toLowerCase().includes(query)) {
          highlights.push(habit.name);
        }
        if (
          habit.description &&
          habit.description.toLowerCase().includes(query)
        ) {
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
      });
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
        WHERE LOWER(title) LIKE ${"%" + query + "%"}
           OR LOWER(description) LIKE ${"%" + query + "%"}
           OR LOWER(location) LIKE ${"%" + query + "%"}
           OR EXISTS (SELECT 1 FROM unnest(tags) AS tag WHERE LOWER(tag) LIKE ${"%" + query + "%"})
        ORDER BY 
          CASE WHEN LOWER(title) LIKE ${"%" + query + "%"} THEN 1 ELSE 2 END,
          start_time DESC
        LIMIT ${Math.floor(limit / types.length)}
      `;

      events.forEach((event) => {
        const highlights: string[] = [];
        if (event.title.toLowerCase().includes(query)) {
          highlights.push(event.title);
        }
        if (
          event.description &&
          event.description.toLowerCase().includes(query)
        ) {
          highlights.push(event.description);
        }
        if (event.location && event.location.toLowerCase().includes(query)) {
          highlights.push(event.location);
        }
        event.tags.forEach((tag) => {
          if (tag.toLowerCase().includes(query)) {
            highlights.push(tag);
          }
        });

        results.push({
          type: "calendar_event",
          id: event.id,
          title: event.title,
          content: event.description || "",
          date: event.start_time,
          highlights,
        });
      });
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
  },
);
