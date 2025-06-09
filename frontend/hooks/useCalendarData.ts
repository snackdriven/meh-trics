import { useCallback, useEffect, useState } from "react";
import backend from "~backend/client";
import type { Habit, HabitEntry } from "~backend/habits/types";
import type {
  CalendarEvent,
  JournalEntry,
  MoodEntry,
  RoutineEntry,
  RoutineItem,
  Task,
} from "~backend/task/types";
import { useAsyncOperation } from "./useAsyncOperation";
import { useToast } from "./useToast";

export type CalendarView = "month" | "2weeks" | "week" | "3days";

export function useCalendarData(currentDate: Date, calendarView: CalendarView) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [routineEntries, setRoutineEntries] = useState<RoutineEntry[]>([]);
  const [routineItems, setRoutineItems] = useState<RoutineItem[]>([]);
  const [habitEntries, setHabitEntries] = useState<HabitEntry[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const { showError } = useToast();

  const getDateRange = useCallback(() => {
    const today = new Date(currentDate);
    let startDate: Date;
    let endDate: Date;

    switch (calendarView) {
      case "3days":
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 1);
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 2);
        break;
      case "week":
        startDate = new Date(today);
        startDate.setDate(today.getDate() - today.getDay());
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6);
        break;
      case "2weeks":
        startDate = new Date(today);
        startDate.setDate(today.getDate() - today.getDay());
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 13);
        break;
      default: {
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const endOfMonth = new Date(
          today.getFullYear(),
          today.getMonth() + 1,
          0,
        );
        startDate = new Date(startOfMonth);
        startDate.setDate(startDate.getDate() - startDate.getDay());
        endDate = new Date(endOfMonth);
        endDate.setDate(endDate.getDate() + (6 - endOfMonth.getDay()));
        break;
      }
    }
    return { startDate, endDate };
  }, [currentDate, calendarView]);

  const { startDate, endDate } = getDateRange();

  const fetchData = useCallback(async () => {
    const { startDate, endDate } = getDateRange();
    const startDateStr = startDate.toISOString().split("T")[0];
    const endDateStr = endDate.toISOString().split("T")[0];
    const requestNames = [
      "tasks",
      "mood entries",
      "routine entries",
      "routine items",
      "habit entries",
      "habits",
      "calendar events",
      "journal entries",
    ];

    const results = await Promise.allSettled([
      backend.task.listTasks({ startDate: startDateStr, endDate: endDateStr }),
      backend.task.listMoodEntries({
        startDate: startDateStr,
        endDate: endDateStr,
      }),
      backend.task.listRoutineEntries({
        startDate: startDateStr,
        endDate: endDateStr,
      }),
      backend.task.listRoutineItems(),
      backend.task.listHabitEntries({
        startDate: startDateStr,
        endDate: endDateStr,
      }),
      backend.task.listHabits(),
      backend.task.listCalendarEvents({
        startDate: startDateStr,
        endDate: endDateStr,
      }),
      backend.task.listJournalEntries({
        startDate: startDateStr,
        endDate: endDateStr,
      }),
    ]);

    const failed: string[] = [];
    const [
      tasksRes,
      moodRes,
      routineEntriesRes,
      routineItemsRes,
      habitEntriesRes,
      habitsRes,
      eventsRes,
      journalsRes,
    ] = results.map((r, idx) => {
      if (r.status === "fulfilled") return r.value as any;
      console.error(`Calendar data fetch failed [${idx}]`, r.reason);
      failed.push(requestNames[idx]);
      return null;
    });

    setTasks(tasksRes?.tasks ?? []);
    setMoodEntries(moodRes?.entries ?? []);
    setRoutineEntries(routineEntriesRes?.entries ?? []);
    setRoutineItems(routineItemsRes?.items ?? []);
    setHabitEntries(habitEntriesRes?.entries ?? []);
    setHabits(habitsRes?.habits ?? []);
    setCalendarEvents(eventsRes?.events ?? []);
    setJournalEntries(journalsRes?.entries ?? []);

    if (failed.length > 0) {
      throw new Error(`Failed to load ${failed.join(", ")}`);
    }

    return {
      tasks: tasksRes?.tasks ?? [],
      events: eventsRes?.events ?? [],
      moods: moodRes?.entries ?? [],
    };
  }, [getDateRange, showError]);

  const {
    loading,
    error,
    execute: loadData,
  } = useAsyncOperation(fetchData, undefined, (msg) =>
    showError(msg, "Loading Error"),
  );

  useEffect(() => {
    loadData();
  }, [loadData]);

  const addCalendarEvent = (event: CalendarEvent) => {
    setCalendarEvents((prev) => [...prev, event]);
  };

  return {
    tasks,
    moodEntries,
    journalEntries,
    routineEntries,
    routineItems,
    habitEntries,
    habits,
    calendarEvents,
    startDate,
    endDate,
    loading,
    error,
    loadData,
    addCalendarEvent,
  };
}
