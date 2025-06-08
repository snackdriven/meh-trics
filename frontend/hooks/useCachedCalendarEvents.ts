import backend from "~backend/client";
import type { CalendarEvent } from "~backend/task/types";
import { useCachedData } from "./useCachedData";

interface Params {
  startDate?: string;
  endDate?: string;
  tags?: string;
}

export function useCachedCalendarEvents(params: Params) {
  const key = `calendarEvents:${params.startDate ?? ""}:${params.endDate ?? ""}:${params.tags ?? ""}`;
  return useCachedData<CalendarEvent[]>(key, async () => {
    const res = await backend.task.listCalendarEvents(params);
    return res.events;
  });
}
