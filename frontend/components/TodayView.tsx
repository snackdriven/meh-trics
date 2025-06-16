import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { ChevronDown, ChevronRight, Minus, Plus, Target } from "lucide-react";
import React, { memo, useCallback, useMemo } from "react";
import { useAutoTags } from "../hooks/useAutoTags";
import { useCollapse } from "../hooks/useCollapse";
import { useTodayData } from "../hooks/useTodayData";
import { getAppDate, getAppDateString } from "../lib/date";
import { JournalEntryForm } from "./JournalEntryForm";
import { MoodSnapshot } from "./MoodSnapshot";
import { TodayTasks } from "./TodayTasks";

// Memoized Habit Item Component to prevent unnecessary re-renders
interface HabitItemProps {
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

const HabitItem = memo<HabitItemProps>(
  ({ habit, count, notes, onCountChange, onNotesChange, onNotesBlur }) => {
    // Memoize computed values to prevent recalculation
    const isCompleted = useMemo(() => count >= habit.targetCount, [count, habit.targetCount]);

    const badgeVariant = useMemo(() => {
      return isCompleted ? "default" : "outline";
    }, [isCompleted]);

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

HabitItem.displayName = "HabitItem";

export const TodayView = memo(() => {
  const date = getAppDate();
  const dateStr = getAppDateString();
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
  } = useTodayData(date);

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

  // Memoize the handlers object to prevent recreation
  const stableHandlers = useMemo(
    () => ({
      onCountChange: handleHabitCountChange,
      onNotesChange: handleNotesChange,
      onNotesBlur: handleNotesBlur,
    }),
    [handleHabitCountChange, handleNotesChange, handleNotesBlur]
  );

  // Better loading state with skeleton
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card className="animate-pulse">
          <CardContent className="h-32 bg-gray-100 rounded" />
        </Card>
        <Card className="animate-pulse">
          <CardContent className="h-24 bg-gray-100 rounded" />
        </Card>
        <Card className="animate-pulse">
          <CardContent className="h-40 bg-gray-100 rounded" />
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <MoodSnapshot onEntryChange={setMoodEntry} />
      <Separator className="my-4" />
      <JournalEntryForm
        date={date}
        moodId={moodEntry?.id}
        autoTags={autoTags}
        onEntryCreated={() => {}} // Simplified since journalEntry was unused
      />
      <Separator className="my-4" />
      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Target className="h-4 w-4" /> Habits
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={habitsCollapse.toggle}>
            {habitsCollapse.collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </CardHeader>
        {!habitsCollapse.collapsed && (
          <CardContent className="space-y-4">
            {habits.map((habit) => {
              const count = habitCounts[habit.id] || 0;
              const notes = habitNotes[habit.id] || "";

              return (
                <HabitItem
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
      <Separator className="my-4" />
      <TodayTasks date={dateStr} />
    </div>
  );
});

TodayView.displayName = "TodayView";
