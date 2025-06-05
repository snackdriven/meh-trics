import { api, APIError } from "encore.dev/api";
import { taskDB } from "./db";
import ical from "node-ical";
import type { EventRecurrence } from "./types";

interface ImportCalendarEventsRequest {
  ics: string;
}

interface ImportCalendarEventsResponse {
  imported: number;
  total: number;
}

function mapFrequency(freq: number | undefined): EventRecurrence {
  switch (freq) {
    case 3: // DAILY
      return "daily";
    case 2: // WEEKLY
      return "weekly";
    case 1: // MONTHLY
      return "monthly";
    case 0: // YEARLY
      return "yearly";
    default:
      return "none";
  }
}

export const importCalendarEvents = api<ImportCalendarEventsRequest, ImportCalendarEventsResponse>(
  { expose: true, method: "POST", path: "/calendar-events/import" },
  async (req) => {
    if (!req.ics || !req.ics.trim()) {
      throw APIError.invalidArgument("iCal data required");
    }

    let data: any;
    try {
      data = ical.sync.parseICS(req.ics);
    } catch (err) {
      throw APIError.invalidArgument("invalid iCal format");
    }
    let imported = 0;
    let total = 0;

    for (const key in data) {
      const ev = data[key] as any;
      if (!ev || ev.type !== "VEVENT") continue;
      total++;

      const recurrence = mapFrequency(ev.rrule?.options.freq);
      const recurrenceEndDate = ev.rrule?.options.until ?? null;
      const isAllDay = ev.datetype === "date";

      await taskDB.exec`
        INSERT INTO calendar_events (title, description, start_time, end_time, is_all_day, location, color, recurrence, recurrence_end_date, tags)
        VALUES (${ev.summary || "Untitled Event"}, ${ev.description || null}, ${ev.start}, ${ev.end}, ${isAllDay}, ${ev.location || null}, ${null}, ${recurrence}, ${recurrenceEndDate}, ${[]})
      `;
      imported++;
    }

    return { imported, total };
  }
);
