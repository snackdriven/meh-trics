import { api } from "encore.dev/api";
import { calendarDB } from "./db";
import type { CreateCalendarEventRequest, CalendarEvent } from "../task/types";

// Creates a new calendar event.
export const createCalendarEvent = api<CreateCalendarEventRequest, CalendarEvent>(
  { expose: true, method: "POST", path: "/calendar-events" },
  async (req) => {
    const row = await calendarDB.queryRow<{
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
      INSERT INTO calendar_events (title, description, start_time, end_time, is_all_day, location, color, recurrence, recurrence_end_date, tags)
      VALUES (${req.title}, ${req.description || null}, ${req.startTime}, ${req.endTime}, ${req.isAllDay || false}, ${req.location || null}, ${req.color || null}, ${req.recurrence || 'none'}, ${req.recurrenceEndDate || null}, ${req.tags || []})
      RETURNING id, title, description, start_time, end_time, is_all_day, location, color, recurrence, recurrence_end_date, tags, created_at, updated_at
    `;

    if (!row) {
      throw new Error("Failed to create calendar event");
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
      recurrence: row.recurrence as any,
      recurrenceEndDate: row.recurrence_end_date || undefined,
      tags: row.tags,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
);
