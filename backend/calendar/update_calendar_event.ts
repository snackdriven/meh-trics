import { APIError, api } from "encore.dev/api";
import type {
  CalendarEvent,
  EventRecurrence,
  UpdateCalendarEventRequest,
} from "../task/types";
import { buildUpdateQuery } from "../utils/buildUpdateQuery";
import { calendarDB } from "./db";
import { type CalendarEventRow, mapCalendarEventRow } from "./utils";

/**
 * Updates fields on an existing calendar event.
 *
 * @param req - Partial event data including the id.
 * @returns The updated calendar event.
 */
export const updateCalendarEvent = api<
  UpdateCalendarEventRequest,
  CalendarEvent
>(
  { expose: true, method: "PUT", path: "/calendar-events/:id" },
  async (req) => {
    const existingEvent = await calendarDB.queryRow`
      SELECT id FROM calendar_events WHERE id = ${req.id}
    `;

    if (!existingEvent) {
      throw APIError.notFound("calendar event not found");
    }

    const { clause, values } = buildUpdateQuery({
      title: req.title,
      description: req.description,
      start_time: req.startTime,
      end_time: req.endTime,
      is_all_day: req.isAllDay,
      location: req.location,
      color: req.color,
      recurrence: req.recurrence as EventRecurrence | undefined,
      recurrence_end_date: req.recurrenceEndDate,
      tags: req.tags,
    });
    values.push(req.id);

    const query = `
      UPDATE calendar_events
      SET ${clause}
      WHERE id = $${values.length}
      RETURNING id, title, description, start_time, end_time, is_all_day, location, color, recurrence, recurrence_end_date, tags, created_at, updated_at
    `;

    const row = await calendarDB.rawQueryRow<CalendarEventRow>(
      query,
      ...values,
    );

    if (!row) {
      throw new Error("Failed to update calendar event");
    }

    return mapCalendarEventRow({
      ...row,
      recurrence: row.recurrence as string,
    });
  },
);
