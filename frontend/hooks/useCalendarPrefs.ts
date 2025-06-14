import { useEffect, useState } from "react";
import type { CalendarView } from "./useCalendarData";

const VIEW_KEY = "calendarView";
const DATE_KEY = "calendarDate";

export function useCalendarPrefs(
  initialDate = new Date(),
  initialView: CalendarView = "month",
) {
  const [currentDate, setCurrentDate] = useState<Date>(() => {
    if (typeof window === "undefined") return initialDate;
    const stored = localStorage.getItem(DATE_KEY);
    return stored ? new Date(stored) : initialDate;
  });

  const [calendarView, setCalendarView] = useState<CalendarView>(() => {
    if (typeof window === "undefined") return initialView;
    const stored = localStorage.getItem(VIEW_KEY) as CalendarView | null;
    return stored ?? initialView;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(DATE_KEY, currentDate.toISOString());
  }, [currentDate]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(VIEW_KEY, calendarView);
  }, [calendarView]);

  return { currentDate, setCurrentDate, calendarView, setCalendarView };
}
