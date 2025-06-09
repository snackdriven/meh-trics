import { beforeEach, describe, expect, it, vi } from "vitest";
import { Readable } from "stream";

vi.mock("encore.dev/api", () => ({
  api: (_opts: unknown, fn: unknown) => fn,
  raw: (_opts: unknown, fn: unknown) => fn,
}));
vi.mock("node-ical", () => ({ sync: { parseICS: vi.fn() } }));
vi.mock("./db", () => ({ calendarDB: { queryRow: vi.fn(), exec: vi.fn() } }));

import { importCalendar } from "./import_calendar";
import { calendarDB } from "./db";
import { sync as icalSync } from "node-ical";

describe("importCalendar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("imports events and returns result", async () => {
    const start = new Date();
    const end = new Date(start.getTime() + 60 * 60 * 1000);
    (icalSync.parseICS as ReturnType<typeof vi.fn>).mockReturnValueOnce({
      ev: { type: "VEVENT", start, end, summary: "Meeting" },
    });
    (calendarDB.queryRow as ReturnType<typeof vi.fn>).mockResolvedValueOnce(null);

    const chunks = ["dummy"];
    const req = Readable.from(chunks);
    const res: any = {
      statusCode: 0,
      headers: {},
      setHeader(name: string, value: string) {
        this.headers[name] = value;
      },
      end: vi.fn(),
    };

    await importCalendar(req as any, res);

    expect(calendarDB.queryRow).toHaveBeenCalled();
    expect(calendarDB.exec).toHaveBeenCalled();
    expect(res.end).toHaveBeenCalledWith(
      JSON.stringify({ imported: 1, skipped: 0 }),
    );
  });
});
