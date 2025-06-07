import { api } from "encore.dev/api";
import type { Query } from "encore.dev/api";
import type { CalendarEvent, EventRecurrence } from "../task/types";
import { calendarDB } from "./db";

interface ListCalendarEventsParams {
  startDate?: Query<string>;
  endDate?: Query<string>;
  tags?: Query<string>;
}

interface ListCalendarEventsResponse {
  events: CalendarEvent[];
}

// Retrieves calendar events with optional date range and tag filtering.
export const listCalendarEvents = api<
  ListCalendarEventsParams,
  ListCalendarEventsResponse
>({ expose: true, method: "GET", path: "/calendar-events" }, async (req) => {
  let query = `
      SELECT id, title, description, start_time, end_time, is_all_day, location, color, recurrence, recurrence_end_date, tags, created_at, updated_at
      FROM calendar_events
      WHERE 1=1
    `;
  const params: Array<Date | string> = [];
  let paramIndex = 1;

  // Only add date filters if values are provided
  // Convert the incoming strings to Date objects to avoid
  // serialization issues with the database driver.
  if (req.startDate && req.startDate.trim() !== "") {
    query += ` AND end_time >= $${paramIndex++}::timestamptz`;
    params.push(new Date(req.startDate.trim()));
  }

  if (req.endDate && req.endDate.trim() !== "") {
    query += ` AND start_time <= $${paramIndex++}::timestamptz`;
    params.push(new Date(`${req.endDate.trim()}T23:59:59`));
  }

  // Only add tag filter if value is provided and not empty
  if (req.tags && req.tags.trim() !== "") {
    query += ` AND $${paramIndex++} = ANY(tags)`;
    params.push(req.tags.trim());
  }

  query += " ORDER BY start_time ASC";

  const events: CalendarEvent[] = [];

  // Use regular query if no parameters, rawQuery if parameters exist
  if (params.length === 0) {
    for await (const row of calendarDB.query<{
      id: number;
      title: string;
      description: string | null;
      start_time: Date;
      end_time: Date;
      is_all_day: boolean;
      location: string | null;
      color: string | null;
      recurrence: string;
      recurrence_end_date: Date | null;
      tags: string[];
      created_at: Date;
      updated_at: Date;
    }>`
        SELECT id, title, description, start_time, end_time, is_all_day, location, color, recurrence, recurrence_end_date, tags, created_at, updated_at
        FROM calendar_events
        ORDER BY start_time ASC
      `) {
      events.push({
        id: row.id,
        title: row.title,
        description: row.description || undefined,
        startTime: row.start_time,
        endTime: row.end_time,
        isAllDay: row.is_all_day,
        location: row.location || undefined,
        color: row.color || undefined,
        recurrence: row.recurrence as EventRecurrence,
        recurrenceEndDate: row.recurrence_end_date || undefined,
        tags: row.tags,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      });
    }
  } else {
    for await (const row of calendarDB.rawQuery<{
      id: number;
      title: string;
      description: string | null;
      start_time: Date;
      end_time: Date;
      is_all_day: boolean;
      location: string | null;
      color: string | null;
      recurrence: string;
      recurrence_end_date: Date | null;
      tags: string[];
      created_at: Date;
      updated_at: Date;
    }>(query, ...params)) {
      events.push({
        id: row.id,
        title: row.title,
        description: row.description || undefined,
        startTime: row.start_time,
        endTime: row.end_time,
        isAllDay: row.is_all_day,
        location: row.location || undefined,
        color: row.color || undefined,
        recurrence: row.recurrence as EventRecurrence,
        recurrenceEndDate: row.recurrence_end_date || undefined,
        tags: row.tags,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      });
    }
  }

  return { events };
});
