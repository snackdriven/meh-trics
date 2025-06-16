import { Separator } from "@/components/ui/separator";
import { memo, useMemo } from "react";
import { useAutoTags } from "@/hooks/useAutoTags";
import { useCollapse } from "@/hooks/useCollapse";
import { useTodayData } from "@/hooks/useTodayData";
import { getAppDate, getAppDateString } from "@/lib/date";
import { UnifiedTodaySection } from "@/components/UnifiedTodaySection";
import { JournalEntryForm } from "@/components/JournalEntryForm";
import { MoodSnapshot } from "@/components/MoodSnapshot";
import { TodayTasks } from "@/components/TodayTasks";

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
    loading: isLoading,
  } = useTodayData(stableDateValues.date);

  // Memoize stable handlers to prevent child re-renders
  // Note: Habit handling is now done by UnifiedTodaySection

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
      <UnifiedTodaySection
        collapsed={habitsCollapse.collapsed}
        onToggleCollapse={habitsCollapse.toggle}
      />
      <Separator className="my-4" />
      <TodayTasks date={stableDateValues.dateStr} />
    </div>
  );
});

TodayView.displayName = "TodayView";

TodayView.displayName = "TodayView";
