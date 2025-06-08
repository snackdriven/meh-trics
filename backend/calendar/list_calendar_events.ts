import { api } from "encore.dev/api";
import type { Query } from "encore.dev/api";
import type { CalendarEvent, EventRecurrence } from "../task/types";
import { calendarDB } from "./db";
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
    for await (const row of calendarDB.query<CalendarEventRow>`
        SELECT id, title, description, start_time, end_time, is_all_day, location, color, recurrence, recurrence_end_date, tags, created_at, updated_at
        FROM calendar_events
        ORDER BY start_time ASC
      `) {
      events.push(mapCalendarEventRow(row));
    }
  } else {
    for await (const row of calendarDB.rawQuery<CalendarEventRow>(
      query,
      ...params,
    )) {
      events.push(mapCalendarEventRow(row));
    }
  }

  return { events };
});
