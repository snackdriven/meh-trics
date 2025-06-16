import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ChevronDown, ChevronRight, Minus, Plus, Target } from "lucide-react";
import React, { memo, useCallback, useMemo } from "react";
import type { Habit } from "~backend/habits/types";

// --- Helper Components ---

/**
 * @component HabitCard
 * @description Renders a single habit card with controls for tracking progress.
 * This component is memoized to prevent re-rendering unless its props change.
 * This is a performance optimization that is important in lists of items.
 *
 * @param {object} props - The component props.
 * @param {Habit} props.habit - The habit data object.
 * @param {number} props.count - The current progress count for the habit.
 * @param {string} props.notes - Any notes associated with the habit entry.
 * @param {boolean} props.isCompleted - Whether the habit's target has been met.
 * @param {function} props.onCountChange - Callback when the count is changed.
 * @param {function} props.onNotesChange - Callback when the notes are changed.
 * @param {function} props.onNotesBlur - Callback when the notes textarea loses focus.
 */
interface HabitCardProps {
  habit: Habit;
  count: number;
  notes: string;
  isCompleted: boolean;
  onCountChange: (habitId: number, newCount: number) => void;
  onNotesChange: (habitId: number, notes: string) => void;
  onNotesBlur: (habitId: number, count: number, notes: string) => void;
}

const HabitCard = memo<HabitCardProps>(
  ({ habit, count, notes, isCompleted, onCountChange, onNotesChange, onNotesBlur }) => {
    /**
     * `useCallback` is a React Hook that lets you cache a function definition between re-renders.
     * Here, we use it to prevent the handler functions from being recreated on every render of HabitCard,
     * which would cause unnecessary re-renders of the child Button and Input components.
     */
    const handleDecrement = useCallback(() => {
      onCountChange(habit.id, Math.max(0, count - 1));
    }, [habit.id, count, onCountChange]);

    const handleIncrement = useCallback(() => {
      onCountChange(habit.id, count + 1);
    }, [habit.id, count, onCountChange]);

    const handleInputChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        // Ensure value is a number, default to 0 if input is invalid.
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
      // This could be used to auto-save the notes when the user clicks away.
      onNotesBlur(habit.id, count, notes);
    }, [habit.id, count, notes, onNotesBlur]);

    /**
     * `useMemo` is a React Hook that lets you cache the result of a calculation between re-renders.
     * We use it here to avoid re-calculating the progress text and badge variant unless their dependencies change.
     * This is a small optimization, but good practice.
     */
    const progressText = useMemo(() => {
      return `${count} / ${habit.targetCount}${isCompleted ? " ✓" : ""}`;
    }, [count, habit.targetCount, isCompleted]);

    const badgeVariant = useMemo(() => {
      return isCompleted ? "default" : "outline";
    }, [isCompleted]);

    return (
      <div className="p-4 border rounded-lg space-y-3 bg-white dark:bg-gray-800">
        {/* Card Header */}
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-gray-900 dark:text-gray-100">{habit.name}</h4>
          <Badge variant={badgeVariant}>{habit.frequency}</Badge>
        </div>

        {/* Progress Tracker */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDecrement}
            disabled={count <= 0}
            aria-label={`Decrease ${habit.name} count`}
          >
            <Minus className="h-4 w-4" />
          </Button>

          <Input
            type="number"
            min="0"
            value={count}
            onChange={handleInputChange}
            className="w-20 text-center"
            aria-label={`${habit.name} count`}
          />

          <Button
            variant="outline"
            size="sm"
            onClick={handleIncrement}
            aria-label={`Increase ${habit.name} count`}
          >
            <Plus className="h-4 w-4" />
          </Button>

          <span className="text-sm text-gray-600 dark:text-gray-400" aria-live="polite">
            {progressText}
          </span>
        </div>

        {/* Notes Area */}
        <Textarea
          value={notes}
          onChange={handleNotesChange}
          onBlur={handleNotesBlur}
          rows={2}
          placeholder={`Notes for ${habit.name}...`}
          aria-label={`Notes for ${habit.name}`}
          className="mt-2"
        />
      </div>
    );
  }
);

HabitCard.displayName = "HabitCard";

// --- Main Component ---

/**
 * @interface HabitsSectionProps
 * @description Defines the props for the HabitsSection component.
 *
 * @property {Habit[]} habits - The list of habits to display.
 * @property {Record<number, number>} habitCounts - A map of habit IDs to their current counts.
 * @property {Record<number, string>} habitNotes - A map of habit IDs to their current notes.
 * @property {boolean} collapsed - Whether the section is collapsed.
 * @property {function} onToggleCollapse - Callback to toggle the collapsed state.
 * @property {function} onCountChange - Callback for when a habit's count changes.
 * @property {function} onNotesChange - Callback for when a habit's notes change.
 * @property {function} onNotesBlur - Callback for when a habit's notes textarea loses focus.
 */
interface HabitsSectionProps {
  habits: Habit[];
  habitCounts: Record<number, number>;
  habitNotes: Record<number, string>;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onCountChange: (habitId: number, newCount: number) => void;
  onNotesChange: (habitId: number, notes: string) => void;
  onNotesBlur: (habitId: number, count: number, notes: string) => void;
}

/**
 * @component HabitsSection
 * @description A major UI component that displays a list of habits.
 * It's optimized with `memo` to prevent re-rendering if its props don't change.
 *
 * @param {HabitsSectionProps} props - The props for the component.
 */
export const HabitsSection = memo<HabitsSectionProps>(
  ({
    habits,
    habitCounts,
    habitNotes,
    collapsed,
    onToggleCollapse,
    onCountChange,
    onNotesChange,
    onNotesBlur,
  }) => {
    /**
     * `useMemo` is used here to process the habits data.
     * It creates a new array `habitsWithData` that combines the raw `habits` with their
     * dynamic state (count, notes, completion status) from the `habitCounts` and `habitNotes` props.
     * This calculation is memoized, so it only runs when the underlying data changes,
     * preventing expensive recalculations on every render.
     */
    const habitsWithData = useMemo(() => {
      return habits.map((habit) => ({
        habit,
        count: habitCounts[habit.id] || 0,
        notes: habitNotes[habit.id] || "",
        isCompleted: (habitCounts[habit.id] || 0) >= habit.targetCount,
      }));
    }, [habits, habitCounts, habitNotes]);

    /**
     * This is another `useMemo` hook, but it's used to memoize an object of callback functions.
     * This ensures that the object passed to `HabitCard` is stable, preventing `HabitCard` from
     * re-rendering just because its parent created a new props object.
     * This is a common pattern for optimizing components that pass down multiple handlers.
     */
    const memoizedHandlers = useMemo(
      () => ({
        onCountChange,
        onNotesChange,
        onNotesBlur,
      }),
      [onCountChange, onNotesChange, onNotesBlur]
    );

    // Dynamically choose the icon based on the collapsed state.
    const ChevronIcon = collapsed ? ChevronRight : ChevronDown;

    return (
      <Card>
        <CardHeader
          className="flex flex-row items-center justify-between cursor-pointer"
          onClick={onToggleCollapse}
          role="button"
          aria-expanded={!collapsed}
          aria-controls="habits-content"
        >
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            <span>Habits</span>
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            aria-label={collapsed ? "Expand habits section" : "Collapse habits section"}
          >
            <ChevronIcon className="h-5 w-5" />
          </Button>
        </CardHeader>

        {/* Content is only rendered if the section is not collapsed */}
        {!collapsed && (
          <CardContent id="habits-content" className="space-y-4 pt-4">
            {habitsWithData.length > 0 ? (
              habitsWithData.map(({ habit, count, notes, isCompleted }) => (
                <HabitCard
                  key={habit.id}
                  habit={habit}
                  count={count}
                  notes={notes}
                  isCompleted={isCompleted}
                  {...memoizedHandlers}
                />
              ))
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <p>No habits for today.</p>
                <p className="text-sm">Create some from the 'Manage Habits' page to get started!</p>
              </div>
            )}
          </CardContent>
        )}
      </Card>
    );
  }
);

HabitsSection.displayName = "HabitsSection";
