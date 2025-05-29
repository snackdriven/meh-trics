import { api } from "encore.dev/api";
import { Query } from "encore.dev/api";
import { taskDB } from "./db";
import type { CalendarEvent } from "./types";

interface ListCalendarEventsParams {
  startDate?: Query<string>;
  endDate?: Query<string>;
  tags?: Query<string>;
}

interface ListCalendarEventsResponse {
  events: CalendarEvent[];
}

// Retrieves calendar events with optional date range and tag filtering.
export const listCalendarEvents = api<ListCalendarEventsParams, ListCalendarEventsResponse>(
  { expose: true, method: "GET", path: "/calendar-events" },
  async (req) => {
    let query = `
      SELECT id, title, description, start_time, end_time, is_all_day, location, color, recurrence, recurrence_end_date, tags, created_at, updated_at
      FROM calendar_events
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramIndex = 1;

    if (req.startDate) {
      query += ` AND end_time >= $${paramIndex++}`;
      params.push(req.startDate);
    }

    if (req.endDate) {
      query += ` AND start_time <= $${paramIndex++}`;
      params.push(req.endDate + ' 23:59:59');
    }

    if (req.tags) {
      query += ` AND $${paramIndex++} = ANY(tags)`;
      params.push(req.tags);
    }

    query += ` ORDER BY start_time ASC`;

    const events: CalendarEvent[] = [];
    
    for await (const row of taskDB.rawQuery<{
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
        recurrence: row.recurrence as any,
        recurrenceEndDate: row.recurrence_end_date || undefined,
        tags: row.tags,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      });
    }

    return { events };
  }
);
