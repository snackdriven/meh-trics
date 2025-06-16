import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronDown, ChevronRight, Target } from "lucide-react";
import { memo, useMemo } from "react";
import { HabitCard } from "./HabitCard";

// Habit type based on backend types
interface Habit {
  id: number;
  name: string;
  targetCount: number;
  frequency: string;
}

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
              habitsWithData.map(({ habit, count, notes }) => (
                <HabitCard
                  key={habit.id}
                  habit={habit}
                  count={count}
                  notes={notes}
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
