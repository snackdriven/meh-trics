import { api, APIError } from "encore.dev/api";
import { taskDB } from "./db";

// Deletes a calendar event.
export const deleteCalendarEvent = api<{ id: number }, void>(
  { expose: true, method: "DELETE", path: "/calendar-events/:id" },
  async (req) => {
    const result = await taskDB.exec`
      DELETE FROM calendar_events WHERE id = ${req.id}
    `;
    
    // Note: PostgreSQL doesn't return affected rows count in this context
    // We'll assume the delete was successful if no error was thrown
  }
);
