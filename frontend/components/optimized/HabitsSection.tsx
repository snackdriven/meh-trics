import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ChevronDown, ChevronRight, Minus, Plus, Target } from "lucide-react";
import React, { memo, useCallback, useMemo } from "react";
import type { Habit } from "~backend/task/types";

// Memoized habit card to prevent unnecessary re-renders
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
    // Memoize handlers to prevent recreation on every render
    const handleDecrement = useCallback(() => {
      onCountChange(habit.id, Math.max(0, count - 1));
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

    // Memoize computed values
    const progressText = useMemo(() => {
      return `${count} / ${habit.targetCount}${isCompleted ? " ✓" : ""}`;
    }, [count, habit.targetCount, isCompleted]);

    const badgeVariant = useMemo(() => {
      return isCompleted ? "default" : "outline";
    }, [isCompleted]);

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

          <span className="text-sm text-gray-600" aria-live="polite">
            {progressText}
          </span>
        </div>

        <Textarea
          value={notes}
          onChange={handleNotesChange}
          onBlur={handleNotesBlur}
          rows={2}
          placeholder={`Notes for ${habit.name}...`}
          aria-label={`Notes for ${habit.name}`}
        />
      </div>
    );
  }
);

HabitCard.displayName = "HabitCard";

// Memoized habits section to prevent unnecessary re-renders
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
    // Memoize computed habit data to prevent recalculation
    const habitsWithData = useMemo(() => {
      return habits.map((habit) => ({
        habit,
        count: habitCounts[habit.id] || 0,
        notes: habitNotes[habit.id] || "",
        isCompleted: (habitCounts[habit.id] || 0) >= habit.targetCount,
      }));
    }, [habits, habitCounts, habitNotes]);

    // Memoize handlers to prevent recreation
    const memoizedHandlers = useMemo(
      () => ({
        onCountChange,
        onNotesChange,
        onNotesBlur,
      }),
      [onCountChange, onNotesChange, onNotesBlur]
    );

    const ChevronIcon = collapsed ? ChevronRight : ChevronDown;

    return (
      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Habits
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleCollapse}
            aria-expanded={!collapsed}
            aria-label={collapsed ? "Expand habits section" : "Collapse habits section"}
          >
            <ChevronIcon className="h-4 w-4" />
          </Button>
        </CardHeader>

        {!collapsed && (
          <CardContent className="space-y-4">
            {habitsWithData.map(({ habit, count, notes, isCompleted }) => (
              <HabitCard
                key={habit.id}
                habit={habit}
                count={count}
                notes={notes}
                isCompleted={isCompleted}
                {...memoizedHandlers}
              />
            ))}

            {habits.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No habits for today. Create some to get started!
              </div>
            )}
          </CardContent>
        )}
      </Card>
    );
  }
);

HabitsSection.displayName = "HabitsSection";
