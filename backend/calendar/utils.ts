export interface CalendarEventRow {
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
}

import type { CalendarEvent, EventRecurrence } from "../task/types";

export function mapCalendarEventRow(row: CalendarEventRow): CalendarEvent {
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
}
