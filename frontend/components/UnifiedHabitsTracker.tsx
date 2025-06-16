import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Edit, History, Plus, Target } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import backend from "~backend/client";
import type { Habit, HabitEntry } from "~backend/habits/types";
import type { RoutineEntry, RoutineItem } from "~backend/task/types";
import { useAsyncOperation } from "../hooks/useAsyncOperation";
import { useToast } from "../hooks/useToast";
import { CreateHabitDialog } from "./HabitCRUDDialogs";
import { CreateRoutineItemDialog } from "./CreateRoutineItemDialog";
import { EditRoutineItemDialog } from "./EditRoutineItemDialog";
import { ErrorMessage } from "./ErrorMessage";
import { SkeletonLoader } from "./SkeletonLoader";

interface UnifiedItem {
  id: number;
  name: string;
  emoji?: string;
  type: "habit" | "routine";
  frequency?: "daily" | "weekly" | "monthly";
  targetCount?: number;
  groupName?: string;
  isActive: boolean;
  originalData: Habit | RoutineItem;
}

interface UnifiedEntry {
  id: number;
  itemId: number;
  date: string;
  count?: number;
  completed: boolean;
  type: "habit" | "routine";
  originalData: HabitEntry | RoutineEntry;
}

export function UnifiedHabitsTracker() {
  const [unifiedItems, setUnifiedItems] = useState<UnifiedItem[]>([]);
  const [todayEntries, setTodayEntries] = useState<Record<number, UnifiedEntry>>({});
  const [historicalEntries, setHistoricalEntries] = useState<UnifiedEntry[]>([]);
  const [searchFilter, setSearchFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "habit" | "routine">("all");
  const [completionFilter, setCompletionFilter] = useState<"all" | "completed" | "incomplete">("all");
  const [isCreateHabitDialogOpen, setIsCreateHabitDialogOpen] = useState(false);
  const [isCreateRoutineDialogOpen, setIsCreateRoutineDialogOpen] = useState(false);
  const [editingRoutine, setEditingRoutine] = useState<RoutineItem | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState("today");
  const { showError, showSuccess } = useToast();
  const today = new Date().toISOString().split("T")[0];
  // Load all data
  const {
    loading,
    error,
    execute: loadData,
  } = useAsyncOperation(
    async () => {
      const [habitsResponse, routineItemsResponse, habitEntriesResponse, routineEntriesResponse] = 
        await Promise.all([
          backend.task.listHabits(),
          backend.task.listRoutineItems(),
          backend.task.listHabitEntries({ startDate: today, endDate: today }),
          backend.task.listRoutineEntries({ date: today }),
        ]);

      // Transform habits to unified format
      const habitItems: UnifiedItem[] = habitsResponse.habits.map((habit: Habit) => ({
        id: habit.id,
        name: habit.name,
        emoji: habit.emoji,
        type: "habit" as const,
        frequency: habit.frequency,
        targetCount: habit.targetCount,
        isActive: true, // Habits don't have isActive in the current schema
        originalData: habit,
      }));

      // Transform routines to unified format
      const routineItems: UnifiedItem[] = routineItemsResponse.items.map((routine: RoutineItem) => ({
        id: routine.id,
        name: routine.name,
        emoji: routine.emoji,
        type: "routine" as const,
        targetCount: 1, // Routines are always binary completion
        groupName: routine.groupName,
        isActive: routine.isActive,
        originalData: routine,
      }));

      const allItems = [...habitItems, ...routineItems];
      setUnifiedItems(allItems);

      // Transform entries to unified format
      const habitEntries: Record<number, UnifiedEntry> = {};
      for (const entry of habitEntriesResponse.entries) {
        habitEntries[entry.habitId] = {
          id: entry.id,
          itemId: entry.habitId,
          date: today,
          count: entry.count,
          completed: entry.count > 0,
          type: "habit",
          originalData: entry,
        };
      }

      const routineEntries: Record<number, UnifiedEntry> = {};
      for (const entry of routineEntriesResponse.entries) {
        routineEntries[entry.routineItemId] = {
          id: entry.id,
          itemId: entry.routineItemId,
          date: today,
          completed: entry.completed,
          type: "routine",
          originalData: entry,
        };
      }

      const allTodayEntries = { ...habitEntries, ...routineEntries };
      setTodayEntries(allTodayEntries);

      return allItems;
    },
    undefined,
    (_error) => showError("Failed to load tracking data", "Loading Error")
  );

  useEffect(() => {
    loadData();
  }, []);

  // Filtered items
  const filteredItems = useMemo(() => {
    return unifiedItems.filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(searchFilter.toLowerCase());
      const matchesType = typeFilter === "all" || item.type === typeFilter;
      
      let matchesCompletion = true;
      if (completionFilter !== "all") {
        const entry = todayEntries[item.id];
        const isCompleted = entry?.completed || false;
        matchesCompletion = completionFilter === "completed" ? isCompleted : !isCompleted;
      }

      return matchesSearch && matchesType && matchesCompletion;
    });
  }, [unifiedItems, searchFilter, typeFilter, completionFilter, todayEntries]);

  // Group items by type and group
  const groupedItems = useMemo(() => {
    const groups: Record<string, UnifiedItem[]> = {};
    
    for (const item of filteredItems) {
      if (item.type === "habit") {
        const groupKey = "Habits";
        if (!groups[groupKey]) groups[groupKey] = [];
        groups[groupKey].push(item);
      } else {
        const groupKey = item.groupName || "Routines";
        if (!groups[groupKey]) groups[groupKey] = [];
        groups[groupKey].push(item);
      }
    }

    return groups;
  }, [filteredItems]);

  const handleHabitToggle = async (item: UnifiedItem) => {
    if (item.type !== "habit") return;
    
    const habit = item.originalData as Habit;
    const currentEntry = todayEntries[item.id];
    const newCount = currentEntry?.count || 0 >= habit.targetCount ? 0 : habit.targetCount;

    try {
      const response = await backend.habits.createHabitEntry({
        habitId: habit.id,
        date: today,
        count: newCount,
        note: "",
      });

      setTodayEntries((prev) => ({
        ...prev,
        [item.id]: {
          id: response.entry.id,
          itemId: item.id,
          date: today,
          count: newCount,
          completed: newCount > 0,
          type: "habit",
          originalData: response.entry,
        },
      }));

      showSuccess(`${habit.name} ${newCount > 0 ? "completed" : "reset"}! 🎯`);
    } catch (error) {
      showError("Failed to update habit", "Update Error");
    }
  };

  const handleRoutineToggle = async (item: UnifiedItem) => {
    if (item.type !== "routine") return;
    
    const routine = item.originalData as RoutineItem;
    const currentEntry = todayEntries[item.id];
    const newCompleted = !currentEntry?.completed;

    try {
      if (newCompleted) {
        const response = await backend.task.createRoutineEntry({
          routineItemId: routine.id,
          date: today,
          completed: true,
        });

        setTodayEntries((prev) => ({
          ...prev,
          [item.id]: {
            id: response.entry.id,
            itemId: item.id,
            date: today,
            completed: true,
            type: "routine",
            originalData: response.entry,
          },
        }));
      } else {
        if (currentEntry) {
          await backend.task.deleteRoutineEntry({ id: currentEntry.id });
          setTodayEntries((prev) => {
            const updated = { ...prev };
            delete updated[item.id];
            return updated;
          });
        }
      }

      showSuccess(`${routine.name} ${newCompleted ? "completed" : "reset"}! ✅`);
    } catch (error) {
      showError("Failed to update routine", "Update Error");
    }
  };

  const handleItemToggle = (item: UnifiedItem) => {
    if (item.type === "habit") {
      handleHabitToggle(item);
    } else {
      handleRoutineToggle(item);
    }
  };

  const handleHabitCreated = (newHabit: Habit) => {
    const unifiedItem: UnifiedItem = {
      id: newHabit.id,
      name: newHabit.name,
      emoji: newHabit.emoji,
      type: "habit",
      frequency: newHabit.frequency,
      targetCount: newHabit.targetCount,
      isActive: newHabit.isActive,
      originalData: newHabit,
    };
    
    setUnifiedItems((prev) => [unifiedItem, ...prev]);
    setIsCreateHabitDialogOpen(false);
    showSuccess("Habit created successfully! 🎯");
  };

  const handleRoutineCreated = (newRoutine: RoutineItem) => {
    const unifiedItem: UnifiedItem = {
      id: newRoutine.id,
      name: newRoutine.name,
      emoji: newRoutine.emoji,
      type: "routine",
      targetCount: 1,
      groupName: newRoutine.groupName,
      isActive: newRoutine.isActive,
      originalData: newRoutine,
    };
    
    setUnifiedItems((prev) => [unifiedItem, ...prev]);
    setIsCreateRoutineDialogOpen(false);
    showSuccess("Routine created successfully! ✅");
  };

  const renderTodayView = () => (
    <div className="space-y-4">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {Object.values(todayEntries).filter(e => e.completed).length}
            </div>
            <div className="text-sm text-gray-600">Completed Today</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">
              {unifiedItems.filter(i => i.type === "habit").length}
            </div>
            <div className="text-sm text-gray-600">Total Habits</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">
              {unifiedItems.filter(i => i.type === "routine").length}
            </div>
            <div className="text-sm text-gray-600">Total Routines</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-amber-600">
              {Math.round((Object.values(todayEntries).filter(e => e.completed).length / unifiedItems.length) * 100) || 0}%
            </div>
            <div className="text-sm text-gray-600">Completion Rate</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search habits and routines..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="w-full"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={typeFilter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setTypeFilter("all")}
          >
            All
          </Button>
          <Button
            variant={typeFilter === "habit" ? "default" : "outline"}
            size="sm"
            onClick={() => setTypeFilter("habit")}
          >
            Habits
          </Button>
          <Button
            variant={typeFilter === "routine" ? "default" : "outline"}
            size="sm"
            onClick={() => setTypeFilter("routine")}
          >
            Routines
          </Button>
        </div>
        <div className="flex gap-2">
          <Button
            variant={completionFilter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setCompletionFilter("all")}
          >
            All
          </Button>
          <Button
            variant={completionFilter === "completed" ? "default" : "outline"}
            size="sm"
            onClick={() => setCompletionFilter("completed")}
          >
            Done
          </Button>
          <Button
            variant={completionFilter === "incomplete" ? "default" : "outline"}
            size="sm"
            onClick={() => setCompletionFilter("incomplete")}
          >
            Todo
          </Button>
        </div>
      </div>

      {/* Grouped Items */}
      <div className="space-y-4">
        {Object.entries(groupedItems).map(([groupName, items]) => (
          <Card key={groupName}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{groupName}</span>
                <Badge variant="secondary">
                  {items.filter(item => todayEntries[item.id]?.completed).length}/{items.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {items.map((item) => {
                  const entry = todayEntries[item.id];
                  const isCompleted = entry?.completed || false;

                  if (item.type === "habit") {
                    return (
                      <HabitCard
                        key={item.id}
                        habit={item.originalData as Habit}
                        entry={entry?.originalData as HabitEntry}
                        onToggle={() => handleItemToggle(item)}
                        compact={true}
                      />
                    );
                  }

                  // Routine item
                  return (
                    <div
                      key={item.id}
                      className={`flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 ${
                        isCompleted
                          ? "bg-green-50 border-green-200"
                          : "bg-gray-50 border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <Checkbox
                        checked={isCompleted}
                        onCheckedChange={() => handleItemToggle(item)}
                        className="w-5 h-5"
                      />
                      <div className="flex items-center gap-2 flex-1">
                        {item.emoji && <span className="text-lg">{item.emoji}</span>}
                        <span className={`font-medium ${isCompleted ? "line-through text-gray-500" : ""}`}>
                          {item.name}
                        </span>
                      </div>
                      {item.type === "routine" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingRoutine(item.originalData as RoutineItem)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Add Buttons */}
      <div className="flex gap-2">
        <Button onClick={() => setIsCreateHabitDialogOpen(true)} className="flex-1">
          <Plus className="w-4 h-4 mr-2" />
          Add Habit
        </Button>
        <Button onClick={() => setIsCreateRoutineDialogOpen(true)} variant="outline" className="flex-1">
          <Plus className="w-4 h-4 mr-2" />
          Add Routine
        </Button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="space-y-4">
        <SkeletonLoader count={6} height="h-20" />
      </div>
    );
  }

  if (error) {
    return <ErrorMessage message="Failed to load tracking data" />;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Habits & Routines</h1>
          <p className="text-gray-600">Track your daily habits and routines in one place</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="today">
            <Calendar className="w-4 h-4 mr-2" />
            Today
          </TabsTrigger>
          <TabsTrigger value="history">
            <History className="w-4 h-4 mr-2" />
            History
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <Target className="w-4 h-4 mr-2" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="today" className="mt-6">
          {renderTodayView()}
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <div className="text-center py-8 text-gray-500">
            History view coming soon...
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <div className="text-center py-8 text-gray-500">
            Analytics view coming soon...
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <CreateHabitDialog
        open={isCreateHabitDialogOpen}
        onOpenChange={setIsCreateHabitDialogOpen}
        onHabitCreated={handleHabitCreated}
      />

      <CreateRoutineItemDialog
        open={isCreateRoutineDialogOpen}
        onOpenChange={setIsCreateRoutineDialogOpen}
        onRoutineItemCreated={handleRoutineCreated}
      />

      {editingRoutine && (
        <EditRoutineItemDialog
          routineItem={editingRoutine}
          open={!!editingRoutine}
          onOpenChange={(open) => !open && setEditingRoutine(null)}
          onRoutineItemUpdated={(updatedRoutine) => {
            setUnifiedItems((prev) =>
              prev.map((item) =>
                item.id === updatedRoutine.id && item.type === "routine"
                  ? { ...item, name: updatedRoutine.name, emoji: updatedRoutine.emoji, originalData: updatedRoutine }
                  : item
              )
            );
            setEditingRoutine(null);
            showSuccess("Routine updated successfully! ✅");
          }}
        />
      )}
    </div>
  );
}
