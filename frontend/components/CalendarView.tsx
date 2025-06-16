import { Card } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { memo, useCallback, useMemo, useRef, useState } from "react";
import type { CalendarEvent } from "~backend/task/types";
import { useCalendarCustomization } from "../hooks/useCalendarCustomization";
import { useCalendarData } from "../hooks/useCalendarData";
import { useCalendarLayers } from "../hooks/useCalendarLayers";
import { useCalendarPrefs } from "../hooks/useCalendarPrefs";
import { useToast } from "../hooks/useToast";
import { CalendarCustomizationDialog } from "./CalendarCustomizationDialog";
import { CalendarGrid } from "./CalendarGrid";
import { CalendarHeader } from "./CalendarHeader";
import { DayView } from "./DayView";
import { ErrorMessage } from "./ErrorMessage";
import { CreateEventDialog } from "./EventCRUDDialogs";
import { CalendarSkeleton } from "./SkeletonLoader";

const CalendarViewComponent = () => {
  const { currentDate, setCurrentDate, calendarView, setCalendarView } = useCalendarPrefs();
  const { layers, toggleLayer } = useCalendarLayers();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isCreateEventDialogOpen, setIsCreateEventDialogOpen] = useState(false);
  const [isCustomizationOpen, setIsCustomizationOpen] = useState(false);
  const { showSuccess, showError } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { saveSettings, getColorSchemeStyles } = useCalendarCustomization();

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
          case "day":
            newDate.setDate(newDate.getDate() + (direction === "next" ? 1 : -1));
            break;
          case "3days":
            newDate.setDate(newDate.getDate() + (direction === "next" ? 3 : -3));
            break;
          case "week":
            newDate.setDate(newDate.getDate() + (direction === "next" ? 7 : -7));
            break;
          case "2weeks":
            newDate.setDate(newDate.getDate() + (direction === "next" ? 14 : -14));
            break;
          default:
            newDate.setMonth(newDate.getMonth() + (direction === "next" ? 1 : -1));
            break;
        }
        return newDate;
      });
    },
    [calendarView, setCurrentDate]
  );

  const goToToday = useCallback(() => {
    setCurrentDate(new Date());
  }, [setCurrentDate]);

  // Memoized date helper functions
  const isToday = useCallback((d: Date) => d.toDateString() === new Date().toDateString(), []);
  const isCurrentPeriod = useCallback(
    (d: Date) => (calendarView === "month" ? d.getMonth() === currentDate.getMonth() : true),
    [calendarView, currentDate]
  );

  const handleEventCreated = useCallback(
    (event: CalendarEvent) => {
      addCalendarEvent(event);
      setIsCreateEventDialogOpen(false);
      showSuccess("Event created successfully! 📅");
    },
    [addCalendarEvent, showSuccess]
  );

  const handleImportClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      try {
        await file.text();
        // TODO: Fix this - calendar import endpoint needs to be verified
        // const result = await backend.calendar.importCalendar({ ics: text });
        showError("Calendar import functionality needs to be updated", "Import Error");
      } catch (_err) {
        showError("Failed to import calendar. Please check the file format.", "Import Error");
      } finally {
        e.target.value = "";
      }
    },
    [loadData, showSuccess, showError]
  );

  const handleNavigatePrev = useCallback(() => navigateCalendar("prev"), [navigateCalendar]);
  const handleNavigateNext = useCallback(() => navigateCalendar("next"), [navigateCalendar]);

  const handleOpenCreateEvent = useCallback(() => setIsCreateEventDialogOpen(true), []);
  const handleCloseCreateEvent = useCallback(
    (open: boolean) => setIsCreateEventDialogOpen(open),
    []
  );

  const handleOpenCustomization = useCallback(() => setIsCustomizationOpen(true), []);
  const handleCloseCustomization = useCallback((open: boolean) => setIsCustomizationOpen(open), []);

  const handleDayClick = useCallback((date: Date) => setSelectedDate(date), []);
  const handleCloseSelectedDate = useCallback(
    (open: boolean) => !open && setSelectedDate(null),
    []
  );
  const handleCloseDayView = useCallback(() => setSelectedDate(null), []);

  // Memoized view title computation
  const viewTitle = useMemo(() => {
    switch (calendarView) {
      case "day":
        return currentDate.toLocaleDateString("en-US", {
          weekday: "long",
          month: "long",
          day: "numeric",
          year: "numeric",
        });
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
  }, [calendarView, currentDate, startDate, endDate]);

  // Memoized color scheme styles to prevent recreation
  const colorSchemeStyles = useMemo(() => getColorSchemeStyles(), [getColorSchemeStyles]);

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
    <div className="space-y-6" style={colorSchemeStyles as React.CSSProperties}>
      <Card>
        <CalendarHeader
          viewTitle={viewTitle}
          calendarView={calendarView}
          onViewChange={setCalendarView}
          onPrev={handleNavigatePrev}
          onNext={handleNavigateNext}
          onToday={goToToday}
          layers={layers}
          toggleLayer={toggleLayer}
          onAddEvent={handleOpenCreateEvent}
          onImport={handleImportClick}
          onCustomize={handleOpenCustomization}
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
          onDayClick={handleDayClick}
          isCurrentPeriod={isCurrentPeriod}
          isToday={isToday}
        />
      </Card>

      {selectedDate && (
        <Dialog open={!!selectedDate} onOpenChange={handleCloseSelectedDate}>
          <DialogContent className="max-w-[95vw] max-h-[95vh] overflow-hidden p-0">
            <DayView
              date={selectedDate}
              onDateChange={setSelectedDate}
              onClose={handleCloseDayView}
            />
          </DialogContent>
        </Dialog>
      )}

      <CreateEventDialog
        open={isCreateEventDialogOpen}
        onOpenChange={handleCloseCreateEvent}
        onEventCreated={handleEventCreated}
      />

      <CalendarCustomizationDialog
        open={isCustomizationOpen}
        onOpenChange={handleCloseCustomization}
        onSave={saveSettings}
      />
    </div>
  );
};

export const CalendarView = memo(CalendarViewComponent);
CalendarView.displayName = "CalendarView";
