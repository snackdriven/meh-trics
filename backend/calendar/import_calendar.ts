import { api } from "encore.dev/api";
import ical from "node-ical";
import { ErrorCode, createAppError, withErrorHandling } from "../utils/errors";
import { calendarDB } from "./db";

interface ImportCalendarRequest {
  ics: string;
}

interface ImportCalendarResult {
  imported: number;
  skipped: number;
}

// Helper function to validate and convert dates
function validateDate(dateValue: any, fieldName: string): Date {
  if (!dateValue) {
    throw createAppError(
      ErrorCode.INVALID_INPUT,
      `${fieldName} is required but was null or undefined`
    );
  }

  const date = new Date(dateValue);
  if (isNaN(date.getTime())) {
    throw createAppError(ErrorCode.INVALID_INPUT, `${fieldName} is not a valid date: ${dateValue}`);
  }

  return date;
}

export const importCalendar = api<ImportCalendarRequest, ImportCalendarResult>(
  {
    expose: true,
    method: "POST",
    path: "/calendar-events/import",
    bodyLimit: 5 * 1024 * 1024,
  },
  async (req) => {
    return withErrorHandling(async () => {
      // Validate input
      if (!req.ics || typeof req.ics !== "string") {
        throw createAppError(ErrorCode.INVALID_INPUT, "ICS data is required and must be a string");
      }

      if (req.ics.trim().length === 0) {
        throw createAppError(ErrorCode.INVALID_INPUT, "ICS data cannot be empty");
      }

      // Parse ICS with error handling
      let parsed: any;
      try {
        parsed = ical.parseICS(req.ics);
      } catch (error) {
        throw createAppError(
          ErrorCode.INVALID_INPUT,
          `Failed to parse ICS data: ${error instanceof Error ? error.message : "Unknown parsing error"}`
        );
      }

      if (!parsed || typeof parsed !== "object") {
        throw createAppError(ErrorCode.INVALID_INPUT, "Parsed ICS data is invalid or empty");
      }

      let imported = 0;
      let skipped = 0;
      const errors: string[] = [];

      // Use transaction for atomic operation
      await calendarDB.exec`BEGIN`;

      try {
        for (const [uid, event] of Object.entries(parsed)) {
          try {
            // Validate event type and required fields
            if (!event || typeof event !== "object" || event.type !== "VEVENT") {
              continue;
            }

            if (!event.start || !event.end) {
              errors.push(`Event ${uid}: Missing start or end time`);
              continue;
            }

            // Validate and convert dates
            let startDate: Date;
            let endDate: Date;

            try {
              startDate = validateDate(event.start, "start time");
              endDate = validateDate(event.end, "end time");
            } catch (dateError) {
              errors.push(`Event ${uid}: ${dateError.message}`);
              continue;
            }

            // Validate date logic
            if (startDate >= endDate) {
              errors.push(`Event ${uid}: Start time must be before end time`);
              continue;
            }

            // Validate string lengths
            const title = event.summary || "Untitled";
            if (title.length > 255) {
              errors.push(`Event ${uid}: Title too long (max 255 characters)`);
              continue;
            }

            const description = event.description || null;
            if (description && description.length > 1000) {
              errors.push(`Event ${uid}: Description too long (max 1000 characters)`);
              continue;
            }

            const location = event.location || null;
            if (location && location.length > 255) {
              errors.push(`Event ${uid}: Location too long (max 255 characters)`);
              continue;
            }

            // Check for existing event with error handling
            let existing;
            try {
              existing = await calendarDB.queryRow`
                SELECT id FROM calendar_events
                WHERE title = ${title}
                  AND start_time = ${startDate}
                  AND end_time = ${endDate}
              `;
            } catch (dbError) {
              throw createAppError(
                ErrorCode.DATABASE_QUERY_FAILED,
                `Failed to check for existing event: ${dbError instanceof Error ? dbError.message : "Unknown database error"}`
              );
            }

            if (existing) {
              skipped++;
              continue;
            }

            // Insert new event with error handling
            try {
              await calendarDB.exec`
                INSERT INTO calendar_events (title, description, start_time, end_time, is_all_day, location, color, recurrence, recurrence_end_date, tags)
                VALUES (
                  ${title},
                  ${description},
                  ${startDate},
                  ${endDate},
                  ${event.datetype === "date"},
                  ${location},
                  ${null},
                  ${"none"},
                  ${null},
                  ${[]}
                )
              `;
              imported++;
            } catch (insertError) {
              if (
                insertError.message?.includes("duplicate key") ||
                insertError.message?.includes("unique constraint")
              ) {
                skipped++;
              } else {
                errors.push(
                  `Event ${uid}: Failed to insert - ${insertError instanceof Error ? insertError.message : "Unknown insert error"}`
                );
              }
            }
          } catch (eventError) {
            errors.push(
              `Event ${uid}: ${eventError instanceof Error ? eventError.message : "Unknown error processing event"}`
            );
          }
        }

        // Commit transaction
        await calendarDB.exec`COMMIT`;

        // Log warnings for any errors encountered during processing
        if (errors.length > 0) {
          console.warn(`Calendar import completed with ${errors.length} errors:`, errors);
        }

        return { imported, skipped };
      } catch (transactionError) {
        // Rollback transaction on any error
        try {
          await calendarDB.exec`ROLLBACK`;
        } catch (rollbackError) {
          console.error("Failed to rollback transaction:", rollbackError);
        }
        throw transactionError;
      }
    }, "import calendar");
  }
);
