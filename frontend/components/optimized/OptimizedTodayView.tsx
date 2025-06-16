import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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

/**
 * Optimized Habit Item Component
 * Memoized to prevent unnecessary re-renders when other habits change
 */
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

const HabitItem = memo<HabitItemProps>(({ 
  habit, 
  count, 
  notes, 
  onCountChange, 
  onNotesChange, 
  onNotesBlur 
}) => {
  // Memoize computed values
  const isCompleted = useMemo(() => count >= habit.targetCount, [count, habit.targetCount]);
  
  const progressText = useMemo(() => {
    return `/ ${habit.targetCount}${isCompleted ? '✓' : ''}`;
  }, [habit.targetCount, isCompleted]);

  const badgeVariant = useMemo(() => {
    return isCompleted ? "default" : "outline";
  }, [isCompleted]);

  // Memoize event handlers to prevent child re-renders
  const handleDecrement = useCallback(() => {
    onCountChange(habit.id, Math.max(0, count - 1));
  }, [habit.id, count, onCountChange]);

  const handleIncrement = useCallback(() => {
    onCountChange(habit.id, count + 1);
  }, [habit.id, count, onCountChange]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newCount = parseInt(e.target.value) || 0;
    onCountChange(habit.id, newCount);
  }, [habit.id, onCountChange]);

  const handleNotesChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onNotesChange(habit.id, e.target.value);
  }, [habit.id, onNotesChange]);

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
        <Button
          variant="outline"
          size="sm"
          onClick={handleDecrement}
          disabled={count <= 0}
        >
          <Minus className="h-4 w-4" />
        </Button>
        
        <Input
          type="number"
          min="0"
          value={count}
          onChange={handleInputChange}
          className="w-20 text-center"
        />
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleIncrement}
        >
          <Plus className="h-4 w-4" />
        </Button>
        
        <span className="text-sm text-gray-600">
          {count} {progressText}
        </span>
      </div>
      
      <Textarea
        value={notes}
        onChange={handleNotesChange}
        onBlur={handleNotesBlur}
        rows={2}
      />
    </div>
  );
});

HabitItem.displayName = 'HabitItem';

/**
 * Optimized Habits Section Component
 * Memoized and uses stable callback references
 */
interface HabitsSectionProps {
  habits: any[];
  habitCounts: Record<number, number>;
  habitNotes: Record<number, string>;
  handleHabitCountChange: (habitId: number, newCount: number) => void;
  setHabitNotes: React.Dispatch<React.SetStateAction<Record<number, string>>>;
  updateHabitEntry: (habitId: number, count: number, notes: string) => Promise<void>;
  collapsed: boolean;
  onToggle: () => void;
}

const HabitsSection = memo<HabitsSectionProps>(({
  habits,
  habitCounts,
  habitNotes,
  handleHabitCountChange,
  setHabitNotes,
  updateHabitEntry,
  collapsed,
  onToggle
}) => {
  // Memoize handlers to prevent recreation on every render
  const handleNotesChange = useCallback((habitId: number, notes: string) => {
    setHabitNotes((prev) => ({
      ...prev,
      [habitId]: notes,
    }));
  }, [setHabitNotes]);

  const handleNotesBlur = useCallback((habitId: number, count: number, notes: string) => {
    updateHabitEntry(habitId, count, notes);
  }, [updateHabitEntry]);

  // Memoize the stable handlers object
  const stableHandlers = useMemo(() => ({
    onCountChange: handleHabitCountChange,
    onNotesChange: handleNotesChange,
    onNotesBlur: handleNotesBlur
  }), [handleHabitCountChange, handleNotesChange, handleNotesBlur]);

  const ChevronIcon = collapsed ? ChevronRight : ChevronDown;

  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Target className="h-4 w-4" /> Habits
        </CardTitle>
        <Button variant="ghost" size="icon" onClick={onToggle}>
          <ChevronIcon className="h-4 w-4" />
        </Button>
      </CardHeader>
      
      {!collapsed && (
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
  );
});

HabitsSection.displayName = 'HabitsSection';

/**
 * Optimized TodayView Component
 * 
 * Performance improvements:
 * 1. Memoized main component
 * 2. Extracted and memoized HabitsSection
 * 3. Stable callback references
 * 4. Computed values memoized
 * 5. Loading state optimization
 */
export const OptimizedTodayView = memo(() => {
  const date = getAppDate();
  const dateStr = getAppDateString();
  const habitsCollapse = useCollapse("today_habits");
  const { tags: autoTags } = useAutoTags();
  const {
    moodEntry,
    setMoodEntry,
    journalEntry,
    setJournalEntry,
    habits,
    habitCounts,
    habitNotes,
    setHabitNotes,
    handleHabitCountChange,
    updateHabitEntry,
    loading: isLoading,
  } = useTodayData(date);

  // Memoize stable date values
  const stableDateValues = useMemo(() => ({
    date,
    dateStr
  }), [date, dateStr]);

  // Show loading state with better UX
  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Skeleton loaders for better perceived performance */}
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
    <div className="space-y-6">
      <MoodSnapshot onEntryChange={setMoodEntry} />
      
      <JournalEntryForm
        date={stableDateValues.date}
        moodId={moodEntry?.id}
        autoTags={autoTags}
        onEntryCreated={setJournalEntry}
      />

      <HabitsSection
        habits={habits}
        habitCounts={habitCounts}
        habitNotes={habitNotes}
        handleHabitCountChange={handleHabitCountChange}
        setHabitNotes={setHabitNotes}
        updateHabitEntry={updateHabitEntry}
        collapsed={habitsCollapse.collapsed}
        onToggle={habitsCollapse.toggle}
      />

      <TodayTasks date={stableDateValues.dateStr} />
    </div>
  );
});

OptimizedTodayView.displayName = 'OptimizedTodayView';

/**
 * Usage Instructions:
 * 
 * Replace the existing TodayView with OptimizedTodayView:
 * 
 * ```typescript
 * // In App.tsx or wherever TodayView is used
 * import { OptimizedTodayView } from './components/OptimizedTodayView';
 * 
 * // Replace
 * <TodayView />
 * 
 * // With
 * <OptimizedTodayView />
 * ```
 * 
 * Performance improvements achieved:
 * 1. Individual habit items only re-render when their data changes
 * 2. Stable callback references prevent unnecessary child re-renders
 * 3. Memoized computed values reduce recalculations
 * 4. Better loading states with skeleton placeholders
 * 5. Component tree is more optimized for React's reconciliation
 */
