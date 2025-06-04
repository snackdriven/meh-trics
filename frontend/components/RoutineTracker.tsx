import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar, History, Search, Filter, CheckCircle } from "lucide-react";
import { SkeletonLoader } from "./SkeletonLoader";
import { ErrorMessage } from "./ErrorMessage";
import { useAsyncOperation } from "../hooks/useAsyncOperation";
import { useToast } from "../hooks/useToast";
import backend from "~backend/client";
import type { RoutineItem, RoutineEntry } from "~backend/task/types";

export function RoutineTracker() {
  const [routineItems, setRoutineItems] = useState<RoutineItem[]>([]);
  const [routineEntries, setRoutineEntries] = useState<Record<number, RoutineEntry>>({});
  const [historicalEntries, setHistoricalEntries] = useState<RoutineEntry[]>([]);
  const [searchDate, setSearchDate] = useState("");
  const [completionFilter, setCompletionFilter] = useState<"all" | "completed" | "incomplete">("all");
  const [updatingItems, setUpdatingItems] = useState<Set<number>>(new Set());
  const [finishing, setFinishing] = useState(false);

  const { showError, showSuccess } = useToast();
  const today = new Date().toISOString().split('T')[0];

  const {
    loading: loadingToday,
    error: todayError,
    execute: loadTodayData,
  } = useAsyncOperation(
    async () => {
      const [itemsResponse, entriesResponse] = await Promise.all([
        backend.task.listRoutineItems(),
        backend.task.listRoutineEntries({ date: today }),
      ]);
      
      setRoutineItems(itemsResponse.items);
      
      const entriesMap: Record<number, RoutineEntry> = {};
      entriesResponse.entries.forEach(entry => {
        entriesMap[entry.routineItemId] = entry;
      });
      setRoutineEntries(entriesMap);

      return { items: itemsResponse.items, entries: entriesResponse.entries };
    },
    undefined,
    (error) => showError("Failed to load routine data", "Loading Error")
  );

  const {
    loading: loadingHistory,
    error: historyError,
    execute: loadHistoricalEntries,
  } = useAsyncOperation(
    async () => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const response = await backend.task.listRoutineEntries({
        startDate: thirtyDaysAgo.toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
      });
      
      setHistoricalEntries(response.entries);
      return response.entries;
    },
    undefined,
    (error) => showError("Failed to load routine history", "Loading Error")
  );

  const {
    execute: updateRoutineEntry,
  } = useAsyncOperation(
    async (itemId: number, completed: boolean) => {
      const entry = await backend.task.createRoutineEntry({
        routineItemId: itemId,
        date: new Date(today),
        completed,
      });
      
      setRoutineEntries(prev => ({
        ...prev,
        [itemId]: entry,
      }));

      // Update historical entries optimistically
      setHistoricalEntries(prev => {
        const filtered = prev.filter(e => 
          !(e.routineItemId === itemId && new Date(e.date).toISOString().split('T')[0] === today)
        );
        return [entry, ...filtered];
      });

      return entry;
    },
    () => showSuccess("Routine updated! 🌟"),
    (error) => {
      showError("Failed to update routine", "Update Error");
      // Revert optimistic update on error
      loadTodayData();
    }
  );

  useEffect(() => {
    loadTodayData();
    loadHistoricalEntries();
  }, []);

  const toggleRoutineItem = async (itemId: number, completed: boolean) => {
    setUpdatingItems(prev => new Set(prev).add(itemId));

    // Optimistic update
    const optimisticEntry: RoutineEntry = {
      id: Date.now(),
      routineItemId: itemId,
      date: new Date(today),
      completed,
      createdAt: new Date(),
    };

    setRoutineEntries(prev => ({
      ...prev,
      [itemId]: optimisticEntry,
    }));

    try {
      await updateRoutineEntry(itemId, completed);
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  const finishDay = async () => {
    setFinishing(true);
    const missingItems = routineItems.filter(item => !routineEntries[item.id]);
    const undoneItems = routineItems.filter(item => !(routineEntries[item.id]?.completed));

    try {
      const created = await Promise.all(
        missingItems.map(item =>
          backend.task.createRoutineEntry({
            routineItemId: item.id,
            date: new Date(today),
            completed: false,
          })
        )
      );

      if (created.length > 0) {
        setHistoricalEntries(prev => [...created, ...prev]);
      }

      const message = undoneItems.length === 0
        ? "Day finished! All routine items completed."
        : `Day finished! Undone: ${undoneItems.map(i => i.name).join(', ')}`;
      showSuccess(message);
      setRoutineEntries({});
    } catch (e) {
      showError("Failed to finish day", "Finish Error");
    } finally {
      setFinishing(false);
    }
  };

  const getRoutineItemName = (itemId: number) => {
    const item = routineItems.find(item => item.id === itemId);
    return item ? `${item.emoji} ${item.name}` : "Unknown routine";
  };

  const filteredHistoricalEntries = historicalEntries.filter(entry => {
    const matchesDate = searchDate === "" || 
      new Date(entry.date).toISOString().split('T')[0] === searchDate;
    
    const matchesCompletion = completionFilter === "all" ||
      (completionFilter === "completed" && entry.completed) ||
      (completionFilter === "incomplete" && !entry.completed);
    
    return matchesDate && matchesCompletion;
  });

  // Group historical entries by date
  const groupedEntries = filteredHistoricalEntries.reduce((acc, entry) => {
    const dateStr = new Date(entry.date).toISOString().split('T')[0];
    if (!acc[dateStr]) {
      acc[dateStr] = [];
    }
    acc[dateStr].push(entry);
    return acc;
  }, {} as Record<string, RoutineEntry[]>);

  if (loadingToday) {
    return (
      <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            Low-bar, high-context habits. Not about productivity. Just keeping your soft systems running.
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <SkeletonLoader key={index} variant="card" className="h-16" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (todayError) {
    return (
      <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
        <CardContent className="p-8">
          <ErrorMessage 
            message={todayError} 
            onRetry={loadTodayData}
          />
        </CardContent>
      </Card>
    );
  }

  const completedCount = Object.values(routineEntries).filter(entry => entry.completed).length;
  const totalCount = routineItems.length;

  return (
    <div className="space-y-6">
      <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            Low-bar, high-context habits. Not about productivity. Just keeping your soft systems running.
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="today" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="today" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Today's Routine
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-2">
                <History className="h-4 w-4" />
                History
              </TabsTrigger>
            </TabsList>

            <TabsContent value="today" className="space-y-6">
              <div className="text-center">
                <p className="text-gray-600">
                  {completedCount} of {totalCount} soft habits tended to today
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <div className="space-y-4">
                {routineItems.map((item) => {
                  const entry = routineEntries[item.id];
                  const isCompleted = entry?.completed || false;
                  const isUpdating = updatingItems.has(item.id);
                  
                  return (
                    <div 
                      key={item.id} 
                      className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-200 ${
                        isCompleted 
                          ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200" 
                          : "bg-white/50 border-gray-200 hover:border-purple-300"
                      } ${isUpdating ? "opacity-75" : ""}`}
                    >
                      <div className="relative">
                        <Checkbox
                          checked={isCompleted}
                          onCheckedChange={(checked) => toggleRoutineItem(item.id, !!checked)}
                          className="h-5 w-5"
                          disabled={isUpdating}
                        />
                        {isUpdating && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-3 h-3 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-3 flex-1">
                        <span className="text-2xl">{item.emoji}</span>
                        <span className={`font-medium ${isCompleted ? "text-green-800" : "text-gray-700"}`}>
                          {item.name}
                        </span>
                      </div>
                      {isCompleted && (
                        <span className="text-green-600 text-sm font-medium">
                          ✓ Done
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={finishDay}
                  size="sm"
                  disabled={finishing}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  {finishing ? (
                    <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                  ) : (
                    <CheckCircle className="h-4 w-4 mr-2" />
                  )}
                  Finish Day
                </Button>
              </div>
              
              {completedCount === totalCount && totalCount > 0 && (
                <div className="mt-6 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-xl text-center">
                  <span className="text-2xl">🎉</span>
                  <p className="text-yellow-800 font-medium mt-2">
                    You've tended to all your soft habits today! Your future self is grateful. 💛
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="history" className="space-y-4">
              {historyError && (
                <ErrorMessage 
                  message={historyError} 
                  onRetry={loadHistoricalEntries}
                />
              )}

              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        type="date"
                        placeholder="Search by date..."
                        value={searchDate}
                        onChange={(e) => setSearchDate(e.target.value)}
                        className="pl-10 bg-white/50"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    <span className="text-sm font-medium">Filter:</span>
                  </div>
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
                    className={completionFilter === "completed" ? "bg-purple-600 hover:bg-purple-700" : ""}
                  >
                    Completed
                  </Button>
                  <Button
                    variant={completionFilter === "incomplete" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCompletionFilter("incomplete")}
                    className={completionFilter === "incomplete" ? "bg-purple-600 hover:bg-purple-700" : ""}
                  >
                    Incomplete
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                {loadingHistory ? (
                  <div className="space-y-3">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <SkeletonLoader key={index} variant="card" className="h-24" />
                    ))}
                  </div>
                ) : Object.keys(groupedEntries).length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>No routine entries found for the selected filter.</p>
                  </div>
                ) : (
                  Object.entries(groupedEntries)
                    .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
                    .map(([date, entries]) => {
                      const completedEntries = entries.filter(e => e.completed);
                      const completionRate = entries.length > 0 ? (completedEntries.length / entries.length) * 100 : 0;
                      
                      return (
                        <Card key={date} className="p-4 bg-white/50">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <h3 className="font-medium">
                                {new Date(date).toLocaleDateString('en-US', {
                                  weekday: 'long',
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </h3>
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-600">
                                  {completedEntries.length}/{entries.length} completed
                                </span>
                                <Badge 
                                  variant="outline" 
                                  className={
                                    completionRate === 100 
                                      ? "bg-green-50 text-green-700 border-green-200"
                                      : completionRate >= 50
                                        ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                                        : "bg-red-50 text-red-700 border-red-200"
                                  }
                                >
                                  {Math.round(completionRate)}%
                                </Badge>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {entries.map((entry) => (
                                <div 
                                  key={entry.id} 
                                  className={`flex items-center gap-2 p-2 rounded-lg ${
                                    entry.completed 
                                      ? "bg-green-50 text-green-800" 
                                      : "bg-gray-50 text-gray-600"
                                  }`}
                                >
                                  <span className={entry.completed ? "✓" : "○"} />
                                  <span className="text-sm">{getRoutineItemName(entry.routineItemId)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </Card>
                      );
                    })
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
