import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Brain,
  Calendar,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Heart,
  List,
  NotebookPen,
  Plus,
  Target,
} from "lucide-react";
import { useEffect, useState } from "react";
import backend from "~backend/client";
import type {
  CalendarEvent,
  Habit,
  HabitEntry,
  JournalEntry,
  MoodEntry,
  RoutineEntry,
  RoutineItem,
  Task,
} from "~backend/task/types";
import { useAsyncOperation } from "../hooks/useAsyncOperation";
import { useCalendarLayers } from "../hooks/useCalendarLayers";
import { useToast } from "../hooks/useToast";
import { CreateEventDialog } from "./CreateEventDialog";
import { DayDetailDialog } from "./DayDetailDialog";
import { EditableCopy } from "./EditableCopy";
import { ErrorMessage } from "./ErrorMessage";
import { CalendarSkeleton } from "./SkeletonLoader";
import { getEventColorClasses } from "./eventColors";

type CalendarView = "month" | "2weeks" | "week" | "3days";

export function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarView, setCalendarView] = useState<CalendarView>("month");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [routineEntries, setRoutineEntries] = useState<RoutineEntry[]>([]);
  const [routineItems, setRoutineItems] = useState<RoutineItem[]>([]);
  const [habitEntries, setHabitEntries] = useState<HabitEntry[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const { layers, toggleLayer } = useCalendarLayers();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isCreateEventDialogOpen, setIsCreateEventDialogOpen] = useState(false);

  const { showError, showSuccess } = useToast();

  const getDateRange = useCallback(() => {
    const today = new Date(currentDate);
    let startDate: Date;
    let endDate: Date;

    switch (calendarView) {
      case "3days":
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 1); // Start from yesterday
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 2);
        break;
      case "week":
        startDate = new Date(today);
        startDate.setDate(today.getDate() - today.getDay()); // Start of week (Sunday)
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6);
        break;
      case "2weeks":
        startDate = new Date(today);
        startDate.setDate(today.getDate() - today.getDay()); // Start of week (Sunday)
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
        daysToShow =
          Math.ceil(
            (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
          ) + 1;
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

    const [
      tasksRes,
      moodRes,
      routineEntriesRes,
      routineItemsRes,
      habitEntriesRes,
      habitsRes,
      eventsRes,
      journalsRes,
    ] = await Promise.all([
      backend.task.listTasks({}),
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

    setTasks(tasksRes.tasks);
    setMoodEntries(moodRes.entries);
    setRoutineEntries(routineEntriesRes.entries);
    setRoutineItems(routineItemsRes.items);
    setHabitEntries(habitEntriesRes.entries);
    setHabits(habitsRes.habits);
    setCalendarEvents(eventsRes.events);
    setJournalEntries(journalsRes.entries);

    return {
      tasks: tasksRes.tasks,
      events: eventsRes.events,
      moods: moodRes.entries,
    };
  }, [getDateRange]);

  const {
    loading,
    error,
    execute: loadData,
  } = useAsyncOperation(
    async () => {
      const startDateStr = startDate.toISOString().split("T")[0];
      const endDateStr = endDate.toISOString().split("T")[0];

      const [
        tasksRes,
        moodRes,
        routineEntriesRes,
        routineItemsRes,
        habitEntriesRes,
        habitsRes,
        eventsRes,
        journalsRes,
      ] = await Promise.all([
        backend.task.listTasks({}),
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

      setTasks(tasksRes.tasks);
      setMoodEntries(moodRes.entries);
      setRoutineEntries(routineEntriesRes.entries);
      setRoutineItems(routineItemsRes.items);
      setHabitEntries(habitEntriesRes.entries);
      setHabits(habitsRes.habits);
      setCalendarEvents(eventsRes.events);
      setJournalEntries(journalsRes.entries);

      return {
        tasks: tasksRes.tasks,
        events: eventsRes.events,
        moods: moodRes.entries,
      };
    },
    undefined,
    (error) => showError("Failed to load calendar data", "Loading Error"),
  );

  useEffect(() => {
    loadData();
  }, [loadData]);

  const navigateCalendar = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      switch (calendarView) {
        case "3days":
          newDate.setDate(newDate.getDate() + (direction === "next" ? 3 : -3));
          break;
        case "week":
          newDate.setDate(newDate.getDate() + (direction === "next" ? 7 : -7));
          break;
        case "2weeks":
          newDate.setDate(
            newDate.getDate() + (direction === "next" ? 14 : -14),
          );
          break;
        default:
          newDate.setMonth(
            newDate.getMonth() + (direction === "next" ? 1 : -1),
          );
          break;
      }
      return newDate;
    });
  };

  const getCalendarDays = () => {
    const days = [];
    const current = new Date(startDate);

    while (current <= endDate) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    return days;
  };

  const getDayData = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0];

    const dayTasks = tasks.filter(
      (task) =>
        task.dueDate &&
        new Date(task.dueDate).toISOString().split("T")[0] === dateStr,
    );

    const dayMood = moodEntries
      .filter(
        (entry) => new Date(entry.date).toISOString().split("T")[0] === dateStr,
      )
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )[0];

    const dayRoutineEntries = routineEntries.filter(
      (entry) => new Date(entry.date).toISOString().split("T")[0] === dateStr,
    );

    const dayHabitEntries = habitEntries.filter(
      (entry) => new Date(entry.date).toISOString().split("T")[0] === dateStr,
    );

    const dayJournals = journalEntries.filter((j) => {
      if (!j.date) return false;
      return new Date(j.date).toISOString().split("T")[0] === dateStr;
    });

    const dayEvents = calendarEvents.filter((event) => {
      const eventStart = new Date(event.startTime);
      const eventEnd = new Date(event.endTime);
      const dayStart = new Date(date);
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);

      return eventStart <= dayEnd && eventEnd >= dayStart;
    });

    const completedRoutines = dayRoutineEntries.filter(
      (entry) => entry.completed,
    ).length;
    const totalRoutines = routineItems.length;

    const completedHabits = dayHabitEntries.filter((entry) => {
      const habit = habits.find((h) => h.id === entry.habitId);
      return habit && entry.count >= habit.targetCount;
    }).length;
    const totalHabits = habits.length;

    return {
      tasks: dayTasks,
      mood: dayMood,
      events: dayEvents,
      routineProgress:
        totalRoutines > 0 ? completedRoutines / totalRoutines : 0,
      completedRoutines,
      totalRoutines,
      habitProgress: totalHabits > 0 ? completedHabits / totalHabits : 0,
      completedHabits,
      totalHabits,
      habitEntries: dayHabitEntries,
      journals: dayJournals,
    };
  };

  const getMoodColor = (tier?: string) => {
    switch (tier) {
      case "uplifted":
        return "bg-yellow-200 border-yellow-400";
      case "neutral":
        return "bg-blue-200 border-blue-400";
      case "heavy":
        return "bg-gray-200 border-gray-400";
      default:
        return "bg-gray-100 border-gray-300";
    }
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isCurrentPeriod = (date: Date) => {
    if (calendarView === "month") {
      return date.getMonth() === currentDate.getMonth();
    }
    return true; // For other views, all days are in the current period
  };

  const handleDayClick = (date: Date) => {
    if (isCurrentPeriod(date)) {
      setSelectedDate(date);
    }
  };

  const handleEventCreated = (newEvent: CalendarEvent) => {
    setCalendarEvents((prev) => [...prev, newEvent]);
    setIsCreateEventDialogOpen(false);
    showSuccess("Event created successfully! 📅");
  };

  const getViewTitle = () => {
    switch (calendarView) {
      case "3days":
        return `${startDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${endDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
      case "week":
        return `Week of ${startDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
      case "2weeks":
        return `${startDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${endDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
      default:
        return currentDate.toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        });
    }
  };

  const getGridCols = () => {
    switch (calendarView) {
      case "3days":
        return "grid-cols-3";
      case "week":
        return "grid-cols-7";
      case "2weeks":
        return "grid-cols-7";
      default:
        return "grid-cols-7";
    }
  };

  if (loading) {
    return (
      <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
        <CardContent className="p-8">
          <CalendarSkeleton />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
        <CardContent className="p-8">
          <ErrorMessage message={error} onRetry={loadData} />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <CardTitle className="text-2xl">{getViewTitle()}</CardTitle>
              <Select
                value={calendarView}
                onValueChange={(value) =>
                  setCalendarView(value as CalendarView)
                }
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="month">Month</SelectItem>
                  <SelectItem value="2weeks">2 Weeks</SelectItem>
                  <SelectItem value="week">Week</SelectItem>
                  <SelectItem value="3days">3 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setIsCreateEventDialogOpen(true)}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Event
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateCalendar("prev")}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateCalendar("next")}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 text-sm mb-2">
            {(Object.keys(layers) as Array<keyof typeof layers>).map((key) => (
              <Label key={key} className="flex items-center gap-1">
                <Checkbox
                  checked={layers[key]}
                  onCheckedChange={() => toggleLayer(key)}
                />
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </Label>
            ))}
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Heart className="h-3 w-3" />
              Mood tracked
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              Routines completed
            </div>
            <div className="flex items-center gap-1">
              <Target className="h-3 w-3" />
              Habits completed
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Tasks & events
            </div>
          </div>
          <EditableCopy
            defaultText="💡 Click on any day to view and edit details"
            as="p"
            className="text-sm text-purple-600 font-medium"
          />
        </CardHeader>
        <CardContent>
          {calendarView !== "3days" && (
            <div className={`grid ${getGridCols()} gap-1 mb-4`}>
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div
                  key={day}
                  className="p-2 text-center text-sm font-medium text-gray-500"
                >
                  {day}
                </div>
              ))}
            </div>
          )}

          <div className={`grid ${getGridCols()} gap-1`}>
            {getCalendarDays().map((date) => {
              const dayData = getDayData(date);
              const isCurrentPeriodDay = isCurrentPeriod(date);
              const isTodayDate = isToday(date);

              return (
                <button
                  key={date.toISOString()}
                  className={`min-h-[120px] p-2 border rounded-lg transition-all duration-200 cursor-pointer ${
                    isTodayDate
                      ? "bg-purple-100 border-purple-400 shadow-md"
                      : isCurrentPeriodDay
                        ? layers.moods && dayData.mood
                          ? getMoodColor(dayData.mood.tier)
                          : "bg-white border-gray-200 hover:border-purple-300 hover:shadow-sm"
                        : "bg-gray-50 border-gray-100 cursor-default"
                  }`}
                  type="button"
                  onClick={() => handleDayClick(date)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleDayClick(date);
                  }}
                >
                  <div
                    className={`text-sm font-medium mb-2 ${
                      isCurrentPeriodDay ? "text-gray-900" : "text-gray-400"
                    }`}
                  >
                    {calendarView === "3days" ? (
                      <div className="text-center">
                        <div className="text-xs text-gray-500">
                          {date.toLocaleDateString("en-US", {
                            weekday: "short",
                          })}
                        </div>
                        <div className="text-lg font-bold">
                          {date.getDate()}
                        </div>
                      </div>
                    ) : (
                      date.getDate()
                    )}
                  </div>

                  {isCurrentPeriodDay && (
                    <div className="space-y-1">
                      {layers.moods && dayData.mood && (
                        <div className="flex items-center gap-1">
                          <span className="text-xs">{dayData.mood.emoji}</span>
                          <span className="text-xs text-gray-600 truncate">
                            {dayData.mood.label}
                          </span>
                        </div>
                      )}

                      {layers.events && dayData.events.length > 0 && (
                        <div className="space-y-1">
                          {dayData.events.slice(0, 2).map((event) => {
                            const cls = getEventColorClasses(event.color).badge;
                            return (
                              <div key={event.id} className="text-xs">
                                <div
                                  className={`px-1 py-0.5 rounded text-xs truncate ${cls} border`}
                                >
                                  {event.isAllDay ? "📅" : "🕐"}{" "}
                                  {event.title.length > 10
                                    ? `${event.title.slice(0, 10)}...`
                                    : event.title}
                                </div>
                              </div>
                            );
                          })}
                          {layers.events && dayData.events.length > 2 && (
                            <div className="text-xs text-gray-500">
                              +{dayData.events.length - 2} more
                            </div>
                          )}
                        </div>
                      )}

                      {layers.habits && dayData.totalRoutines > 0 && (
                        <div className="text-xs text-gray-600">
                          <div className="flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" />
                            {dayData.completedRoutines}/{dayData.totalRoutines}
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                            <div
                              className="bg-green-500 h-1 rounded-full transition-all duration-300"
                              style={{
                                width: `${dayData.routineProgress * 100}%`,
                              }}
                            />
                          </div>
                        </div>
                      )}

                      {layers.habits && dayData.totalHabits > 0 && (
                        <div className="text-xs text-gray-600">
                          <div className="flex items-center gap-1">
                            <Target className="h-3 w-3" />
                            {dayData.completedHabits}/{dayData.totalHabits}
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                            <div
                              className="bg-purple-500 h-1 rounded-full transition-all duration-300"
                              style={{
                                width: `${dayData.habitProgress * 100}%`,
                              }}
                            />
                          </div>
                        </div>
                      )}

                      {layers.tasks && dayData.tasks.length > 0 && (
                        <div className="space-y-1">
                          {dayData.tasks.slice(0, 1).map((task) => (
                            <div key={task.id} className="text-xs">
                              <Badge
                                variant="outline"
                                className={`text-xs px-1 py-0 ${
                                  task.status === "done"
                                    ? "bg-green-50 text-green-700 border-green-200"
                                    : task.isHardDeadline
                                      ? "bg-red-50 text-red-700 border-red-200"
                                      : "bg-blue-50 text-blue-700 border-blue-200"
                                }`}
                              >
                                {task.title.length > 8
                                  ? `${task.title.slice(0, 8)}...`
                                  : task.title}
                              </Badge>
                            </div>
                          ))}
                          {layers.tasks && dayData.tasks.length > 1 && (
                            <div className="text-xs text-gray-500">
                              +{dayData.tasks.length - 1} more
                            </div>
                          )}
                        </div>
                      )}
                      {layers.journals && dayData.journals.length > 0 && (
                        <div className="flex items-center gap-1 text-xs text-gray-600">
                          <NotebookPen className="h-3 w-3" />
                          {dayData.journals.length}
                        </div>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {selectedDate && (
        <DayDetailDialog
          date={selectedDate}
          open={!!selectedDate}
          onOpenChange={(open) => !open && setSelectedDate(null)}
          onDataUpdated={loadData}
        />
      )}

      <CreateEventDialog
        open={isCreateEventDialogOpen}
        onOpenChange={setIsCreateEventDialogOpen}
        onEventCreated={handleEventCreated}
      />
    </div>
  );
}
