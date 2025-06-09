import { beforeEach, describe, expect, it, vi } from "vitest";
vi.mock("encore.dev/api", () => ({ api: (_opts: unknown, fn: unknown) => fn }));
vi.mock("node-ical", () => ({
  parseICS: vi.fn(),
}));
vi.mock("./db", () => ({ calendarDB: { queryRow: vi.fn(), exec: vi.fn() } }));

import { parseICS } from "node-ical";
import { calendarDB } from "./db";
import { importCalendar } from "./import_calendar";

describe("importCalendar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("imports events and returns result", async () => {
    const start = new Date();
    const end = new Date(start.getTime() + 60 * 60 * 1000);
    const mockReturn = {
      ev: { type: "VEVENT", start, end, summary: "Meeting" },
    };
    (parseICS as ReturnType<typeof vi.fn>).mockReturnValueOnce(mockReturn);
    (calendarDB.queryRow as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      null,
    );

    const res = await importCalendar({ ics: "dummy" });

    expect(calendarDB.queryRow).toHaveBeenCalled();
    expect(calendarDB.exec).toHaveBeenCalled();
    expect(res).toEqual({ imported: 1, skipped: 0 });
  });
});
