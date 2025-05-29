import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Plus, Minus, Calendar } from "lucide-react";
import backend from "~backend/client";
import type { Habit, HabitEntry } from "~backend/task/types";

interface HabitListProps {
  habits: Habit[];
}

export function HabitList({ habits }: HabitListProps) {
  const [habitEntries, setHabitEntries] = useState<Record<string, HabitEntry>>({});
  const [isLoading, setIsLoading] = useState(true);

  const today = new Date().toISOString().split('T')[0];

  const loadTodayEntries = async () => {
    try {
      const response = await backend.task.listHabitEntries({
        startDate: today,
        endDate: today,
      });
      
      const entriesMap: Record<string, HabitEntry> = {};
      response.entries.forEach(entry => {
        const key = `${entry.habitId}-${today}`;
        entriesMap[key] = entry;
      });
      
      setHabitEntries(entriesMap);
    } catch (error) {
      console.error("Failed to load habit entries:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTodayEntries();
  }, []);

  const updateHabitEntry = async (habitId: number, count: number) => {
    try {
      const entry = await backend.task.createHabitEntry({
        habitId,
        date: new Date(today),
        count,
      });
      
      const key = `${habitId}-${today}`;
      setHabitEntries(prev => ({
        ...prev,
        [key]: entry,
      }));
    } catch (error) {
      console.error("Failed to update habit entry:", error);
    }
  };

  const getFrequencyColor = (frequency: string) => {
    switch (frequency) {
      case "daily": return "bg-green-100 text-green-800";
      case "weekly": return "bg-blue-100 text-blue-800";
      case "monthly": return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return <div className="text-center py-4 text-gray-500">Loading...</div>;
  }

  if (habits.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No habits yet. Create your first habit to get started!
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {habits.map((habit) => {
        const entryKey = `${habit.id}-${today}`;
        const todayEntry = habitEntries[entryKey];
        const currentCount = todayEntry?.count || 0;

        return (
          <Card key={habit.id} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-medium text-gray-900">{habit.name}</h3>
                  <Badge className={getFrequencyColor(habit.frequency)}>
                    {habit.frequency}
                  </Badge>
                </div>
                
                {habit.description && (
                  <p className="text-sm text-gray-600 mb-2">{habit.description}</p>
                )}
                
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <Calendar className="h-3 w-3" />
                  Started: {new Date(habit.startDate).toLocaleDateString()}
                  {habit.endDate && (
                    <span> • Ends: {new Date(habit.endDate).toLocaleDateString()}</span>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateHabitEntry(habit.id, Math.max(0, currentCount - 1))}
                  disabled={currentCount <= 0}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                
                <div className="flex items-center gap-1 min-w-[80px] justify-center">
                  <span className="font-medium">{currentCount}</span>
                  <span className="text-sm text-gray-500">/ {habit.targetCount}</span>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateHabitEntry(habit.id, currentCount + 1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {currentCount >= habit.targetCount && (
              <div className="mt-2 text-sm text-green-600 font-medium">
                ✓ Goal completed for today!
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}
