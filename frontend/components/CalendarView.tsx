import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useCallback, useRef, useState } from "react";
import backend from "~backend/client";
import type { CalendarEvent } from "~backend/task/types";
import { type CalendarView, useCalendarData } from "../hooks/useCalendarData";
import { useCalendarLayers } from "../hooks/useCalendarLayers";
import { useCalendarPrefs } from "../hooks/useCalendarPrefs";
import { useToast } from "../hooks/useToast";
import { CalendarGrid } from "./CalendarGrid";
import { CalendarHeader } from "./CalendarHeader";
import { CreateEventDialog } from "./CreateEventDialog";
import { DayDetailDialog } from "./DayDetailDialog";
import { ErrorMessage } from "./ErrorMessage";
import { CalendarSkeleton } from "./SkeletonLoader";

export function CalendarView() {
  const { currentDate, setCurrentDate, calendarView, setCalendarView } =
    useCalendarPrefs();
  const { layers, toggleLayer } = useCalendarLayers();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isCreateEventDialogOpen, setIsCreateEventDialogOpen] = useState(false);
  const { showSuccess, showError } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
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
  } = useCalendarData(currentDate, calendarView);

  const navigateCalendar = useCallback(
    (direction: "prev" | "next") => {
      setCurrentDate((prev) => {
        const newDate = new Date(prev);
        switch (calendarView) {
          case "3days":
            newDate.setDate(
              newDate.getDate() + (direction === "next" ? 3 : -3),
            );
            break;
          case "week":
            newDate.setDate(
              newDate.getDate() + (direction === "next" ? 7 : -7),
            );
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
    },
    [calendarView],
  );

  const isToday = (d: Date) => d.toDateString() === new Date().toDateString();
  const isCurrentPeriod = (d: Date) =>
    calendarView === "month" ? d.getMonth() === currentDate.getMonth() : true;

  const handleEventCreated = (event: CalendarEvent) => {
    addCalendarEvent(event);
    setIsCreateEventDialogOpen(false);
    showSuccess("Event created successfully! 📅");
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const result = await backend.task.importCalendar({ ics: text });
      showSuccess(`Imported ${result.imported} events`);
      await loadData();
    } catch (err) {
      console.error(err);
      showError("Failed to import calendar");
    } finally {
      e.target.value = "";
    }
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

  if (loading) {
    return (
      <Card>
        <CalendarSkeleton />
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <ErrorMessage message={error} onRetry={loadData} />
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CalendarHeader
          viewTitle={getViewTitle()}
          calendarView={calendarView}
          onViewChange={setCalendarView}
          onPrev={() => navigateCalendar("prev")}
          onNext={() => navigateCalendar("next")}
          layers={layers}
          toggleLayer={toggleLayer}
          onAddEvent={() => setIsCreateEventDialogOpen(true)}
          onImport={handleImportClick}
        />
        <input
          ref={fileInputRef}
          type="file"
          accept=".ics"
          className="hidden"
          onChange={handleFileChange}
        />
        <CalendarGrid
          startDate={startDate}
          endDate={endDate}
          calendarView={calendarView}
          tasks={tasks}
          moodEntries={moodEntries}
          journalEntries={journalEntries}
          routineEntries={routineEntries}
          routineItems={routineItems}
          habitEntries={habitEntries}
          habits={habits}
          calendarEvents={calendarEvents}
          layers={layers}
          onDayClick={(date) => setSelectedDate(date)}
          isCurrentPeriod={isCurrentPeriod}
          isToday={isToday}
        />
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
