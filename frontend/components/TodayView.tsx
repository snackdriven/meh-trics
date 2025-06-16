import { Separator } from "@/components/ui/separator";
import { memo, useCallback, useMemo } from "react";
import { useAutoTags } from "../hooks/useAutoTags";
import { useCollapse } from "../hooks/useCollapse";
import { useTodayData } from "../hooks/useTodayData";
import { getAppDate, getAppDateString } from "../lib/date";
import { HabitsSection } from "./HabitsSection";
import { JournalEntryForm } from "./JournalEntryForm";
import { MoodSnapshot } from "./MoodSnapshot";
import { TodayTasks } from "./TodayTasks";

/**
 * Optimized TodayView Component
 *
 * Performance optimizations:
 * - Memoized date values to prevent unnecessary recalculations
 * - Stable callback references to prevent child re-renders
 * - Better loading states with skeleton placeholders
 * - Memoized handlers object for props stability
 */
export const TodayView = memo(() => {
  // Memoize date calculations to prevent recalculation on every render
  const stableDateValues = useMemo(
    () => ({
      date: getAppDate(),
      dateStr: getAppDateString(),
    }),
    []
  );

  const habitsCollapse = useCollapse("today_habits");
  const { tags: autoTags } = useAutoTags();
  const {
    moodEntry,
    setMoodEntry,
    habits,
    habitCounts,
    habitNotes,
    setHabitNotes,
    handleHabitCountChange,
    updateHabitEntry,
    loading: isLoading,
  } = useTodayData(stableDateValues.date);

  // Memoize stable handlers to prevent child re-renders
  const handleNotesChange = useCallback(
    (habitId: number, notes: string) => {
      setHabitNotes((prev) => ({
        ...prev,
        [habitId]: notes,
      }));
    },
    [setHabitNotes]
  );

  const handleNotesBlur = useCallback(
    (habitId: number, count: number, notes: string) => {
      updateHabitEntry(habitId, count, notes);
    },
    [updateHabitEntry]
  );

  // Better loading state with skeleton placeholders
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-32 bg-gray-100 dark:bg-gray-800 rounded" />
        </div>
        <div className="animate-pulse">
          <div className="h-24 bg-gray-100 dark:bg-gray-800 rounded" />
        </div>
        <div className="animate-pulse">
          <div className="h-40 bg-gray-100 dark:bg-gray-800 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <MoodSnapshot onEntryChange={setMoodEntry} />
      <Separator className="my-4" />
      <JournalEntryForm
        date={stableDateValues.date}
        moodId={moodEntry?.id}
        autoTags={autoTags}
        onEntryCreated={() => {}} // Simplified since journalEntry was unused
      />
      <Separator className="my-4" />
      <HabitsSection
        habits={habits}
        habitCounts={habitCounts}
        habitNotes={habitNotes}
        collapsed={habitsCollapse.collapsed}
        onToggleCollapse={habitsCollapse.toggle}
        onCountChange={handleHabitCountChange}
        onNotesChange={handleNotesChange}
        onNotesBlur={handleNotesBlur}
      />
      <Separator className="my-4" />
      <TodayTasks date={stableDateValues.dateStr} />
    </div>
  );
});

TodayView.displayName = "TodayView";

TodayView.displayName = "TodayView";
