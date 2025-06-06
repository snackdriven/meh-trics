import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EditableCopy } from "./EditableCopy";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, TrendingUp, Calendar, Target } from "lucide-react";
import { CreateHabitDialog } from "./CreateHabitDialog";
import { HabitList } from "./HabitList";
import { HabitListSkeleton } from "./SkeletonLoader";
import { ErrorMessage } from "./ErrorMessage";
import { useAsyncOperation } from "../hooks/useAsyncOperation";
import { useToast } from "../hooks/useToast";
import backend from "~backend/client";
import type { Habit } from "~backend/task/types";

export function HabitTracker() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [selectedHabitIds, setSelectedHabitIds] = useState<number[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const { showError, showSuccess } = useToast();

  const {
    loading,
    error,
    execute: loadHabits,
  } = useAsyncOperation(
    async () => {
      const response = await backend.task.listHabits();
      setHabits(response.habits);
      return response.habits;
    },
    undefined,
    (error) => showError("Failed to load habits", "Loading Error")
  );

  useEffect(() => {
    loadHabits();
  }, []);

  const handleHabitCreated = (newHabit: Habit) => {
    setHabits(prev => [newHabit, ...prev]);
    setIsCreateDialogOpen(false);
    showSuccess("Habit created successfully! 🎯");
  };

  const handleHabitUpdated = (updatedHabit: Habit) => {
    setHabits(prev => prev.map(habit => 
      habit.id === updatedHabit.id ? updatedHabit : habit
    ));
  };

  const handleHabitDeleted = (habitId: number) => {
    setHabits(prev => prev.filter(habit => habit.id !== habitId));
  };

  const handleSelectHabit = (habitId: number, selected: boolean) => {
    setSelectedHabitIds(prev =>
      selected ? [...prev, habitId] : prev.filter(id => id !== habitId)
    );
  };

  const clearSelection = () => setSelectedHabitIds([]);

  const handleBulkComplete = async () => {
    const today = new Date().toISOString().split("T")[0];
    for (const id of selectedHabitIds) {
      const habit = habits.find(h => h.id === id);
      if (habit) {
        await backend.task.createHabitEntry({
          habitId: id,
          date: new Date(today),
          count: habit.targetCount,
        });
      }
    }
    showSuccess("Habits marked complete");
    clearSelection();
  };

  const handleBulkDelete = async () => {
    for (const id of selectedHabitIds) {
      await backend.task.deleteHabit({ id });
      handleHabitDeleted(id);
    }
    showSuccess("Habits deleted");
    clearSelection();
  };

  if (loading) {
    return (
      <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Target className="h-6 w-6" />
              Habit Tracker
            </CardTitle>
            <EditableCopy
              defaultText="Build lasting habits with gentle tracking and streak rewards"
              as="p"
              className="text-gray-600 mt-1"
            />
          </div>
          <Button 
            onClick={() => setIsCreateDialogOpen(true)}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Habit
          </Button>
        </CardHeader>
        <CardContent>
          <HabitListSkeleton />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
        <CardContent className="p-8">
          <ErrorMessage 
            message={error} 
            onRetry={loadHabits}
          />
        </CardContent>
      </Card>
    );
  }

  const getFrequencyCounts = () => {
    const counts = {
      daily: habits.filter(h => h.frequency === "daily").length,
      weekly: habits.filter(h => h.frequency === "weekly").length,
      monthly: habits.filter(h => h.frequency === "monthly").length,
    };
    return counts;
  };

  const frequencyCounts = getFrequencyCounts();

  return (
    <div className="space-y-6">
      <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Target className="h-6 w-6" />
              Habit Tracker
            </CardTitle>
            <EditableCopy
              storageKey="habitsCopy"
              defaultText="Build lasting habits with gentle tracking and streak rewards"
              as="p"
              className="text-gray-600 mt-1"
            />
            <div className="flex gap-2 mt-3">
              <Badge variant="outline" className="bg-blue-50 flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {frequencyCounts.daily} Daily
              </Badge>
              <Badge variant="outline" className="bg-green-50 flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {frequencyCounts.weekly} Weekly
              </Badge>
              <Badge variant="outline" className="bg-purple-50 flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {frequencyCounts.monthly} Monthly
              </Badge>
            </div>
          </div>
          <Button 
            onClick={() => setIsCreateDialogOpen(true)}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Habit
          </Button>
        </CardHeader>
        <CardContent>
          {habits.length === 0 ? (
            <div className="text-center py-12">
              <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No habits yet</h3>
              <p className="text-gray-500 mb-4">
                Start building positive habits that stick. Track daily, weekly, or monthly goals.
              </p>
              <Button 
                onClick={() => setIsCreateDialogOpen(true)}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Habit
              </Button>
            </div>
          ) : (
            <>
              {selectedHabitIds.length > 0 && (
                <div className="mb-4 flex flex-wrap items-center gap-2">
                  <span className="text-sm text-gray-600">
                    {selectedHabitIds.length} selected
                  </span>
                  <Button size="sm" onClick={handleBulkComplete}>Complete</Button>
                  <Button size="sm" variant="destructive" onClick={handleBulkDelete}>Delete</Button>
                  <Button size="sm" variant="outline" onClick={clearSelection}>Clear</Button>
                </div>
              )}
              <HabitList
                habits={habits}
                onHabitUpdated={handleHabitUpdated}
                onHabitDeleted={handleHabitDeleted}
                selectedHabitIds={selectedHabitIds}
                onSelectHabit={handleSelectHabit}
              />
            </>
          )}
        </CardContent>
      </Card>

      <CreateHabitDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onHabitCreated={handleHabitCreated}
      />
    </div>
  );
}
