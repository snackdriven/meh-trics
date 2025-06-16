import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Edit, Flame, Minus, Plus, Target, Trash2, TrendingUp } from "lucide-react";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import backend from "~backend/client";
import type { Habit, HabitEntry, HabitStats } from "~backend/habits/types";
import { useAsyncOperation } from "../hooks/useAsyncOperation";
import { useToast } from "../hooks/useToast";
import { getFrequencyColor, getStreakColor } from "../lib/colors";
import { getAppDate, getAppDateString } from "../lib/date";
import { ConfirmDialog } from "./ConfirmDialog";
import { EditHabitDialog } from "./HabitCRUDDialogs";
import { HabitListSkeleton } from "./SkeletonLoader";

interface HabitListProps {
  habits: Habit[];
  onHabitUpdated: (habit: Habit) => void;
  onHabitDeleted: (habitId: number) => void;
  selectedHabitIds: number[];
  onSelectHabit: (habitId: number, selected: boolean) => void;
}

interface HabitListProps {
  habits: Habit[];
  onHabitUpdated: (habit: Habit) => void;
  onHabitDeleted: (habitId: number) => void;
  selectedHabitIds: number[];
  onSelectHabit: (habitId: number, selected: boolean) => void;
}

interface HabitCardProps {
  habit: Habit;
  entry: HabitEntry | undefined;
  stats: HabitStats | undefined;
  inputs: { count: number; notes: string };
  isSelected: boolean;
  isUpdating: boolean;
  onSelectHabit: (habitId: number, selected: boolean) => void;
  onCountChange: (habitId: number, newCount: number) => void;
  onNotesChange: (habitId: number, notes: string) => void;
  onNotesBlur: (habitId: number) => void;
  onEditHabit: (habit: Habit) => void;
  onDeleteHabit: (habit: Habit) => void;
}

/**
 * Memoized HabitCard component for better performance in large lists
 */
const HabitCard = memo<HabitCardProps>(
  ({
    habit,
    entry,
    stats,
    inputs,
    isSelected,
    isUpdating,
    onSelectHabit,
    onCountChange,
    onNotesChange,
    onNotesBlur,
    onEditHabit,
    onDeleteHabit,
  }) => {
    const isCompleted = useMemo(
      () => inputs.count >= habit.targetCount,
      [inputs.count, habit.targetCount]
    );
    const completionPercentage = useMemo(
      () => Math.min((inputs.count / habit.targetCount) * 100, 100),
      [inputs.count, habit.targetCount]
    );

    const handleCheckboxChange = useCallback(
      (checked: boolean | string) => {
        onSelectHabit(habit.id, !!checked);
      },
      [habit.id, onSelectHabit]
    );

    const handleCountIncrease = useCallback(() => {
      onCountChange(habit.id, inputs.count + 1);
    }, [habit.id, inputs.count, onCountChange]);

    const handleCountDecrease = useCallback(() => {
      onCountChange(habit.id, inputs.count - 1);
    }, [habit.id, inputs.count, onCountChange]);

    const handleCountInputChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        onCountChange(habit.id, Number.parseInt(e.target.value) || 0);
      },
      [habit.id, onCountChange]
    );

    const handleNotesInputChange = useCallback(
      (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        onNotesChange(habit.id, e.target.value);
      },
      [habit.id, onNotesChange]
    );

    const handleNotesInputBlur = useCallback(() => {
      onNotesBlur(habit.id);
    }, [habit.id, onNotesBlur]);

    const handleEditClick = useCallback(() => {
      onEditHabit(habit);
    }, [habit, onEditHabit]);

    const handleDeleteClick = useCallback(() => {
      onDeleteHabit(habit);
    }, [habit, onDeleteHabit]);

    const cardClassName = useMemo(() => {
      return `p-6 transition-all duration-200 ${
        isCompleted
          ? "bg-[color:var(--color-accent)]/20 border-[color:var(--color-accent)]"
          : "bg-white/50 border-purple-100"
      } ${isUpdating ? "opacity-75" : ""}`;
    }, [isCompleted, isUpdating]);

    return (
      <Card className={cardClassName}>
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <Checkbox
              checked={isSelected}
              onCheckedChange={handleCheckboxChange}
              className="mr-2 mt-1"
            />
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-semibold text-[var(--color-text-primary)] flex items-center gap-1">
                  <span>{habit.emoji}</span>
                  {habit.name}
                </h3>
                <Badge className={getFrequencyColor(habit.frequency)}>{habit.frequency}</Badge>
                {isCompleted && (
                  <Badge className="bg-[var(--color-semantic-success-bg)] text-[var(--color-semantic-success-text)] border-[var(--color-semantic-success-border)]">
                    ✓ Completed
                  </Badge>
                )}
              </div>
              {habit.description && (
                <p className="text-sm text-[var(--color-text-secondary)] mb-3">
                  {habit.description}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={handleEditClick}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={handleDeleteClick}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Stats Row */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className={`text-2xl font-bold ${getStreakColor(stats.currentStreak)}`}>
                  {stats.currentStreak}
                </div>
                <div className="text-xs text-[var(--color-text-tertiary)] flex items-center justify-center gap-1">
                  <Flame className="h-3 w-3" />
                  Current Streak
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-[var(--color-text-primary)]">
                  {stats.longestStreak}
                </div>
                <div className="text-xs text-[var(--color-text-tertiary)] flex items-center justify-center gap-1">
                  <Target className="h-3 w-3" />
                  Best Streak
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-[var(--color-text-primary)]">
                  {stats.totalCompletions}
                </div>
                <div className="text-xs text-[var(--color-text-tertiary)] flex items-center justify-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  Total Done
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-[var(--color-text-primary)]">
                  {stats.completionRate}%
                </div>
                <div className="text-xs text-[var(--color-text-tertiary)] flex items-center justify-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Success Rate
                </div>
              </div>
            </div>
          )}

          {/* Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[var(--color-text-secondary)]">
                Today's Progress: {inputs.count} / {habit.targetCount}
              </span>
              <span className="text-[var(--color-text-secondary)]">
                {Math.round(completionPercentage)}%
              </span>
            </div>
            <Progress value={completionPercentage} className="h-2" />
          </div>

          {/* Entry Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-[var(--color-text-primary)] mb-2 block">
                Count for Today
              </label>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCountDecrease}
                  disabled={inputs.count <= 0 || isUpdating}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <Input
                  type="number"
                  min="0"
                  value={inputs.count}
                  onChange={handleCountInputChange}
                  className="w-20 text-center"
                  disabled={isUpdating}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCountIncrease}
                  disabled={isUpdating}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Notes (optional)
              </label>
              <Textarea
                value={inputs.notes}
                onChange={handleNotesInputChange}
                onBlur={handleNotesInputBlur}
                placeholder="How did it go?"
                rows={2}
                className="resize-none"
                disabled={isUpdating}
              />
            </div>
          </div>
        </div>
      </Card>
    );
  }
);

HabitCard.displayName = "HabitCard";

const HabitListComponent = ({
  habits,
  onHabitUpdated,
  onHabitDeleted,
  selectedHabitIds,
  onSelectHabit,
}: HabitListProps) => {
  const [habitEntries, setHabitEntries] = useState<Record<number, HabitEntry>>({});
  const [habitStats, setHabitStats] = useState<Record<number, HabitStats>>({});
  const [entryInputs, setEntryInputs] = useState<Record<number, { count: number; notes: string }>>(
    {}
  );
  const [isLoading, setIsLoading] = useState(true);
  const [updatingHabits, setUpdatingHabits] = useState<Set<number>>(new Set());
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [deletingHabit, setDeletingHabit] = useState<Habit | null>(null);

  const { showSuccess, showError } = useToast();

  const appDate = getAppDate();
  const today = getAppDateString();

  const { execute: deleteHabit } = useAsyncOperation(
    async (...args: unknown[]) => {
      const habitId = args[0] as number;
      await backend.habits.deleteHabit(habitId);
      return habitId;
    },
    (habitId) => {
      onHabitDeleted(habitId);
      setDeletingHabit(null);
      showSuccess("Habit deleted successfully!");
    },
    () => {
      showError("Failed to delete habit", "Delete Error");
      setDeletingHabit(null);
    }
  );

  const loadHabitData = useCallback(async () => {
    try {
      // Load today's entries for all habits
      const entriesResponse = await backend.habits.listHabitEntries({
        startDate: today,
        endDate: today,
      });

      const entriesMap: Record<number, HabitEntry> = {};
      entriesResponse.entries.forEach((entry: HabitEntry) => {
        entriesMap[entry.habitId] = entry;
      });
      setHabitEntries(entriesMap);

      // Load stats for all habits
      const statsPromises = habits.map((habit) => backend.habits.getHabitStats(habit.id));
      const statsResults = await Promise.all(statsPromises);

      const statsMap: Record<number, HabitStats> = {};
      statsResults.forEach((stats: HabitStats) => {
        statsMap[stats.habitId] = stats;
      });
      setHabitStats(statsMap);

      // Initialize entry inputs
      const inputsMap: Record<number, { count: number; notes: string }> = {};
      habits.forEach((habit) => {
        const existingEntry = entriesMap[habit.id];
        inputsMap[habit.id] = {
          count: existingEntry?.count || 0,
          notes: existingEntry?.notes || "",
        };
      });
      setEntryInputs(inputsMap);
    } catch (_error) {
      showError("Failed to load habit data. Please try again.", "Loading Error");
    } finally {
      setIsLoading(false);
    }
  }, [habits, today]);

  useEffect(() => {
    if (habits.length > 0) {
      loadHabitData();
    } else {
      setIsLoading(false);
    }
  }, [habits, loadHabitData]);

  const updateHabitEntry = useCallback(
    async (habitId: number, count: number, notes: string) => {
      setUpdatingHabits((prev) => new Set(prev).add(habitId));

      try {
        const entry = await backend.habits.createHabitEntry({
          habitId,
          date: appDate,
          count,
          notes: notes.trim() || undefined,
        });

        setHabitEntries((prev) => ({
          ...prev,
          [habitId]: entry,
        }));

        // Reload stats for this habit
        const stats = await backend.habits.getHabitStats(habitId);
        setHabitStats((prev) => ({
          ...prev,
          [habitId]: stats,
        }));
      } catch (_error) {
        showError("Failed to update habit entry. Please try again.", "Update Error");
        // Revert optimistic update on error
        loadHabitData();
      } finally {
        setUpdatingHabits((prev) => {
          const newSet = new Set(prev);
          newSet.delete(habitId);
          return newSet;
        });
      }
    },
    [appDate, loadHabitData]
  );

  const handleCountChange = useCallback(
    (habitId: number, newCount: number) => {
      const count = Math.max(0, newCount);

      // Optimistic update
      setEntryInputs((prev) => ({
        ...prev,
        [habitId]: { ...prev[habitId], count, notes: prev[habitId]?.notes || "" },
      }));

      const notes = entryInputs[habitId]?.notes || "";
      updateHabitEntry(habitId, count, notes);
    },
    [entryInputs, updateHabitEntry]
  );

  const handleNotesChange = useCallback((habitId: number, notes: string) => {
    setEntryInputs((prev) => ({
      ...prev,
      [habitId]: { ...prev[habitId], notes, count: prev[habitId]?.count || 0 },
    }));
  }, []);

  const handleNotesBlur = useCallback(
    (habitId: number) => {
      const count = entryInputs[habitId]?.count || 0;
      const notes = entryInputs[habitId]?.notes || "";
      updateHabitEntry(habitId, count, notes);
    },
    [entryInputs, updateHabitEntry]
  );

  const handleHabitUpdated = useCallback(
    (updatedHabit: Habit) => {
      onHabitUpdated(updatedHabit);
      setEditingHabit(null);
    },
    [onHabitUpdated]
  );

  const handleDeleteHabit = useCallback(async () => {
    if (deletingHabit) {
      await deleteHabit(deletingHabit.id);
    }
  }, [deletingHabit, deleteHabit]);

  const handleEditHabit = useCallback((habit: Habit) => {
    setEditingHabit(habit);
  }, []);

  const handleDeleteHabitRequest = useCallback((habit: Habit) => {
    setDeletingHabit(habit);
  }, []);

  const handleCloseEditDialog = useCallback((open: boolean) => {
    if (!open) setEditingHabit(null);
  }, []);

  const handleCloseDeleteDialog = useCallback((open: boolean) => {
    if (!open) setDeletingHabit(null);
  }, []);

  // Memoized selected habits set for performance
  const selectedHabitsSet = useMemo(() => new Set(selectedHabitIds), [selectedHabitIds]);

  if (isLoading) {
    return <HabitListSkeleton />;
  }

  return (
    <div className="space-y-4">
      {habits.map((habit) => {
        const entry = habitEntries[habit.id];
        const stats = habitStats[habit.id];
        const inputs = entryInputs[habit.id] || { count: 0, notes: "" };
        const isSelected = selectedHabitsSet.has(habit.id);
        const isUpdating = updatingHabits.has(habit.id);

        return (
          <HabitCard
            key={habit.id}
            habit={habit}
            entry={entry}
            stats={stats}
            inputs={inputs}
            isSelected={isSelected}
            isUpdating={isUpdating}
            onSelectHabit={onSelectHabit}
            onCountChange={handleCountChange}
            onNotesChange={handleNotesChange}
            onNotesBlur={handleNotesBlur}
            onEditHabit={handleEditHabit}
            onDeleteHabit={handleDeleteHabitRequest}
          />
        );
      })}

      {editingHabit && (
        <EditHabitDialog
          habit={editingHabit}
          open={!!editingHabit}
          onOpenChange={handleCloseEditDialog}
          onHabitUpdated={handleHabitUpdated}
        />
      )}

      <ConfirmDialog
        open={!!deletingHabit}
        onOpenChange={handleCloseDeleteDialog}
        title="Delete Habit"
        description={`Are you sure you want to delete "${deletingHabit?.name}"? This will permanently remove the habit and all its tracking data.`}
        confirmText="Delete"
        onConfirm={handleDeleteHabit}
        variant="destructive"
      />
    </div>
  );
};

export const HabitList = memo(HabitListComponent);
HabitList.displayName = "HabitList";
