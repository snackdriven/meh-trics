import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("encore.dev/api", () => ({ api: (_opts: unknown, fn: unknown) => fn }));
vi.mock("./db", () => ({ calendarDB: { query: vi.fn(), rawQuery: vi.fn() } }));

import type { CalendarEvent } from "../task/types";
import { calendarDB } from "./db";
import { listCalendarEvents } from "./list_calendar_events";

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
      })()
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
      })()
    );

    const dateStr = now.toISOString().slice(0, 10);
    await listCalendarEvents({ startDate: dateStr, endDate: dateStr });

    expect(calendarDB.rawQuery).toHaveBeenCalledWith(
      expect.stringContaining("SELECT"),
      new Date(dateStr),
      new Date(`${dateStr}T23:59:59`)
    );
  });

  it("expands recurring events", async () => {
    const start = new Date("2023-01-01T10:00:00Z");
    const end = new Date("2023-01-01T11:00:00Z");
    (calendarDB.query as ReturnType<typeof vi.fn>).mockReturnValueOnce(
      (async function* () {
        yield {
          id: 1,
          title: "Standup",
          description: null,
          start_time: start,
          end_time: end,
          is_all_day: false,
          location: null,
          color: null,
          recurrence: "daily",
          recurrence_end_date: new Date("2023-01-03"),
          tags: [],
          created_at: start,
          updated_at: start,
        };
      })()
    );

    const res = await listCalendarEvents({});

    expect(res.events).toHaveLength(3);
    expect(res.events[0]?.startTime).toEqual(start);
    expect(res.events[1]?.startTime).toEqual(new Date(start.getTime() + 24 * 60 * 60 * 1000));
    expect(res.events[2]?.startTime).toEqual(new Date(start.getTime() + 2 * 24 * 60 * 60 * 1000));
  });
});
