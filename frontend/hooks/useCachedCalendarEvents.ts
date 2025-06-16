import { useCallback, useEffect, useState } from "react";
import backend from "~backend/client";
import type { CalendarEvent } from "~backend/calendar/types";
import { reviveDates } from "../lib/date";

export interface ListCalendarEventsParams {
  startDate?: string;
  endDate?: string;
  tags?: string;
}

const STORAGE_KEY = "calendarEventsCache";
const CACHE_LIMIT = 10;

function loadCache(): Record<string, CalendarEvent[]> {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw, reviveDates) : {};
}

function saveCache(cache: Record<string, CalendarEvent[]>) {
  const keys = Object.keys(cache);
  if (keys.length > CACHE_LIMIT) {
    // Remove oldest entry
    delete cache[keys[0]];
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
}

const keyForParams = (p: ListCalendarEventsParams) =>
  `${p.startDate ?? ""}:${p.endDate ?? ""}:${p.tags ?? ""}`;

export function useCachedCalendarEvents(params: ListCalendarEventsParams) {
  const cacheKey = keyForParams(params);

  const [events, setEvents] = useState<CalendarEvent[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const fresh = await backend.calendar.listCalendarEvents(params as any);
      setEvents(fresh.events);
      const cache = loadCache();
      cache[cacheKey] = fresh.events;
      saveCache(cache);
      setError(null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to load";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [params, cacheKey]);

  useEffect(() => {
    const cache = loadCache();
    const cached = cache[cacheKey];
    if (cached) {
      setEvents(cached);
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
