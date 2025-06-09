import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("encore.dev/api", () => ({ api: (_opts: unknown, fn: unknown) => fn }));
vi.mock("./db", () => ({ calendarDB: { queryRow: vi.fn() } }));

import { createCalendarEvent } from "./create_calendar_event";
import { calendarDB } from "./db";
import type { CalendarEvent, CreateCalendarEventRequest } from "../task/types";

describe("createCalendarEvent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates calendar event", async () => {
    const now = new Date();
    (calendarDB.queryRow as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      id: 1,
      title: "Meeting",
      description: null,
      start_time: now,
      end_time: now,
      is_all_day: false,
      location: null,
      color: null,
      recurrence: "none",
      recurrence_end_date: null,
      tags: [],
      created_at: now,
      updated_at: now,
    });

    const req: CreateCalendarEventRequest = {
      title: "Meeting",
      startTime: now,
      endTime: now,
    };

    const event = await createCalendarEvent(req);

    expect(calendarDB.queryRow).toHaveBeenCalled();
    expect(event).toEqual<CalendarEvent>({
      id: 1,
      title: "Meeting",
      description: undefined,
      startTime: now,
      endTime: now,
      isAllDay: false,
      location: undefined,
      color: undefined,
      recurrence: "none",
      recurrenceEndDate: undefined,
      tags: [],
      createdAt: now,
      updatedAt: now,
    });
  });
});
