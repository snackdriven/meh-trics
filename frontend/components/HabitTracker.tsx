import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { HabitList } from "./HabitList";
import { CreateHabitDialog } from "./CreateHabitDialog";
import backend from "~backend/client";
import type { Habit } from "~backend/task/types";

export function HabitTracker() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadHabits = async () => {
    try {
      const response = await backend.task.listHabits();
      setHabits(response.habits);
    } catch (error) {
      console.error("Failed to load habits:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHabits();
  }, []);

  const handleHabitCreated = (newHabit: Habit) => {
    setHabits(prev => [newHabit, ...prev]);
    setIsCreateDialogOpen(false);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center text-gray-500">Loading habits...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Habits</CardTitle>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Habit
          </Button>
        </CardHeader>
        <CardContent>
          <HabitList habits={habits} />
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
