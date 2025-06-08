import { APIError, api } from "encore.dev/api";
import type { Primitive } from "../primitive";
import type {
  CalendarEvent,
  EventRecurrence,
  UpdateCalendarEventRequest,
} from "../task/types";
import { calendarDB } from "./db";

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

    const updates: string[] = [];
    const values: Primitive[] = [];
    let paramIndex = 1;

    if (req.title !== undefined) {
      updates.push(`title = $${paramIndex++}`);
      values.push(req.title);
    }
    if (req.description !== undefined) {
      updates.push(`description = $${paramIndex++}`);
      values.push(req.description);
    }
    if (req.startTime !== undefined) {
      updates.push(`start_time = $${paramIndex++}`);
      values.push(req.startTime);
    }
    if (req.endTime !== undefined) {
      updates.push(`end_time = $${paramIndex++}`);
      values.push(req.endTime);
    }
    if (req.isAllDay !== undefined) {
      updates.push(`is_all_day = $${paramIndex++}`);
      values.push(req.isAllDay);
    }
    if (req.location !== undefined) {
      updates.push(`location = $${paramIndex++}`);
      values.push(req.location);
    }
    if (req.color !== undefined) {
      updates.push(`color = $${paramIndex++}`);
      values.push(req.color);
    }
    if (req.recurrence !== undefined) {
      updates.push(`recurrence = $${paramIndex++}`);
      values.push(req.recurrence);
    }
    if (req.recurrenceEndDate !== undefined) {
      updates.push(`recurrence_end_date = $${paramIndex++}`);
      values.push(req.recurrenceEndDate);
    }
    if (req.tags !== undefined) {
      updates.push(`tags = $${paramIndex++}`);
      values.push(req.tags);
    }

    updates.push("updated_at = NOW()");
    values.push(req.id);

    const query = `
      UPDATE calendar_events 
      SET ${updates.join(", ")}
      WHERE id = $${paramIndex}
      RETURNING id, title, description, start_time, end_time, is_all_day, location, color, recurrence, recurrence_end_date, tags, created_at, updated_at
    `;

    const row = await calendarDB.rawQueryRow<{
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
    }>(query, ...values);

    if (!row) {
      throw new Error("Failed to update calendar event");
    }

    return {
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
    };
  },
);
