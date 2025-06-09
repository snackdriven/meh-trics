import { api } from "encore.dev/api";
import { parseICS } from "node-ical";
import { calendarDB } from "./db";

interface ImportCalendarRequest {
  ics: string;
}

interface ImportCalendarResult {
  imported: number;
  skipped: number;
}

export const importCalendar = api<ImportCalendarRequest, ImportCalendarResult>(
  {
    expose: true,
    method: "POST",
    path: "/calendar-events/import",
    bodyLimit: 5 * 1024 * 1024,
  },
  async (req) => {
    const parsed = parseICS(req.ics);
    let imported = 0;
    let skipped = 0;

    for (const event of Object.values(parsed)) {
      if (event.type !== "VEVENT" || !event.start || !event.end) {
        continue;
      }

      const existing = await calendarDB.queryRow`
        SELECT id FROM calendar_events
        WHERE title = ${event.summary || ""}
          AND start_time = ${event.start as Date}
          AND end_time = ${event.end as Date}
      `;

      if (existing) {
        skipped++;
        continue;
      }

      await calendarDB.exec`
        INSERT INTO calendar_events (title, description, start_time, end_time, is_all_day, location, color, recurrence, recurrence_end_date, tags)
        VALUES (
          ${event.summary || "Untitled"},
          ${event.description || null},
          ${event.start as Date},
          ${event.end as Date},
          ${event.datetype === "date"},
          ${event.location || null},
          ${null},
          ${"none"},
          ${null},
          ${[]}
        )
      `;
      imported++;
    }

    return { imported, skipped };
  },
);
