import { api } from "encore.dev/api";
import type {
  CalendarEvent,
  CreateCalendarEventRequest,
} from "../task/types";
import { calendarDB } from "./db";
import { type CalendarEventRow, mapCalendarEventRow } from "./utils";

/**
 * Creates a new calendar event in the database.
 *
 * @param req - Event details to persist.
 * @returns The stored calendar event.
 */
export const createCalendarEvent = api<
  CreateCalendarEventRequest,
  CalendarEvent
>({ expose: true, method: "POST", path: "/calendar-events" }, async (req) => {
  const row = await calendarDB.queryRow<CalendarEventRow>`
      INSERT INTO calendar_events (title, description, start_time, end_time, is_all_day, location, color, recurrence, recurrence_end_date, tags)
      VALUES (${req.title}, ${req.description || null}, ${req.startTime}, ${req.endTime}, ${req.isAllDay || false}, ${req.location || null}, ${req.color || null}, ${req.recurrence || "none"}, ${req.recurrenceEndDate || null}, ${req.tags || []})
      RETURNING id, title, description, start_time, end_time, is_all_day, location, color, recurrence, recurrence_end_date, tags, created_at, updated_at
    `;

  if (!row) {
    throw new Error("Failed to create calendar event");
  }

  return mapCalendarEventRow({ ...row, recurrence: row.recurrence as string });
});
