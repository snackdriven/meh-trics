import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("encore.dev/api", () => ({ api: (_opts: unknown, fn: unknown) => fn }));
vi.mock("./db", () => ({
  calendarDB: { queryRow: vi.fn(), rawQueryRow: vi.fn() },
}));

import type { CalendarEvent, UpdateCalendarEventRequest } from "../task/types";
import { calendarDB } from "./db";
import { updateCalendarEvent } from "./update_calendar_event";

describe("updateCalendarEvent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("updates calendar event", async () => {
    const now = new Date();
    (calendarDB.queryRow as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      id: 1,
    });
    (calendarDB.rawQueryRow as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
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

    const req: UpdateCalendarEventRequest = { id: 1, startTime: now };
    const event = await updateCalendarEvent(req);

    expect(calendarDB.rawQueryRow).toHaveBeenCalledWith(
      expect.stringContaining("UPDATE calendar_events"),
      now,
      1
    );
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
