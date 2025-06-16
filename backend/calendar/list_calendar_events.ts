import { api } from "encore.dev/api";
import type { Query } from "encore.dev/api";
import type { CalendarEvent } from "../task/types";
import { calendarDB } from "./db";
import { expandEvent } from "./recurrence";
import { type CalendarEventRow, mapCalendarEventRow } from "./utils";

interface ListCalendarEventsParams {
  startDate?: Query<string>;
  endDate?: Query<string>;
  tags?: Query<string>;
}

interface ListCalendarEventsResponse {
  events: CalendarEvent[];
}

/**
 * Retrieves calendar events with optional date range and tag filtering.
 *
 * @param req - Optional start/end dates and tag filter.
 * @returns A list of matching calendar events.
 */
export const listCalendarEvents = api<ListCalendarEventsParams, ListCalendarEventsResponse>(
  { expose: true, method: "GET", path: "/calendar-events" },
  async (req) => {
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
      query += ` AND end_time >= $${paramIndex++}`;
      params.push(new Date(req.startDate.trim()));
    }

    if (req.endDate && req.endDate.trim() !== "") {
      query += ` AND start_time <= $${paramIndex++}`;
      params.push(new Date(`${req.endDate.trim()}T23:59:59`));
    }

    // Only add tag filter if value is provided and not empty
    // Tag filtering using PostgreSQL array contains operator
    if (req.tags && req.tags.trim() !== "") {
      query += ` AND $${paramIndex++} = ANY(tags)`;
      params.push(req.tags.trim());
    }

    query += " ORDER BY start_time ASC";

    const events: CalendarEvent[] = [];

    const rangeStart = req.startDate ? new Date(req.startDate.trim()) : new Date(0);
    const rangeEnd = req.endDate
      ? new Date(`${req.endDate.trim()}T23:59:59`)
      : new Date("2100-01-01");

    // Use regular query if no parameters, rawQuery if parameters exist
    if (params.length === 0) {
      for await (const row of calendarDB.query<CalendarEventRow>`
        SELECT id, title, description, start_time, end_time, is_all_day, location, color, recurrence, recurrence_end_date, tags, created_at, updated_at
        FROM calendar_events
        ORDER BY start_time ASC
      `) {
        const mapped = mapCalendarEventRow(row);
        events.push(...expandEvent(mapped, rangeStart, rangeEnd));
      }
    } else {
      for await (const row of calendarDB.rawQuery<CalendarEventRow>(query, ...params)) {
        const mapped = mapCalendarEventRow(row);
        events.push(...expandEvent(mapped, rangeStart, rangeEnd));
      }
    }

    events.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

    return { events };
  }
);
