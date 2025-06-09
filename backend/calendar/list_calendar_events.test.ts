import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("encore.dev/api", () => ({ api: (_opts: unknown, fn: unknown) => fn }));
vi.mock("./db", () => ({ calendarDB: { query: vi.fn(), rawQuery: vi.fn() } }));

import { listCalendarEvents } from "./list_calendar_events";
import { calendarDB } from "./db";
import type { CalendarEvent } from "../task/types";

describe("listCalendarEvents", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("lists events without filters", async () => {
    const now = new Date();
    const row = {
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
    };
    (calendarDB.query as ReturnType<typeof vi.fn>).mockReturnValueOnce(
      (async function* () {
        yield row;
      })(),
    );

    const res = await listCalendarEvents({});

    expect(calendarDB.query).toHaveBeenCalled();
    expect(res.events).toEqual<CalendarEvent[]>([
      {
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
      },
    ]);
  });

  it("uses rawQuery when filtering", async () => {
    const now = new Date();
    const row = {
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
    };
    (calendarDB.rawQuery as ReturnType<typeof vi.fn>).mockReturnValueOnce(
      (async function* () {
        yield row;
      })(),
    );

    const dateStr = now.toISOString().slice(0, 10);
    await listCalendarEvents({ startDate: dateStr, endDate: dateStr });

    expect(calendarDB.rawQuery).toHaveBeenCalledWith(
      expect.any(String),
      new Date(dateStr),
      new Date(`${dateStr}T23:59:59`),
    );
  });
});
