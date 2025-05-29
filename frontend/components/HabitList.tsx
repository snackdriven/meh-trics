import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Target, TrendingUp, Flame, Plus, Minus, Edit, Trash2 } from "lucide-react";
import backend from "~backend/client";
import type { Habit, HabitEntry, HabitStats } from "~backend/task/types";

interface HabitListProps {
  habits: Habit[];
  onHabitUpdated: (habit: Habit) => void;
  onHabitDeleted: (habitId: number) => void;
}

export function HabitList({ habits, onHabitUpdated, onHabitDeleted }: HabitListProps) {
  const [habitEntries, setHabitEntries] = useState<Record<number, HabitEntry>>({});
  const [habitStats, setHabitStats] = useState<Record<number, HabitStats>>({});
  const [entryInputs, setEntryInputs] = useState<Record<number, { count: number; notes: string }>>({});
  const [isLoading, setIsLoading] = useState(true);

  const today = new Date().toISOString().split('T')[0];

  const loadHabitData = async () => {
    try {
      // Load today's entries for all habits
      const entriesResponse = await backend.task.listHabitEntries({
        startDate: today,
        endDate: today,
      });
      
      const entriesMap: Record<number, HabitEntry> = {};
      entriesResponse.entries.forEach(entry => {
        entriesMap[entry.habitId] = entry;
      });
      setHabitEntries(entriesMap);

      // Load stats for all habits
      const statsPromises = habits.map(habit => 
        backend.task.getHabitStats({ habitId: habit.id })
      );
      const statsResults = await Promise.all(statsPromises);
      
      const statsMap: Record<number, HabitStats> = {};
      statsResults.forEach(stats => {
        statsMap[stats.habitId] = stats;
      });
      setHabitStats(statsMap);

      // Initialize entry inputs
      const inputsMap: Record<number, { count: number; notes: string }> = {};
      habits.forEach(habit => {
        const existingEntry = entriesMap[habit.id];
        inputsMap[habit.id] = {
          count: existingEntry?.count || 0,
          notes: existingEntry?.notes || "",
        };
      });
      setEntryInputs(inputsMap);
    } catch (error) {
      console.error("Failed to load habit data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (habits.length > 0) {
      loadHabitData();
    } else {
      setIsLoading(false);
    }
  }, [habits]);

  const updateHabitEntry = async (habitId: number, count: number, notes: string) => {
    try {
      const entry = await backend.task.createHabitEntry({
        habitId,
        date: new Date(today),
        count,
        notes: notes.trim() || undefined,
      });
      
      setHabitEntries(prev => ({
        ...prev,
        [habitId]: entry,
      }));

      // Reload stats for this habit
      const stats = await backend.task.getHabitStats({ habitId });
      setHabitStats(prev => ({
        ...prev,
        [habitId]: stats,
      }));
    } catch (error) {
      console.error("Failed to update habit entry:", error);
    }
  };

  const handleCountChange = (habitId: number, newCount: number) => {
    const count = Math.max(0, newCount);
    setEntryInputs(prev => ({
      ...prev,
      [habitId]: { ...prev[habitId], count },
    }));
    
    const notes = entryInputs[habitId]?.notes || "";
    updateHabitEntry(habitId, count, notes);
  };

  const handleNotesChange = (habitId: number, notes: string) => {
    setEntryInputs(prev => ({
      ...prev,
      [habitId]: { ...prev[habitId], notes },
    }));
  };

  const handleNotesBlur = (habitId: number) => {
    const count = entryInputs[habitId]?.count || 0;
    const notes = entryInputs[habitId]?.notes || "";
    updateHabitEntry(habitId, count, notes);
  };

  const getFrequencyColor = (frequency: string) => {
    switch (frequency) {
      case "daily": return "bg-blue-100 text-blue-800 border-blue-200";
      case "weekly": return "bg-green-100 text-green-800 border-green-200";
      case "monthly": return "bg-purple-100 text-purple-800 border-purple-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStreakColor = (streak: number) => {
    if (streak >= 30) return "text-purple-600";
    if (streak >= 14) return "text-blue-600";
    if (streak >= 7) return "text-green-600";
    if (streak >= 3) return "text-yellow-600";
    return "text-gray-600";
  };

  if (isLoading) {
    return (
      <div className="text-center py-8 text-gray-500">
        Loading habit data...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {habits.map((habit) => {
        const entry = habitEntries[habit.id];
        const stats = habitStats[habit.id];
        const inputs = entryInputs[habit.id] || { count: 0, notes: "" };
        const isCompleted = inputs.count >= habit.targetCount;
        const completionPercentage = Math.min((inputs.count / habit.targetCount) * 100, 100);

        return (
          <Card 
            key={habit.id} 
            className={`p-6 transition-all duration-200 ${
              isCompleted 
                ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200" 
                : "bg-white/50 border-purple-100"
            }`}
          >
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{habit.name}</h3>
                    <Badge className={getFrequencyColor(habit.frequency)}>
                      {habit.frequency}
                    </Badge>
                    {isCompleted && (
                      <Badge className="bg-green-100 text-green-800 border-green-200">
                        ✓ Completed
                      </Badge>
                    )}
                  </div>
                  {habit.description && (
                    <p className="text-sm text-gray-600 mb-3">{habit.description}</p>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
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
                    <div className="text-xs text-gray-500 flex items-center justify-center gap-1">
                      <Flame className="h-3 w-3" />
                      Current Streak
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-700">{stats.longestStreak}</div>
                    <div className="text-xs text-gray-500 flex items-center justify-center gap-1">
                      <Target className="h-3 w-3" />
                      Best Streak
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-700">{stats.totalCompletions}</div>
                    <div className="text-xs text-gray-500 flex items-center justify-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      Total Done
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-700">{stats.completionRate}%</div>
                    <div className="text-xs text-gray-500 flex items-center justify-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Success Rate
                    </div>
                  </div>
                </div>
              )}

              {/* Progress */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">
                    Today's Progress: {inputs.count} / {habit.targetCount}
                  </span>
                  <span className="text-gray-600">{Math.round(completionPercentage)}%</span>
                </div>
                <Progress value={completionPercentage} className="h-2" />
              </div>

              {/* Entry Controls */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Count for Today
                  </label>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCountChange(habit.id, inputs.count - 1)}
                      disabled={inputs.count <= 0}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <Input
                      type="number"
                      min="0"
                      value={inputs.count}
                      onChange={(e) => handleCountChange(habit.id, parseInt(e.target.value) || 0)}
                      className="w-20 text-center"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCountChange(habit.id, inputs.count + 1)}
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
                    onChange={(e) => handleNotesChange(habit.id, e.target.value)}
                    onBlur={() => handleNotesBlur(habit.id)}
                    placeholder="How did it go?"
                    rows={2}
                    className="resize-none"
                  />
                </div>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
