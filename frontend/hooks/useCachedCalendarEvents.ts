import { useCallback, useEffect, useState } from "react";
import backend from "~backend/client";
import type { CalendarEvent } from "~backend/task/types";
import { reviveDates } from "../lib/date";

export interface ListCalendarEventsParams {
  startDate?: string;
  endDate?: string;
  tags?: string;
}

const keyForParams = (p: ListCalendarEventsParams) =>
  `calendarEvents:${p.startDate ?? ""}:${p.endDate ?? ""}:${p.tags ?? ""}`;

export function useCachedCalendarEvents(params: ListCalendarEventsParams) {
  const cacheKey = keyForParams(params);

  const [events, setEvents] = useState<CalendarEvent[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const fresh = await backend.task.listCalendarEvents(params as any);
      setEvents(fresh.events);
      localStorage.setItem(cacheKey, JSON.stringify(fresh.events));
      setError(null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to load";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [params, cacheKey]);

  useEffect(() => {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      setEvents(JSON.parse(cached, reviveDates));
      setLoading(false);
    }
    void fetchData();
  }, [fetchData, cacheKey]);

  const refresh = useCallback(() => {
    setLoading(true);
    return fetchData();
  }, [fetchData]);

  return { events, loading, error, refresh };
}
