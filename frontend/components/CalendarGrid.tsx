import { Badge } from "@/components/ui/badge";
import { CardContent } from "@/components/ui/card";
import { CheckCircle, NotebookPen, Target } from "lucide-react";
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
import type { CalendarView } from "../hooks/useCalendarData";
import type { CalendarLayers } from "../hooks/useCalendarLayers";
import { useCalendarCustomization } from "../hooks/useCalendarCustomization";
import { getEventColorClasses } from "./eventColors";
import { getStatusColor, getProgressColor, getEmptyStateColor } from "../lib/colors";

interface CalendarGridProps {
  startDate: Date;
  endDate: Date;
  calendarView: CalendarView;
  tasks: Task[];
  moodEntries: MoodEntry[];
  journalEntries: JournalEntry[];
  routineEntries: RoutineEntry[];
  routineItems: RoutineItem[];
  habitEntries: HabitEntry[];
  habits: Habit[];
  calendarEvents: CalendarEvent[];
  layers: CalendarLayers;
  onDayClick: (date: Date) => void;
  isCurrentPeriod: (d: Date) => boolean;
  isToday: (d: Date) => boolean;
}

export function CalendarGrid({
  startDate,
  endDate,
  calendarView,
  tasks,
  moodEntries,
  journalEntries,
  routineEntries,
  routineItems,
  habitEntries,
  habits,
  calendarEvents,
  layers,
  onDayClick,
  isCurrentPeriod,
  isToday,
}: CalendarGridProps) {
  const { 
    settings, 
    getCellPaddingClass, 
    getEventBadgeClass, 
    getEventTextSizeClass,
    getShortDayNames,
    formatTime 
  } = useCalendarCustomization();

  const getCalendarDays = () => {
    const days = [] as Date[];
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
      (t) =>
        t.dueDate &&
        new Date(t.dueDate).toISOString().split("T")[0] === dateStr,
    );
    const dayMood = moodEntries
      .filter((e) => new Date(e.date).toISOString().split("T")[0] === dateStr)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )[0];
    const dayRoutineEntries = routineEntries.filter(
      (e) => new Date(e.date).toISOString().split("T")[0] === dateStr,
    );
    const dayHabitEntries = habitEntries.filter(
      (e) => new Date(e.date).toISOString().split("T")[0] === dateStr,
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
      (e) => e.completed,
    ).length;
    const totalRoutines = routineItems.length;
    const completedHabits = dayHabitEntries.filter((e) => {
      const habit = habits.find((h) => h.id === e.habitId);
      return habit && e.count >= habit.targetCount;
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

  return (
    <CardContent>
      {/* Always show days of the week for better orientation */}
      <div className={`grid ${getGridCols()} gap-1 mb-4`}>
        {calendarView === "3days" 
          ? getCalendarDays().map((date, index) => (
              <div
                key={index}
                className="p-2 text-center text-sm font-medium text-gray-500"
              >
                {date.toLocaleDateString('en-US', { weekday: 'short' })}
              </div>
            ))
          : getShortDayNames().map((day) => (
              <div
                key={day}
                className="p-2 text-center text-sm font-medium text-gray-500"
              >
                {day}
              </div>
            ))
        }
      </div>
      <div className={`grid ${getGridCols()} gap-1`}>
        {getCalendarDays().map((date) => {
          const dayData = getDayData(date);
          const isCurrentPeriodDay = isCurrentPeriod(date);
          return (
            <button
              key={date.toISOString()}
              type="button"
              className={`min-h-[80px] ${getCellPaddingClass()} text-left border rounded-md space-y-1 ${
                isToday(date) && settings.todayHighlight ? "border-[var(--calendar-primary, var(--color-compassionate-celebration))]" : "border-transparent"
              } ${isCurrentPeriodDay ? "bg-[var(--color-background-secondary)]" : "bg-[var(--color-background-tertiary)]"} ${
                settings.weekendHighlight && (date.getDay() === 0 || date.getDay() === 6) ? "bg-opacity-90" : ""
              } ${settings.compactMode ? "min-h-[60px]" : ""}`}
              onClick={() => onDayClick(date)}
            >
              <div className="text-xs font-medium text-right">
                {isToday(date) ? (
                  <span className="text-[var(--color-compassionate-celebration)]">{date.getDate()}</span>
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
                      {dayData.events.slice(0, settings.maxEventsPerDay).map((event) => {
                        const cls = getEventColorClasses(event.color).badge;
                        return (
                          <div key={event.id} className={getEventTextSizeClass()}>
                            <div
                              className={`${getEventBadgeClass()} truncate ${cls}`}
                            >
                              {!event.isAllDay && settings.showEventTime && (
                                <span className="text-xs opacity-75">
                                  {formatTime(event.startTime)}{" "}
                                </span>
                              )}
                              {event.isAllDay ? "📅" : "🕐"}{" "}
                              {event.title.length > (settings.compactMode ? 8 : 12)
                                ? `${event.title.slice(0, settings.compactMode ? 8 : 12)}...`
                                : event.title}
                            </div>
                          </div>
                        );
                      })}
                      {layers.events && dayData.events.length > settings.maxEventsPerDay && (
                        <div className="text-xs text-gray-500">
                          +{dayData.events.length - settings.maxEventsPerDay} more
                        </div>
                      )}
                    </div>
                  )}
                  {layers.habits && dayData.totalRoutines > 0 && (
                    <div className="text-xs text-[var(--color-text-secondary)]">
                      <div className="flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />{" "}
                        {dayData.completedRoutines}/{dayData.totalRoutines}
                      </div>
                      <div className="w-full bg-[var(--color-background-tertiary)] rounded-full h-1 mt-1">
                        <div
                          className={`h-1 rounded-full ${getProgressColor(dayData.routineProgress * 100)}`}
                          style={{ width: `${dayData.routineProgress * 100}%` }}
                        />
                      </div>
                    </div>
                  )}
                  {layers.habits && dayData.totalHabits > 0 && (
                    <div className="text-xs text-[var(--color-text-secondary)]">
                      <div className="flex items-center gap-1">
                        <Target className="h-3 w-3" /> {dayData.completedHabits}
                        /{dayData.totalHabits}
                      </div>
                      <div className="w-full bg-[var(--color-background-tertiary)] rounded-full h-1 mt-1">
                        <div
                          className={`h-1 rounded-full ${getProgressColor(dayData.habitProgress * 100)}`}
                          style={{ width: `${dayData.habitProgress * 100}%` }}
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
                                ? "bg-[var(--color-semantic-success-bg)] text-[var(--color-semantic-success-text)] border-[var(--color-semantic-success-border)]"
                                : task.isHardDeadline
                                  ? "bg-[var(--color-semantic-error-bg)] text-[var(--color-semantic-error-text)] border-[var(--color-semantic-error-border)]"
                                  : getStatusColor("todo")
                            }`}
                          >
                            {task.title.length > 8
                              ? `${task.title.slice(0, 8)}...`
                              : task.title}
                          </Badge>
                        </div>
                      ))}
                      {layers.tasks && dayData.tasks.length > 1 && (
                        <div className="text-xs text-[var(--color-text-tertiary)]">
                          +{dayData.tasks.length - 1} more
                        </div>
                      )}
                    </div>
                  )}
                  {layers.journals && dayData.journals.length > 0 && (
                    <div className="flex items-center gap-1 text-xs text-[var(--color-text-secondary)]">
                      <NotebookPen className="h-3 w-3" />{" "}
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
  );
}
