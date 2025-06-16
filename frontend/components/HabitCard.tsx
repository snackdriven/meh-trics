import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Minus, Plus } from "lucide-react";
import type React from "react";
import { memo, useCallback, useMemo } from "react";

// Habit type based on backend types
interface Habit {
  id: number;
  name: string;
  targetCount: number;
  frequency: string;
}

interface HabitCardProps {
  habit: Habit;
  count: number;
  notes: string;
  onCountChange: (habitId: number, newCount: number) => void;
  onNotesChange: (habitId: number, notes: string) => void;
  onNotesBlur: (habitId: number, count: number, notes: string) => void;
}

/**
 * Optimized Habit Card Component
 *
 * Performance optimizations:
 * - Memoized with React.memo to prevent unnecessary re-renders
 * - Stable callback references with useCallback
 * - Memoized computed values with useMemo
 * - Enhanced accessibility with ARIA labels
 * - Dark mode support
 */
export const HabitCard = memo<HabitCardProps>(
  ({ habit, count, notes, onCountChange, onNotesChange, onNotesBlur }) => {
    // Memoize computed values to prevent recalculation
    const isCompleted = useMemo(() => count >= habit.targetCount, [count, habit.targetCount]);

    const progressText = useMemo(() => {
      return `${count} / ${habit.targetCount}${isCompleted ? " ✓" : ""}`;
    }, [count, habit.targetCount, isCompleted]);

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
        const newCount = Math.max(0, Number.parseInt(e.target.value) || 0);
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
      <div className="p-4 border rounded-lg space-y-3 bg-white dark:bg-gray-800">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-gray-900 dark:text-gray-100">{habit.name}</h4>
          <Badge variant={badgeVariant}>{habit.frequency}</Badge>
        </div>

        {/* Counter Controls */}
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

          <span className="text-sm text-gray-600 dark:text-gray-400 min-w-fit" aria-live="polite">
            {progressText}
          </span>
        </div>

        {/* Notes */}
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
