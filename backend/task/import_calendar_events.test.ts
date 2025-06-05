import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('encore.dev/api', () => ({ api: (_opts: any, fn: any) => fn, APIError: class extends Error { static invalidArgument(msg: string) { return new this(msg); } } }));
vi.mock('./db', () => ({ taskDB: { exec: vi.fn() } }));

import { importCalendarEvents } from './import_calendar_events';
import { taskDB } from './db';

const sampleICS = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
UID:1
SUMMARY:Hello
DTSTART:20250101T100000Z
DTEND:20250101T110000Z
END:VEVENT
END:VCALENDAR`;

describe('importCalendarEvents', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('imports events and returns counts', async () => {
    const result = await importCalendarEvents({ ics: sampleICS });
    expect(taskDB.exec).toHaveBeenCalled();
    expect(result).toEqual({ imported: 1, total: 1 });
  });

  it('validates input', async () => {
    await expect(importCalendarEvents({ ics: '' })).rejects.toThrowError();
  });
});
