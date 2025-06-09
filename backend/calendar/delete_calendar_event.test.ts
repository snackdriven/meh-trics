import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("encore.dev/api", () => ({ api: (_opts: unknown, fn: unknown) => fn }));
vi.mock("./db", () => ({ calendarDB: { exec: vi.fn() } }));

import { deleteCalendarEvent } from "./delete_calendar_event";
import { calendarDB } from "./db";

describe("deleteCalendarEvent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deletes calendar event", async () => {
    await deleteCalendarEvent({ id: 1 });
    expect(calendarDB.exec).toHaveBeenCalled();
  });
});
