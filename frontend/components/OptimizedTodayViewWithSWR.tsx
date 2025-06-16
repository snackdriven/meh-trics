/**
 * Optimized TodayView with SWR and Split Contexts
 * 
 * This version demonstrates Week 2 optimizations:
 * - SWR-style data fetching with background updates
 * - Split contexts to minimize re-renders
 * - Optimistic updates for better UX
 * - Memoized components and stable references
 */

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ChevronDown, ChevronRight, Minus, Plus, Target } from "lucide-react";
import React, { memo, useCallback, useMemo } from "react";
import { useTodayHabits, useTodayJournal, useTodayMood } from "../hooks/useSWR";
import { useTodayData, useTodayUI } from "../contexts/SplitTodayContexts";
import { useAutoTags } from "../hooks/useAutoTags";
import { getAppDate, getAppDateString } from "../lib/date";
import { JournalEntryForm } from "./JournalEntryForm";
import { MoodSnapshot } from "./MoodSnapshot";
import { TodayTasks } from "./TodayTasks";

// ============================================
// Optimized Habit Item with SWR
// ============================================

interface OptimizedHabitItemProps {
  habit: {
    id: number;
    name: string;
    targetCount: number;
    frequency: string;
  };
  count: number;
  notes: string;
  onCountChange: (habitId: number, newCount: number) => void;
  onNotesChange: (habitId: number, notes: string) => void;
  onNotesBlur: (habitId: number, count: number, notes: string) => void;
}

const OptimizedHabitItem = memo<OptimizedHabitItemProps>(
  ({ habit, count, notes, onCountChange, onNotesChange, onNotesBlur }) => {
    // Memoize computed values to prevent recalculation
    const isCompleted = useMemo(() => count >= habit.targetCount, [count, habit.targetCount]);
    const badgeVariant = useMemo(() => isCompleted ? "default" : "outline", [isCompleted]);

    // Stable callback references to prevent child re-renders
    const handleDecrement = useCallback(() => {
      if (count > 0) {
        onCountChange(habit.id, count - 1);
      }
    }, [habit.id, count, onCountChange]);

    const handleIncrement = useCallback(() => {
      onCountChange(habit.id, count + 1);
    }, [habit.id, count, onCountChange]);

    const handleInputChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const newCount = parseInt(e.target.value) || 0;
        onCountChange(habit.id, newCount);
      },
      [habit.id, onCountChange]
    );

    const handleNotesChange = useCallback(
      (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        onNotesChange(habit.id, e.target.value);
      },
      [habit.id, onNotesChange]
    );

    const handleNotesBlur = useCallback(() => {
      onNotesBlur(habit.id, count, notes);
    }, [habit.id, count, notes, onNotesBlur]);

    return (
      <div className="p-4 border rounded-lg space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-medium">{habit.name}</h4>
          <Badge variant={badgeVariant}>{habit.frequency}</Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleDecrement} disabled={count <= 0}>
            <Minus className="h-4 w-4" />
          </Button>
          <Input
            type="number"
            min="0"
            value={count}
            onChange={handleInputChange}
            className="w-20 text-center"
          />
          <Button variant="outline" size="sm" onClick={handleIncrement}>
            <Plus className="h-4 w-4" />
          </Button>
          <span className="text-sm text-gray-600">
            / {habit.targetCount}
            {isCompleted && "✓"}
          </span>
        </div>
        <Textarea value={notes} onChange={handleNotesChange} onBlur={handleNotesBlur} rows={2} />
      </div>
    );
  }
);

OptimizedHabitItem.displayName = "OptimizedHabitItem";

// ============================================
// Habits Section Component (Split from main view for better performance)
// ============================================

const HabitsSection = memo(() => {
  const { data: habits, isLoading, mutate } = useTodayHabits();
  const { ui, toggleCollapse } = useTodayUI();
  const { updateHabitCount, updateHabitNotes } = useTodayData();

  // Local state for habit counts and notes with optimistic updates
  const [localCounts, setLocalCounts] = React.useState<Record<number, number>>({});
  const [localNotes, setLocalNotes] = React.useState<Record<number, string>>({});

  // Memoize stable handlers to prevent child re-renders
  const handleCountChange = useCallback(
    async (habitId: number, newCount: number) => {
      // Optimistic update
      setLocalCounts(prev => ({ ...prev, [habitId]: newCount }));
      
      try {
        await updateHabitCount(habitId, newCount);
        // Update SWR cache optimistically
        mutate();
      } catch (error) {
        // Revert optimistic update on error
        setLocalCounts(prev => {
          const updated = { ...prev };
          delete updated[habitId];
          return updated;
        });
        console.error("Failed to update habit count:", error);
      }
    },
    [updateHabitCount, mutate]
  );

  const handleNotesChange = useCallback(
    (habitId: number, notes: string) => {
      setLocalNotes(prev => ({ ...prev, [habitId]: notes }));
    },
    []
  );
  const handleNotesBlur = useCallback(
    async (habitId: number, _count: number, notes: string) => {
      try {
        await updateHabitNotes(habitId, notes);
        mutate();
      } catch (error) {
        console.error("Failed to update habit notes:", error);
      }
    },
    [updateHabitNotes, mutate]
  );

  // Memoize the handlers object to prevent recreation
  const stableHandlers = useMemo(
    () => ({
      onCountChange: handleCountChange,
      onNotesChange: handleNotesChange,
      onNotesBlur: handleNotesBlur,
    }),
    [handleCountChange, handleNotesChange, handleNotesBlur]
  );

  const isHabitsCollapsed = ui.collapsed["habits"] || false;

  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardContent className="h-40 bg-gray-100 rounded" />
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Target className="h-4 w-4" /> Habits
        </CardTitle>
        <Button variant="ghost" size="icon" onClick={() => toggleCollapse("habits")}>
          {isHabitsCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
      </CardHeader>
      {!isHabitsCollapsed && (
        <CardContent className="space-y-4">
          {habits?.map((habit) => {
            const count = localCounts[habit.id] ?? habit.currentCount ?? 0;
            const notes = localNotes[habit.id] ?? habit.notes ?? "";

            return (
              <OptimizedHabitItem
                key={habit.id}
                habit={habit}
                count={count}
                notes={notes}
                {...stableHandlers}
              />
            );
          })}
        </CardContent>
      )}
    </Card>
  );
});

HabitsSection.displayName = "HabitsSection";

// ============================================
// Mood Section Component
// ============================================

const MoodSection = memo(() => {
  const { mutate } = useTodayMood();
  const { updateMood } = useTodayData();

  const handleEntryChange = useCallback(
    async (entry: any) => {
      try {
        // Optimistic update
        mutate(entry, false);
        await updateMood(entry.mood, entry.notes);
        mutate();
      } catch (error) {
        console.error("Failed to update mood:", error);
        mutate(); // Revert to server state
      }
    },
    [updateMood, mutate]
  );

  return <MoodSnapshot onEntryChange={handleEntryChange} />;
});

MoodSection.displayName = "MoodSection";

// ============================================
// Journal Section Component
// ============================================

const JournalSection = memo(() => {
  const date = getAppDate();
  const { data: moodEntry } = useTodayMood();
  const { mutate } = useTodayJournal();
  const { updateJournal } = useTodayData();
  const { tags: autoTags } = useAutoTags();

  const handleEntryCreated = useCallback(
    async (entry: any) => {
      try {
        // Optimistic update
        mutate(entry, false);
        await updateJournal(entry.content);
        mutate();
      } catch (error) {
        console.error("Failed to update journal:", error);
        mutate(); // Revert to server state
      }
    },
    [updateJournal, mutate]
  );

  return (
    <JournalEntryForm
      date={date}
      moodId={moodEntry?.id}
      autoTags={autoTags}
      onEntryCreated={handleEntryCreated}
    />
  );
});

JournalSection.displayName = "JournalSection";

// ============================================
// Main Optimized TodayView Component
// ============================================

export const OptimizedTodayViewWithSWR = memo(() => {
  const dateStr = getAppDateString();

  // Split components prevent unnecessary re-renders
  return (
    <div className="space-y-6">
      <MoodSection />
      <JournalSection />
      <HabitsSection />
      <TodayTasks date={dateStr} />
    </div>
  );
});

OptimizedTodayViewWithSWR.displayName = "OptimizedTodayViewWithSWR";
