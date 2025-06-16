import { api } from "encore.dev/api";
import { taskDB } from "./db";

interface FinishDayRequest {
  date: Date;
}

interface FinishDayResponse {
  totalItems: number;
  completed: number;
  incomplete: number;
}

/**
 * Seeds routine entries for a day and returns completion counts.
 *
 * @param req - The date to finish.
 * @returns Totals of completed vs incomplete items.
 */
export const finishDay = api<FinishDayRequest, FinishDayResponse>(
  { expose: true, method: "POST", path: "/finish-day" },
  async (req) => {
    await taskDB.query`
      INSERT INTO routine_entries (routine_item_id, date, completed)
      SELECT ri.id, ${req.date}, false
      FROM routine_items ri
      LEFT JOIN routine_entries re
        ON re.routine_item_id = ri.id AND re.date = ${req.date}
      WHERE ri.is_active = true AND re.id IS NULL
    `;

    const counts = await taskDB.queryRow<{
      total: number;
      completed: number;
      incomplete: number;
    }>`
      SELECT
        (SELECT COUNT(*) FROM routine_items WHERE is_active = true) AS total,
        (SELECT COUNT(*) FROM routine_entries WHERE date = ${req.date} AND completed) AS completed,
        (SELECT COUNT(*) FROM routine_entries WHERE date = ${req.date} AND NOT completed) AS incomplete
    `;

    return {
      totalItems: Number(counts?.total || 0),
      completed: Number(counts?.completed || 0),
      incomplete: Number(counts?.incomplete || 0),
    };
  }
);
